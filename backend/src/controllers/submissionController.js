const realtimeSyncService = require('../services/realtimeSyncService');

// POST /api/submissions: Người dân tạo hồ sơ / nộp mã QR
function handleCreateSubmission(req, res) {
  try {
    const payload = req.body || {};
    const newSub = realtimeSyncService.createSubmission(payload);
    return res.status(201).json({
      success: true,
      message: `Hồ sơ ${newSub.submissionCode} đã được tạo và gửi trực tuyến tới Bộ phận Một cửa xã Hiệp Hòa!`,
      submission: newSub,
      data: newSub
    });
  } catch (err) {
    console.error('[submissionController] createSubmission error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/submissions/live: Cán bộ Một cửa & Admin tự động polling mỗi 3 giây
function handleGetLiveQueue(req, res) {
  try {
    const queueData = realtimeSyncService.getLiveQueue();
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

// GET /api/submissions/:code: Người dân theo dõi tiến độ hồ sơ từ điện thoại
function handleGetSubmission(req, res) {
  try {
    const { code } = req.params;
    const sub = realtimeSyncService.getSubmissionByCode(code);
    if (!sub) {
      return res.status(404).json({
        success: false,
        error: `Không tìm thấy hồ sơ có mã ${code}`
      });
    }
    return res.json({
      success: true,
      submission: sub,
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
    return res.json({
      success: true,
      message: `Cập nhật hồ sơ ${code} thành công!`,
      submission: updated,
      data: updated
    });
  } catch (err) {
    console.error('[submissionController] updateSubmission error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/submissions/reset-demo: Reset về 03 hồ sơ mẫu
function handleResetDemoQueue(req, res) {
  try {
    const list = realtimeSyncService.resetDemoData();
    return res.json({
      success: true,
      message: 'Đã thiết lập lại 03 hồ sơ mẫu trực tuyến thành công!',
      submissions: list,
      data: list
    });
  } catch (err) {
    console.error('[submissionController] resetDemo error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/stats/realtime: Thống kê tổng hợp trực tuyến
function handleGetRealtimeStats(req, res) {
  try {
    const queueData = realtimeSyncService.getLiveQueue();
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
  handleGetRealtimeStats
};
