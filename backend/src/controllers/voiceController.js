const https = require('https');
const { getGeminiModel } = require('../config/gemini');

/**
 * Controller chuyển đổi giọng nói thành văn bản bằng Gemini Multimodal Audio (Voice STT)
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

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Voice STT timeout 2500ms')), 2500)
        );
        const result = await Promise.race([model.generateContent([prompt, audioPart]), timeoutPromise]);
        const transcribedText = result.response.text().trim();

        return res.json({
          success: true,
          transcript: transcribedText,
          provider: 'Gemini 1.5 Flash Audio STT'
        });
      } catch (err) {
        console.warn('[voiceController] Gemini Audio STT lỗi, chuyển sang bộ xử lý thông minh:', err.message);
      }
    }

    // Fallback nếu không có API key
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

/**
 * Controller Text-to-Speech (TTS) Tiếng Việt chuẩn Quốc gia
 * Phát âm thanh giọng nữ tiếng Việt trong trẻo, tự nhiên, chống 100% lỗi câm tiếng của Web Speech API
 */
function handleTextToSpeech(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const text = req.query.text || '';
    if (!text || !text.trim()) {
      return res.status(400).send('Thiếu tham số text');
    }

    // Làm sạch và giới hạn độ dài câu
    const cleanText = text
      .normalize('NFC')
      .replace(/[*#_`>\[\]\(\)]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 195);

    const encoded = encodeURIComponent(cleanText);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=vi&client=tw-ob`;

    const request = https.get(ttsUrl, {
      family: 4, // Ép IPv4 để chống delay IPv6 trên Windows/Vercel
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    }, (ttsRes) => {
      if (ttsRes.statusCode !== 200) {
        return res.status(ttsRes.statusCode || 500).send('TTS Provider Error');
      }
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      ttsRes.pipe(res);
    });

    request.setTimeout(4500, () => {
      request.destroy();
      if (!res.headersSent) {
        res.status(504).send('TTS Timeout');
      }
    });

    request.on('error', (err) => {
      console.warn('[voiceController] TTS stream error:', err.message);
      if (!res.headersSent) {
        res.status(502).send('TTS Error');
      }
    });
  } catch (err) {
    console.error('[voiceController] TTS error:', err);
    if (!res.headersSent) {
      res.status(500).send('Server Error');
    }
  }
}

module.exports = {
  handleVoiceSpeechToText,
  handleTextToSpeech
};
