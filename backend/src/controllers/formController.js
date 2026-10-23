const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const formSchemas = require('../data/form_schemas.json');
const ReportLogger = require('../utils/reportLogger');

const TEMPLATES_DIR = path.resolve(__dirname, '../data/templates');

// Bộ nhớ đệm lưu file Word chuẩn bị tải về (Native Server Attachment)
const downloadCache = new Map();

// Tự động dọn dẹp sau 10 phút
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of downloadCache.entries()) {
    if (now - v.timestamp > 10 * 60 * 1000) {
      downloadCache.delete(k);
    }
  }
}, 60000);

function getForms(req, res) {
  return res.json({
    success: true,
    data: formSchemas.forms
  });
}

function getFormDetail(req, res) {
  const { id } = req.params;
  const form = formSchemas.forms.find(f => f.id === id);
  if (!form) {
    return res.status(404).json({
      success: false,
      error: 'Không tìm thấy mẫu đơn yêu cầu.'
    });
  }
  return res.json({
    success: true,
    data: form
  });
}

function downloadTemplate(req, res) {
  const { filename } = req.params;
  if (!/^[a-zA-Z0-9_-]+\.docx$/.test(filename)) {
    return res.status(400).json({ error: 'Tên file không hợp lệ.' });
  }

  const filePath = path.join(TEMPLATES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File biểu mẫu không tồn tại.' });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.sendFile(filePath);
}

// 1. Tạo file Word và cấp link tải trực tiếp (Chuẩn Native Browser Download 100% không bị GUID)
function prepareFilledDocx(req, res) {
  try {
    let { templateFilename, formData, outputFilename } = req.body;
    const filename = templateFilename || 'mau_01_to_khai_dang_ky_khai_sinh.docx';

    if (typeof formData === 'string') {
      try {
        formData = JSON.parse(formData);
      } catch (e) {}
    }

    const filePath = path.join(TEMPLATES_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File biểu mẫu không tồn tại.' });
    }

    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      delimiters: { start: '{{', end: '}}' },
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => ''
    });

    const now = new Date();
    const preparedData = {
      ngay_lam_don: String(now.getDate()).padStart(2, '0'),
      thang_lam_don: String(now.getMonth() + 1).padStart(2, '0'),
      nam_lam_don: String(now.getFullYear()),
      ...(formData || {})
    };

    doc.render(preparedData);

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });

    let safeName = (outputFilename || `HIEP_HOA_${filename}`)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .replace(/_+/g, '_');

    if (!safeName.toLowerCase().endsWith('.docx')) {
      safeName += '.docx';
    }

    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    downloadCache.set(token, {
      buffer: buf,
      filename: safeName,
      timestamp: Date.now()
    });

    return res.json({
      success: true,
      downloadUrl: `/api/download-docx/${token}/${safeName}`,
      filename: safeName
    });
  } catch (err) {
    console.error('Error prepare filled docx:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Trình duyệt tải trực tiếp qua HTTP GET Attachment (Windows & Chrome tự động gán tên file và đuôi .docx)
function serveDownloadDocx(req, res) {
  const { token, filename } = req.params;
  const item = downloadCache.get(token);
  if (!item) {
    return res.status(404).send('Liên kết tải tài liệu đã hết hạn, xin vui lòng bấm tải lại từ hệ thống.');
  }

  const downloadFilename = item.filename || filename || 'HIEP_HOA_BIEU_MAU.docx';

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
  res.setHeader('Content-Length', item.buffer.length);
  return res.end(item.buffer);
}

// 3. Xuất trực tiếp qua POST stream
function exportFilledDocx(req, res) {
  try {
    let { templateFilename, formData, outputFilename } = req.body;
    const filename = templateFilename || 'mau_01_to_khai_dang_ky_khai_sinh.docx';

    if (typeof formData === 'string') {
      try {
        formData = JSON.parse(formData);
      } catch (e) {}
    }

    const filePath = path.join(TEMPLATES_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File biểu mẫu không tồn tại.' });
    }

    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      delimiters: { start: '{{', end: '}}' },
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => ''
    });

    const now = new Date();
    const preparedData = {
      ngay_lam_don: String(now.getDate()).padStart(2, '0'),
      thang_lam_don: String(now.getMonth() + 1).padStart(2, '0'),
      nam_lam_don: String(now.getFullYear()),
      ...(formData || {})
    };

    doc.render(preparedData);

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });

    let safeName = (outputFilename || `HIEP_HOA_${filename}`)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .replace(/_+/g, '_');

    if (!safeName.toLowerCase().endsWith('.docx')) {
      safeName += '.docx';
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Length', buf.length);
    return res.end(buf);
  } catch (err) {
    console.error('Error generating filled docx:', err);
    return res.status(500).json({ error: 'Không thể tạo file Word: ' + err.message });
  }
}

function getAuditLogs(req, res) {
  const logs = ReportLogger.getAuditLogs ? ReportLogger.getAuditLogs(100) : [];
  return res.json({
    success: true,
    count: logs.length,
    data: logs
  });
}

module.exports = {
  getForms,
  getFormDetail,
  downloadTemplate,
  prepareFilledDocx,
  serveDownloadDocx,
  exportFilledDocx,
  getAuditLogs
};
