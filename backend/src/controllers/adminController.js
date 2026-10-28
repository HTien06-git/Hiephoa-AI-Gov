const securityService = require('../services/securityService');
const { buildClientSnapshot } = require('../utils/persistentStore');

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

    const snapshot = buildClientSnapshot();
    return res.json({
      success: true,
      message: `Đã mở khóa và reset lượt đăng nhập cho thiết bị ${deviceId} về 0/5 thành công!`,
      deviceId,
      clientSnapshot: snapshot
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Reset toàn bộ thiết bị đang bị khóa
function handleResetAllDevices(req, res) {
  try {
    const count = securityService.resetAllDevices();
    const snapshot = buildClientSnapshot();
    return res.json({
      success: true,
      message: `Đã mở khóa toàn bộ ${count} thiết bị về trạng thái hợp lệ (0/5)!`,
      resetCount: count,
      unlockedCount: count,
      clientSnapshot: snapshot
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Lấy danh sách toàn bộ cán bộ & admin
function handleGetAllOfficers(req, res) {
  try {
    const list = securityService.getAllOfficers();
    const snapshot = buildClientSnapshot();
    return res.json({
      success: true,
      officers: list,
      data: list,
      clientSnapshot: snapshot
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Tạo mới tài khoản cán bộ
function handleCreateOfficer(req, res) {
  try {
    const { username, password, name, role, department } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Tên tài khoản và mật khẩu là bắt buộc.'
      });
    }

    const created = securityService.createOfficer(username, password, name, role, department);
    const snapshot = buildClientSnapshot();
    return res.json({
      success: true,
      message: `Tạo tài khoản cán bộ "${created.username}" thành công!`,
      officer: created,
      data: created,
      clientSnapshot: snapshot
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

// Cập nhật tài khoản cán bộ (đổi mật khẩu, tạm khóa / mở khóa)
function handleUpdateOfficer(req, res) {
  try {
    const { username } = req.params;
    const updates = req.body || {};
    const updated = securityService.updateOfficer(username, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Không tìm thấy tài khoản cán bộ "${username}"`
      });
    }

    const snapshot = buildClientSnapshot();
    return res.json({
      success: true,
      message: `Cập nhật tài khoản cán bộ "${username}" thành công!`,
      officer: updated,
      data: updated,
      clientSnapshot: snapshot
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Xóa tài khoản cán bộ
function handleDeleteOfficer(req, res) {
  try {
    const { username } = req.params;
    const ok = securityService.deleteOfficer(username);
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: `Không tìm thấy tài khoản cán bộ "${username}" để xóa.`
      });
    }

    const snapshot = buildClientSnapshot();
    return res.json({
      success: true,
      message: `Đã xóa tài khoản cán bộ "${username}" thành công!`,
      username,
      clientSnapshot: snapshot
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  handleGetAllDevices,
  handleResetDevice,
  handleResetAllDevices,
  handleGetAllOfficers,
  handleCreateOfficer,
  handleUpdateOfficer,
  handleDeleteOfficer
};
