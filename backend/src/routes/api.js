const express = require('express');
const multer = require('multer');
const { handleChatQuery } = require('../controllers/ragController');
const { handleCccdOcr } = require('../controllers/ocrController');
const { handlePreCheck } = require('../controllers/preCheckController');
const {
  getLocalInfo,
  getCategories,
  getAllProcedures,
  getProcedureDetail
} = require('../controllers/procedureController');
const {
  getForms,
  getFormDetail,
  downloadTemplate,
  prepareFilledDocx,
  serveDownloadDocx,
  exportFilledDocx,
  getAuditLogs
} = require('../controllers/formController');

const router = express.Router();

// Configure multer memory storage (Zero-Data Retention: purely in-memory buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max per image
  }
});

const { handleVoiceSpeechToText, handleTextToSpeech } = require('../controllers/voiceController');
const { handleLogin, handleDeviceStatus, handleVerify } = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');
const {
  handleGetAllDevices,
  handleResetDevice,
  handleResetAllDevices,
  handleGetAllOfficers,
  handleCreateOfficer,
  handleUpdateOfficer
} = require('../controllers/adminController');

const {
  handleCreateSubmission,
  handleGetLiveQueue,
  handleGetSubmission,
  handleUpdateSubmission,
  handleResetDemoQueue,
  handleResetAllSubmissions,
  handleGetRealtimeStats
} = require('../controllers/submissionController');

// 0. Authentication & Device Security
router.post('/auth/login', handleLogin);
router.get('/auth/device-status', handleDeviceStatus);
router.get('/auth/verify', handleVerify);

// 0b. Admin Device Management & Unlock
router.get('/admin/devices', verifyToken, requireAdmin, handleGetAllDevices);
router.post('/admin/devices/:deviceId/reset', verifyToken, requireAdmin, handleResetDevice);
router.post('/admin/devices/reset-all', verifyToken, requireAdmin, handleResetAllDevices);

// 0c. Admin Officer Management
router.get('/admin/officers', verifyToken, requireAdmin, handleGetAllOfficers);
router.post('/admin/officers', verifyToken, requireAdmin, handleCreateOfficer);
router.put('/admin/officers/:username', verifyToken, requireAdmin, handleUpdateOfficer);

// 0d. Real-Time Online Submissions & Queue Sync
router.post('/submissions', handleCreateSubmission);
router.get('/submissions/live', handleGetLiveQueue);
router.get('/submissions/:code', handleGetSubmission);
router.put('/submissions/:code', handleUpdateSubmission);
router.post('/submissions/reset-all', handleResetAllSubmissions);
router.post('/submissions/reset-demo', handleResetDemoQueue);
router.get('/stats/realtime', handleGetRealtimeStats);

// 1. RAG AI Chat & Voice
router.post('/chat', handleChatQuery);

// 1b. Gemini Multimodal Audio Speech-to-Text & Vietnamese TTS
router.post('/voice-stt', upload.single('audio'), handleVoiceSpeechToText);
router.get('/tts', handleTextToSpeech);


// 2. OCR CCCD (Single image file or base64)
router.post('/ocr-cccd', upload.single('image'), handleCccdOcr);

// 3. AI Document Pre-Check (Multiple images or base64 array)
router.post('/pre-check', upload.array('images', 5), handlePreCheck);

// 4. Procedures & Local Info
router.get('/local-info', getLocalInfo);
router.get('/categories', getCategories);
router.get('/procedures', getAllProcedures);
router.get('/procedures/:id', getProcedureDetail);

// 5. Forms & Templates
router.get('/forms', getForms);
router.get('/forms/:id', getFormDetail);
router.get('/templates/:filename', downloadTemplate);
router.post('/prepare-docx', prepareFilledDocx);
router.get('/download-docx/:token/:filename', serveDownloadDocx);
router.post('/export-docx', exportFilledDocx);

// 6. System Audit Logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;

