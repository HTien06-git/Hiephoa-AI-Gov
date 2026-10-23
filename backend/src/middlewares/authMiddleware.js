const securityService = require('../services/securityService');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Vui lòng đăng nhập để thực hiện quyền này.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = securityService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'
    });
  }

  req.user = decoded;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Quyền truy cập bị từ chối. Thao tác chỉ dành cho Quản trị viên (Admin).'
    });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin
};
