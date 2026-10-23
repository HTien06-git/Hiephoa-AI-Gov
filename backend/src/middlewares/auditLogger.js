const ReportLogger = require('../utils/reportLogger');

function auditLoggerMiddleware(req, res, next) {
  const start = Date.now();
  const path = req.path;
  const method = req.method;

  // Track important actions (OCR, Pre-check, Form Template downloads)
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api/')) {
      let actionType = 'API_REQUEST';
      if (path.includes('ocr-cccd')) actionType = 'OCR_CCCD_SCAN';
      else if (path.includes('pre-check')) actionType = 'PRE_CHECK_DOCUMENTS';
      else if (path.includes('chat')) actionType = 'RAG_AI_CONSULT';
      else if (path.includes('templates')) actionType = 'DOWNLOAD_TEMPLATE';
      else if (path.includes('audit')) actionType = 'AUDIT_VIEW';

      // Only log summary, never citizen personal details
      ReportLogger.logEvent({
        action: actionType,
        module: path.split('/')[2] || 'api',
        details: {
          method,
          path,
          statusCode: res.statusCode,
          durationMs: duration
        },
        userType: req.headers['x-user-role'] === 'OFFICER' ? 'OFFICER' : 'CITIZEN',
        status: res.statusCode < 400 ? 'SUCCESS' : 'FAILED'
      });
    }
  });

  next();
}

module.exports = auditLoggerMiddleware;
