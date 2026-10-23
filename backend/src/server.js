const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { zeroDataSanitizer } = require('./middlewares/zeroDataSanitizer');
const auditLoggerMiddleware = require('./middlewares/auditLogger');
const ReportLogger = require('./utils/reportLogger');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role']
}));

// Body parsers with generous limits for camera snapshots
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Security & Zero-Data Retention
app.use(zeroDataSanitizer);
app.use(auditLoggerMiddleware);

// Static serve templates directory for direct downloads if needed
app.use('/templates', express.static(path.join(__dirname, 'data/templates')));

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'HIỆP HÒA AI-GOV BACKEND API',
    commune: 'Xã Hiệp Hòa, Tỉnh Tây Ninh',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    error: 'Đã xảy ra sự cố trên máy chủ xử lý hành chính.',
    message: err.message
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 HIỆP HÒA AI-GOV Backend Server đang chạy tại cổng ${PORT}`);
    console.log(`📍 Đơn vị: UBND Xã Hiệp Hòa, Tỉnh Tây Ninh`);
    console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
    console.log(`🔒 Tiêu chuẩn: Zero-Data Retention & Client-Side Processing`);
    console.log(`=======================================================`);

    // Log system startup in audit log
    ReportLogger.logEvent({
      action: 'SERVER_STARTUP',
      module: 'CORE',
      details: { port: PORT, mode: process.env.NODE_ENV || 'development' },
      userType: 'SYSTEM',
      status: 'SUCCESS'
    });
  });
}

module.exports = app;

