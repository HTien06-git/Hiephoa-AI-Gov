const vectorStore = require('../services/vectorStore');

function getLocalInfo(req, res) {
  return res.json({
    success: true,
    data: vectorStore.getLocalInfo()
  });
}

function getCategories(req, res) {
  return res.json({
    success: true,
    data: vectorStore.getCategories()
  });
}

function getAllProcedures(req, res) {
  const categoryId = req.query.category;
  let procedures = vectorStore.getAllProcedures();
  if (categoryId) {
    procedures = procedures.filter(p => p.category_id === categoryId);
  }
  return res.json({
    success: true,
    count: procedures.length,
    data: procedures
  });
}

function getProcedureDetail(req, res) {
  const { id } = req.params;
  const procedure = vectorStore.getProcedureById(id);
  if (!procedure) {
    return res.status(404).json({
      success: false,
      error: 'Không tìm thấy thủ tục hành chính yêu cầu.'
    });
  }
  return res.json({
    success: true,
    data: procedure
  });
}

module.exports = {
  getLocalInfo,
  getCategories,
  getAllProcedures,
  getProcedureDetail
};
