const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || '';
const rawModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
// Chuẩn hóa tên model hợp lệ theo chuẩn Google Generative AI SDK
const modelName = (rawModel.includes('3.8') || !rawModel.startsWith('gemini-')) ? 'gemini-1.5-flash' : rawModel;

let genAI = null;
if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here' && !apiKey.startsWith('AQ.')) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log(`[Gemini Config] Đã cấu hình Google Gemini với mô hình: ${modelName}`);
  } catch (err) {
    console.warn('[Gemini Config] Không thể khởi tạo GoogleGenerativeAI:', err.message);
  }
} else {
  console.log('[Gemini Config] Kích hoạt Chế độ Tri thức Hành chính Cấp xã Nội bộ (Local Strict-Domain Knowledge Engine) tốc độ cao.');
}

function getGeminiModel(customModelName) {
  if (!genAI) return null;
  const targetModel = customModelName || modelName;
  try {
    return genAI.getGenerativeModel({ model: targetModel });
  } catch (e) {
    try {
      return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (err) {
      return null;
    }
  }
}

module.exports = {
  genAI,
  getGeminiModel,
  hasApiKey: Boolean(genAI),
  defaultModel: modelName
};
