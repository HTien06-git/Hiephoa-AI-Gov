const geminiRagService = require('../services/geminiRagService');

async function handleChatQuery(req, res) {
  try {
    const { message, procedureId, categoryId, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Vui lòng cung cấp nội dung câu hỏi (message).'
      });
    }

    const result = await geminiRagService.processQuery(message, {
      procedureId,
      categoryId,
      history
    });

    // Cập nhật bộ đếm và nhật ký trực tuyến thời gian thực
    try {
      const realtimeSyncService = require('../services/realtimeSyncService');
      realtimeSyncService.recordChatEvent(message);
    } catch (e) {
      // Non-blocking
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[ragController] Error:', error);
    return res.status(500).json({
      error: 'Lỗi trong quá trình xử lý câu hỏi tư vấn.',
      details: error.message
    });
  }
}

module.exports = {
  handleChatQuery
};
