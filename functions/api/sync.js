// Cloudflare Pages / Workers Edge Function: /api/sync
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Hiephoa-Snapshot, X-Hiephoa-Sig',
};

// Bộ nhớ đệm Node Edge
let edgeCache = {
  counter: 1000,
  submissions: [],
  stats: {
    totalVisits: 0,
    aiVoiceConsultations: 0,
    autoFormsCreated: 0,
    preCheckDocs: 0,
    completedSubmissions: 0
  },
  officers: {},
  activityFeed: [],
  updatedAt: new Date().toISOString()
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet(context) {
  const env = context.env || {};
  let data = edgeCache;

  if (env.HIEPHOA_KV) {
    try {
      const stored = await env.HIEPHOA_KV.get('hiephoa_realtime_data', 'json');
      if (stored) data = stored;
    } catch (e) {}
  }

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const env = context.env || {};
  try {
    const body = await context.request.json();
    let current = edgeCache;

    if (env.HIEPHOA_KV) {
      try {
        const stored = await env.HIEPHOA_KV.get('hiephoa_realtime_data', 'json');
        if (stored) current = stored;
      } catch (e) {}
    }

    const subsMap = new Map((current.submissions || []).map(s => [s.submissionCode, s]));
    if (Array.isArray(body.submissions)) {
      for (const s of body.submissions) {
        subsMap.set(s.submissionCode, s);
      }
    }

    const merged = {
      counter: Math.max(current.counter || 1000, body.counter || 1000),
      submissions: Array.from(subsMap.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
      stats: {
        totalVisits: Math.max(current.stats?.totalVisits || 0, body.stats?.totalVisits || 0),
        aiVoiceConsultations: Math.max(current.stats?.aiVoiceConsultations || 0, body.stats?.aiVoiceConsultations || 0),
        autoFormsCreated: Math.max(current.stats?.autoFormsCreated || 0, body.stats?.autoFormsCreated || 0),
        preCheckDocs: Math.max(current.stats?.preCheckDocs || 0, body.stats?.preCheckDocs || 0),
        completedSubmissions: Math.max(current.stats?.completedSubmissions || 0, body.stats?.completedSubmissions || 0)
      },
      officers: {
        ...(current.officers || {}),
        ...(body.officers || {})
      },
      activityFeed: (body.activityFeed && body.activityFeed.length > 0) ? body.activityFeed : (current.activityFeed || []),
      updatedAt: new Date().toISOString()
    };

    edgeCache = merged;

    if (env.HIEPHOA_KV) {
      try {
        await env.HIEPHOA_KV.put('hiephoa_realtime_data', JSON.stringify(merged));
      } catch (e) {}
    }

    return new Response(JSON.stringify({ success: true, count: merged.submissions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

