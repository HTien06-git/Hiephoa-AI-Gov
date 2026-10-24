const visionOcrService = require('../services/visionOcrService');

async function handlePreCheck(req, res) {
  try {
    const procedureId = req.body.procedureId || req.query.procedureId || 'TT_KHAI_SINH';
    let files = [];

    if (req.files && Array.isArray(req.files)) {
      files = req.files.map(f => ({
        buffer: f.buffer,
        mimeType: f.mimetype,
        filename: f.originalname
      }));
    } else if (req.file) {
      files = [{
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        filename: req.file.originalname
      }];
    } else if (req.body && req.body.images && Array.isArray(req.body.images)) {
      files = req.body.images.map((base64Str, idx) => {
        const cleanBase64 = base64Str.replace(/^data:image\/\w+;base64,/, '');
        return {
          buffer: Buffer.from(cleanBase64, 'base64'),
          mimeType: 'image/jpeg',
          filename: `upload_${idx + 1}.jpg`
        };
      });
    }

    const result = await visionOcrService.preCheckDocuments(files, procedureId);

    try {
      const realtimeSyncService = require('../services/realtimeSyncService');
      realtimeSyncService.recordPreCheckEvent(procedureId);
    } catch (e) {
      // Non-blocking
    }

    return res.json(result);
  } catch (error) {
    console.error('[preCheckController] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi kiểm tra sơ bộ hồ sơ.',
      details: error.message
    });
  }
}

module.exports = {
  handlePreCheck
};
