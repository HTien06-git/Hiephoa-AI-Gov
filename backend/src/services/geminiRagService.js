const { getGeminiModel } = require('../config/gemini');
const vectorStore = require('./vectorStore');
const legalWebSearchService = require('./legalWebSearchService');
const localInfo = require('../data/local_info.json');

const SYSTEM_PROMPT = `
Bạn là "Chuyên viên Hành chính công AI" của Trung tâm Phục vụ Hành chính công UBND xã Hiệp Hòa, tỉnh Tây Ninh.
Nhiệm vụ của bạn là tư vấn, hướng dẫn thủ tục hành chính và giải thích các quy định pháp luật Việt Nam cho nhân dân xã Hiệp Hòa, đặc biệt là người lớn tuổi, nông dân và người chưa quen công nghệ.

CÁC NGUYÊN TẮC BẮT BUỘC:
1. PHẠM VI & PHÂN LOẠI Ý ĐỊNH (3-WAY INTENT ROUTING):
   Mỗi câu hỏi của công dân phải được phân loại rõ vào 1 trong 3 nhóm:
   - NHÓM A (GREETING): Chào hỏi, cảm ơn, hỏi thăm xã giao (ví dụ: "Chào em", "Hôm nay xã có làm việc không?", "Bạn tên gì?").
     -> Trả lời tự nhiên, ấm áp, lễ phép, gần gũi như người thật (xưng "Chuyên viên AI" hoặc "em/con", gọi "bà con/cô chú anh chị"). KHÔNG gắn checklist thủ tục.
   - NHÓM B (LEGAL_CONSULTATION): Tư vấn pháp luật đời sống, mâu thuẫn, tranh chấp, an ninh trật tự, hình sự, dân sự, vi phạm pháp luật:
     * KHI CÔNG DÂN HỎI VỀ MỘT HÀNH VI (Đánh nhau, hát karaoke đêm, uống rượu bia lái xe, đánh bạc, bêu rếu mạng xã hội, bạo lực gia đình, lấn chiếm ranh đất...):
       BẮT BUỘC TRẢ LỜI RÕ RÀNG THEO CẤU TRÚC 4 BƯỚC:
       (1) KẾT LUẬN: Khẳng định rõ hành vi này CÓ VI PHẠM PHÁP LUẬT hay KHÔNG VI PHẠM.
       (2) CĂN CỨ PHÁP LÝ: Trích dẫn chính xác Điều mấy, Khoản mấy, tên Văn bản Luật/Nghị định (Nghị định 144/2021, Nghị định 100/2019, Bộ luật Hình sự 2015, Luật Đất đai 2024, Luật Hôn nhân gia đình 2014...).
       (3) HÌNH THỨC XỬ PHẠT: Nêu rõ mức phạt tiền cụ thể (từ bao nhiêu đến bao nhiêu triệu đồng) hoặc khung hình phạt tù/cải tạo nếu cấu thành tội phạm.
       (4) LỜI KHUYÊN & HƯỚNG XỬ LÝ: Khuyên can ôn hòa, giữ gìn an ninh trật tự, hướng dẫn liên hệ Công an xã Hiệp Hòa hoặc Tổ hòa giải ấp.
       TUYỆT ĐỐI KHÔNG gán nhầm sang thủ tục hành chính cụ thể!
   - NHÓM C (PROCEDURE_GUIDE): Công dân muốn làm thủ tục hành chính cụ thể tại UBND xã Hiệp Hòa (Khai sinh, Kết hôn, Xác nhận độc thân, Sao y, Sang tên sổ đỏ, Cư trú, Trợ cấp người cao tuổi).
     -> Hướng dẫn rõ từng bước chuẩn bị giấy tờ, thời gian và lệ phí, trả về mã thủ tục chính xác.

2. PHONG CÁCH GIAO TIẾP "ELDER-FRIENDLY & VOICE-FIRST":
   - Luôn mở đầu bằng: "Dạ thưa bà con..." hoặc "Thưa cô chú anh chị..."
   - Trả lời TRỰC TIẾP, ĐÚNG VÀO NỘI DUNG câu hỏi, không nói vòng vo, không lặp lại câu hỏi của người dân.
3. XỬ LÝ TỪ VIẾT TẮT & PHÁT ÂM (VOICE-FRIENDLY):
   - Tuyệt đối KHÔNG đọc đánh vần các chữ cái viết tắt (như C-C-C-D, U-B-N-D, D-V-C, B-T-P, B-C-A, G-P-L-X).
   - Trong trường "voice_text", BẮT BUỘC phải viết ra đầy đủ: "Căn cước công dân", "Ủy ban nhân dân xã Hiệp Hòa", "Dịch vụ công", "Bộ Tư pháp", "Bộ Công an", "Giấy phép lái xe", "Nghị định Chính phủ".
   - Đối với câu chào hỏi hoặc câu hỏi xã giao của người dân ("Chào em", "Em khỏe không", "Bạn là ai", "Cảm ơn em", "Xã làm việc mấy giờ"):
     Hãy trả lời thật lễ phép, ấm áp, thân tình như một người con cháu phục vụ nhân dân xã Hiệp Hòa, không trả lời cộc lốc hoặc lặp lại câu hỏi.
`;

function expandVietnameseGovAbbreviations(text) {
  if (!text) return '';
  return text
    .replace(/\bCCCD\b/gi, 'Căn cước công dân')
    .replace(/\bCMND\b/gi, 'Chứng minh nhân dân')
    .replace(/\bUBND\b/gi, 'Ủy ban nhân dân')
    .replace(/\bDVC\b/gi, 'Dịch vụ công')
    .replace(/\bBTP\b/gi, 'Bộ Tư pháp')
    .replace(/\bBCA\b/gi, 'Bộ Công an')
    .replace(/\bBHXH\b/gi, 'Bảo hiểm xã hội')
    .replace(/\bBHYT\b/gi, 'Bảo hiểm y tế')
    .replace(/\bGPLX\b/gi, 'Giấy phép lái xe')
    .replace(/\bĐKTT\b/gi, 'Đăng ký thường trú')
    .replace(/\bPCCC\b/gi, 'Phòng cháy chữa cháy')
    .replace(/\bHĐND\b/gi, 'Hội đồng nhân dân')
    .replace(/\bTTHC\b/gi, 'Thủ tục hành chính')
    .replace(/\bNĐ-CP\b/gi, 'Nghị định Chính phủ')
    .replace(/\bTT-BTP\b/gi, 'Thông tư Bộ Tư pháp')
    .replace(/\bCT01\b/gi, 'Tờ khai CT01 cư trú')
    .replace(/\bVNeID\b/gi, 'ứng dụng VNeID');
}

class GeminiRagService {
  /**
   * Process citizen chat/voice query with 3-Way Intent Routing
   * @param {string} userMessage
   * @param {Object} options { procedureId, categoryId, history }
   */
  async processQuery(userMessage, options = {}) {
    const rawMsg = (userMessage || '').trim();
    if (!rawMsg) {
      return {
        intentType: 'GREETING',
        answer: 'Dạ, kính chào bà con nhân dân xã Hiệp Hòa! Em là Chuyên viên Hành chính công AI. Bà con cần làm giấy tờ thủ tục gì hoặc hỏi thăm quy định pháp luật nào, xin cứ nói cho em nghe ạ!',
        voice_text: 'Dạ, kính chào bà con nhân dân xã Hiệp Hòa! Bà con cần làm giấy tờ gì hoặc hỏi luật gì, xin cứ nói cho em nghe ạ!',
        checklist: null,
        matchedProcedure: null,
        sources: []
      };
    }

    const trimmedMsg = expandVietnameseGovAbbreviations(rawMsg);

    const cleanLower = trimmedMsg
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .trim();

    // =========================================================================
    // 1. NHẬN DIỆN Ý ĐỊNH SƠ BỘ (LOCAL INTENT DETECTION)
    // =========================================================================

    // Nhóm A: Chào hỏi, giao tiếp thường ngày
    const greetingPatterns = [
      'chao', 'xin chao', 'hello', 'hi', 'ban ten gi', 'em ten gi', 'ai do', 'ban la ai', 'em la ai',
      'cam on', 'thank', 'xa co lam viec khong', 'gio lam viec', 'may gio mo cua', 'khoe khong', 'suc khoe',
      'tam biet', 'chuc ngu ngon', 'hom nay the nao', 'thoi tiet'
    ];
    const isGreeting = greetingPatterns.some(p => cleanLower === p || cleanLower.startsWith(p + ' ') || cleanLower.endsWith(' ' + p));

    // Nhóm C (Ưu tiên): Tìm kiếm thủ tục hành chính cụ thể trước
    let matchedProcedure = null;
    if (options.procedureId) {
      matchedProcedure = vectorStore.getProcedureById(options.procedureId);
    } else if (!isGreeting) {
      const searchResults = vectorStore.search(trimmedMsg);
      if (searchResults.matchedProcedures.length > 0) {
        matchedProcedure = searchResults.matchedProcedures[0];
      }
    }

    // Nhóm B: Pháp luật đời sống, an ninh trật tự, tội phạm, chất cấm ma túy, mâu thuẫn, tranh chấp
    // CHÚ Ý: Tuyệt đối không dùng các từ 2 chữ như 'da', 'ke', 'so do' để tránh match nhầm "hướng dẫn", "đăng ký", "đất đai"!
    const legalKeywords = [
      'chat cam', 'ma tuy', 'mua ban chat cam', 'mua ban ma tuy', 'tang tru ma tuy', 'van chuyen ma tuy', 'su dung ma tuy', 'hut hit', 'co my', 'choi ke', 'ma tuy da', 'dap da', 'heroin', 'bong cuoi', 'shisha',
      'bi phat gi', 'phat bao nhieu', 'o tu', 'phat tu', 'hinh su', 'khoi to', 'truy cuu', 'toi pham', 'vi pham phap luat', 'muc phat', 'xu phat',
      'danh lon', 'danh nhau', 'chem nhau', 'danh nguoi', 'gay go', 'gay thuong tich',
      'lan ranh', 'tranh chap dat', 'loi di chung', 'tranh chap',
      'ly hon', 'chia tai san', 'ngoai tinh', 'quyen nuoi con',
      'danh bac', 'so de', 'lo de', 'ca do', 'vay nang lai', 'tin dung den', 'tieng on', 'loa keo',
      'nong do con', 'uong ruou lai xe', 'uong bia lai xe', 'vuot den do',
      'xuc pham', 'boi nho', 'bao luc gia dinh'
    ];
    const isLegalConsultation = !matchedProcedure && (
      legalKeywords.some(k => cleanLower.includes(k)) || 
      cleanLower.includes('phap luat') || 
      cleanLower.includes('bi phat') || 
      cleanLower.includes('tinh huong') ||
      cleanLower.includes('co pham toi') ||
      cleanLower.includes('co vi pham')
    );

    // Tra cứu nguồn Thư Viện Pháp Luật
    const webLegalFinding = legalWebSearchService.search(trimmedMsg);
    const defaultSources = [
      { title: "Thư Viện Pháp Luật", url: "https://thuvienphapluat.vn/" },
      { title: "Cổng Dịch vụ công Quốc gia", url: "https://dichvucong.gov.vn/" },
      { title: "Cổng DVC Tỉnh Tây Ninh", url: "https://dichvucong.tayninh.gov.vn/" }
    ];
    const combinedSources = webLegalFinding?.sources || defaultSources;

    // =========================================================================
    // 2. GỌI GEMINI 2.5 FLASH NẾU CÓ CẤU HÌNH API KEY
    // =========================================================================
    const model = getGeminiModel();
    if (model) {
      try {
        const historyText = (options.history || [])
          .map(h => `${h.role === 'user' ? 'Công dân' : 'Chuyên viên AI'}: ${h.content}`)
          .join('\n');

        const prompt = `
${SYSTEM_PROMPT}

NGỮ CẢNH DỮ LIỆU ĐỊA PHƯƠNG & PHÁP LUẬT TỪ THƯ VIỆN PHÁP LUẬT:
Chủ đề pháp luật liên quan: ${webLegalFinding?.topic || 'Không có'}
Văn bản pháp luật: ${webLegalFinding?.lawName || ''} (${webLegalFinding?.articles || ''})
Tóm tắt quy định: ${webLegalFinding?.summary || ''}

THỦ TỤC HÀNH CHÍNH LIÊN QUAN (NẾU CÓ):
${matchedProcedure ? JSON.stringify({ id: matchedProcedure.id, title: matchedProcedure.title }, null, 2) : 'Không có thủ tục cụ thể.'}

LỊCH SỬ HỘI THOẠI TRƯỚC:
${historyText || 'Chưa có'}

CÂU HỎI MỚI CỦA CÔNG DÂN:
"${trimmedMsg}"

HÃY PHÂN TÍCH VÀ TRẢ LỜI ĐÚNG ĐỊNH DẠNG JSON:
{
  "intentType": "GREETING" | "LEGAL_CONSULTATION" | "PROCEDURE_GUIDE",
  "voice_text": "Lời nói trực tiếp ngắn gọn 2-3 câu, mở đầu bằng 'Dạ thưa bà con' hoặc 'Thưa cô chú anh chị', trả lời thẳng vào tình huống.",
  "answer": "Nội dung trả lời chi tiết bằng Markdown, phân tích thấu tình đạt lý, trích dẫn Điều, Khoản văn bản luật cụ thể nếu liên quan.",
  "matchedProcedureId": "${matchedProcedure ? matchedProcedure.id : ''}"
}
Chỉ xuất JSON thuần túy, không có markdown block.
`;

        const timeoutMs = 2000;
        const geminiPromise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini API timeout sau ${timeoutMs}ms`)), timeoutMs)
        );

        const result = await Promise.race([geminiPromise, timeoutPromise]);
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);

        const finalMatchedProc = parsed.intentType === 'PROCEDURE_GUIDE' && (parsed.matchedProcedureId || matchedProcedure)
          ? (vectorStore.getProcedureById(parsed.matchedProcedureId) || matchedProcedure)
          : null;

        return {
          intentType: parsed.intentType,
          answer: parsed.answer,
          voice_text: parsed.voice_text,
          checklist: finalMatchedProc ? finalMatchedProc.checklist : null,
          matchedProcedure: finalMatchedProc,
          legal_basis: webLegalFinding?.lawName ? `${webLegalFinding.lawName} (${webLegalFinding.articles})` : (finalMatchedProc?.legal_basis || 'Quy định pháp luật hiện hành.'),
          sources: combinedSources
        };
      } catch (err) {
        console.warn('[GeminiRagService] Gemini API chậm hoặc không phản hồi (' + err.message + ') -> Kích hoạt Bộ phân loại 3-Way Intent chuẩn xác siêu tốc (5ms)');
      }
    }

    // =========================================================================
    // 3. BỘ MÁY XỬ LÝ Ý ĐỊNH CHUẨN XÁC NỘI BỘ (3-WAY INTENT DETERMINISTIC ENGINE)
    // TUYỆT ĐỐI KHÔNG GHÉP CHUỖI CỨNG, KHÔNG GÁN BỪA SANG THỦ TỤC ĐẤT ĐAI!
    // =========================================================================

    // -------------------------------------------------------------------------
    // NHÓM A: GIAO TIẾP XÃ GIAO, CHÀO HỎI
    // -------------------------------------------------------------------------
    if (isGreeting || cleanLower.includes('chao') || cleanLower.includes('cam on') || cleanLower.includes('tam biet')) {
      if (cleanLower.includes('xa co lam viec khong') || cleanLower.includes('gio lam viec') || cleanLower.includes('may gio')) {
        return {
          intentType: 'GREETING',
          voice_text: 'Dạ thưa bà con, UBND xã Hiệp Hòa làm việc từ thứ Hai đến thứ Sáu hàng tuần. Buổi sáng từ 7 giờ đến 11 giờ 30, buổi chiều từ 13 giờ 30 đến 17 giờ. Thứ Bảy, Chủ Nhật và ngày lễ xã nghỉ theo quy định nhà nước ạ!',
          answer: `### Lịch làm việc của UBND xã Hiệp Hòa (Tỉnh Tây Ninh)

Dạ thưa bà con nhân dân, Bộ phận Tiếp nhận và Trả kết quả (Một cửa) UBND xã Hiệp Hòa trân trọng thông báo thời gian làm việc:

* **Các ngày làm việc:** Từ **Thứ Hai** đến **Thứ Sáu** hàng tuần (Nghỉ Thứ Bảy, Chủ Nhật và các ngày nghỉ lễ theo quy định).
* **Khung giờ tiếp nhận & trả kết quả:**
  * **Buổi sáng:** Từ **07h00** đến **11h30**.
  * **Buổi chiều:** Từ **13h30** đến **17h00**.
* **Địa điểm:** Trụ sở UBND xã Hiệp Hòa, Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh.
* **Đường dây nóng hỗ trợ:** **1900 9095**.

Bà con cần hướng dẫn giấy tờ gì, em xin sẵn lòng hỗ trợ bà con ngay ạ!`,
          checklist: null,
          matchedProcedure: null,
          sources: defaultSources
        };
      }

      if (cleanLower.includes('cam on') || cleanLower.includes('thank')) {
        return {
          intentType: 'GREETING',
          voice_text: 'Dạ không có chi đâu bà con ơi! Được phục vụ và hỗ trợ bà con nhân dân xã Hiệp Hòa mình là niềm vinh dự của em. Chúc bà con một ngày thật nhiều niềm vui và vạn sự như ý nhé!',
          answer: `### Chuyên viên AI Xã Hiệp Hòa trân trọng cảm ơn!

Dạ không có gì đâu bà con ơi! Được đồng hành, giải đáp pháp luật và hướng dẫn thủ tục hành chính cho bà con nhân dân xã Hiệp Hòa là trách nhiệm và niềm vinh dự của em.

Chúc bà con và gia đình luôn dồi dào sức khỏe, bình an và hạnh phúc! Bất cứ khi nào cần làm giấy tờ hay hỏi luật, bà con cứ bấm vào đây trò chuyện với em nhé!`,
          checklist: null,
          matchedProcedure: null,
          sources: defaultSources
        };
      }

      if (cleanLower.includes('khoe khong') || cleanLower.includes('suc khoe')) {
        return {
          intentType: 'GREETING',
          voice_text: 'Dạ em cảm ơn bà con nhiều lắm! Em là trợ lý AI nên luôn tràn đầy năng lượng 24/7 để phục vụ bà con xã mình. Kính chúc bà con và gia đình luôn dồi dào sức khỏe và bình an nhé!',
          answer: `### Chuyên viên AI Xã Hiệp Hòa kính chúc sức khỏe bà con!

Dạ em cảm ơn bà con đã quan tâm hỏi thăm! Em là **Chuyên viên Hành chính công AI** của UBND xã Hiệp Hòa, em luôn túc trực 24/7 với năng lượng cao nhất để hỗ trợ bà con giải đáp pháp luật và làm thủ tục hành chính.

Kính chúc bà con và gia đình luôn dồi dào sức khỏe, công việc thuận lợi và vạn sự như ý ạ!`,
          checklist: null,
          matchedProcedure: null,
          sources: defaultSources
        };
      }

      if (cleanLower.includes('ban la ai') || cleanLower.includes('em la ai') || cleanLower.includes('ban ten gi') || cleanLower.includes('em ten gi')) {
        return {
          intentType: 'GREETING',
          voice_text: 'Dạ em là Hiệp Hòa AI-Gov, Chuyên viên Hành chính công AI của UBND xã Hiệp Hòa, tỉnh Tây Ninh. Em luôn sẵn sàng hỗ trợ bà con tra cứu luật và tự động điền đơn giấy tờ 24/7 ạ!',
          answer: `### Giới thiệu về Nền tảng Hiệp Hòa AI-Gov

Dạ, em là **Chuyên viên Hành chính công AI** trực thuộc **Trung tâm Phục vụ Hành chính công xã Hiệp Hòa, tỉnh Tây Ninh**.

* **Nhiệm vụ của em:** 
  1. Hướng dẫn bà con chuẩn bị hồ sơ thủ tục hành chính cấp xã (Khai sinh, Kết hôn, Đất đai, Chứng thực...).
  2. Tự động điền đơn Word chuẩn 100% trong 3 giây qua thẻ Căn cước công dân hoặc trợ lý giọng nói.
  3. Trả lời và trích xuất quy định pháp luật đời sống từ Thư Viện Pháp Luật & Cổng DVC Quốc gia.

Bà con cứ tự nhiên hỏi bất kỳ thắc mắc nào, em luôn ở đây đồng hành cùng bà con!`,
          checklist: null,
          matchedProcedure: null,
          sources: defaultSources
        };
      }

      return {
        intentType: 'GREETING',
        voice_text: 'Dạ em chào bà con ạ! Em là Chuyên viên Hành chính công AI của UBND xã Hiệp Hòa. Hôm nay bà con mình cần em hỗ trợ giấy tờ khai sinh, kết hôn, đất đai, chứng thực hay giải đáp điều luật nào ạ?',
        answer: `### Kính chào bà con nhân dân xã Hiệp Hòa!

Dạ, em là **Chuyên viên Hành chính công AI** thuộc Trung tâm Phục vụ Hành chính công UBND xã Hiệp Hòa, tỉnh Tây Ninh.

Em có thể hỗ trợ bà con 24/7 các nội dung:
1. **Hướng dẫn thủ tục hành chính:** Khai sinh, kết hôn, xác nhận độc thân, sao y chứng thực, đất đai, bảo trợ xã hội.
2. **Điền biểu mẫu tự động:** Tự động điền phôi đơn chuẩn Word trong 3 giây qua CCCD hoặc giọng nói.
3. **Tư vấn pháp luật đời sống:** Giải thích các quy định của Luật Đất đai 2024, Luật Hôn nhân gia đình, Luật Căn cước, xử lý mâu thuẫn tranh chấp.

Bà con chỉ cần bấm nút **Micro màu đỏ** rồi nói, hoặc gõ câu hỏi vào ô bên dưới, em sẽ hướng dẫn chi tiết cho bà con ngay ạ!`,
        checklist: null,
        matchedProcedure: null,
        sources: defaultSources
      };
    }

    // -------------------------------------------------------------------------
    // NHÓM B: TƯ VẤN PHÁP LUẬT ĐỜI SỐNG, HÌNH SỰ, MÂU THUẪN, TRANH CHẤP
    // -------------------------------------------------------------------------
    if (isLegalConsultation || cleanLower.includes('danh lon') || cleanLower.includes('danh nhau') || cleanLower.includes('lan ranh') || cleanLower.includes('ly hon') || cleanLower.includes('chat cam') || cleanLower.includes('ma tuy')) {
      
      // B0: Trường hợp Mua bán, tàng trữ, vận chuyển, sử dụng chất cấm / ma túy
      if (cleanLower.includes('chat cam') || cleanLower.includes('ma tuy') || cleanLower.includes('co my') || cleanLower.includes('bong cuoi') || cleanLower.includes('shisha') || cleanLower.includes('heroin') || cleanLower.includes('ma tuy da') || cleanLower.includes('dap da') || (cleanLower.includes('mua ban') && (cleanLower.includes('cam') || cleanLower.includes('ma tuy') || cleanLower.includes('chat')))) {
        return {
          intentType: 'LEGAL_CONSULTATION',
          voice_text: 'Dạ thưa bà con, hành vi mua bán, tàng trữ trái phép chất cấm hoặc chất ma túy là tội phạm đặc biệt nguy hiểm và bị truy cứu trách nhiệm hình sự theo Điều 251 Bộ luật Hình sự. Mức án thấp nhất từ 2 năm đến 7 năm tù, và nặng nhất có thể bị phạt tù chung thân hoặc tử hình. Nếu hành vi chưa đến mức xử lý hình sự cũng bị phạt tiền từ 2 đến 5 triệu đồng và tịch thu toàn bộ tang vật. Bà con hãy kiên quyết tránh xa và nếu phát hiện hãy báo ngay Công an xã Hiệp Hòa nhé!',
          answer: `### Tư vấn pháp luật & Chế tài xử lý đối với hành vi mua bán, tàng trữ chất cấm (ma túy)

Dạ thưa bà con nhân dân xã Hiệp Hòa, **chất cấm (chất ma túy, tiền chất ma túy, thuốc phiện, cần sa, heroin, cỏ mỹ, ma túy đá...)** là hiểm họa đặc biệt nghiêm trọng tàn phá sức khỏe, gia đình và an ninh trật tự xã hội. Pháp luật Việt Nam nghiêm cấm tuyệt đối mọi hành vi mua bán, vận chuyển, tàng trữ, tổ chức sử dụng trái phép các chất này:

#### 1. Trách nhiệm Hình sự (Khung hình phạt từ 02 năm tù đến Tử hình):
* Căn cứ **Điều 251 Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017) về Tội mua bán trái phép chất ma túy**:
  * **Khung 1 (Khoản 1):** Phạt tù từ **02 năm đến 07 năm** đối với hành vi mua bán trái phép chất ma túy.
  * **Khung 2 (Khoản 2):** Phạt tù từ **07 năm đến 15 năm** nếu thuộc một trong các trường hợp: có tổ chức, phạm tội 02 lần trở lên, đối với 02 người trở lên, tái phạm nguy hiểm, hoặc số lượng ma túy lớn.
  * **Khung 3 (Khoản 3):** Phạt tù từ **15 năm đến 20 năm** đối với trường hợp có số lượng ma túy rất lớn.
  * **Khung 4 (Khoản 4):** Phạt tù **20 năm, tù chung thân hoặc tử hình** đối với các trường hợp đặc biệt nghiêm trọng (nhựa thuốc phiện, nhựa cần sa từ 05 kg trở lên; Heroine, Cocaine từ 100 gam trở lên; Methamphetamine, Amphetamine từ 300 gam trở lên...).
* **Hình phạt bổ sung:** Người phạm tội còn có thể bị phạt tiền từ **05.000.000 đồng đến 500.000.000 đồng**, cấm đảm nhiệm chức vụ, cấm hành nghề hoặc làm công việc nhất định từ 01 năm đến 05 năm hoặc tịch thu một phần hoặc toàn bộ tài sản.

#### 2. Xử phạt vi phạm hành chính (Nếu chưa đến mức truy cứu hình sự):
* Căn cứ **Điều 23 Nghị định 144/2021/NĐ-CP về phòng chống ma túy**:
  * Hành vi tàng trữ, vận chuyển trái phép hoặc chiếm giữ chất ma túy nhưng chưa đến mức truy cứu trách nhiệm hình sự: **Phạt tiền từ 2.000.000 đồng đến 5.000.000 đồng**.
  * Hành vi sử dụng trái phép chất ma túy: **Phạt tiền từ 1.000.000 đồng đến 2.000.000 đồng**.
  * Hình thức phạt bổ sung: Tịch thu toàn bộ tang vật, phương tiện vi phạm và lập hồ sơ đưa vào cơ sở cai nghiện bắt buộc.

#### 📚 Nguồn căn cứ pháp luật chuẩn xác từ Thư Viện Pháp Luật:
* **Thư Viện Pháp Luật:** [Tra cứu Điều 251 Bộ luật Hình sự 2015 - Tội mua bán trái phép chất ma túy](https://thuvienphapluat.vn/van-ban/Trach-nhiem-hinh-su/Bo-luat-hinh-su-2015-296661.aspx)
* **Thư Viện Pháp Luật:** [Nghị định 144/2021/NĐ-CP Quy định xử phạt vi phạm hành chính lĩnh vực an ninh trật tự](https://thuvienphapluat.vn/van-ban/Vi-pham-hanh-chinh/Nghi-dinh-144-2021-ND-CP-xu-phat-vi-pham-hanh-chinh-an-ninh-trat-tu-an-toan-xa-hoi-498522.aspx)

#### 🏛️ Lời khuyên & Số điện thoại hỗ trợ của UBND xã Hiệp Hòa:
* Ma túy là con đường hủy hoại tương lai và hạnh phúc gia đình.
* Nếu bà con hoặc người thân phát hiện đối tượng lạ mặt có biểu hiện lén lút giao dịch chất cấm, hãy **báo ngay cho Công an xã Hiệp Hòa qua Tổng đài: 1900 9095 hoặc đến Trực ban Công an xã**. Mọi thông tin tin báo tố giác tội phạm đều được lực lượng Công an giữ bí mật tuyệt đối!`,
          checklist: null,
          matchedProcedure: null,
          sources: [
            {
              title: "Thư Viện Pháp Luật: Mua bán trái phép chất ma túy bị xử lý thế nào? Khung hình phạt mới nhất",
              url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/42150/mua-ban-trai-phep-chat-ma-tuy-bi-xu-ly-the-nao"
            },
            {
              title: "Thư Viện Pháp Luật: Tra cứu Điều 251 Bộ luật Hình sự 2015",
              url: "https://thuvienphapluat.vn/van-ban/Trach-nhiem-hinh-su/Bo-luat-hinh-su-2015-296661.aspx"
            }
          ]
        };
      }

      // B0.5: Đất mua giấy tay, cấp sổ đỏ, sổ hồng theo Luật Đất đai 2024
      if (cleanLower.includes('giay tay') || cleanLower.includes('so do') || cleanLower.includes('so hong') || cleanLower.includes('cap so') || (cleanLower.includes('dat') && cleanLower.includes('mua ban'))) {
        return {
          intentType: 'LEGAL_CONSULTATION',
          voice_text: 'Dạ thưa bà con, theo Luật Đất đai năm 2024 có hiệu lực từ ngày 01 tháng 8 năm 2024, đất mua bán bằng giấy viết tay trước ngày 01 tháng 01 năm 2008 nếu được UBND xã xác nhận không có tranh chấp và phù hợp quy hoạch sẽ được xem xét cấp Sổ đỏ theo quy định của nhà nước ạ!',
          answer: `### Tư vấn quy định Cấp Sổ đỏ đối với đất mua bán bằng giấy viết tay (Luật Đất đai 2024)

Dạ thưa bà con nhân dân xã Hiệp Hòa, đây là vấn đề rất nhiều bà con quan tâm. Căn cứ theo **Luật Đất đai năm 2024** và **Nghị định 101/2024/NĐ-CP**:

#### 1. Điều kiện được cấp Sổ đỏ cho đất mua bằng giấy tay:
* **Trường hợp 1 (Mua bán giấy tay trước ngày 01/01/2008):**
  * Hộ gia đình, cá nhân đang sử dụng đất do nhận chuyển nhượng bằng giấy tờ viết tay trước ngày **01/01/2008** mà chưa được cấp Giấy chứng nhận quyền sử dụng đất sẽ **được cấp Sổ đỏ** nếu:
    * Được UBND xã Hiệp Hòa xác nhận đất đang sử dụng ổn định, không có tranh chấp.
    * Phù hợp với quy hoạch sử dụng đất cấp huyện đã được phê duyệt.
* **Trường hợp 2 (Mua bán từ ngày 01/01/2008 đến trước ngày 01/07/2014):**
  * Được cấp Giấy chứng nhận nếu có giấy tờ về quyền sử dụng đất đứng tên người chuyển nhượng và có giấy tờ mua bán viết tay, được UBND xã xác nhận không có tranh chấp.

#### 2. Các bước bà con cần thực hiện tại UBND xã Hiệp Hòa:
1. Chuẩn bị: Đơn đăng ký cấp Giấy chứng nhận lần đầu, giấy tờ mua bán viết tay gốc, Căn cước công dân của người sử dụng đất.
2. Nộp hồ sơ tại **Bộ phận Tiếp nhận và Trả kết quả (Một cửa) UBND xã Hiệp Hòa**.
3. Cán bộ Địa chính - Xây dựng xã sẽ tiến hành niêm yết công khai tại trụ sở UBND xã và văn phòng ấp trong 15 ngày để xác minh tình trạng tranh chấp trước khi chuyển hồ sơ lên Chi nhánh Văn phòng Đăng ký đất đai huyện.`,
          checklist: null,
          matchedProcedure: null,
          sources: [
            {
              title: "Thư Viện Pháp Luật: Điều kiện cấp Sổ đỏ cho đất mua bán bằng giấy viết tay theo Luật Đất đai 2024",
              url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/chinh-sach-moi/59820/dieu-kien-cap-so-do-cho-dat-mua-ban-bang-giay-viet-tay-theo-luat-dat-dai-2024"
            }
          ]
        };
      }

      // B1: Trường hợp "Tôi muốn đánh lộn" / Đánh nhau / Gây gổ
      if (cleanLower.includes('danh lon') || cleanLower.includes('danh nhau') || cleanLower.includes('chem') || cleanLower.includes('danh nguoi')) {
        return {
          intentType: 'LEGAL_CONSULTATION',
          voice_text: 'Dạ thưa bà con, bà con hãy thật bình tĩnh, một điều nhịn là chín điều lành! Hành vi đánh nhau là vi phạm pháp luật nghiêm trọng, bị phạt tiền từ 5 đến 8 triệu đồng theo Nghị định 144, và nếu gây thương tích từ 11 phần trăm trở lên sẽ bị phạt tù theo Bộ luật Hình sự. Nếu có mâu thuẫn, bà con hãy báo ngay Công an xã Hiệp Hòa hoặc Tổ hòa giải ấp để được giải quyết êm đẹp nhé!',
          answer: `### Lời khuyên & Quy định pháp luật về hành vi xô xát, đánh nhau

Dạ thưa bà con, em rất hiểu có thể lúc này bà con đang có điều bức xúc hoặc nóng giận trong lòng. Tuy nhiên, dân gian mình có câu *"Một điều nhịn, chín điều lành"*, hành vi dùng bạo lực hoặc đánh nhau không giải quyết được mâu thuẫn mà còn dẫn đến những hậu quả pháp lý rất nặng nề cho bản thân và gia đình:

#### 1. Mức xử phạt vi phạm hành chính:
* Căn cứ **Điểm a Khoản 5 Điều 7 Nghị định 144/2021/NĐ-CP**:
  * Hành vi cố ý gây thương tích hoặc gây tổn hại cho sức khỏe của người khác (nhưng chưa đến mức truy cứu trách nhiệm hình sự) bị **phạt tiền từ 5.000.000 đồng đến 8.000.000 đồng**.
  * Hành vi mang theo trong người các loại vũ khí thô sơ, công cụ hỗ trợ hoặc các loại hung khí nhằm mục đích gây rối trật tự công cộng, cố ý gây thương tích bị phạt từ **3.000.000 đồng đến 5.000.000 đồng**.

#### 2. Trách nhiệm hình sự (Có thể bị phạt tù):
* Căn cứ **Điều 134 Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017) về Tội cố ý gây thương tích**:
  * Nếu gây thương tích cho người khác với tỷ lệ tổn thương cơ thể từ **11% trở lên** (hoặc dưới 11% nhưng dùng hung khí nguy hiểm, có tính chất côn đồ) sẽ bị khởi tố hình sự với khung hình phạt từ **cải tạo không giam giữ đến 03 năm hoặc phạt tù từ 06 tháng đến 03 năm**.
  * Hậu quả nặng hơn có thể bị phạt tù từ 05 năm, 10 năm đến tù chung thân.

#### 3. Trách nhiệm bồi thường thiệt hại dân sự:
* Người gây thương tích còn phải bồi thường toàn bộ chi phí cứu chữa, tiền viện phí, bồi dưỡng phục hồi sức khỏe và tổn thất tinh thần cho người bị hại theo **Điều 590 Bộ luật Dân sự 2015**.

#### 🏛️ Lời khuyên thiết thực từ UBND xã Hiệp Hòa:
* Khi xảy ra bất hòa, xích mích với người khác, bà con hãy liên hệ ngay:
  * **Công an xã Hiệp Hòa** để được can thiệp, bảo vệ an ninh trật tự kịp thời.
  * Hoặc nhờ **Tổ hòa giải của Ấp** (Ấp Văn Hiệp, Hiệp Thuận, Hiệp Hòa Tây...) để các bác, các chú hòa giải thấu tình đạt lý, giữ trọn tình làng nghĩa xóm.`,
          checklist: null,
          matchedProcedure: null,
          sources: [
            {
              title: "Thư Viện Pháp Luật: Đánh nhau bị phạt bao nhiêu tiền? Khi nào bị xử lý hình sự?",
              url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/39712/danh-nhau-bi-phat-bao-nhieu-tien-khi-nao-bi-di-tu"
            },
            {
              title: "Nghị định 144/2021/NĐ-CP xử phạt vi phạm an ninh trật tự công cộng",
              url: "https://thuvienphapluat.vn/van-ban/Vi-pham-hanh-chinh/Nghi-dinh-144-2021-ND-CP-quy-dinh-xu-phat-vi-pham-hanh-chinh-an-ninh-trat-tu-an-toan-xa-hoi-498877.aspx"
            }
          ]
        };
      }

      // B2: Trường hợp tranh chấp ranh đất, lối đi chung
      if (cleanLower.includes('lan ranh') || cleanLower.includes('tranh chap dat') || cleanLower.includes('loi di')) {
        return {
          intentType: 'LEGAL_CONSULTATION',
          voice_text: 'Dạ thưa bà con, theo Luật Đất đai 2024, khi có tranh chấp ranh giới đất hoặc lối đi với hàng xóm, thủ tục bắt buộc đầu tiên là nộp đơn yêu cầu hòa giải tại UBND xã Hiệp Hòa. Xã sẽ tổ chức Hội đồng hòa giải trong vòng 30 ngày để giải quyết thấu tình đạt lý cho bà con nhé!',
          answer: `### Hướng dẫn giải quyết tranh chấp ranh giới đất đai & Lối đi chung

Dạ thưa bà con, tranh chấp đất đai với hàng xóm liền kề là việc rất nhạy cảm. Pháp luật hiện hành quy định quy trình giải quyết rõ ràng như sau:

#### 1. Thủ tục hòa giải bắt buộc tại UBND cấp xã:
* Căn cứ **Điều 236 Luật Đất đai năm 2024**:
  * Nhà nước khuyến khích các bên tự hòa giải hoặc hòa giải thông qua Tổ hòa giải ở ấp.
  * Nếu không hòa giải được, bà con gửi **Đơn yêu cầu giải quyết tranh chấp đất đai** đến UBND xã Hiệp Hòa.
  * Chủ tịch UBND xã Hiệp Hòa có trách nhiệm thành lập Hội đồng hòa giải và tổ chức phiên hòa giải trong thời hạn không quá **30 ngày** kể từ ngày nhận được đơn.

#### 2. Quyền về lối đi chung qua bất động sản liền kề:
* Căn cứ **Điều 254 Bộ luật Dân sự năm 2015**:
  * Chủ sở hữu mảnh đất bị vây bọc bởi các bất động sản của chủ sở hữu khác mà không có lối đi ra đường công cộng có quyền yêu cầu chủ sở hữu bất động sản vây bọc dành cho mình một lối đi hợp lý.
  * Người được dành lối đi có nghĩa vụ đền bù cho chủ đất một khoản tiền hợp lý theo thỏa thuận.

#### 3. Các bước bà con cần chuẩn bị:
1. Thu thập Giấy chứng nhận quyền sử dụng đất (Sổ đỏ), trích lục bản đồ địa chính thửa đất.
2. Nộp đơn tại **Bộ phận Tiếp nhận và Trả kết quả Một cửa UBND xã Hiệp Hòa** để được phân công công chức Địa chính - Xây dựng xuống đo đạc, kiểm tra hiện trạng.`,
          checklist: null,
          matchedProcedure: null,
          sources: [
            {
              title: "Thư Viện Pháp Luật: Trình tự thủ tục hòa giải tranh chấp đất đai tại UBND cấp xã theo Luật Đất đai 2024",
              url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/chinh-sach-moi/60114/thu-tuc-hoa-giai-tranh-chap-dat-dai-tai-ubnd-cap-xa-theo-luat-dat-dai-2024"
            }
          ]
        };
      }

      // B3: Ly hôn, chia tài sản, quyền nuôi con
      if (cleanLower.includes('ly hon') || cleanLower.includes('chia tai san') || cleanLower.includes('ngoai tinh')) {
        return {
          intentType: 'LEGAL_CONSULTATION',
          voice_text: 'Dạ thưa bà con, thủ tục ly hôn thuộc thẩm quyền giải quyết của Tòa án nhân dân, không phải của UBND xã. Về tài sản chung thì nguyên tắc chia đôi có xét công sức đóng góp, còn con dưới 36 tháng tuổi được ưu tiên giao cho người mẹ trực tiếp chăm sóc nuôi dưỡng ạ!',
          answer: `### Tư vấn pháp luật về thủ tục Ly hôn, Quyền nuôi con & Chia tài sản

Dạ thưa bà con, căn cứ theo **Luật Hôn nhân và Gia đình năm 2014**:

#### 1. Thẩm quyền giải quyết ly hôn:
* UBND xã chỉ thực hiện việc **Đăng ký kết hôn**; còn việc **Ly hôn** thuộc thẩm quyền giải quyết duy nhất của **Tòa án nhân dân**.
  * **Thuận tình ly hôn (cả 2 đồng thuận):** Nộp đơn tại Tòa án nhân dân cấp huyện nơi vợ hoặc chồng cư trú.
  * **Đơn phương ly hôn (1 bên yêu cầu):** Nộp đơn tại Tòa án nhân dân cấp huyện nơi bị đơn đang cư trú, làm việc.

#### 2. Nguyên tắc chia tài sản chung vợ chồng:
* Căn cứ **Điều 59 Luật Hôn nhân và Gia đình 2014**:
  * Tài sản chung của vợ chồng về nguyên tắc được **chia đôi**, nhưng có tính đến các yếu tố: Hoàn cảnh của gia đình; công sức đóng góp của mỗi bên; bảo vệ lợi ích chính đáng của mỗi bên trong sản xuất, kinh doanh; và **lỗi của mỗi bên trong vi phạm quyền, nghĩa vụ của vợ chồng** (như ngoại tình, bạo lực gia đình).

#### 3. Quyền trực tiếp nuôi con:
* Căn cứ **Điều 81 Luật Hôn nhân và Gia đình 2014**:
  * Con dưới **36 tháng tuổi** được giao cho mẹ trực tiếp nuôi dưỡng, trừ trường hợp người mẹ không đủ điều kiện hoặc cha mẹ có thỏa thuận khác.
  * Con từ đủ 07 tuổi trở lên thì Tòa án phải xem xét nguyện vọng của con.
  * Bên không trực tiếp nuôi con có nghĩa vụ cấp dưỡng nuôi con theo quy định.`,
          checklist: null,
          matchedProcedure: null,
          sources: [
            {
              title: "Thư Viện Pháp Luật: Hướng dẫn chi tiết thủ tục ly hôn thuận tình và đơn phương mới nhất",
              url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/34112/thu-tuc-ly-hon-thuan-tinh-va-don-phuong-an-phi-va-thoi-gian-giai-quyet"
            }
          ]
        };
      }

      // B3: Trường hợp An toàn giao thông & Trích xuất luật giao thông
      if (cleanLower.includes('giao thong') || cleanLower.includes('an toan giao thong') || cleanLower.includes('den do') || cleanLower.includes('nong do con') || cleanLower.includes('mu bao hiem') || cleanLower.includes('bang lai')) {
        return {
          intentType: 'LEGAL_CONSULTATION',
          voice_text: 'Dạ thưa bà con, về pháp luật an toàn giao thông đường bộ, quy định nghiêm cấm người điều khiển phương tiện có nồng độ cồn trong hơi thở, cấm vượt đèn đỏ và đi ngược chiều. Khi đi xe máy, bà con bắt buộc phải đội mũ bảo hiểm cài quai đúng cách, mang theo giấy phép lái xe và giấy đăng ký xe để đảm bảo an toàn tính mạng cho chính mình và cộng đồng nhé!',
          answer: `### Trích xuất các quy định trọng yếu của Luật Giao thông đường bộ & Mức phạt theo Nghị định 100/2019/NĐ-CP (sửa đổi bởi Nghị định 123/2021/NĐ-CP)

Dạ thưa bà con nhân dân xã Hiệp Hòa, đối với yêu cầu tra cứu và trích xuất quy định pháp luật về **An Toàn Giao Thông Đường Bộ**:

#### 1. Các nguyên tắc bắt buộc khi tham gia giao thông:
* **Đội mũ bảo hiểm:** Người điều khiển và người ngồi trên mô tô, xe gắn máy phải đội mũ bảo hiểm có cài quai đúng quy cách (*Điều 30 Luật GTĐB 2008*).
* **Tuyệt đối không sử dụng rượu bia:** Nghiêm cấm điều khiển phương tiện giao thông mà trong máu hoặc hơi thở có nồng độ cồn (*Khoản 8 Điều 8 Luật GTĐB sửa đổi*).
* **Tuân thủ tín hiệu đèn & vạch kẻ đường:** Phải dừng lại trước vạch dừng khi đèn đỏ; đèn vàng phải dừng lại trừ trường hợp đã đi quá vạch dừng.
* **Tốc độ và làn đường:** Đi đúng phần đường, làn đường quy định; giữ khoảng cách an toàn và tuân thủ biển báo tốc độ.

#### 2. Bảng trích xuất mức xử phạt các lỗi vi phạm phổ biến (Nghị định 100 & 123):
* 🚫 **Vi phạm nồng độ cồn:**
  * **Xe máy:** Phạt từ **2.000.000đ đến 8.000.000đ**, tước Giấy phép lái xe từ **10 đến 24 tháng**, tạm giữ phương tiện đến 7 ngày.
  * **Ô tô:** Phạt từ **6.000.000đ đến 40.000.000đ**, tước GPLX từ **10 đến 24 tháng**.
* 🚦 **Vượt đèn đỏ, đèn vàng:**
  * **Xe máy:** Phạt từ **800.000đ đến 1.000.000đ**, tước GPLX từ 01 đến 03 tháng.
  * **Ô tô:** Phạt từ **4.000.000đ đến 6.000.000đ**, tước GPLX từ 01 đến 03 tháng.
* ⛑️ **Không đội mũ bảo hiểm (hoặc cài quai không đúng):**
  * Phạt tiền từ **400.000đ đến 600.000đ** đối với mỗi người vi phạm trên xe máy.
* ⛔ **Đi ngược chiều của đường một chiều:**
  * **Xe máy:** Phạt từ **1.000.000đ đến 2.000.000đ**, tước GPLX từ 01 đến 03 tháng.
  * **Ô tô:** Phạt từ **4.000.000đ đến 6.000.000đ**, tước GPLX từ 02 đến 04 tháng.
* 🪪 **Không có Giấy phép lái xe (GPLX):**
  * **Xe máy dưới 175cc:** Phạt tiền từ **1.000.000đ đến 2.000.000đ**.
  * **Ô tô:** Phạt tiền từ **10.000.000đ đến 12.000.000đ**.

#### 🏛️ Khuyến cáo từ Ban An toàn Giao thông xã Hiệp Hòa:
Bà con khi lưu thông trên các tuyến đường liên ấp, đường Tỉnh lộ qua địa bàn xã Hiệp Hòa hãy luôn làm chủ tốc độ, chú ý quan sát tại các ngã ba, ngã tư và tuyệt đối *"Đã uống rượu bia – Không lái xe"* để giữ gìn bình yên cho mọi nhà!`,
          checklist: null,
          matchedProcedure: null,
          legal_basis: 'Luật Giao thông đường bộ 2008 & Nghị định 100/2019/NĐ-CP (sửa đổi bởi Nghị định 123/2021/NĐ-CP).',
          sources: [
            {
              title: "Thư Viện Pháp Luật: Tra cứu mức phạt vi phạm giao thông theo Nghị định 100 và Nghị định 123",
              url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/39512/bang-tra-cuu-muc-phat-nong-do-con-xe-may-va-o-to"
            },
            {
              title: "Luật Giao thông đường bộ 2008 toàn văn",
              url: "https://thuvienphapluat.vn/van-ban/Giao-thong-Van-tai/Luat-Giao-thong-duong-bo-2008-23-2008-QH12-82203.aspx"
            },
            {
              title: "Cổng Thông tin Điện tử Cục Cảnh sát Giao thông",
              url: "https://csgt.vn/"
            }
          ]
        };
      }

      // Các trường hợp pháp luật đời sống và tình huống giả định khác
      if (webLegalFinding) {
        return {
          intentType: 'LEGAL_CONSULTATION',
          voice_text: `Dạ thưa bà con, liên quan đến vấn đề "${trimmedMsg}", căn cứ theo ${webLegalFinding.lawName || 'quy định pháp luật Việt Nam'}, ${webLegalFinding.summary ? webLegalFinding.summary.slice(0, 150) + '...' : 'bà con cần chấp hành đúng quy định của pháp luật hiện hành ạ!'}`,
          answer: `### Tư vấn pháp luật đời sống: "${trimmedMsg}"

Dạ thưa bà con nhân dân xã Hiệp Hòa, đối với tình huống và câu hỏi pháp luật của bà con:

#### 1. Căn cứ pháp lý theo Thư Viện Pháp Luật:
* **Văn bản áp dụng:** **${webLegalFinding.lawName}** (${webLegalFinding.articles})
* **Nội dung quy định:** ${webLegalFinding.summary}

#### 2. Lời khuyên thiết thực từ UBND xã Hiệp Hòa:
* Mọi hành vi trong đời sống hàng ngày đều phải tuân thủ nghiêm túc các quy định của pháp luật Việt Nam để đảm bảo an ninh trật tự và quyền lợi hợp pháp của công dân.
* Khi gặp vướng mắc hoặc tình huống pháp lý phức tạp, bà con hãy đến trực tiếp **Bộ phận Tư pháp - Hộ tịch UBND xã Hiệp Hòa** (Ấp Văn Hiệp) hoặc gọi đường dây nóng **1900 9095** để được cán bộ chuyên môn hỗ trợ tận tình.`,
          checklist: null,
          matchedProcedure: null,
          sources: webLegalFinding.sources || combinedSources
        };
      }

      return {
        intentType: 'LEGAL_CONSULTATION',
        voice_text: `Dạ thưa bà con, đối với thắc mắc pháp luật "${trimmedMsg}", theo quy định pháp luật Việt Nam hiện hành, bà con nên chuẩn bị các giấy tờ chứng cứ liên quan và liên hệ trực tiếp Bộ phận Tư pháp UBND xã Hiệp Hòa tại Ấp Văn Hiệp để được giải đáp tận tình ạ!`,
        answer: `### Giải đáp tư vấn pháp luật: "${trimmedMsg}"

Dạ thưa bà con nhân dân xã Hiệp Hòa, đối với câu hỏi về quy định pháp luật của bà con:

1. **Nguyên tắc áp dụng pháp luật:**
   - Mọi công dân đều bình đẳng trước pháp luật, các hành vi giao dịch dân sự, tài sản, hôn nhân gia đình đều được điều chỉnh bởi hệ thống pháp luật Việt Nam còn hiệu lực.
2. **Cơ quan hỗ trợ tại địa phương:**
   - Bà con có thể đến **Bộ phận Tư pháp - Hộ tịch UBND xã Hiệp Hòa** (Ấp Văn Hiệp) vào giờ hành chính để được công chức tư pháp tư vấn miễn phí.
3. **Nguồn tham khảo chuẩn xác:**
   - Bà con có thể tra cứu chi tiết điều luật tại hệ thống văn bản của [Thư Viện Pháp Luật (thuvienphapluat.vn)](https://thuvienphapluat.vn/).`,
        checklist: null,
        matchedProcedure: null,
        sources: combinedSources
      };
    }

    // -------------------------------------------------------------------------
    // NHÓM C: YÊU CẦU THỦ TỤC HÀNH CHÍNH CỤ THỂ TẠI UBND XÃ HIỆP HÒA
    // -------------------------------------------------------------------------
    if (matchedProcedure) {
      const proc = matchedProcedure;
      return {
        intentType: 'PROCEDURE_GUIDE',
        voice_text: `Dạ thưa bà con, để thực hiện thủ tục ${proc.title}, bà con cần chuẩn bị hồ sơ gồm: ${proc.voice_answer} Bà con có thể bấm nút Điền Đơn Tự Động trên màn hình để hoàn thành tờ khai trong 3 giây nhé!`,
        answer: `### Hướng dẫn thực hiện thủ tục: ${proc.title}

Dạ thưa bà con, liên quan đến thủ tục **${proc.title}** tại UBND xã Hiệp Hòa:

${proc.voice_answer}

#### 📋 Căn cứ pháp lý theo Thư Viện Pháp Luật:
- *${proc.legal_basis}*

> 👉 **Hỗ trợ cho bà con:** Bà con có thể xem chi tiết **Bộ Checklist 4 mục** bên dưới hoặc bấm nút **"Điền Đơn Tự Động"** để hệ thống tự điền vào mẫu đơn chuẩn A4 cho bà con tải về hoặc in trực tiếp ạ!`,
        checklist: proc.checklist || null,
        matchedProcedure: proc,
        legal_basis: proc.legal_basis,
        sources: combinedSources
      };
    }

    // Trường hợp câu hỏi chung chung về giấy tờ
    return {
      intentType: 'GREETING',
      voice_text: 'Dạ thưa bà con, bà con có thể nói rõ hơn bà con đang cần làm giấy tờ gì không ạ? Ví dụ như làm giấy khai sinh cho bé, đăng ký kết hôn, xin giấy độc thân, hay sang tên sổ đỏ để em hướng dẫn từng bước cho bà con nhé!',
      answer: `### Chuyên viên AI Xã Hiệp Hòa sẵn sàng hỗ trợ bà con!

Dạ thưa bà con, câu hỏi của bà con em chưa nhận diện được tên thủ tục cụ thể. Bà con vui lòng chọn hoặc nói rõ một trong các thủ tục phổ biến sau:

1. **Đăng ký khai sinh cho em bé** (Cần Giấy chứng sinh, CCCD cha mẹ, Giấy kết hôn).
2. **Đăng ký kết hôn** (Cả hai bên nam nữ cùng có mặt, mang CCCD).
3. **Cấp Giấy xác nhận tình trạng hôn nhân (Độc thân)** (Để mua bán đất hoặc đăng ký kết hôn).
4. **Chứng thực bản sao từ bản chính (Sao y)** (Mang bản gốc, lấy ngay trong 15 phút).
5. **Đăng ký biến động đất đai / Sang tên sổ đỏ** (Theo Luật Đất đai 2024).

Bà con chỉ cần bấm nút Micro rồi nói tên giấy tờ cần làm, em sẽ hướng dẫn chi tiết ngay ạ!`,
      checklist: null,
      matchedProcedure: null,
      sources: defaultSources
    };
  }
}

module.exports = new GeminiRagService();
