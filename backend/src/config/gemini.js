const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

let genAI = null;
if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log(`[Gemini Config] Đã cấu hình Google Gemini với mô hình: ${modelName}`);
  } catch (err) {
    console.warn('[Gemini Config] Không thể khởi tạo GoogleGenerativeAI:', err.message);
  }
} else {
  console.log('[Gemini Config] Chưa có GEMINI_API_KEY. Hệ thống kích hoạt Chế độ Tri thức Nội bộ Cấp xã (Local Strict-Domain Knowledge Engine).');
}

function getGeminiModel(customModelName) {
  if (!genAI) return null;
  const targetModel = customModelName || modelName;
  try {
    return genAI.getGenerativeModel({ model: targetModel });
  } catch (e) {
    try {
      return genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
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
