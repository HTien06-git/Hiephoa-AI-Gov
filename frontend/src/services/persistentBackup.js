/**
 * persistentBackup.js – Frontend Persistent Backup Service
 * Hạng mục 3: Lưu clientSnapshot vào localStorage sau mỗi thao tác tạo/sửa cán bộ
 * Gửi snapshot lên header mỗi request để server tự khôi phục khi Cold Start
 */

const BACKUP_KEY = '__HIEPHOA_PERSISTENT_BACKUP__';

/**
 * Lưu snapshot nhận được từ server vào localStorage
 */
export function saveClientSnapshot(clientSnapshot) {
  if (!clientSnapshot) return;
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(clientSnapshot));
  } catch (e) {
    console.warn('[persistentBackup] Could not save snapshot:', e);
  }
}

/**
 * Lấy snapshot hiện tại từ localStorage
 */
export function getClientSnapshot() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Tạo headers bổ sung chứa snapshot để gửi lên server (chống Cold Start)
 * Chỉ gửi khi snapshot tồn tại
 */
export function getSnapshotHeaders() {
  try {
    const snap = getClientSnapshot();
    if (!snap || !snap.snapshot || !snap.sig) return {};
    return {
      'X-Hiephoa-Snapshot': snap.snapshot.slice(0, 4096), // Giới hạn kích thước header
      'X-Hiephoa-Sig': snap.sig
    };
  } catch {
    return {};
  }
}

/**
 * Xóa snapshot khỏi localStorage (khi logout)
 */
export function clearClientSnapshot() {
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch {}
}
