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
  }
};
