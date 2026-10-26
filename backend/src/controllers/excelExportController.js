/**
 * excelExportController.js – Hạng mục 5: Xuất báo cáo hồ sơ sang Excel (.xlsx)
 * Chuẩn văn bản hành chính công UBND xã Hiệp Hòa
 */
const realtimeSyncService = require('../services/realtimeSyncService');
const securityService = require('../services/securityService');

/**
 * GET /api/submissions/export-excel
 * Query params: startDate, endDate, status, procedureId
 */
async function handleExportExcel(req, res) {
  try {
    const { startDate, endDate, status, procedureId } = req.query;

    const queueData = realtimeSyncService.getLiveQueue();
    let submissions = queueData.submissions || [];

    // Lọc theo khoảng thời gian
    if (startDate) {
      const from = new Date(startDate);
      from.setHours(0, 0, 0, 0);
      submissions = submissions.filter(s => new Date(s.createdAt) >= from);
    }
    if (endDate) {
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      submissions = submissions.filter(s => new Date(s.createdAt) <= to);
    }
    if (status && status !== 'ALL') {
      submissions = submissions.filter(s => s.status === status);
    }
    if (procedureId && procedureId !== 'ALL') {
      submissions = submissions.filter(s => s.procedureId === procedureId);
    }

    // Tạo tên file
    const fmtDate = (d) => {
      const dt = d ? new Date(d) : new Date();
      return `${String(dt.getDate()).padStart(2,'0')}-${String(dt.getMonth()+1).padStart(2,'0')}-${dt.getFullYear()}`;
    };
    const fromLabel = startDate ? fmtDate(startDate) : fmtDate();
    const toLabel = endDate ? fmtDate(endDate) : fmtDate();
    const filename = `Bao_Cao_Ho_So_Hiep_Hoa_AI_Gov_${fromLabel}_${toLabel}.xlsx`;

    // Trạng thái hồ sơ
    const statusMap = {
      'WAITING': 'Chờ tiếp nhận',
      'PROCESSING': 'Đang xử lý',
      'COMPLETED': 'Đã hoàn tất',
      'NEEDS_SUPPLEMENT': 'Cần bổ sung'
    };

    // Thông tin báo cáo
    const reportLines = {
      line1: 'ỦY BAN NHÂN DÂN XÃ HIỆP HÒA - TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG',
      line2: 'BÁO CÁO DANH SÁCH TIẾP NHẬN VÀ GIẢI QUYẾT HỒ SƠ HÀNH CHÍNH CÔNG',
      line3: `Kỳ báo cáo: Từ ngày ${fromLabel} đến ngày ${toLabel} | Tổng số hồ sơ: ${submissions.length}`
    };

    // Tạo nội dung CSV (UTF-8 with BOM) – tương thích mở Excel trực tiếp
    // Vì không có thư viện xlsx native, dùng CSV-Excel BOM trick
    const BOM = '\uFEFF';
    const SEP = ',';
    const ESC = (val) => {
      if (val === null || val === undefined) return '';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = [];

    // Header hành chính
    rows.push([ESC(reportLines.line1)]);
    rows.push([ESC(reportLines.line2)]);
    rows.push([ESC(reportLines.line3)]);
    rows.push([]);  // Dòng trống

    // Tiêu đề cột
    rows.push([
      'STT', 'Mã Hồ Sơ', 'Ngày Giờ Nộp', 'Họ và Tên Công Dân',
      'Ngày Sinh', 'Số CCCD/ĐDCN', 'Số Điện Thoại',
      'Ấp / Địa Chỉ Cư Trú', 'Tên Thủ Tục Hành Chính',
      'Nhóm Lĩnh Vực', 'Trạng Thái Hồ Sơ',
      'Cán Bộ Tiếp Nhận', 'Ghi Chú Giải Quyết',
      'Mức Hài Lòng'
    ].map(ESC).join(SEP));

    // Dữ liệu
    submissions.forEach((sub, idx) => {
      const fd = sub.formData || {};
      const ngaySinh = fd.ngay_sinh || fd.ngay_sinh_nam || fd.ngay_sinh_nu || '';
      const soCccd = sub.citizenCccd || fd.so_cccd || fd.so_cccd_nam || fd.so_cccd_nu || '';
      const groupMap = {
        'TT_KHAI_SINH': 'Hộ tịch', 'TT_KET_HON': 'Hộ tịch',
        'TT_TINH_TRANG_HON_NHAN': 'Hộ tịch', 'TT_XAC_NHAN_CU_TRU': 'Cư trú',
        'TT_DAT_DAI': 'Đất đai', 'TT_CHUNG_THUC': 'Chứng thực',
        'TT_BAO_TRO_HO_NGHEO': 'Bảo trợ XH', 'TT_TU_VAN_LUAT': 'Tư vấn pháp luật'
      };
      const createdAt = sub.createdAt ? new Date(sub.createdAt).toLocaleString('vi-VN') : '';
      rows.push([
        idx + 1,
        sub.submissionCode || '',
        createdAt,
        sub.citizenName || '',
        ngaySinh,
        soCccd,
        sub.citizenPhone || '',
        sub.hamlet || '',
        sub.procedureTitle || '',
        groupMap[sub.procedureId] || 'Hành chính công',
        statusMap[sub.status] || sub.status || 'Chờ tiếp nhận',
        sub.assignedOfficer || 'Chờ tiếp nhận',
        sub.officerNote || '',
        sub.satisfactionRating || ''
      ].map(ESC).join(SEP));
    });

    // Dòng thống kê cuối
    rows.push([]);
    const completed = submissions.filter(s => s.status === 'COMPLETED').length;
    const processing = submissions.filter(s => s.status === 'PROCESSING').length;
    const waiting = submissions.filter(s => s.status === 'WAITING').length;
    const needs = submissions.filter(s => s.status === 'NEEDS_SUPPLEMENT').length;
    rows.push([ESC(`Tổng cộng: ${submissions.length} hồ sơ | Hoàn tất: ${completed} | Đang xử lý: ${processing} | Chờ tiếp nhận: ${waiting} | Cần bổ sung: ${needs}`)]);

    const csvContent = BOM + rows.map(r => Array.isArray(r) ? r.join(SEP) : r).join('\r\n');

    res.setHeader('Content-Type', 'application/vnd.ms-excel;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(Buffer.from(csvContent, 'utf8'));
  } catch (err) {
    console.error('[excelExportController] error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/submissions/satisfaction – Ghi nhận đánh giá hài lòng người dân
 */
async function handleRecordSatisfaction(req, res) {
  try {
    const { submissionCode, rating } = req.body;
    if (!submissionCode || !rating) {
      return res.status(400).json({ success: false, error: 'Thiếu mã hồ sơ hoặc đánh giá' });
    }
    const validRatings = ['VERY_SATISFIED', 'SATISFIED', 'NEEDS_IMPROVEMENT'];
    if (!validRatings.includes(rating)) {
      return res.status(400).json({ success: false, error: 'Đánh giá không hợp lệ' });
    }
    const updated = realtimeSyncService.updateSubmission(submissionCode, {
      satisfactionRating: rating,
      satisfactionAt: new Date().toISOString()
    });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy hồ sơ' });
    }
    const store = globalThis.__HIEPHOA_REALTIME_STORE__;
    if (store) {
      if (!store.satisfactionStats) {
        store.satisfactionStats = { VERY_SATISFIED: 0, SATISFIED: 0, NEEDS_IMPROVEMENT: 0, total: 0 };
      }
      store.satisfactionStats[rating] = (store.satisfactionStats[rating] || 0) + 1;
      store.satisfactionStats.total = (store.satisfactionStats.total || 0) + 1;
    }
    return res.json({ success: true, message: 'Cảm ơn bà con đã đánh giá dịch vụ hành chính xã Hiệp Hòa!' });
  } catch (err) {
    console.error('[satisfactionController] error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { handleExportExcel, handleRecordSatisfaction };
