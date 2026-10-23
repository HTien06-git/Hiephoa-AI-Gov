const securityService = require('../services/securityService');

// Lấy danh sách toàn bộ thiết bị
function handleGetAllDevices(req, res) {
  try {
    const list = securityService.getAllDevices();
    return res.json({
      success: true,
      count: list.length,
      devices: list,
      data: list
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Reset lượt đăng nhập của 1 thiết bị về 0/5 (Mở khóa)
function handleResetDevice(req, res) {
  try {
    const { deviceId } = req.params;
    const ok = securityService.resetDevice(deviceId);
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thiết bị hoặc thiết bị chưa từng có lịch sử thử đăng nhập.'
      });
    }

    return res.json({
      success: true,
      message: `Đã mở khóa và reset lượt đăng nhập cho thiết bị ${deviceId} về 0/5 thành công!`,
      deviceId
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Reset toàn bộ thiết bị đang bị khóa
function handleResetAllDevices(req, res) {
  try {
    const count = securityService.resetAllDevices();
    return res.json({
      success: true,
      message: `Đã mở khóa toàn bộ ${count} thiết bị về trạng thái hợp lệ (0/5)!`,
      resetCount: count,
      unlockedCount: count
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Tạo thiết bị khóa mẫu để biểu diễn trước Ban Giám khảo
function handleCreateDemoLock(req, res) {
  try {
    const demoDev = securityService.createDemoLockedDevice();
    return res.json({
      success: true,
      message: `Đã tạo thành công thiết bị khóa mẫu ${demoDev.deviceId} (5/5) để biểu diễn mở khóa!`,
      device: demoDev,
      data: demoDev
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Lấy danh sách toàn bộ cán bộ & admin
function handleGetAllOfficers(req, res) {
  try {
    const list = securityService.getAllOfficers();
    return res.json({
      success: true,
      officers: list,
      data: list
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Tạo mới tài khoản cán bộ
function handleCreateOfficer(req, res) {
  try {
    const { username, password, name, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Tên tài khoản và mật khẩu là bắt buộc.'
      });
    }

    const created = securityService.createOfficer(username, password, name, role);
    return res.json({
      success: true,
      message: `Tạo tài khoản cán bộ "${created.username}" thành công!`,
      officer: created,
      data: created
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

module.exports = {
  handleGetAllDevices,
  handleResetDevice,
  handleResetAllDevices,
  handleCreateDemoLock,
  handleGetAllOfficers,
  handleCreateOfficer
};
