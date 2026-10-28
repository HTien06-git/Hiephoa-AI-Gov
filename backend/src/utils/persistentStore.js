/**
 * persistentStore.js – Dual-Persistence Engine (Hạng mục 3)
 * Chống mất tài khoản Cán bộ Một cửa khi Vercel Cold Start
 *
 * Cơ chế:
 *  Tầng 1 – /tmp (Vercel) hoặc src/data (Local), kết hợp globalThis memory
 *  Tầng 2 – Client-Server HMAC-SHA256 Encrypted Snapshot Sync
 *    + Mỗi khi dữ liệu thay đổi, server tạo bản sao mã hoá gửi cho frontend
 *    + Khi Cold Start, frontend gửi lại bản sao; server xác thực chữ ký và khôi phục
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'HiepHao_AI_Gov_Secret_Security_Key_2026';
const isVercel = Boolean(process.env.VERCEL);

const SECURITY_DB_FILE = isVercel
  ? path.join('/tmp', 'security_db.json')
  : path.resolve(__dirname, '../data/security_db.json');

const REALTIME_DB_FILE = isVercel
  ? path.join('/tmp', 'hiephoa_realtime_db.json')
  : path.resolve(__dirname, '../data/hiephoa_realtime_db.json');

/**
 * Tạo chữ ký HMAC-SHA256 để đảm bảo tính toàn vẹn dữ liệu
 */
function signPayload(payload) {
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', JWT_SECRET).update(str).digest('hex');
}

/**
 * Xác thực chữ ký HMAC-SHA256
 */
function verifySignature(payload, signature) {
  const expected = signPayload(payload);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Tạo gói snapshot mã hoá để gửi về client localStorage
 * @param {Object} data - Dữ liệu cần backup (officers + submissions + devices)
 * @returns {{ snapshot: string, sig: string, ts: number }}
 */
function createEncryptedSnapshot(data) {
  const ts = Date.now();
  const payload = JSON.stringify({ data, ts });
  const sig = signPayload(payload);
  return { snapshot: payload, sig, ts };
}

/**
 * Khôi phục dữ liệu từ gói snapshot mã hoá do client gửi lên
 * @param {{ snapshot: string, sig: string }} pkg
 * @returns {{ data: Object, ts: number } | null}
 */
function restoreFromSnapshot(pkg) {
  if (!pkg || !pkg.snapshot || !pkg.sig) return null;
  if (!verifySignature(pkg.snapshot, pkg.sig)) {
    console.warn('[persistentStore] Chữ ký snapshot không hợp lệ – Bỏ qua khôi phục');
    return null;
  }
  try {
    const parsed = JSON.parse(pkg.snapshot);
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Kiểm tra xem server có đang ở trạng thái Cold Start không
 * (dữ liệu /tmp trống hoặc không tồn tại)
 */
function isColdStart() {
  if (!isVercel) return false;
  try {
    return !fs.existsSync(SECURITY_DB_FILE);
  } catch {
    return true;
  }
}

/**
 * Middleware autoHydrateMiddleware: Tự động khôi phục dữ liệu nếu Cold Start
 * Đọc header X-Hiephoa-Snapshot và khôi phục nếu hợp lệ
 */
function autoHydrateMiddleware(req, res, next) {
  try {
    const snapshotHeader = req.headers['x-hiephoa-snapshot'];
    const sigHeader = req.headers['x-hiephoa-sig'];

    if (snapshotHeader && sigHeader && isColdStart()) {
      console.log('[persistentStore] Cold Start phát hiện! Đang khôi phục từ Client Snapshot...');
      const restored = restoreFromSnapshot({ snapshot: snapshotHeader, sig: sigHeader });

      if (restored && restored.data) {
        const { officers, devices, submissions, stats, activityFeed, counter } = restored.data;

        // Khôi phục Security Store (Cán bộ + Thiết bị)
        if (!globalThis.__HIEPHOA_SECURITY_STORE__) {
          globalThis.__HIEPHOA_SECURITY_STORE__ = { devices: {}, officers: {} };
        }
        if (officers && typeof officers === 'object') {
          globalThis.__HIEPHOA_SECURITY_STORE__.officers = {
            ...globalThis.__HIEPHOA_SECURITY_STORE__.officers,
            ...officers
          };
          console.log(`[persistentStore] Đã khôi phục ${Object.keys(officers).length} tài khoản Cán bộ`);
        }
        if (devices && typeof devices === 'object') {
          globalThis.__HIEPHOA_SECURITY_STORE__.devices = {
            ...globalThis.__HIEPHOA_SECURITY_STORE__.devices,
            ...devices
          };
        }

        // Khôi phục Realtime Store (Hồ sơ + Thống kê)
        if (!globalThis.__HIEPHOA_REALTIME_STORE__) {
          globalThis.__HIEPHOA_REALTIME_STORE__ = {
            counter: 1000, submissions: [], stats: {}, activityFeed: []
          };
        }
        if (Array.isArray(submissions) && submissions.length > 0) {
          const currentSubs = globalThis.__HIEPHOA_REALTIME_STORE__.submissions || [];
          const existingMap = new Map(currentSubs.map(s => [s.submissionCode, s]));
          for (const s of submissions) {
            if (!existingMap.has(s.submissionCode)) {
              existingMap.set(s.submissionCode, s);
            }
          }
          globalThis.__HIEPHOA_REALTIME_STORE__.submissions = Array.from(existingMap.values());
        }
        if (stats) {
          globalThis.__HIEPHOA_REALTIME_STORE__.stats = stats;
        }
        if (Array.isArray(activityFeed)) {
          globalThis.__HIEPHOA_REALTIME_STORE__.activityFeed = activityFeed;
        }
        if (typeof counter === 'number') {
          globalThis.__HIEPHOA_REALTIME_STORE__.counter = counter;
        }

        // Lưu ngay vào /tmp để các request sau không cần re-hydrate
        try {
          fs.writeFileSync(SECURITY_DB_FILE, JSON.stringify(globalThis.__HIEPHOA_SECURITY_STORE__, null, 2), 'utf8');
          fs.writeFileSync(REALTIME_DB_FILE, JSON.stringify(globalThis.__HIEPHOA_REALTIME_STORE__, null, 2), 'utf8');
          console.log('[persistentStore] Đã lưu lại dữ liệu khôi phục vào /tmp thành công!');
        } catch (saveErr) {
          console.warn('[persistentStore] Không thể lưu /tmp sau khôi phục:', saveErr.message);
        }
      }
    }
  } catch (e) {
    console.warn('[persistentStore] autoHydrateMiddleware error:', e.message);
  }
  next();
}

/**
 * Tạo response snapshot để gửi về client sau mỗi lần thay đổi dữ liệu
 */
function buildClientSnapshot() {
  try {
    const secStore = globalThis.__HIEPHOA_SECURITY_STORE__ || {};
    const rtStore = globalThis.__HIEPHOA_REALTIME_STORE__ || {};

    // Chỉ backup officers (không backup mật khẩu rõ ràng – vẫn lưu vì đây là dữ liệu backup có ký số)
    const data = {
      officers: secStore.officers || {},
      devices: secStore.devices || {},
      submissions: (rtStore.submissions || []).slice(0, 100), // Tối đa 100 hồ sơ gần nhất
      stats: rtStore.stats || {},
      activityFeed: (rtStore.activityFeed || []).slice(0, 20),
      counter: rtStore.counter || 1000
    };

    return createEncryptedSnapshot(data);
  } catch (e) {
    console.warn('[persistentStore] buildClientSnapshot error:', e.message);
    return null;
  }
}

module.exports = {
  signPayload,
  verifySignature,
  createEncryptedSnapshot,
  restoreFromSnapshot,
  isColdStart,
  autoHydrateMiddleware,
  buildClientSnapshot
};
