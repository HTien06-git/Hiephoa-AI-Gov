const proceduresData = require('../data/procedures_demo.json');
const legalCorpus = require('../data/legal_corpus.json');
const localInfo = require('../data/local_info.json');

/**
 * Text normalizer for Vietnamese matching (case-insensitive, remove accents optional)
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

class VectorStoreService {
  constructor() {
    this.procedures = proceduresData.procedures || [];
    this.categories = proceduresData.categories || [];
    this.legalArticles = legalCorpus || [];
    this.localInfo = localInfo;
  }

  /**
   * Search procedures & legal corpus based on citizen's query
   * @param {string} query
   * @param {number} topK
   */
  search(query, topK = 3) {
    if (!query || typeof query !== 'string') {
      return { matchedProcedures: [], matchedLaws: [] };
    }

    const normQuery = normalizeText(query);
    const queryTokens = normQuery.split(' ').filter(t => t.length > 1);

    // Score procedures với nhận diện ngữ nghĩa chuyên sâu tiếng Việt
    const scoredProcedures = this.procedures.map(proc => {
      let score = 0;
      const normTitle = normalizeText(proc.title);
      const normDesc = normalizeText(proc.short_desc);
      const normQ = normalizeText(proc.suggested_question);
      const normChecklist = normalizeText(JSON.stringify(proc.checklist));

      // 1. Nhận diện thủ tục ĐĂNG KÝ KHAI SINH
      if (proc.id === 'TT_KHAI_SINH') {
        if (normQuery.includes('khai sinh')) score += 300;
        if (normQuery.includes('giay khai sinh')) score += 350;
        if (normQuery.includes('giay chung sinh')) score += 250;
        if (normQuery.includes('sinh con') || normQuery.includes('moi sinh') || normQuery.includes('be moi sinh') || normQuery.includes('em be sinh')) score += 180;
        if (normQuery.includes('lam giay cho con') || normQuery.includes('lam giay cho be')) score += 180;
      }

      // 2. Nhận diện thủ tục ĐĂNG KÝ KẾT HÔN
      if (proc.id === 'TT_KET_HON') {
        if (normQuery.includes('ket hon') && !normQuery.includes('chua ket hon') && !normQuery.includes('xac nhan')) score += 300;
        if (normQuery.includes('dang ky ket hon')) score += 350;
        if (normQuery.includes('giay ket hon') || normQuery.includes('giay hon thu') || normQuery.includes('to khai ket hon')) score += 300;
        if (normQuery.includes('cuoi nhau') || normQuery.includes('lay vo') || normQuery.includes('lay chong')) score += 160;
      }

      // 3. Nhận diện thủ tục XÁC NHẬN TÌNH TRẠNG HÔN NHÂN (GIẤY ĐỘC THÂN)
      // Chú ý: Dù trong câu có từ "đất", "mua đất", "ngân hàng", "kết hôn", nếu có "độc thân" hoặc "tình trạng hôn nhân" thì ĐỘC THÂN PHẢI THẮNG ĐẤT ĐAI!
      if (proc.id === 'TT_TINH_TRANG_HON_NHAN') {
        if (normQuery.includes('doc than') || normQuery.includes('giay doc than')) score += 400;
        if (normQuery.includes('tinh trang hon nhan') || normQuery.includes('xac nhan doc than')) score += 400;
        if (normQuery.includes('chua ket hon') || normQuery.includes('chung nhan doc than')) score += 350;
        if (normQuery.includes('doc than de') || normQuery.includes('giay doc than de')) score += 450;
      }

      // 4. Nhận diện thủ tục XÁC NHẬN CƯ TRÚ (CT07)
      if (proc.id === 'TT_XAC_NHAN_CU_TRU') {
        if (normQuery.includes('ct07') || normQuery.includes('ct 07') || normQuery.includes('giay ct07')) score += 350;
        if (normQuery.includes('xac nhan cu tru') || normQuery.includes('thong tin cu tru')) score += 300;
        if (normQuery.includes('tam tru') || normQuery.includes('thuong tru') || normQuery.includes('dang ky tam tru')) score += 200;
        if (normQuery.includes('so ho khau') || normQuery.includes('giay ho khau')) score += 180;
      }

      // 5. Nhận diện thủ tục ĐẤT ĐAI - BIẾN ĐỘNG ĐẤT - SỔ ĐỎ
      if (proc.id === 'TT_DAT_DAI') {
        if (normQuery.includes('so do') || normQuery.includes('so hong')) score += 250;
        if (normQuery.includes('tach thua') || normQuery.includes('hop thua')) score += 300;
        if (normQuery.includes('sang ten dat') || normQuery.includes('sang ten so do') || normQuery.includes('chuyen nhuong dat')) score += 350;
        if (normQuery.includes('bien dong dat') || normQuery.includes('cap doi so do') || normQuery.includes('cap so do')) score += 300;
        if (normQuery.includes('dat dai') && !normQuery.includes('doc than')) score += 150;
      }

      // 6. Nhận diện thủ tục CHỨNG THỰC / SAO Y BẢN CHÍNH / CHỨNG THỰC CHỮ KÝ
      if (proc.id === 'TT_CHUNG_THUC') {
        if (normQuery.includes('sao y') || normQuery.includes('sao y ban chinh')) score += 350;
        if (normQuery.includes('chung thuc') || normQuery.includes('chung thuc chu ky')) score += 320;
        if (normQuery.includes('cong chung') || normQuery.includes('photo cong chung')) score += 280;
        if (normQuery.includes('giay uy quyen') || normQuery.includes('chung thuc hop dong')) score += 240;
      }

      // 7. Nhận diện thủ tục BẢO TRỢ XÃ HỘI - HỘ NGHÈO - TRỢ CẤP NGƯỜI CAO TUỔI
      if (proc.id === 'TT_BAO_TRO_HO_NGHEO') {
        if (normQuery.includes('ho ngheo') || normQuery.includes('can ngheo') || normQuery.includes('xac nhan ho ngheo')) score += 350;
        if (normQuery.includes('nguoi cao tuoi') || normQuery.includes('nguoi gia') || normQuery.includes('tro cap nguoi gia')) score += 320;
        if (normQuery.includes('tro cap xa hoi') || normQuery.includes('hoan canh kho khan')) score += 280;
        if (normQuery.includes('mien giam hoc phi') || normQuery.includes('bhyt mien phi')) score += 220;
      }

      // 8. Nhận diện thủ tục TƯ VẤN THỪA KẾ - DI CHÚC - TẶNG CHO
      if (proc.id === 'TT_TU_VAN_LUAT') {
        if (normQuery.includes('di chuc') || normQuery.includes('lap di chuc')) score += 350;
        if (normQuery.includes('thua ke') || normQuery.includes('chia thua ke')) score += 320;
        if (normQuery.includes('tang cho dat') || normQuery.includes('tang cho con')) score += 280;
      }

      // Token overlap
      queryTokens.forEach(token => {
        if (normTitle.includes(token)) score += 10;
        if (normQ.includes(token)) score += 8;
        if (normDesc.includes(token)) score += 5;
        if (normChecklist.includes(token)) score += 2;
      });

      return { proc, score };
    });

    scoredProcedures.sort((a, b) => b.score - a.score);
    const topProcedures = scoredProcedures
      .filter(item => item.score > 25)
      .slice(0, topK)
      .map(item => item.proc);

    // Score legal corpus
    const scoredLaws = this.legalArticles.map(law => {
      let score = 0;
      const normName = normalizeText(law.law_name);
      const normArt = normalizeText(law.article);
      const normContent = normalizeText(law.content);
      const normExp = normalizeText(law.plain_explanation);

      queryTokens.forEach(token => {
        if (normName.includes(token)) score += 5;
        if (normArt.includes(token)) score += 4;
        if (normExp.includes(token)) score += 3;
        if (normContent.includes(token)) score += 1;
      });

      return { law, score };
    });

    scoredLaws.sort((a, b) => b.score - a.score);
    const topLaws = scoredLaws
      .filter(item => item.score > 0)
      .slice(0, 2)
      .map(item => item.law);

    return {
      matchedProcedures: topProcedures,
      matchedLaws: topLaws
    };
  }

  getProcedureById(id) {
    return this.procedures.find(p => p.id === id) || null;
  }

  getAllProcedures() {
    return this.procedures;
  }

  getCategories() {
    return this.categories;
  }

  getLocalInfo() {
    return this.localInfo;
  }
}

module.exports = new VectorStoreService();
