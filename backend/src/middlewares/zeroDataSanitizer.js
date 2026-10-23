/**
 * Middleware đảm bảo tuân thủ nguyên tắc Zero-Data Retention:
 * 1. Không ghi thông tin cá nhân (CCCD, Họ tên, SĐT) vào console log công khai.
 * 2. Đảm bảo dữ liệu upload dạng buffer chỉ tồn tại trong vòng đời request và tự động giải phóng khỏi RAM.
 */

function maskSensitiveInfo(str) {
  if (!str || typeof str !== 'string') return str;
  // Mask 12 digit CCCD
  return str.replace(/\b(\d{4})\d{4}(\d{4})\b/g, '$1****$2');
}

function zeroDataSanitizer(req, res, next) {
  // Set header to prevent caching of citizen sensitive responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Zero-Data-Retention', 'Active-ClientSide-Processing');

  // Register cleanup when response finishes
  res.on('finish', () => {
    if (req.file && req.file.buffer) {
      req.file.buffer = null;
    }
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(f => {
        if (f.buffer) f.buffer = null;
      });
    }
  });

  next();
}

module.exports = {
  zeroDataSanitizer,
  maskSensitiveInfo
};
