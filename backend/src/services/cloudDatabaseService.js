/**
 * cloudDatabaseService.js – Global Cloud Sync Service
 * Đồng bộ dữ liệu Hồ sơ, Thống kê, Trạng thái Cán bộ & Phiên làm việc (Session)
 * giữa tất cả các thiết bị (Laptop, PC, Mobile) và các Serverless container
 * với cơ chế thời gian thực hai chiều.
 */

const CLOUD_SYNC_URL = process.env.CLOUD_SYNC_URL || 'https://api.restful-api.dev/objects/ff808181a09d98f701a18501f4603fb6';

class CloudDatabaseService {
  constructor() {
    this.syncUrl = CLOUD_SYNC_URL;
    this.isSyncing = false;
    this.lastSyncTime = 0;
  }

  /**
   * Kéo dữ liệu mới nhất từ Cloud Database về bộ nhớ server
   */
  async pullFromCloud() {
    if (!this.syncUrl) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(this.syncUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const rawJson = await res.json();
      const data = rawJson.data || rawJson;

      if (data && typeof data === 'object') {
        // Đồng bộ vào Realtime Store (Hồ sơ)
        if (!globalThis.__HIEPHOA_REALTIME_STORE__) {
          globalThis.__HIEPHOA_REALTIME_STORE__ = { counter: 1000, submissions: [], stats: {}, activityFeed: [] };
        }

        const rt = globalThis.__HIEPHOA_REALTIME_STORE__;

        if (Array.isArray(data.submissions) && data.submissions.length > 0) {
          const localMap = new Map((rt.submissions || []).map(s => [s.submissionCode, s]));
          for (const s of data.submissions) {
            // Giữ lại bản ghi mới hơn hoặc bổ sung bản ghi chưa có
            if (!localMap.has(s.submissionCode) || new Date(s.updatedAt || 0) >= new Date(localMap.get(s.submissionCode).updatedAt || 0)) {
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

        // Đồng bộ vào Security Store (Cán bộ + Phiên đăng nhập duy nhất activeSessionId)
        if (data.officers && typeof data.officers === 'object') {
          if (!globalThis.__HIEPHOA_SECURITY_STORE__) {
            globalThis.__HIEPHOA_SECURITY_STORE__ = { devices: {}, officers: {} };
          }
          const officers = globalThis.__HIEPHOA_SECURITY_STORE__.officers || {};
          for (const [uname, off] of Object.entries(data.officers)) {
            if (uname === 'canbo1' || off?.username === 'canbo1') continue;
            const existing = officers[uname];
            if (!existing) {
              officers[uname] = off;
            } else {
              // Cập nhật phiên đăng nhập mới nhất từ thiết bị khác
              if (off.activeSessionId) existing.activeSessionId = off.activeSessionId;
              if (off.activeDeviceId) existing.activeDeviceId = off.activeDeviceId;
              if (off.lastLoginAt) existing.lastLoginAt = off.lastLoginAt;
              if (off.isLocked !== undefined) existing.isLocked = off.isLocked;
            }
          }
          delete officers.canbo1;
          globalThis.__HIEPHOA_SECURITY_STORE__.officers = officers;
        }

        this.lastSyncTime = Date.now();
        return data;
      }
    } catch (e) {
      console.warn('[CloudDatabaseService] pullFromCloud notice (offline/fallback):', e.message);
    }
    return null;
  }

  /**
   * Đẩy dữ liệu hiện tại lên Cloud Database để chia sẻ ngay lập tức cho mọi thiết bị khác
   */
  async pushToCloud() {
    if (!this.syncUrl || this.isSyncing) return;
    this.isSyncing = true;

    try {
      const rt = globalThis.__HIEPHOA_REALTIME_STORE__ || {};
      const sec = globalThis.__HIEPHOA_SECURITY_STORE__ || {};

      const cleanOfficers = { ...(sec.officers || {}) };
      delete cleanOfficers.canbo1;

      const payload = {
        name: 'HIEPHOA_STORE',
        data: {
          counter: rt.counter || 1000,
          submissions: (rt.submissions || []).slice(0, 100),
          stats: rt.stats || {},
          officers: cleanOfficers,
          activityFeed: (rt.activityFeed || []).slice(0, 20),
          updatedAt: new Date().toISOString()
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      await fetch(this.syncUrl, {
        method: 'PUT',
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

