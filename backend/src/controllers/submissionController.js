const realtimeSyncService = require('../services/realtimeSyncService');
const { buildClientSnapshot } = require('../utils/persistentStore');

// POST /api/submissions: Người dân tạo hồ sơ / nộp mã QR
function handleCreateSubmission(req, res) {
  try {
    const payload = req.body || {};
    const newSub = realtimeSyncService.createSubmission(payload);
    const snapshot = buildClientSnapshot();
    return res.status(201).json({
      success: true,
      message: `Hồ sơ ${newSub.submissionCode} đã được tạo và gửi trực tuyến tới Bộ phận Một cửa xã Hiệp Hòa!`,
      submission: newSub,
      data: newSub,
      clientSnapshot: snapshot
    });
  } catch (err) {
    console.error('[submissionController] createSubmission error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/submissions/live: Cán bộ Một cửa & Admin tự động polling mỗi 3 giây
async function handleGetLiveQueue(req, res) {
  try {
    // Nếu có gửi kèm token cán bộ, kiểm tra trạng thái phiên làm việc (Single active session)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const securityService = require('../services/securityService');
      const token = authHeader.split(' ')[1];
      const decoded = securityService.verifyToken(token);
      if (decoded && decoded.username) {
        const check = securityService.validateSession(decoded.username, decoded.sessionId, decoded.deviceId);
        if (!check.valid) {
          return res.status(401).json({
            success: false,
            sessionTerminated: true,
            code: 'SESSION_TERMINATED',
            error: check.message
          });
        }
      }
    }

    const queueData = await realtimeSyncService.getLiveQueue();
    return res.json({
      success: true,
      count: queueData.submissions.length,
      ...queueData
    });
  } catch (err) {
    console.error('[submissionController] getLiveQueue error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/submissions/:code: Người dân theo dõi tiến độ hồ sơ từ điện thoại (Hỗ trợ Mã HH-xxxx, Số CCCD 12 số, hoặc SĐT)
function handleGetSubmission(req, res) {
  try {
    const { code } = req.params;
    const clean = (code || '').trim();
    if (!clean) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp mã hồ sơ hoặc số CCCD' });
    }

    // 1. Kiểm tra khớp mã hồ sơ
    let sub = realtimeSyncService.getSubmissionByCode(clean);
    let matches = [];

    // 2. Nếu không thấy theo mã hồ sơ, tra cứu linh hoạt theo số CCCD (12 số) hoặc SĐT
    if (!sub) {
      matches = realtimeSyncService.lookupSubmissions(clean);
      if (matches.length > 0) {
        sub = matches[0];
      }
    } else {
      matches = [sub];
    }

    if (!sub) {
      return res.status(404).json({
        success: false,
        error: `Không tìm thấy hồ sơ với mã hoặc số CCCD/SĐT "${clean}". Bà con vui lòng kiểm tra lại.`
      });
    }

    return res.json({
      success: true,
      submission: sub,
      submissions: matches,
      totalMatches: matches.length,
      data: sub
    });
  } catch (err) {
    console.error('[submissionController] getSubmission error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// PUT /api/submissions/:code: Cán bộ cập nhật thông tin tờ khai hoặc đổi trạng thái hồ sơ
function handleUpdateSubmission(req, res) {
  try {
    const { code } = req.params;
    const updates = req.body || {};
    const updated = realtimeSyncService.updateSubmission(code, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Không tìm thấy hồ sơ có mã ${code} để cập nhật`
      });
    }
    const snapshot = buildClientSnapshot();
    return res.json({
      success: true,
      message: `Cập nhật hồ sơ ${code} thành công!`,
      submission: updated,
      data: updated,
      clientSnapshot: snapshot
    });
  } catch (err) {
    console.error('[submissionController] updateSubmission error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/submissions/reset-all: Reset xóa toàn bộ hồ sơ đã nộp để đưa vào vận hành thật
function handleResetAllSubmissions(req, res) {
  try {
    const list = realtimeSyncService.resetAllSubmissions();
    const snapshot = buildClientSnapshot();
    return res.json({
      success: true,
      message: 'Đã xóa và làm sạch toàn bộ hồ sơ đã nộp trong hệ thống thành công!',
      submissions: list,
      data: list,
      clientSnapshot: snapshot
    });
  } catch (err) {
    console.error('[submissionController] resetAll error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/submissions/reset-demo: Reset hồ sơ (tương thích ngược)
function handleResetDemoQueue(req, res) {
  return handleResetAllSubmissions(req, res);
}

// GET /api/stats/realtime: Thống kê tổng hợp trực tuyến
async function handleGetRealtimeStats(req, res) {
  try {
    const queueData = await realtimeSyncService.getLiveQueue();
    return res.json({
      success: true,
      stats: queueData.stats,
      activityFeed: queueData.activityFeed
    });
  } catch (err) {
    console.error('[submissionController] stats error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  handleCreateSubmission,
  handleGetLiveQueue,
  handleGetSubmission,
  handleUpdateSubmission,
  handleResetDemoQueue,
  handleResetAllSubmissions,
  handleGetRealtimeStats
};
