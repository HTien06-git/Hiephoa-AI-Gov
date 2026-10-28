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
   - NHÓM C (PROCEDURE_GUIDE - ƯU TIÊN HÀNG ĐẦU): Công dân muốn làm bất kỳ giấy tờ, thủ tục hành chính nào tại UBND xã Hiệp Hòa (Khai sinh, Kết hôn, Xác nhận độc thân/Tình trạng hôn nhân, Sao y chứng thực, Đất đai/Sổ đỏ, Cư trú CT07, Trợ cấp/Hộ nghèo...).
     -> Hướng dẫn rõ ràng, đúng trọng tâm từng bước chuẩn bị giấy tờ, thời gian và lệ phí, trả về mã thủ tục chính xác. NẾU CÔNG DÂN NÓI "XIN GIẤY ĐỘC THÂN ĐỂ MUA BÁN ĐẤT", TRỌNG TÂM LÀ LÀM GIẤY ĐỘC THÂN (TT_TINH_TRANG_HON_NHAN), TUYỆT ĐỐI KHÔNG CHUYỂN NHẦM SANG ĐẤT ĐAI!
   - NHÓM B (LEGAL_CONSULTATION): Tư vấn pháp luật đời sống, mâu thuẫn, tranh chấp, an ninh trật tự, hình sự, dân sự, vi phạm pháp luật (Đánh nhau, hát karaoke đêm, uống rượu bia lái xe, đánh bạc, bạo lực gia đình, chất cấm...):
     -> Nêu kết luận, căn cứ pháp lý, hình thức xử phạt và lời khuyên hòa giải.

2. PHONG CÁCH GIAO TIẾP "ELDER-FRIENDLY & VOICE-FIRST":
   - Luôn mở đầu bằng: "Dạ thưa bà con..." hoặc "Thưa cô chú anh chị..."
   - Trả lời TRỰC TIẾP, ĐÚNG VÀO NỘI DUNG câu hỏi, không nói vòng vo, không lặp lại câu hỏi của người dân.
3. XỬ LÝ TỪ VIẾT TẮT & PHÁT ÂM (VOICE-FRIENDLY):
   - Trong trường "voice_text", BẮT BUỘC phải viết ra đầy đủ: "Căn cước công dân", "Ủy ban nhân dân xã Hiệp Hòa", "Dịch vụ công", "Bộ Tư pháp", "Bộ Công an", "Giấy phép lái xe", "Nghị định Chính phủ".
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
    .replace(/\bCT07\b/gi, 'Giấy xác nhận cư trú CT07')
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
    const greetingExactPatterns = [
      'chao', 'xin chao', 'hello', 'hi', 'ban ten gi', 'em ten gi', 'ai do', 'ban la ai', 'em la ai',
      'cam on', 'thank', 'khoe khong', 'suc khoe', 'tam biet', 'chuc ngu ngon'
    ];
    const isPureGreeting = greetingExactPatterns.some(p => cleanLower === p || cleanLower === p + ' em' || cleanLower === p + ' ban' || cleanLower === p + ' admin');

    // Nhóm C (Ưu tiên Cao nhất): Tìm kiếm thủ tục hành chính cụ thể trước
    let matchedProcedure = null;
    if (options.procedureId) {
      matchedProcedure = vectorStore.getProcedureById(options.procedureId);
    } else {
      const searchResults = vectorStore.search(trimmedMsg);
      if (searchResults.matchedProcedures.length > 0) {
        matchedProcedure = searchResults.matchedProcedures[0];
      }
    }

    // Nhóm B: Pháp luật đời sống, an ninh trật tự, tội phạm, chất cấm ma túy, mâu thuẫn, tranh chấp
    const legalKeywords = [
      'chat cam', 'ma tuy', 'mua ban chat cam', 'mua ban ma tuy', 'tang tru ma tuy', 'van chuyen ma tuy', 'su dung ma tuy', 'heroin', 'ma tuy da',
      'bi phat gi', 'phat bao nhieu', 'o tu', 'phat tu', 'hinh su', 'khoi to', 'truy cuu', 'toi pham',
      'danh lon', 'danh nhau', 'chem nhau', 'danh nguoi', 'gay go', 'gay thuong tich',
      'ly hon', 'chia tai san', 'ngoai tinh', 'quyen nuoi con',
      'danh bac', 'so de', 'lo de', 'ca do', 'tin dung den', 'tieng on', 'loa keo',
      'nong do con', 'uong ruou lai xe', 'uong bia lai xe', 'vuot den do'
    ];

    // Chỉ xếp vào Legal Consultation nếu KHÔNG khớp thủ tục hành chính, hoặc từ khóa pháp luật rất rõ rệt
    const isLegalConsultation = !matchedProcedure && (
      legalKeywords.some(k => cleanLower.includes(k)) || 
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
    // 2. GỌI GEMINI MODEL NẾU CÓ CẤU HÌNH API KEY (TĂNG TIMEOUT LÊN 7500ms)
    // =========================================================================
    const model = getGeminiModel();
    if (model) {
      try {
        const historyText = (options.history || [])
          .map(h => `${h.role === 'user' ? 'Công dân' : 'Chuyên viên AI'}: ${h.content}`)
          .join('\n');

        const prompt = `
${SYSTEM_PROMPT}

NGỮ CẢNH DỮ LIỆU ĐỊA PHƯƠNG & PHÁP LUẬT:
Chủ đề pháp luật liên quan: ${webLegalFinding?.topic || 'Không có'}
Văn bản pháp luật: ${webLegalFinding?.lawName || ''} (${webLegalFinding?.articles || ''})
Tóm tắt quy định: ${webLegalFinding?.summary || ''}

THỦ TỤC HÀNH CHÍNH TƯƠNG ỨNG TRONG HỆ THỐNG UBND XÃ HIỆP HÒA:
${matchedProcedure ? JSON.stringify({ id: matchedProcedure.id, title: matchedProcedure.title, voice_answer: matchedProcedure.voice_answer, checklist: matchedProcedure.checklist }, null, 2) : 'Không có thủ tục cụ thể.'}

LỊCH SỬ HỘI THOẠI TRƯỚC:
${historyText || 'Chưa có'}

CÂU HỎI MỚI CỦA CÔNG DÂN:
"${trimmedMsg}"

QUY TẮC PHÂN LOẠI QUAN TRỌNG:
1. Nếu câu hỏi liên quan đến việc làm giấy tờ thủ tục hành chính cấp xã (Khai sinh, Kết hôn, Xác nhận tình trạng hôn nhân/độc thân, Cư trú CT07, Đất đai sổ đỏ, Chứng thực sao y, Hộ nghèo, Trợ cấp):
   BẮT BUỘC trả về intentType: "PROCEDURE_GUIDE", matchedProcedureId: "${matchedProcedure ? matchedProcedure.id : ''}".
   LƯU Ý: Nếu người dân hỏi "xin giấy độc thân để mua bán đất" thì TRỌNG TÂM LÀ LÀM GIẤY ĐỘC THÂN (TT_TINH_TRANG_HON_NHAN).
2. Nếu câu hỏi là chào hỏi, cảm ơn, hỏi giờ làm việc của xã: intentType: "GREETING".
3. Nếu câu hỏi về vi phạm pháp luật, xử phạt, tội phạm, an ninh trật tự: intentType: "LEGAL_CONSULTATION".

HÃY PHÂN TÍCH VÀ TRẢ LỜI ĐÚNG ĐỊNH DẠNG JSON:
{
  "intentType": "GREETING" | "LEGAL_CONSULTATION" | "PROCEDURE_GUIDE",
  "voice_text": "Lời nói trực tiếp ngắn gọn 2-3 câu, mở đầu bằng 'Dạ thưa bà con' hoặc 'Thưa cô chú anh chị', trả lời thẳng vào trọng tâm câu hỏi của bà con.",
  "answer": "Nội dung trả lời chi tiết bằng Markdown, hướng dẫn rõ giấy tờ cần mang, thời gian giải quyết, lệ phí và căn cứ pháp lý.",
  "matchedProcedureId": "${matchedProcedure ? matchedProcedure.id : ''}"
}
Chỉ xuất JSON thuần túy, không có markdown block.
`;

        const timeoutMs = 7500; // Tăng timeout lên 7.5s để Gemini 2.5 Flash phản hồi mượt mà
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
          : (matchedProcedure || null);

        return {
          intentType: finalMatchedProc ? 'PROCEDURE_GUIDE' : parsed.intentType,
          answer: parsed.answer,
          voice_text: parsed.voice_text,
          checklist: finalMatchedProc ? finalMatchedProc.checklist : null,
          matchedProcedure: finalMatchedProc,
          legal_basis: webLegalFinding?.lawName ? `${webLegalFinding.lawName} (${webLegalFinding.articles})` : (finalMatchedProc?.legal_basis || 'Quy định pháp luật hiện hành.'),
          sources: combinedSources
        };
      } catch (err) {
        console.warn('[GeminiRagService] Gemini API chậm hoặc timeout (' + err.message + ') -> Kích hoạt Bộ phân loại 3-Way Intent chuẩn xác nội bộ');
      }
    }

    // =========================================================================
    // 3. BỘ MÁY XỬ LÝ Ý ĐỊNH NỘI BỘ CHUẨN XÁC 100% (DETERMINISTIC ROUTING)
    // =========================================================================

    // -------------------------------------------------------------------------
    // ƯU TIÊN 1: NHÓM C - THỦ TỤC HÀNH CHÍNH CỤ THỂ TẠI UBND XÃ HIỆP HÒA
    // NẾU CÓ MATCHED PROCEDURE -> TRẢ LỜI NGAY ĐÚNG TRỌNG TÂM THỦ TỤC!
    // -------------------------------------------------------------------------
    if (matchedProcedure) {
      const proc = matchedProcedure;
      return {
        intentType: 'PROCEDURE_GUIDE',
        voice_text: `${proc.voice_answer} Bà con có thể bấm nút Điền Đơn Tự Động trên màn hình để hoàn thành tờ khai ngay nhé!`,
        answer: `### Hướng dẫn thực hiện thủ tục: ${proc.title}

${proc.voice_answer}

#### 📋 Căn cứ pháp lý theo quy định hiện hành:
- *${proc.legal_basis}*

> 👉 **Hỗ trợ cho bà con:** Bà con có thể xem chi tiết **Bộ Checklist giấy tờ** bên dưới hoặc bấm nút **"Điền Đơn Tự Động"** để hệ thống tự điền vào mẫu đơn chuẩn cho bà con tải về hoặc nộp mã QR trực tiếp tới Cán bộ Một cửa ạ!`,
        checklist: proc.checklist || null,
        matchedProcedure: proc,
        legal_basis: proc.legal_basis,
        sources: combinedSources
      };
    }

    // -------------------------------------------------------------------------
    // ƯU TIÊN 2: NHÓM A - GIAO TIẾP XÃ GIAO, CHÀO HỎI, LỊCH LÀM VIỆC
    // -------------------------------------------------------------------------
    if (isPureGreeting || cleanLower.includes('xa co lam viec khong') || cleanLower.includes('gio lam viec') || cleanLower.includes('may gio')) {
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

      return {
        intentType: 'GREETING',
        voice_text: 'Dạ em chào bà con ạ! Em là Chuyên viên Hành chính công AI của UBND xã Hiệp Hòa. Hôm nay bà con mình cần em hỗ trợ giấy tờ khai sinh, kết hôn, xác nhận độc thân, đất đai, chứng thực hay giải đáp điều luật nào ạ?',
        answer: `### Kính chào bà con nhân dân xã Hiệp Hòa!

Dạ, em là **Chuyên viên Hành chính công AI** thuộc Trung tâm Phục vụ Hành chính công UBND xã Hiệp Hòa, tỉnh Tây Ninh.

Em có thể hỗ trợ bà con 24/7 các nội dung:
1. **Hướng dẫn thủ tục hành chính:** Khai sinh, kết hôn, xác nhận độc thân, sao y chứng thực, đất đai, bảo trợ xã hội.
2. **Điền biểu mẫu tự động:** Tự động điền phôi đơn chuẩn Word trong 3 giây qua CCCD hoặc giọng nói.
3. **Tư vấn pháp luật đời sống:** Giải thích các quy định của Luật Đất đai 2024, Luật Hôn nhân gia đình, Luật Căn cước.

Bà con chỉ cần bấm nút **Micro màu đỏ** rồi nói, hoặc gõ câu hỏi vào ô bên dưới, em sẽ hướng dẫn chi tiết cho bà con ngay ạ!`,
        checklist: null,
        matchedProcedure: null,
        sources: defaultSources
      };
    }

    // -------------------------------------------------------------------------
    // ƯU TIÊN 3: NHÓM B - TƯ VẤN PHÁP LUẬT ĐỜI SỐNG, HÌNH SỰ, MÂU THUẪN
    // -------------------------------------------------------------------------
    if (isLegalConsultation) {
      // B1: Đánh nhau / Gây gổ
      if (cleanLower.includes('danh lon') || cleanLower.includes('danh nhau') || cleanLower.includes('chem') || cleanLower.includes('danh nguoi')) {
        return {
          intentType: 'LEGAL_CONSULTATION',
          voice_text: 'Dạ thưa bà con, bà con hãy thật bình tĩnh, một điều nhịn là chín điều lành! Hành vi đánh nhau là vi phạm pháp luật nghiêm trọng, bị phạt tiền từ 5 đến 8 triệu đồng theo Nghị định 144, và nếu gây thương tích từ 11 phần trăm trở lên sẽ bị phạt tù theo Bộ luật Hình sự. Nếu có mâu thuẫn, bà con hãy báo ngay Công an xã Hiệp Hòa hoặc Tổ hòa giải ấp để được giải quyết êm đẹp nhé!',
          answer: `### Lời khuyên & Quy định pháp luật về hành vi xô xát, đánh nhau

Dạ thưa bà con, dân gian mình có câu *"Một điều nhịn, chín điều lành"*, hành vi dùng bạo lực hoặc đánh nhau không giải quyết được mâu thuẫn mà còn dẫn đến những hậu quả pháp lý rất nặng nề cho bản thân và gia đình:

#### 1. Mức xử phạt vi phạm hành chính:
* Căn cứ **Điểm a Khoản 5 Điều 7 Nghị định 144/2021/NĐ-CP**:
  * Hành vi cố ý gây thương tích hoặc gây tổn hại cho sức khỏe của người khác (nhưng chưa đến mức truy cứu trách nhiệm hình sự) bị **phạt tiền từ 5.000.000 đồng đến 8.000.000 đồng**.

#### 2. Trách nhiệm hình sự (Có thể bị phạt tù):
* Căn cứ **Điều 134 Bộ luật Hình sự 2015**:
  * Nếu gây thương tích cho người khác với tỷ lệ tổn thương cơ thể từ **11% trở lên** (hoặc dưới 11% nhưng dùng hung khí nguy hiểm) sẽ bị khởi tố hình sự với khung hình phạt từ **cải tạo không giam giữ đến 03 năm hoặc phạt tù từ 06 tháng đến 03 năm**.

#### 🏛️ Lời khuyên thiết thực từ UBND xã Hiệp Hòa:
Khi xảy ra bất hòa, xích mích với người khác, bà con hãy liên hệ ngay **Công an xã Hiệp Hòa** hoặc **Tổ hòa giải của Ấp** để được can thiệp, hòa giải thấu tình đạt lý, giữ trọn tình làng nghĩa xóm.`,
          checklist: null,
          matchedProcedure: null,
          sources: combinedSources
        };
      }

      // B2: Ma túy, chất cấm
      if (cleanLower.includes('chat cam') || cleanLower.includes('ma tuy')) {
        return {
          intentType: 'LEGAL_CONSULTATION',
          voice_text: 'Dạ thưa bà con, hành vi mua bán, tàng trữ trái phép chất cấm hoặc chất ma túy là tội phạm đặc biệt nguy hiểm và bị truy cứu trách nhiệm hình sự theo Điều 251 Bộ luật Hình sự, với mức án từ 2 năm tù đến tù chung thân hoặc tử hình. Bà con hãy kiên quyết tránh xa và nếu phát hiện hãy báo ngay Công an xã Hiệp Hòa nhé!',
          answer: `### Quy định pháp luật đối với hành vi mua bán, tàng trữ chất ma túy

Dạ thưa bà con, pháp luật Việt Nam nghiêm cấm tuyệt đối mọi hành vi liên quan đến chất cấm, chất ma túy:
* Căn cứ **Điều 251 Bộ luật Hình sự 2015**: Tội mua bán trái phép chất ma túy có khung hình phạt từ **02 năm tù đến Chung thân hoặc Tử hình**.
* Căn cứ **Điều 23 Nghị định 144/2021/NĐ-CP**: Xử phạt vi phạm hành chính từ 2.000.000đ đến 5.000.000đ đối với hành vi tàng trữ chưa đến mức truy cứu hình sự.
* Mọi tin báo tố giác tội phạm bà con liên hệ ngay **Công an xã Hiệp Hòa (Hotline: 1900 9095)** để được bảo vệ bí mật và giải quyết kịp thời.`,
          checklist: null,
          matchedProcedure: null,
          sources: combinedSources
        };
      }
    }

    // -------------------------------------------------------------------------
    // MẶC ĐỊNH HƯỚNG DẪN BÀ CON CHỌN THỦ TỤC
    // -------------------------------------------------------------------------
    return {
      intentType: 'GREETING',
      voice_text: 'Dạ thưa bà con, bà con có thể nói rõ hơn bà con đang cần làm giấy tờ gì không ạ? Ví dụ như làm giấy khai sinh cho bé, đăng ký kết hôn, xin giấy độc thân, sao y chứng thực, hay sang tên sổ đỏ để em hướng dẫn từng bước cho bà con nhé!',
      answer: `### Chuyên viên AI Xã Hiệp Hòa sẵn sàng hỗ trợ bà con!

Dạ thưa bà con, câu hỏi của bà con em chưa nhận diện được tên thủ tục cụ thể. Bà con vui lòng chọn hoặc nói rõ một trong các thủ tục phổ biến sau:

1. **Đăng ký khai sinh cho em bé** (Cần Giấy chứng sinh, CCCD cha mẹ, Giấy kết hôn).
2. **Đăng ký kết hôn** (Cả hai bên nam nữ cùng có mặt, mang CCCD).
3. **Cấp Giấy xác nhận tình trạng hôn nhân (Độc thân)** (Để mua bán đất hoặc đăng ký kết hôn).
4. **Chứng thực bản sao từ bản chính (Sao y)** (Mang bản gốc, lấy ngay trong 15 phút).
5. **Đăng ký biến động đất đai / Sang tên sổ đỏ** (Theo Luật Đất đai 2024).
6. **Xác nhận cư trú CT07** (Công an xã cấp).

Bà con chỉ cần bấm nút Micro rồi nói tên giấy tờ cần làm, em sẽ hướng dẫn chi tiết ngay ạ!`,
      checklist: null,
      matchedProcedure: null,
      sources: defaultSources
    };
  }
}

module.exports = new GeminiRagService();
