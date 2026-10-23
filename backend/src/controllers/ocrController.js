const visionOcrService = require('../services/visionOcrService');

async function handleCccdOcr(req, res) {
  try {
    let imageBuffer = null;
    let mimeType = 'image/jpeg';

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body && req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
      if (req.body.imageBase64.includes('image/png')) mimeType = 'image/png';
    }

    // Call Vision OCR service
    const result = await visionOcrService.ocrCccdFront(imageBuffer, mimeType);

    return res.json(result);
  } catch (error) {
    console.error('[ocrController] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi bóc tách ảnh CCCD.',
      details: error.message
    });
  }
}

module.exports = {
  handleCccdOcr
};
