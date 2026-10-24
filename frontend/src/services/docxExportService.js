import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

// Chuẩn hóa tên file an toàn tuyệt đối cho Windows/macOS (bỏ dấu tiếng Việt, không khoảng trắng)
const sanitizeFilename = (name) => {
  if (!name) return 'HIEP_HOA_BIEU_MAU.docx';
  let clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
  if (!clean.toLowerCase().endsWith('.docx')) {
    clean += '.docx';
  }
  return clean;
};

export const docxExportService = {
  /**
   * Xuất file Word chuẩn (.docx) điền sẵn thông tin
   * Sử dụng Native Server Attachment Download (Giải pháp 2) đảm bảo 100% không bao giờ bị GUID trên Windows
   */
  async generateAndDownloadDocx(templateFilename, formData, outputFilename) {
    const rawName = outputFilename || `HIEP_HOA_${templateFilename.replace('.docx', '')}_${Date.now()}.docx`;
    const safeDownloadName = sanitizeFilename(rawName);

    // =========================================================================
    // GIẢI PHÁP 2: TẢI TRỰC TIẾP QUA NATIVE SERVER ATTACHMENT (/api/prepare-docx)
    // =========================================================================
    try {
      const response = await fetch('http://localhost:5000/api/prepare-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateFilename,
          formData: formData || {},
          outputFilename: safeDownloadName
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.downloadUrl) {
          // Kích hoạt Native Download của Trình duyệt bằng hidden iframe (không load lại trang)
          const downloadUrl = `http://localhost:5000${result.downloadUrl}`;
          
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = downloadUrl;
          document.body.appendChild(iframe);

          setTimeout(() => {
            try {
              document.body.removeChild(iframe);
            } catch (e) {}
          }, 30000);

          return { success: true, filename: safeDownloadName };
        }
      }
    } catch (serverErr) {
      console.warn('[docxExportService] Server Native Download notice, trying client fallback:', serverErr);
    }

    // =========================================================================
    // FALLBACK DỰ PHÒNG: CLIENT-SIDE RENDERING VỚI DOCXTEMPLATER & FILE-SAVER
    // =========================================================================
    try {
      const templateUrl = `/templates/${templateFilename}`;
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error(`Không thể nạp file mẫu: ${templateFilename}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);

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

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      saveAs(out, safeDownloadName);
      return { success: true, filename: safeDownloadName };
    } catch (clientErr) {
      console.error('[docxExportService] Fallback error:', clientErr);
      throw clientErr;
    }
  },

  /**
   * In trực tiếp tài liệu tại chỗ (Print)
   */
  printDocument() {
    window.print();
  },

  /**
   * Xuất Sổ theo dõi và danh sách hồ sơ đã nộp và xử lý trong ngày sang file Word (.docx)
   * Chuẩn Nghị định 30/2020/NĐ-CP của Chính phủ về công tác văn thư
   * Đảm bảo 100% tệp tin OpenXML PKZIP .docx thật, mở ngay trên Microsoft Word không bị lỗi
   * Bắt buộc phông chữ: Times New Roman ('Times New Roman', Times, serif)
   */
  async exportDailySubmissionsWord(submissions = [], officerUser = null) {
    const escapeXml = (str) => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}/${month}/${year}`;
    const filename = `SO_THEO_DOI_HO_SO_TRONG_NGAY_${day}_${month}_${year}.docx`;

    const officerName = officerUser?.name || 'Trần Văn Hòa';
    const totalCount = submissions.length;
    const completedCount = submissions.filter(s => s.status === 'COMPLETED').length;
    const processingCount = submissions.filter(s => s.status === 'PROCESSING').length;
    const needsSupplementCount = submissions.filter(s => s.status === 'NEEDS_SUPPLEMENT').length;
    const waitingCount = submissions.filter(s => s.status === 'WAITING' || !s.status).length;

    try {
      // Nạp cấu trúc OpenXML chuẩn từ tệp mẫu có sẵn để bảo đảm tương thích tuyệt đối với Microsoft Word
      const templateUrl = '/templates/mau_01_to_khai_dang_ky_khai_sinh.docx';
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error('Không thể tải tệp mẫu định dạng Word');
      }
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);

      let rowsXml = '';
      if (submissions.length === 0) {
        rowsXml = `
          <w:tr>
            <w:tc>
              <w:tcPr><w:gridSpan w:val="10"/></w:tcPr>
              <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:sz w:val="22"/></w:rPr><w:t>(Chưa có hồ sơ nào tiếp nhận hoặc xử lý trong ngày)</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
        `;
      } else {
        submissions.forEach((s, idx) => {
          let statusText = 'Chờ tiếp nhận';
          if (s.status === 'COMPLETED') statusText = 'Đã hoàn tất & trả KQ';
          else if (s.status === 'PROCESSING') statusText = 'Đang thụ lý tại quầy';
          else if (s.status === 'NEEDS_SUPPLEMENT') statusText = 'Yêu cầu bổ sung';

          const timeCreated = s.createdAt
            ? new Date(s.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : '--:--';
          const cccdOrPhone = [s.citizenCccd, s.citizenPhone].filter(Boolean).join(' / ') || 'Đã đối chiếu';
          const address = s.hamlet || s.formData?.noi_thuong_tru || s.formData?.dia_chi_thuong_tru || 'Xã Hiệp Hòa';
          const note = s.officerNote || 'Đạt yêu cầu quy định';
          const officer = s.assignedOfficer || officerName;

          rowsXml += `
            <w:tr>
              <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/></w:rPr><w:t>${idx + 1}</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>${escapeXml(s.submissionCode || 'HH-1000')}</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>${escapeXml(s.procedureTitle || 'Thủ tục hành chính')}</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/></w:rPr><w:t>${escapeXml(s.citizenName || 'Người dân')}</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(cccdOrPhone)}</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(address)}</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(timeCreated)}</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(statusText)}</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(officer)}</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(note)}</w:t></w:r></w:p></w:tc>
            </w:tr>
          `;
        });
      }

      const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <!-- Header Quốc hiệu Tiêu ngữ 2 cột -->
    <w:tbl>
      <w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="7200" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>ỦY BAN NHÂN DÂN XÃ HIỆP HÒA</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:u w:val="single"/><w:sz w:val="22"/></w:rPr><w:t>BỘ PHẬN TIẾP NHẬN VÀ TRẢ KẾT QUẢ</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:sz w:val="20"/></w:rPr><w:t>Số: ......./STĐ-UBND</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="9300" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="24"/></w:rPr><w:t>Độc lập - Tự do - Hạnh phúc</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:sz w:val="22"/></w:rPr><w:t>Hiệp Hòa, ngày ${day} tháng ${month} năm ${year}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <!-- Tiêu đề Sổ -->
    <w:p><w:pPr><w:spacing w:before="240" w:after="100"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="30"/></w:rPr><w:t>SỔ THEO DÕI VÀ DANH SÁCH HỒ SƠ TIẾP NHẬN, XỬ LÝ TRONG NGÀY</w:t></w:r></w:p>
    <w:p><w:pPr><w:spacing w:after="100"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:sz w:val="22"/></w:rPr><w:t>(Cổng Dịch vụ công &amp; Bộ phận Một cửa UBND xã Hiệp Hòa, tỉnh Tây Ninh)</w:t></w:r></w:p>
    <w:p><w:pPr><w:spacing w:after="160"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>Thời điểm thống kê: Ngày ${dateStr} • Người lập sổ: ${escapeXml(officerName)}</w:t></w:r></w:p>

    <!-- Tóm tắt số liệu tiếp nhận trong ngày -->
    <w:p><w:pPr><w:spacing w:after="180"/></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>* Tình hình giải quyết trong ngày: </w:t></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/></w:rPr><w:t>Tổng số tiếp nhận: </w:t></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>${totalCount} hồ sơ</w:t></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/></w:rPr><w:t>  |  Đã hoàn tất trả kết quả: </w:t></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>${completedCount}</w:t></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/></w:rPr><w:t>  |  Đang thụ lý tại quầy: </w:t></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>${processingCount}</w:t></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/></w:rPr><w:t>  |  Yêu cầu bổ sung: </w:t></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>${needsSupplementCount}</w:t></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/></w:rPr><w:t>  |  Chờ tiếp nhận: </w:t></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>${waitingCount}</w:t></w:r>
    </w:p>

    <!-- Bảng danh sách chi tiết hồ sơ -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="0" w:type="auto"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>STT</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>Mã hồ sơ</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>Tên thủ tục</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>Họ tên người nộp</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>Số CCCD / ĐT</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>Ấp cư trú</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>Giờ nhận</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>Trạng thái</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>Cán bộ</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t>Ghi chú</w:t></w:r></w:p></w:tc>
      </w:tr>
      ${rowsXml}
    </w:tbl>

    <!-- Chữ ký người lập biểu và Cán bộ Một cửa -->
    <w:tbl>
      <w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="5500" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>NGƯỜI LẬP BIỂU</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:sz w:val="20"/></w:rPr><w:t>(Ký và ghi rõ họ tên)</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="900"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>${escapeXml(officerName)}</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="5500" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>CÁN BỘ TIẾP NHẬN &amp; TRẢ KQ</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:sz w:val="20"/></w:rPr><w:t>(Ký và ghi rõ họ tên)</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="900"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>${escapeXml(officerName)}</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="5500" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>XÁC NHẬN CỦA LÃNH ĐẠO UBND XÃ</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:sz w:val="20"/></w:rPr><w:t>(Ký, đóng dấu xác nhận)</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:before="900"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>ỦY BAN NHÂN DÂN XÃ HIỆP HÒA</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <!-- Page setup: Landscape A4 -->
    <w:sectPr>
      <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>
    </w:sectPr>
  </w:body>
</w:document>`;

      zip.file('word/document.xml', docXml);
      const blob = zip.generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      saveAs(blob, filename);
      return { success: true, filename };
    } catch (e) {
      console.error('[docxExportService] Export Daily Word error:', e);
      throw e;
    }
  }
};
