const securityService = require('../services/securityService');
const { buildClientSnapshot } = require('../utils/persistentStore');

// Xử lý đăng nhập tài khoản Cán bộ / Admin kèm kiểm tra khóa thiết bị
async function handleLogin(req, res) {
  try {
    const { username, password, deviceId, deviceName } = req.body;
    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Không xác định được mã định danh thiết bị (Device Fingerprint).'
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.'
      });
    }

    // 1. Kiểm tra trạng thái khóa của thiết bị trước tiên
    const currentStatus = securityService.getDeviceStatus(deviceId);
    if (currentStatus.isLocked || currentStatus.failedCount >= 5) {
      const lockMsg = 'THIẾT BỊ NÀY ĐÃ BỊ KHÓA DO NHẬP SAI TÀI KHOẢN QUÁ 5 LẦN. Vui lòng liên hệ Admin để Reset lượt đăng nhập.';
      return res.status(403).json({
        success: false,
        locked: true,
        isLocked: true,
        deviceId,
        failedCount: currentStatus.failedCount,
        lockedAt: currentStatus.lockedAt,
        message: lockMsg,
        error: lockMsg
      });
    }

    // 2. Xác thực thông tin đăng nhập
    const user = securityService.authenticateUser(username.trim(), password);

    // NẾU SAI TÀI KHOẢN HOẶC MẬT KHẨU
    if (!user) {
      const failedResult = securityService.recordFailedAttempt(deviceId, deviceName, ipAddress, username);

      // Nếu lần sai này chạm mốc 5 lần -> Khóa cứng ngay lập tức
      if (failedResult.isLocked || failedResult.failedCount >= 5) {
        const lockMsg = 'THIẾT BỊ NÀY ĐÃ BỊ KHÓA DO NHẬP SAI TÀI KHOẢN QUÁ 5 LẦN. Vui lòng liên hệ Admin để Reset lượt đăng nhập.';
        return res.status(403).json({
          success: false,
          locked: true,
          isLocked: true,
          deviceId,
          failedCount: 5,
          remainingAttempts: 0,
          message: lockMsg,
          error: lockMsg
        });
      }

      // Nếu từ 1 đến 4 lần -> Cảnh báo số lần còn lại
      const warnMsg = `Sai tài khoản hoặc mật khẩu! Thiết bị đã nhập sai ${failedResult.failedCount}/5 lần (Còn ${failedResult.remainingAttempts} lần thử trước khi bị khóa).`;
      return res.status(401).json({
        success: false,
        locked: false,
        isLocked: false,
        deviceId,
        failedCount: failedResult.failedCount,
        remainingAttempts: failedResult.remainingAttempts,
        message: warnMsg,
        error: warnMsg
      });
    }

    // NẾU ĐĂNG NHẬP THÀNH CÔNG VÀ CHƯA BỊ KHÓA
    // Sinh mã phiên duy nhất: nếu đăng nhập trên thiết bị mới, thiết bị cũ sẽ tự động đăng xuất
    const sessionId = `SES-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    securityService.recordSuccessLogin(deviceId, user.username, sessionId);
    const token = securityService.generateToken(user, deviceId, sessionId);
    const snapshot = buildClientSnapshot();

    return res.json({
      success: true,
      token,
      sessionId,
      user: {
        ...user,
        sessionId,
        deviceId
      },
      clientSnapshot: snapshot,
      message: `Đăng nhập thành công với vai trò ${user.role === 'ADMIN' ? 'Quản Trị Viên' : 'Cán Bộ Một Cửa'}!`
    });
  } catch (err) {
    console.error('[authController] Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ trong quá trình xác thực: ' + err.message
    });
  }
}

// Kiểm tra trạng thái thiết bị theo deviceId khi người dùng mở form hoặc F5
async function handleDeviceStatus(req, res) {
  try {
    const { deviceId } = req.query;
    if (!deviceId) {
      return res.json({
        success: true,
        failedCount: 0,
        isLocked: false,
        remainingAttempts: 5,
        data: { failedCount: 0, isLocked: false, remainingAttempts: 5 }
      });
    }

    const status = securityService.getDeviceStatus(deviceId);
    return res.json({
      success: true,
      deviceId,
      failedCount: status.failedCount || 0,
      isLocked: Boolean(status.isLocked),
      remainingAttempts: status.remainingAttempts || (5 - (status.failedCount || 0)),
      lockedAt: status.lockedAt,
      data: status
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}


// Xác thực tính hợp lệ của token và kiểm tra phiên làm việc đơn
async function handleVerify(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Thiếu Authorization Token.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = securityService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Token đã hết hạn hoặc không hợp lệ.' });
  }

  // Kiểm tra phiên đăng nhập đồng thời
  const check = securityService.validateSession(decoded.username, decoded.sessionId, decoded.deviceId);
  if (!check.valid) {
    return res.status(401).json({
      success: false,
      valid: false,
      sessionTerminated: true,
      code: 'SESSION_TERMINATED',
      error: check.message
    });
  }

  return res.json({
    success: true,
    valid: true,
    user: {
      username: decoded.username,
      role: decoded.role,
      name: decoded.name,
      deviceId: decoded.deviceId,
      sessionId: decoded.sessionId
    }
  });
}

module.exports = {
  handleLogin,
  handleDeviceStatus,
  handleVerify
};
