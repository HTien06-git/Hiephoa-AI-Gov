/**
 * deviceFingerprint.js
 * Thuật toán nhận diện thiết bị duy nhất (Client Device Fingerprinting)
 * Kết hợp Canvas Fingerprint + Screen Resolution + UserAgent + TimeZone + Platform
 * Lưu đồng bộ vào localStorage, sessionStorage và Cookie
 */

// Simple non-cryptographic hash (DJB2 / Murmur-like) to create a clean alphanumeric ID
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).toUpperCase();
}

// Generate canvas fingerprint hash
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'NO_2D_CTX';

    // Text with different styling and blending
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('HiepHoa_AI_Gov@2026!#$', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('HiepHoa_AI_Gov@2026!#$', 4, 17);

    return canvas.toDataURL();
  } catch (err) {
    return 'CANVAS_BLOCKED';
  }
}

// Format human-friendly device name (e.g., "iPhone (Safari iOS)", "Điện thoại Android (Chrome)", "Máy tính Windows (Chrome)")
export function getFriendlyDeviceName() {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  let os = 'Thiết bị';
  let browser = 'Trình duyệt web';

  // Detect OS
  if (/iPhone|iPad|iPod/i.test(ua)) {
    os = /iPad/i.test(ua) ? 'iPad (iOS)' : 'iPhone (iOS)';
  } else if (/Android/i.test(ua)) {
    os = 'Điện thoại Android';
  } else if (/Win/i.test(platform) || /Windows/i.test(ua)) {
    os = 'Máy tính Windows';
  } else if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) {
    os = 'Máy tính MacOS';
  } else if (/Linux/i.test(platform) || /Linux/i.test(ua)) {
    os = 'Máy tính Linux';
  }

  // Detect Browser
  if (/Edg/i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox/i.test(ua)) {
    browser = 'Firefox';
  } else if (/Zalo/i.test(ua)) {
    browser = 'Trình duyệt Zalo App';
  }

  return `${os} (${browser})`;
}

// Set cookie helper
function setCookie(name, value, days = 365) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    // ignore cookie error
  }
}

// Get cookie helper
function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Lấy hoặc khởi tạo Device Fingerprint
 * @returns {{ deviceId: string, deviceName: string }}
 */
export function getDeviceFingerprint() {
  const STORAGE_KEY = 'hiephoa_device_id';

  // 1. Kiểm tra bộ nhớ đã có sẵn deviceId hay chưa
  let cachedId = null;
  try {
    cachedId = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY) || getCookie(STORAGE_KEY);
  } catch (e) {}

  if (cachedId && cachedId.length >= 8) {
    // Đồng bộ lại tất cả kho lưu trữ
    try {
      localStorage.setItem(STORAGE_KEY, cachedId);
      sessionStorage.setItem(STORAGE_KEY, cachedId);
      setCookie(STORAGE_KEY, cachedId);
    } catch (e) {}

    return {
      deviceId: cachedId,
      deviceName: getFriendlyDeviceName()
    };
  }

  // 2. Tính toán dấu vân tay phần cứng mới
  const screenInfo = `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
  const ua = navigator.userAgent || '';
  const language = navigator.language || 'vi-VN';
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const canvasHash = hashString(getCanvasFingerprint());

  const rawFingerprint = [
    screenInfo,
    timeZone,
    ua,
    language,
    hardwareConcurrency,
    canvasHash
  ].join('###');

  const hashPart1 = hashString(rawFingerprint);
  const hashPart2 = hashString(rawFingerprint.split('').reverse().join(''));
  const deviceId = `DEV-${hashPart1}${hashPart2}`.slice(0, 16);

  // 3. Lưu đồng bộ vào LocalStorage, SessionStorage và Cookie
  try {
    localStorage.setItem(STORAGE_KEY, deviceId);
    sessionStorage.setItem(STORAGE_KEY, deviceId);
    setCookie(STORAGE_KEY, deviceId);
  } catch (e) {}

  return {
    deviceId,
    deviceName: getFriendlyDeviceName()
  };
}
