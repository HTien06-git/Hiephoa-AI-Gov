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

    // Score procedures
    const scoredProcedures = this.procedures.map(proc => {
      let score = 0;
      const normTitle = normalizeText(proc.title);
      const normDesc = normalizeText(proc.short_desc);
      const normQ = normalizeText(proc.suggested_question);
      const normChecklist = normalizeText(JSON.stringify(proc.checklist));

      // Specific keywords boosts
      if (normQuery.includes('khai sinh') && proc.id === 'TT_KHAI_SINH') score += 100;
      if (normQuery.includes('ket hon') && proc.id === 'TT_KET_HON') score += 100;
      if ((normQuery.includes('doc than') || normQuery.includes('tinh trang hon nhan')) && proc.id === 'TT_TINH_TRANG_HON_NHAN') score += 100;
      if ((normQuery.includes('cu tru') || normQuery.includes('tam tru') || normQuery.includes('ct07')) && proc.id === 'TT_XAC_NHAN_CU_TRU') score += 100;
      if ((normQuery.includes('dat') || normQuery.includes('so do') || normQuery.includes('tach thua') || normQuery.includes('sang ten')) && proc.id === 'TT_DAT_DAI') score += 100;
      if ((normQuery.includes('sao y') || normQuery.includes('chung thuc') || normQuery.includes('cong chung') || normQuery.includes('chu ky')) && proc.id === 'TT_CHUNG_THUC') score += 100;
      if ((normQuery.includes('ho ngheo') || normQuery.includes('kho khan') || normQuery.includes('tro cap') || normQuery.includes('nguoi cao tuoi') || normQuery.includes('bhyt')) && proc.id === 'TT_BAO_TRO_HO_NGHEO') score += 100;
      if ((normQuery.includes('di chuc') || normQuery.includes('thua ke') || normQuery.includes('tang cho') || normQuery.includes('tranh chap')) && proc.id === 'TT_TU_VAN_LUAT') score += 100;

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
      .filter(item => item.score > 0)
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
