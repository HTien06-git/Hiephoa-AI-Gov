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
   * Bắt buộc phông chữ: Times New Roman ('Times New Roman', Times, serif)
   */
  exportDailySubmissionsWord(submissions = [], officerUser = null) {
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

    const rowsHtml = submissions.map((s, idx) => {
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

      return `
        <tr>
          <td style="text-align: center; border: 1px solid #000000; padding: 6px 4px; font-size: 11pt;">${idx + 1}</td>
          <td style="text-align: center; border: 1px solid #000000; padding: 6px 4px; font-weight: bold; font-size: 11pt;">${s.submissionCode || 'HH-1000'}</td>
          <td style="border: 1px solid #000000; padding: 6px 6px; font-size: 11pt; font-weight: bold;">${s.procedureTitle || 'Thủ tục hành chính'}</td>
          <td style="border: 1px solid #000000; padding: 6px 6px; font-size: 11pt;">${s.citizenName || 'Người dân'}</td>
          <td style="border: 1px solid #000000; padding: 6px 4px; font-size: 10pt; text-align: center;">${cccdOrPhone}</td>
          <td style="border: 1px solid #000000; padding: 6px 4px; font-size: 10pt;">${address}</td>
          <td style="text-align: center; border: 1px solid #000000; padding: 6px 4px; font-size: 10pt;">${timeCreated}</td>
          <td style="text-align: center; border: 1px solid #000000; padding: 6px 4px; font-size: 10pt; font-weight: bold;">${statusText}</td>
          <td style="border: 1px solid #000000; padding: 6px 4px; font-size: 10pt; text-align: center;">${officer}</td>
          <td style="border: 1px solid #000000; padding: 6px 4px; font-size: 10pt; font-style: italic;">${note}</td>
        </tr>
      `;
    }).join('');

    const emptyRowsHtml = submissions.length === 0 ? `
      <tr>
        <td colspan="10" style="text-align: center; padding: 18px; border: 1px solid #000000; font-style: italic; font-size: 11pt;">
          (Chưa có hồ sơ nào nộp hoặc xử lý trong ngày)
        </td>
      </tr>
    ` : '';

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>SỔ THEO DÕI HỒ SƠ TRONG NGÀY - UBND XÃ HIỆP HÒA</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 841.9pt 595.3pt;
            mso-page-orientation: landscape;
            margin: 15mm 15mm 15mm 15mm;
            mso-header-margin: 36.0pt;
            mso-footer-margin: 36.0pt;
            mso-paper-source: 0;
          }
          div.Section1 { page: Section1; }
          body, table, th, td, p, div, span {
            font-family: 'Times New Roman', Times, serif !important;
          }
          body {
            font-size: 13pt;
            line-height: 1.35;
            color: #000000;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            margin-bottom: 20px;
          }
          table.data-table th, table.data-table td {
            border: 1px solid #000000;
            padding: 6px 4px;
            vertical-align: middle;
          }
          table.data-table th {
            background-color: #F1F5F9;
            font-weight: bold;
            text-align: center;
            font-size: 11pt;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          <!-- Header Quốc hiệu Tiêu ngữ chuẩn công văn -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            <tr>
              <td style="width: 45%; text-align: center; vertical-align: top; border: none;">
                <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">
                  ỦY BAN NHÂN DÂN XÃ HIỆP HÒA
                </div>
                <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase; text-decoration: underline;">
                  BỘ PHẬN TIẾP NHẬN VÀ TRẢ KẾT QUẢ
                </div>
                <div style="font-size: 11pt; margin-top: 4px; font-style: italic;">
                  Số: ......./STĐ-UBND
                </div>
              </td>
              <td style="width: 55%; text-align: center; vertical-align: top; border: none;">
                <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div style="font-size: 13pt; font-weight: bold;">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div style="font-size: 11pt; margin: 4px auto 6px auto; border-bottom: 1px solid #000000; width: 150px;"></div>
                <div style="font-size: 12pt; font-style: italic;">
                  Hiệp Hòa, ngày ${day} tháng ${month} năm ${year}
                </div>
              </td>
            </tr>
          </table>

          <!-- Tiêu đề Sổ theo dõi -->
          <div style="text-align: center; margin-top: 14px; margin-bottom: 10px;">
            <div style="font-size: 16pt; font-weight: bold; text-transform: uppercase;">
              SỔ THEO DÕI VÀ DANH SÁCH HỒ SƠ TIẾP NHẬN, XỬ LÝ TRONG NGÀY
            </div>
            <div style="font-size: 12pt; font-style: italic; margin-top: 4px;">
              (Áp dụng trong hệ thống Cổng Dịch vụ công & Bộ phận Một cửa xã Hiệp Hòa, tỉnh Tây Ninh)
            </div>
            <div style="font-size: 12pt; font-weight: bold; margin-top: 4px;">
              Thời điểm thống kê: Ngày ${dateStr} • Người lập sổ: ${officerName}
            </div>
          </div>

          <!-- Tóm tắt số liệu tiếp nhận trong ngày -->
          <div style="font-size: 12pt; margin-bottom: 10px; line-height: 1.5; background: #F8FAFC; padding: 8px 12px; border: 1px solid #CBD5E1;">
            <strong>* Tổng hợp tình hình giải quyết trong ngày:</strong>
            Tổng số hồ sơ tiếp nhận: <strong>${totalCount}</strong> hồ sơ | 
            Đã hoàn tất trả kết quả: <strong>${completedCount}</strong> | 
            Đang xử lý tại quầy: <strong>${processingCount}</strong> | 
            Cần bổ sung giấy tờ: <strong>${needsSupplementCount}</strong> | 
            Chờ tiếp nhận: <strong>${waitingCount}</strong>
          </div>

          <!-- Bảng danh sách chi tiết hồ sơ -->
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 35px;">STT</th>
                <th style="width: 80px;">Mã hồ sơ</th>
                <th style="width: 170px;">Tên thủ tục hành chính</th>
                <th style="width: 130px;">Họ tên người nộp</th>
                <th style="width: 120px;">Số CCCD / ĐT</th>
                <th style="width: 110px;">Ấp cư trú</th>
                <th style="width: 65px;">Giờ nhận</th>
                <th style="width: 110px;">Trạng thái</th>
                <th style="width: 110px;">Cán bộ thụ lý</th>
                <th>Ghi chú / Yêu cầu</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              ${emptyRowsHtml}
            </tbody>
          </table>

          <!-- Chữ ký người lập biểu và Cán bộ Một cửa -->
          <table style="width: 100%; margin-top: 25px; border-collapse: collapse;">
            <tr style="vertical-align: top; text-align: center;">
              <td style="width: 33%; border: none;">
                <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">
                  NGƯỜI LẬP BIỂU
                </div>
                <div style="font-size: 11pt; font-style: italic;">
                  (Ký và ghi rõ họ tên)
                </div>
                <div style="height: 70px;"></div>
                <div style="font-size: 12pt; font-weight: bold;">
                  ${officerName}
                </div>
              </td>
              <td style="width: 33%; border: none;">
                <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">
                  CÁN BỘ TIẾP NHẬN & TRẢ KQ
                </div>
                <div style="font-size: 11pt; font-style: italic;">
                  (Ký và ghi rõ họ tên)
                </div>
                <div style="height: 70px;"></div>
                <div style="font-size: 12pt; font-weight: bold;">
                  ${officerName}
                </div>
              </td>
              <td style="width: 34%; border: none;">
                <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">
                  XÁC NHẬN CỦA LÃNH ĐẠO UBND XÃ
                </div>
                <div style="font-size: 11pt; font-style: italic;">
                  (Ký, đóng dấu xác nhận)
                </div>
                <div style="height: 70px;"></div>
                <div style="font-size: 12pt; font-weight: bold;">
                  ỦY BAN NHÂN DÂN XÃ HIỆP HÒA
                </div>
              </td>
            </tr>
          </table>

        </div>
      </body>
      </html>
    `;

    try {
      const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword;charset=utf-8'
      });
      saveAs(blob, filename);
      return { success: true, filename };
    } catch (e) {
      console.error('[docxExportService] Export Daily Word error:', e);
      throw e;
    }
  }
};
