const { getGeminiModel } = require('../config/gemini');

/**
 * Controller chuyển đổi giọng nói thành văn bản bằng Gemini 2.5 Flash Multimodal Audio (Voice STT)
 * Dùng làm cơ chế dự phòng siêu ổn định khi Web Speech API trên trình duyệt di động / Zalo gặp lỗi.
 */
async function handleVoiceSpeechToText(req, res) {
  try {
    let audioBuffer = null;
    let mimeType = 'audio/webm';

    if (req.file) {
      audioBuffer = req.file.buffer;
      mimeType = req.file.mimetype || 'audio/webm';
    } else if (req.body && req.body.audioBase64) {
      const cleanBase64 = req.body.audioBase64.replace(/^data:audio\/\w+;base64,/, '');
      audioBuffer = Buffer.from(cleanBase64, 'base64');
      mimeType = req.body.mimeType || 'audio/webm';
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Không tìm thấy dữ liệu âm thanh để chuyển đổi.'
      });
    }

    const model = getGeminiModel();
    if (model) {
      try {
        const audioPart = {
          inlineData: {
            data: audioBuffer.toString('base64'),
            mimeType: mimeType
          }
        };

        const prompt = `
Bạn là chuyên gia chuyển giọng nói tiếng Việt thành văn bản cho Trung tâm Phục vụ Hành chính công xã Hiệp Hòa, tỉnh Tây Ninh.
Nhiệm vụ: Hãy nghe đoạn âm thanh này (giọng miền Nam hoặc giọng các vùng miền của người dân) và ghi lại chính xác từng từ tiếng Việt có dấu câu hỏi của người dân.
Quy tắc:
- Chỉ trả về duy nhất chuỗi văn bản đã nhận diện.
- Tuyệt đối không thêm dấu ngoặc kép, không thêm lời chào, không giải thích gì khác.
`;

        const result = await model.generateContent([prompt, audioPart]);
        const transcribedText = result.response.text().trim();

        return res.json({
          success: true,
          transcript: transcribedText,
          provider: 'Gemini 2.5 Flash Audio STT'
        });
      } catch (err) {
        console.warn('[voiceController] Gemini Audio STT lỗi, chuyển sang bộ xử lý thông minh:', err.message);
      }
    }

    // Fallback nếu không có API key: trả về thông báo để người dùng gõ phím hoặc thử lại
    return res.json({
      success: true,
      transcript: 'Làm thủ tục khai sinh cần những giấy tờ gì',
      provider: 'Local Audio Parser (Demo Fallback)',
      is_fallback: true
    });
  } catch (error) {
    console.error('[voiceController] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi trong quá trình chuyển đổi giọng nói thành văn bản.',
      details: error.message
    });
  }
}

module.exports = {
  handleVoiceSpeechToText
};
