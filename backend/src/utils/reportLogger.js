const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.resolve(__dirname, '../../../reports');
const AUDIT_LOG_FILE = path.join(REPORTS_DIR, 'system_audit_log.json');
const CHANGELOG_FILE = path.join(REPORTS_DIR, 'CHANGELOG.md');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

class ReportLogger {
  /**
   * Log an audit event (such as template update, procedure update, OCR precheck run, etc.)
   * @param {Object} eventData { action, module, details, userType, ip }
   */
  static logEvent(eventData) {
    const timestamp = new Date().toISOString();
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp,
      action: eventData.action || 'SYSTEM_ACTION',
      module: eventData.module || 'CORE',
      details: eventData.details || {},
      userType: eventData.userType || 'CITIZEN', // CITIZEN, OFFICER, SYSTEM
      status: eventData.status || 'SUCCESS'
    };

    try {
      let logs = [];
      if (fs.existsSync(AUDIT_LOG_FILE)) {
        const raw = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
        try {
          logs = JSON.parse(raw);
          if (!Array.isArray(logs)) logs = [];
        } catch (e) {
          logs = [];
        }
      }
      logs.unshift(entry);
      // Keep last 1000 entries
      if (logs.length > 1000) logs = logs.slice(0, 1000);
      fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ReportLogger] Error writing to system_audit_log.json:', err);
    }

    return entry;
  }

  /**
   * Append an entry to CHANGELOG.md
   * @param {string} taskType
   * @param {string} title
   * @param {string[]} filesList
   * @param {string} details
   * @param {string} reason
   */
  static appendChangelog(taskType, title, filesList = [], details = '', reason = '') {
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
    
    const entry = `
## [${dateStr}] - ${title}
- **Loại tác vụ**: ${taskType}
- **Tác vụ thực hiện**:
  - ${details}
- **Danh sách file ảnh hưởng**:
${filesList.map(f => `  + \`${f}\``).join('\n')}
- **Lý do thay đổi**: ${reason || 'Nâng cấp và duy trì hệ thống HIỆP HÒA AI-GOV'}
`;

    try {
      if (fs.existsSync(CHANGELOG_FILE)) {
        let content = fs.readFileSync(CHANGELOG_FILE, 'utf-8');
        content += '\n' + entry;
        fs.writeFileSync(CHANGELOG_FILE, content, 'utf-8');
      } else {
        fs.writeFileSync(CHANGELOG_FILE, '# NHẬT KÝ THAY ĐỔI DỰ ÁN\n' + entry, 'utf-8');
      }
    } catch (err) {
      console.error('[ReportLogger] Error appending to CHANGELOG.md:', err);
    }
  }

  /**
   * Read recent audit logs
   */
  static getAuditLogs(limit = 50) {
    try {
      if (fs.existsSync(AUDIT_LOG_FILE)) {
        const raw = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
        const logs = JSON.parse(raw);
        return Array.isArray(logs) ? logs.slice(0, limit) : [];
      }
    } catch (err) {
      console.error('[ReportLogger] Error reading audit logs:', err);
    }
    return [];
  }
}

module.exports = ReportLogger;
