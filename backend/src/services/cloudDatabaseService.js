/**
 * cloudDatabaseService.js – Cloudflare Edge Database Sync Service
 * Đồng bộ dữ liệu Hồ sơ, Thống kê và Cán bộ trực tuyến giữa mọi thiết bị
 * qua Cloudflare Workers + KV với độ trễ cực thấp (< 25ms).
 */

const CLOUDFLARE_SYNC_URL = process.env.CLOUDFLARE_SYNC_URL || 'https://hiephoa-ai-gov.truonghoangtien90.workers.dev/api/sync';

class CloudDatabaseService {
  constructor() {
    this.syncUrl = CLOUDFLARE_SYNC_URL;
    this.isSyncing = false;
    this.lastSyncTime = 0;
  }

  /**
   * Kéo dữ liệu mới nhất từ Cloudflare Edge về bộ nhớ server
   */
  async pullFromCloud() {
    if (!this.syncUrl) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(this.syncUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data = await res.json();

      if (data && typeof data === 'object') {
        // Đồng bộ vào Realtime Store
        if (!globalThis.__HIEPHOA_REALTIME_STORE__) {
          globalThis.__HIEPHOA_REALTIME_STORE__ = { counter: 1000, submissions: [], stats: {}, activityFeed: [] };
        }

        const rt = globalThis.__HIEPHOA_REALTIME_STORE__;

        if (Array.isArray(data.submissions) && data.submissions.length > 0) {
          const localMap = new Map((rt.submissions || []).map(s => [s.submissionCode, s]));
          for (const s of data.submissions) {
            // Giữ lại bản ghi mới hơn
            if (!localMap.has(s.submissionCode) || new Date(s.updatedAt || 0) > new Date(localMap.get(s.submissionCode).updatedAt || 0)) {
              localMap.set(s.submissionCode, s);
            }
          }
          rt.submissions = Array.from(localMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        if (data.stats && typeof data.stats === 'object') {
          rt.stats = {
            totalVisits: Math.max(rt.stats?.totalVisits || 0, data.stats.totalVisits || 0),
            aiVoiceConsultations: Math.max(rt.stats?.aiVoiceConsultations || 0, data.stats.aiVoiceConsultations || 0),
            autoFormsCreated: Math.max(rt.stats?.autoFormsCreated || 0, data.stats.autoFormsCreated || 0),
            preCheckDocs: Math.max(rt.stats?.preCheckDocs || 0, data.stats.preCheckDocs || 0),
            completedSubmissions: Math.max(rt.stats?.completedSubmissions || 0, data.stats.completedSubmissions || 0)
          };
        }

        if (typeof data.counter === 'number' && data.counter > (rt.counter || 1000)) {
          rt.counter = data.counter;
        }

        // Đồng bộ vào Security Store (Cán bộ)
        if (data.officers && typeof data.officers === 'object') {
          if (!globalThis.__HIEPHOA_SECURITY_STORE__) {
            globalThis.__HIEPHOA_SECURITY_STORE__ = { devices: {}, officers: {} };
          }
          globalThis.__HIEPHOA_SECURITY_STORE__.officers = {
            ...globalThis.__HIEPHOA_SECURITY_STORE__.officers,
            ...data.officers
          };
        }

        this.lastSyncTime = Date.now();
        return data;
      }
    } catch (e) {
      // Cloudflare sync fail -> chạy offline/local êm dịu, không gián đoạn
      console.warn('[CloudDatabaseService] pullFromCloud notice (offline/fallback):', e.message);
    }
    return null;
  }

  /**
   * Đẩy dữ liệu hiện tại lên Cloudflare Edge để chia sẻ cho mọi thiết bị khác
   */
  async pushToCloud() {
    if (!this.syncUrl || this.isSyncing) return;
    this.isSyncing = true;

    try {
      const rt = globalThis.__HIEPHOA_REALTIME_STORE__ || {};
      const sec = globalThis.__HIEPHOA_SECURITY_STORE__ || {};

      const payload = {
        counter: rt.counter || 1000,
        submissions: (rt.submissions || []).slice(0, 150),
        stats: rt.stats || {},
        officers: sec.officers || {},
        activityFeed: (rt.activityFeed || []).slice(0, 20),
        updatedAt: new Date().toISOString()
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      await fetch(this.syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (e) {
      console.warn('[CloudDatabaseService] pushToCloud notice:', e.message);
    } finally {
      this.isSyncing = false;
    }
  }
}

module.exports = new CloudDatabaseService();
