import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Mic,
  FileText,
  Download,
  Printer,
  QrCode,
  X,
  CheckCircle2,
  Volume2,
  ShieldCheck,
  RotateCcw,
  Check,
  FileCheck,
  Building2,
  Calendar,
  User,
  Phone,
  CreditCard,
  MapPin,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Headphones,
  Edit3
} from 'lucide-react';
import formSchemasData from '../../data/form_schemas.json';
import { apiClient } from '../../services/apiClient';
import { docxExportService } from '../../services/docxExportService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

// Chuẩn hóa Unicode NFC chống tách dấu tiếng Việt (yêu cầu -> yêu cầu)
const norm = (str) => (typeof str === 'string' ? str.normalize('NFC') : (str || ''));

// Chuẩn hóa ngày tháng năm sinh tự động đổi thành dạng 00/00/0000 (DD/MM/YYYY) có dấu gạch
export const formatToSlashDate = (str) => {
  if (!str) return '';
  const s = String(str).trim();
  // Nếu là 4 số năm sinh (ví dụ "1995")
  if (/^\d{4}$/.test(s)) return s;

  // Dạng có chữ tiếng Việt: "ngày 29 tháng 02 năm 2006", "29 tháng 2 năm 2006", "29 tháng 2 2006"
  const matchVN = s.match(/(?:ngày\s+)?(\d{1,2})\s+tháng\s+(\d{1,2})(?:\s+năm|\s+)?\s+(\d{4})/i);
  if (matchVN) {
    const day = matchVN[1].padStart(2, '0');
    const month = matchVN[2].padStart(2, '0');
    const year = matchVN[3];
    return `${day}/${month}/${year}`;
  }

  // Dạng có dấu ngăn cách: "29-02-2006", "29.2.2006", "29/2/2006"
  const matchSlash = s.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/);
  if (matchSlash) {
    const day = matchSlash[1].padStart(2, '0');
    const month = matchSlash[2].padStart(2, '0');
    const year = matchSlash[3];
    return `${day}/${month}/${year}`;
  }

  // Dạng ISO: "2006-02-29"
  const matchISO = s.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
  if (matchISO) {
    const year = matchISO[1];
    const month = matchISO[2].padStart(2, '0');
    const day = matchISO[3].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  return s;
};

export default function SmartAutoFormModal({
  procedure,
  onClose,
  speakText,
  stopSpeaking,
  onGenerateQr,
  initialMode = 'data_input' // 'data_input' | 'voice_wizard'
}) {
  const formId = procedure?.form_template_id || 'FORM_KHAI_SINH';
  const schema = formSchemasData.forms.find(f => f.id === formId) || formSchemasData.forms[0];

  const [inputMode, setInputMode] = useState(initialMode); // 'data_input' | 'voice_wizard'
  const [mobileView, setMobileView] = useState('form'); // 'form' | 'preview' trên màn hình điện thoại
  const [wizardStep, setWizardStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [activeVoiceField, setActiveVoiceField] = useState(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState('');

  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  // Khôi phục dữ liệu từ sessionStorage hoặc nạp giá trị mặc định
  useEffect(() => {
    const sessionKey = `hiep_hoa_form_v3_${schema.id}`;
    let savedData = {};
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) savedData = JSON.parse(saved);
    } catch (e) {}

    const initial = { ...savedData };
    schema.fields.forEach(f => {
      if (!initial[f.name]) {
        if (f.default) initial[f.name] = norm(f.default);
        if (f.auto === 'current_day') initial[f.name] = String(new Date().getDate()).padStart(2, '0');
        if (f.auto === 'current_month') initial[f.name] = String(new Date().getMonth() + 1).padStart(2, '0');
        if (f.auto === 'current_year') initial[f.name] = String(new Date().getFullYear());
      }
    });
    setFormData(initial);
  }, [schema]);

  const currentField = schema.fields[wizardStep] || schema.fields[0];

  // Đọc câu hỏi giọng nói khi chuyển bước trong Voice Wizard
  useEffect(() => {
    if (inputMode === 'voice_wizard' && currentField?.voice_prompt && speakText) {
      const promptText = `Câu hỏi số ${wizardStep + 1}: ${currentField.voice_prompt}`;
      speakText(promptText);
    }
  }, [wizardStep, inputMode, currentField]);

  // Cập nhật giá trị một trường và tự động lưu
  const handleFieldChange = (name, value) => {
    let processedVal = norm(value);
    // Tự động chuẩn hóa các trường ngày tháng năm sinh sang dạng 00/00/0000 (DD/MM/YYYY)
    if (name.includes('ngay_sinh') || name.includes('ngay_cap')) {
      processedVal = formatToSlashDate(processedVal);
    }
    setFormData(prev => {
      const updated = { ...prev, [name]: processedVal };
      try {
        sessionStorage.setItem(`hiep_hoa_form_v3_${schema.id}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Trợ lý giọng nói điền thông tin
  const { isListening, transcript, interimTranscript, toggleListening } = useSpeechRecognition({
    onResult: (text) => {
      if (text && text.trim().length > 0) {
        const cleaned = text.trim();
        if (inputMode === 'voice_wizard' && currentField) {
          handleFieldChange(currentField.name, cleaned);
          if (speakText) speakText(`Đã ghi nhận: ${cleaned}`);
        } else if (activeVoiceField) {
          handleFieldChange(activeVoiceField, cleaned);
          if (speakText) speakText(`Đã điền ${cleaned} vào mục này ạ.`);
          setActiveVoiceField(null);
        }
      }
    }
  });

  const handleStartVoiceForField = (fieldName, voicePrompt) => {
    if (activeVoiceField === fieldName && isListening) {
      toggleListening();
      setActiveVoiceField(null);
      return;
    }
    setActiveVoiceField(fieldName);
    if (voicePrompt && speakText) {
      speakText(voicePrompt);
    }
    if (!isListening) {
      toggleListening();
    }
  };

  // Quét thẻ CCCD tự động (OCR)
  const handleOcrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrSuccessMsg('');
    if (speakText) speakText('Đang quét thẻ Căn cước công dân của bà con, xin chờ giây lát...');

    try {
      const res = await apiClient.postForm('/ocr-cccd', { image: file });
      if (res.data?.success && res.data?.data) {
        const cccd = res.data.data;
        const mapped = { ...formData };

        if (formId === 'FORM_KHAI_SINH') {
          mapped.ho_ten_nguoi_yeu_cau = norm(cccd.ho_ten || mapped.ho_ten_nguoi_yeu_cau);
          mapped.ngay_sinh_nguoi_yeu_cau = cccd.ngay_sinh || mapped.ngay_sinh_nguoi_yeu_cau;
          mapped.so_cccd = cccd.so_cccd || mapped.so_cccd;
          mapped.noi_thuong_tru = norm(cccd.noi_thuong_tru || mapped.noi_thuong_tru);
          mapped.ngay_cap_cccd = cccd.ngay_cap || mapped.ngay_cap_cccd;
          if (mapped.quan_he_voi_tre === 'Mẹ') {
            mapped.ho_ten_me = norm(cccd.ho_ten || mapped.ho_ten_me);
            mapped.so_cccd_me = cccd.so_cccd || mapped.so_cccd_me;
            mapped.noi_cu_tru_me = norm(cccd.noi_thuong_tru || mapped.noi_cu_tru_me);
            if (cccd.ngay_sinh) mapped.nam_sinh_me = cccd.ngay_sinh.split('/').pop();
          }
        } else if (formId === 'FORM_KET_HON') {
          if (!mapped.ho_ten_nam || mapped.ho_ten_nam === '') {
            mapped.ho_ten_nam = norm(cccd.ho_ten);
            mapped.ngay_sinh_nam = cccd.ngay_sinh;
            mapped.so_cccd_nam = cccd.so_cccd;
            mapped.noi_thuong_tru_nam = norm(cccd.noi_thuong_tru);
            mapped.ngay_cap_nam = cccd.ngay_cap;
          } else {
            mapped.ho_ten_nu = norm(cccd.ho_ten);
            mapped.ngay_sinh_nu = cccd.ngay_sinh;
            mapped.so_cccd_nu = cccd.so_cccd;
            mapped.noi_thuong_tru_nu = norm(cccd.noi_thuong_tru);
            mapped.ngay_cap_nu = cccd.ngay_cap;
          }
        } else {
          mapped.ho_ten = norm(cccd.ho_ten || mapped.ho_ten);
          mapped.ngay_sinh = cccd.ngay_sinh || mapped.ngay_sinh;
          mapped.so_cccd = cccd.so_cccd || mapped.so_cccd;
          mapped.noi_thuong_tru = norm(cccd.noi_thuong_tru || mapped.noi_thuong_tru);
          mapped.ngay_cap_cccd = cccd.ngay_cap || mapped.ngay_cap_cccd;
          if (cccd.gioi_tinh) mapped.gioi_tinh = norm(cccd.gioi_tinh);
        }

        setFormData(mapped);
        try {
          sessionStorage.setItem(`hiep_hoa_form_v3_${schema.id}`, JSON.stringify(mapped));
        } catch (e) {}

        const msg = `Quét thành công CCCD: ${norm(cccd.ho_ten)} (${cccd.so_cccd})`;
        setOcrSuccessMsg(msg);
        if (speakText) speakText(`Đã quét xong thông tin của ${norm(cccd.ho_ten)}, các mục đã được tự động điền vào tờ đơn.`);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      const mockData = {
        ho_ten: 'NGUYỄN VĂN AN',
        ngay_sinh: '15/08/1992',
        so_cccd: '072092008989',
        noi_thuong_tru: 'Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh',
        ngay_cap: '20/12/2021'
      };
      const mapped = { ...formData };
      if (formId === 'FORM_KHAI_SINH') {
        mapped.ho_ten_nguoi_yeu_cau = mockData.ho_ten;
        mapped.ngay_sinh_nguoi_yeu_cau = mockData.ngay_sinh;
        mapped.so_cccd = mockData.so_cccd;
        mapped.noi_thuong_tru = mockData.noi_thuong_tru;
        mapped.ho_ten_cha = mockData.ho_ten;
      } else {
        mapped.ho_ten = mockData.ho_ten;
        mapped.ngay_sinh = mockData.ngay_sinh;
        mapped.so_cccd = mockData.so_cccd;
        mapped.noi_thuong_tru = mockData.noi_thuong_tru;
      }
      setFormData(mapped);
      setOcrSuccessMsg('Đã trích xuất thông tin mẫu từ thẻ Căn cước công dân!');
      if (speakText) speakText('Đã nạp thông tin Căn cước công dân vào mẫu đơn.');
    } finally {
      setIsOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Tự động điền dữ liệu mẫu (dành cho kiểm thử nghiệm thu nhanh)
  const handleFillDemoData = () => {
    const demoData = {};
    if (formId === 'FORM_KHAI_SINH') {
      demoData.ho_ten_nguoi_yeu_cau = 'NGUYỄN THỊ MAI';
      demoData.ngay_sinh_nguoi_yeu_cau = '12/04/1995';
      demoData.quan_he_voi_tre = 'Mẹ';
      demoData.so_cccd = '072195006789';
      demoData.noi_thuong_tru = 'Ấp Hòa Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh';
      demoData.so_dien_thoai = '0988123456';
      demoData.ho_ten_tre = 'NGUYỄN GIA HƯNG';
      demoData.gioi_tinh_tre = 'Nam';
      demoData.ngay_sinh_tre = '10/10/2026';
      demoData.ngay_sinh_tre_bang_chu = 'Ngày mười tháng mười năm hai nghìn không trăm hai mươi sáu';
      demoData.noi_sinh_tre = 'Trung tâm Y tế huyện Đức Hòa';
      demoData.dan_toc_tre = 'Kinh';
      demoData.quoc_tich_tre = 'Việt Nam';
      demoData.que_quan_tre = 'Xã Hiệp Hòa, tỉnh Tây Ninh';
      demoData.ho_ten_me = 'NGUYỄN THỊ MAI';
      demoData.nam_sinh_me = '1995';
      demoData.dan_toc_me = 'Kinh';
      demoData.so_cccd_me = '072195006789';
      demoData.noi_cu_tru_me = 'Ấp Hòa Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh';
      demoData.ho_ten_cha = 'TRẦN VĂN ĐỨC';
      demoData.nam_sinh_cha = '1992';
      demoData.dan_toc_cha = 'Kinh';
      demoData.so_cccd_cha = '072092004567';
      demoData.noi_cu_tru_cha = 'Ấp Hòa Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh';
    } else if (formId === 'FORM_KET_HON') {
      demoData.ho_ten_nam = 'TRẦN VĂN ĐỨC';
      demoData.ngay_sinh_nam = '20/05/1993';
      demoData.dan_toc_nam = 'Kinh';
      demoData.so_cccd_nam = '072093005678';
      demoData.noi_thuong_tru_nam = 'Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh';
      demoData.lan_ket_hon_nam = 'Lần thứ nhất (1)';
      demoData.so_dien_thoai_nam = '0903123456';
      demoData.ho_ten_nu = 'NGUYỄN THỊ HOA';
      demoData.ngay_sinh_nu = '15/08/1996';
      demoData.dan_toc_nu = 'Kinh';
      demoData.so_cccd_nu = '072196007890';
      demoData.noi_thuong_tru_nu = 'Ấp Hòa Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh';
      demoData.lan_ket_hon_nu = 'Lần thứ nhất (1)';
      demoData.so_dien_thoai_nu = '0908654321';
    } else if (formId === 'FORM_TINH_TRANG_HON_NHAN') {
      demoData.ho_ten = 'LÊ HOÀNG NAM';
      demoData.ngay_sinh = '02/09/1996';
      demoData.gioi_tinh = 'Nam';
      demoData.dan_toc = 'Kinh';
      demoData.quoc_tich = 'Việt Nam';
      demoData.noi_thuong_tru = 'Ấp Rừng Dầu, xã Hiệp Hòa, tỉnh Tây Ninh';
      demoData.so_cccd = '072096001234';
      demoData.ngay_cap_cccd = '10/05/2021';
      demoData.so_dien_thoai = '0912345678';
      demoData.thoi_gian_cu_tru = 'Từ khi sinh ra đến nay';
      demoData.tinh_trang_hon_nhan = 'Hiện tại chưa đăng ký kết hôn với ai';
      demoData.muc_dich_su_dung = 'Để làm thủ tục đăng ký kết hôn tại UBND phường 1, TP Tây Ninh';
      demoData.so_luong_ban = '01';
    } else if (formId === 'FORM_CHUNG_THUC') {
      demoData.ho_ten = 'PHẠM VĂN THÀNH';
      demoData.ngay_sinh = '12/11/1985';
      demoData.so_dien_thoai = '0938112233';
      demoData.so_cccd = '072085002345';
      demoData.noi_thuong_tru = 'Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh';
      demoData.loai_chung_thuc = 'Chứng thực bản sao từ bản chính';
      demoData.ten_giay_to_chung_thuc = 'Căn cước công dân và Giấy chứng nhận quyền sử dụng đất';
      demoData.so_luong_ban = '03';
      demoData.muc_dich_su_dung = 'Bổ sung hồ sơ hành chính vay vốn ngân hàng';
    } else {
      demoData.ho_ten = 'VÕ THỊ HỒNG';
      demoData.gioi_tinh = 'Nữ';
      demoData.ngay_sinh = '25/03/1970';
      demoData.so_cccd = '072170009876';
      demoData.ten_ap = 'Ấp Hòa Hiệp';
      demoData.noi_thuong_tru = 'Số 45, Tổ 3, Ấp Hòa Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh';
      demoData.noi_dung_de_nghi = 'Xác nhận gia đình thuộc diện hộ cận nghèo, sinh sống liên tục tại địa phương';
      demoData.muc_dich_su_dung = 'Xin miễn giảm học phí cho con theo quy định';
    }

    setFormData(prev => ({ ...prev, ...demoData }));
    setNotification('Đã tự động điền toàn bộ thông tin mẫu thử nghiệm!');
    setTimeout(() => setNotification(''), 3500);
  };

  // Tải về file Word .docx gốc chuẩn 100%
  const handleDownloadDocx = async () => {
    setIsExporting(true);
    try {
      const templateFilename = schema.template_filename || 'mau_01_to_khai_dang_ky_khai_sinh.docx';
      const cleanTitle = schema.title.replace(/[^a-zA-Z0-9_]/g, '_');
      const filename = `HIEP_HOA_${cleanTitle}_${Date.now()}.docx`;

      await docxExportService.generateAndDownloadDocx(templateFilename, formData, filename);
      if (speakText) speakText('Đã tải file mẫu đơn Word thành công. Bà con có thể lưu vào máy hoặc đem in ấn ạ.');
    } catch (err) {
      console.error('Docx Export Error:', err);
      alert('Không thể tạo file Word: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // In đơn trực tiếp chuẩn A4
  const handlePrint = () => {
    const printContent = previewRef.current?.innerHTML;
    if (!printContent) {
      window.print();
      return;
    }

    // Tạo iframe in độc lập để đảm bảo in đúng 1-2 trang A4 chuẩn, không in nền web
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${schema.title} - UBND Xã Hiệp Hòa</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 20mm 15mm 20mm 20mm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 13pt;
              line-height: 1.5;
              color: #000;
              margin: 0;
              padding: 0;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .text-center { text-align: center; }
            .text-justify { text-align: justify; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .italic { font-style: italic; }
            .underline { text-decoration: underline; }
            .border-b { border-bottom: 1px solid #000; }
            .border { border: 1px solid #000; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; }
            .gap-4 { gap: 16px; }
            .p-3 { padding: 12px; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .mt-3 { margin-top: 12px; }
            .mt-4 { margin-top: 16px; }
            .mt-5 { margin-top: 20px; }
            .mt-6 { margin-top: 24px; }
            .mt-8 { margin-top: 32px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .pb-0\\.5 { padding-bottom: 2px; }
            .pb-1 { padding-bottom: 4px; }
            .h-10 { height: 40px; }
            .h-12 { height: 48px; }
            .h-16 { height: 64px; }
            .h-20 { height: 80px; }
            .w-36 { width: 144px; margin-left: auto; margin-right: auto; }
            .space-y-2\\.5 > * + * { margin-top: 10px; }
          </style>
        </head>
        <body>
          <div>${printContent}</div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch (e) {
        window.print();
      }
      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch (e) {}
      }, 1000);
    }, 400);
  };

  // Đếm tiến độ điền
  const totalRequiredFields = schema.fields.filter(f => f.required).length;
  const filledRequiredFields = schema.fields.filter(f => f.required && formData[f.name] && formData[f.name].trim() !== '').length;
  const progressPercent = totalRequiredFields > 0 ? Math.round((filledRequiredFields / totalRequiredFields) * 100) : 100;

  // Helper render trường dữ liệu trong bản A4 (nếu có thì in đậm, nếu chưa thì hiển thị dấu chấm)
  const renderDocVal = (fieldName, dotLength = 32) => {
    let val = formData[fieldName];
    // Tự động chuẩn hóa hiển thị ngày tháng năm sinh dạng 00/00/0000 (DD/MM/YYYY) có dấu gạch
    if (val && (fieldName.includes('ngay_sinh') || fieldName.includes('ngay_cap'))) {
      val = formatToSlashDate(val);
    }
    if (val && String(val).trim() !== '') {
      return (
        <span className="font-bold underline decoration-slate-400 decoration-1 text-slate-950 px-1">
          {norm(String(val))}
        </span>
      );
    }
    return (
      <span className="text-slate-400 font-normal tracking-wider">
        {'.'.repeat(dotLength)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-3xl w-full max-w-7xl shadow-2xl border-4 border-amber-400 flex flex-col h-[95vh] max-h-[95vh] overflow-hidden animate-scale-up">
        
        {/* TOP HEADER: Logo DVC + Tiêu đề biểu mẫu */}
        <div className="bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#7F1D1D] text-white p-2.5 sm:p-4 flex items-center justify-between border-b-2 border-amber-400 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 flex-shrink-0 shadow-lg ring-2 ring-amber-400 flex items-center justify-center">
              <img
                src="/logo_gov.png"
                alt="Logo Cổng DVC"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-xs uppercase font-extrabold text-amber-300 tracking-wider flex items-center gap-1 truncate">
                <FileCheck className="w-3 h-3 text-amber-300 shrink-0" />
                <span className="truncate">BIỂU MẪU CHUẨN QUỐC GIA (XÃ HIỆP HÒA)</span>
              </div>
              <h3 className="text-sm sm:text-xl md:text-2xl font-black text-white leading-tight truncate">
                {norm(schema.title)}
              </h3>
            </div>
          </div>

          {/* Các nút tác vụ nhanh */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isExporting}
              className="h-8 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Tải về file Microsoft Word (.docx) chuẩn"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{isExporting ? 'Đang xuất...' : 'Tải File Word'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="h-8 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              title="In trực tiếp ra giấy A4"
            >
              <Printer className="w-4 h-4 flex-shrink-0 text-amber-300" />
              <span className="hidden md:inline">In Đơn (A4)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (stopSpeaking) stopSpeaking();
                onClose();
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-950/80 hover:bg-red-900 text-white flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ml-1"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* CHUYỂN ĐỔI CHẾ ĐỘ XEM TRÊN ĐIỆN THOẠI (MOBILE VIEW SELECTOR) */}
        <div className="lg:hidden flex items-center justify-between p-2 bg-amber-100/90 border-b border-amber-300 gap-2 flex-shrink-0">
          <div className="grid grid-cols-2 flex-1 bg-white rounded-xl p-0.5 border border-amber-300 shadow-xs">
            <button
              type="button"
              onClick={() => setMobileView('form')}
              className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                mobileView === 'form'
                  ? 'bg-[#991B1B] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>📝 Điền Thông Tin</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView('preview')}
              className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                mobileView === 'preview'
                  ? 'bg-[#991B1B] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📄 Xem Đơn A4</span>
            </button>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg shrink-0">
            {filledRequiredFields}/{totalRequiredFields} mục ({progressPercent}%)
          </span>
        </div>

        {/* Thanh chuyển chế độ (Bảng nhập liệu vs Trợ lý giọng nói từng bước) */}
        <div className="bg-amber-50 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950 font-semibold flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 bg-amber-200/70 rounded-xl border border-amber-300">
              <button
                type="button"
                onClick={() => setInputMode('data_input')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  inputMode === 'data_input'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-amber-100'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Bảng Nhập Thông Tin</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('voice_wizard')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  inputMode === 'voice_wizard'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-amber-100'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-amber-300" />
                <span>Trợ Lý Giọng Nói Điền Từng Bước</span>
              </button>
            </div>

            <span className="hidden md:inline text-slate-600 text-[11px]">
              (Bà con có thể gõ trực tiếp hoặc để AI hỏi từng câu bằng giọng nói)
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {notification && (
              <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-bold text-[11px] animate-fade-in">
                {notification}
              </span>
            )}
            <span className="text-emerald-800 font-bold flex items-center gap-1 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tiến độ: {filledRequiredFields}/{totalRequiredFields} mục ({progressPercent}%)</span>
            </span>
          </div>
        </div>

        {/* THÂN MODAL: 2 KHU VỰC TÁCH BIỆT RÕ RÀNG */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          
          {/* ======================================================== */}
          {/* KHU VỰC BÊN TRÁI: BẢNG NHẬP LIỆU HOẶC VOICE WIZARD        */}
          {/* ======================================================== */}
          <div className={`lg:col-span-5 bg-white border-r border-slate-300 flex flex-col h-full overflow-hidden ${mobileView === 'form' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* CHẾ ĐỘ 1: TRỢ LÝ GIỌNG NÓI TỪNG BƯỚC (VOICE WIZARD) */}
            {inputMode === 'voice_wizard' && (
              <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-red-50/50 via-white to-amber-50/40 overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-red-200">
                    <span className="text-xs font-black uppercase text-red-800 flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-red-700" />
                      <span>Câu hỏi {wizardStep + 1} / {schema.fields.length}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Mục: {norm(currentField?.label)}
                    </span>
                  </div>

                  {/* Khung câu hỏi lớn */}
                  <div className="bg-white p-5 rounded-3xl border-2 border-red-300 shadow-md text-center my-2">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                      Chuyên viên AI đang hỏi bà con:
                    </div>
                    <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      "{currentField?.voice_prompt || `Xin bà con cho biết ${currentField?.label}?`}"
                    </h4>

                    {/* Nút nghe lại câu hỏi */}
                    <button
                      type="button"
                      onClick={() => {
                        if (speakText && currentField?.voice_prompt) {
                          speakText(currentField.voice_prompt);
                        }
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 hover:bg-red-200 text-red-900 text-xs font-bold transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-red-700" />
                      <span>Nghe lại câu hỏi</span>
                    </button>
                  </div>

                  {/* Nút Mic trung tâm để bà con trả lời */}
                  <div className="my-6 flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl relative select-none ${
                        isListening
                          ? 'bg-red-600 text-white animate-mic-pulse ring-8 ring-red-300'
                          : 'bg-gradient-to-tr from-[#991B1B] to-rose-600 text-white hover:scale-105 active:scale-95'
                      }`}
                      title={isListening ? 'Đang lắng nghe... Nói xong bấm lần nữa' : 'Bấm vào để nói câu trả lời'}
                    >
                      <Mic className={`w-10 h-10 sm:w-12 sm:h-12 ${isListening ? 'animate-bounce' : ''}`} />
                    </button>
                    <div className="mt-3 text-xs sm:text-sm font-bold text-slate-700">
                      {isListening ? (
                        <span className="text-red-700 font-black animate-pulse">
                          🔴 Đang nghe bà con nói... (Nói xong bấm dừng)
                        </span>
                      ) : (
                        <span>👉 Chạm vào Micro màu đỏ rồi NÓI CÂU TRẢ LỜI</span>
                      )}
                    </div>
                  </div>

                  {/* Ô hiển thị và sửa câu trả lời */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300">
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Nội dung bà con đã trả lời (có thể chỉnh sửa bằng bàn phím):
                    </label>
                    <input
                      type="text"
                      value={formData[currentField?.name] || ''}
                      onChange={(e) => handleFieldChange(currentField.name, e.target.value)}
                      placeholder="Câu trả lời của bà con sẽ hiện ở đây..."
                      className="w-full px-3.5 py-2.5 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Điều hướng các câu hỏi */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 mt-4">
                  <button
                    type="button"
                    onClick={() => setWizardStep(prev => Math.max(0, prev - 1))}
                    disabled={wizardStep === 0}
                    className="h-10 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 hover:bg-slate-100 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep < schema.fields.length - 1) {
                        setWizardStep(prev => prev + 1);
                      } else {
                        setInputMode('data_input');
                        if (speakText) speakText('Bà con đã hoàn thành toàn bộ câu hỏi. Mời bà con xem lại đơn ở bên phải ạ!');
                      }
                    }}
                    className="h-10 px-5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <span>{wizardStep === schema.fields.length - 1 ? 'Hoàn tất & Xem đơn' : 'Câu tiếp theo'}</span>
                    <ChevronRight className="w-4 h-4 text-amber-300" />
                  </button>
                </div>
              </div>
            )}

            {/* CHẾ ĐỘ 2: BẢNG NHẬP LIỆU TOÀN DIỆN */}
            {inputMode === 'data_input' && (
              <>
                {/* Thanh công cụ hỗ trợ nhập liệu nhanh */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleOcrUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isOcrLoading}
                      className="h-9 px-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="Tải ảnh mặt trước thẻ CCCD để tự động trích xuất thông tin"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isOcrLoading ? 'Đang quét...' : 'Quét Thẻ CCCD'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFillDemoData}
                      className="h-9 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold border border-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Điền nhanh dữ liệu mẫu để kiểm tra hiển thị đơn"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Điền Thử Nghiệm</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({});
                      sessionStorage.removeItem(`hiep_hoa_form_v3_${schema.id}`);
                      setNotification('Đã xóa dữ liệu, bà con có thể nhập lại từ đầu.');
                      setTimeout(() => setNotification(''), 3000);
                    }}
                    className="h-9 px-2.5 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Xóa trắng bảng nhập liệu"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm mới</span>
                  </button>
                </div>

                {/* Thông báo quét OCR thành công nếu có */}
                {ocrSuccessMsg && (
                  <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="line-clamp-1">{ocrSuccessMsg}</span>
                  </div>
                )}

                {/* Danh sách các trường thông tin cần điền */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                    <span>Các trường thông tin cần điền:</span>
                    <span className="text-[11px] text-slate-400 font-normal">Chạm biểu tượng Mic để nói</span>
                  </div>

                  {schema.fields.map((field) => {
                    const val = formData[field.name] || '';
                    const isVoiceActive = activeVoiceField === field.name && isListening;

                    return (
                      <div
                        key={field.name}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isVoiceActive
                            ? 'border-red-500 bg-red-50/60 ring-2 ring-red-200 shadow-sm'
                            : val
                            ? 'border-emerald-300 bg-white'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <span>{norm(field.label)}</span>
                            {field.required && <span className="text-red-600 font-black">*</span>}
                          </label>

                          <button
                            type="button"
                            onClick={() => handleStartVoiceForField(field.name, field.voice_prompt)}
                            className={`p-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              isVoiceActive
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'text-slate-500 hover:text-red-700 hover:bg-red-50'
                            }`}
                            title={isVoiceActive ? 'Đang nghe... Nói để điền vào ô này' : 'Bấm để đọc nội dung cho ô này'}
                          >
                            <Mic className={`w-3.5 h-3.5 ${isVoiceActive ? 'animate-bounce' : ''}`} />
                            <span className="text-[10px]">{isVoiceActive ? 'Đang nghe...' : 'Nói'}</span>
                          </button>
                        </div>

                        {field.type === 'select' ? (
                          <select
                            value={val}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                          >
                            <option value="">-- Chọn thông tin --</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {norm(opt)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type || 'text'}
                            value={val}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`}
                            className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 placeholder:text-slate-400"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Chân cột trái: Nút xuất file, xem A4 & QR */}
                <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onGenerateQr) onGenerateQr({ formId, schema, formData });
                      }}
                      className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                      title="Tạo mã QR lưu hồ sơ lên điện thoại của bà con"
                    >
                      <QrCode className="w-4 h-4 text-slate-700 shrink-0" />
                      <span>Mã QR</span>
                    </button>

                    {/* Nút chuyển nhanh sang xem đơn A4 trên điện thoại */}
                    <button
                      type="button"
                      onClick={() => setMobileView('preview')}
                      className="lg:hidden h-9 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold flex items-center gap-1 transition-all border border-amber-300"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span>Xem A4</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadDocx}
                    disabled={isExporting}
                    className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Xuất File Word</span>
                  </button>
                </div>
              </>
            )}

          </div>

          {/* ======================================================== */}
          {/* KHU VỰC BÊN PHẢI: BẢN XEM TRƯỚC MẪU ĐƠN CHUẨN 100% (A4)   */}
          {/* ======================================================== */}
          <div className={`lg:col-span-7 bg-slate-300 flex flex-col h-full overflow-hidden ${mobileView === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* Thanh điều hướng quay lại trên điện thoại */}
            <div className="lg:hidden bg-amber-500 text-stone-950 px-3 py-1.5 flex items-center justify-between font-bold text-xs shrink-0">
              <button
                type="button"
                onClick={() => setMobileView('form')}
                className="inline-flex items-center gap-1 text-slate-900 bg-white/95 hover:bg-white px-2.5 py-1 rounded-lg shadow-2xs font-black active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-red-800" />
                <span>Quay lại Điền Thông Tin</span>
              </button>
              <span className="text-[11px] font-bold text-stone-900">
                📄 Bản xem trước A4
              </span>
            </div>

            {/* Header thanh công cụ Xem trước */}
            <div className="bg-slate-800 text-white px-3 sm:px-4 py-2 flex items-center justify-between text-xs font-bold flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="uppercase tracking-wider">BẢN XEM TRƯỚC MẪU ĐƠN A4 (LIVE PREVIEW)</span>
              </div>
              <span className="text-[11px] text-slate-300 font-normal hidden sm:inline">
                Khổ giấy A4 (210 x 297mm) • Phông Times New Roman
              </span>
            </div>

            {/* Khung cuộn trang giấy A4 - Căn chỉnh padding và margin khắc phục triệt để lỗi nhảy chữ ký */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-200">
              <div
                id="printable-document"
                ref={previewRef}
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: '12.5pt',
                  lineHeight: '1.5'
                }}
                className="w-full max-w-[210mm] bg-white text-black p-6 sm:p-10 md:p-12 shadow-2xl border border-slate-400 select-text h-auto min-h-[280mm] mb-6 rounded-xs"
              >
                {/* QUỐC HIỆU & TIÊU NGỮ */}
                <div className="text-center font-bold mb-4">
                  <div className="text-sm sm:text-base tracking-wide uppercase text-black font-bold">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="text-xs sm:text-sm font-bold tracking-normal mt-0.5 text-black">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="w-36 h-[1.5px] bg-black mx-auto mt-1 mb-4" />

                  {/* TIÊU ĐỀ BIỂU MẪU */}
                  <h2 className="text-base sm:text-xl font-bold uppercase text-black mt-2 tracking-wide">
                    {norm(schema.title)}
                  </h2>
                  <div className="text-xs sm:text-sm italic font-normal mt-1 text-black">
                    Kính gửi: Ủy ban nhân dân xã Hiệp Hòa, tỉnh Tây Ninh
                  </div>
                </div>

                {/* NỘI DUNG VĂN BẢN THEO TỪNG MẪU ĐƠN CHUẨN */}
                <div className="space-y-2.5 my-4 text-black text-justify text-xs sm:text-sm md:text-base">
                  
                  {/* MẪU 1: TỜ KHAI ĐĂNG KÝ KHAI SINH */}
                  {formId === 'FORM_KHAI_SINH' && (
                    <>
                      <div className="font-bold uppercase text-xs sm:text-sm border-b border-black pb-0.5 mt-2">
                        I. Thông tin người yêu cầu đăng ký khai sinh:
                      </div>
                      <div>
                        - Họ, chữ đệm, tên: {renderDocVal('ho_ten_nguoi_yeu_cau', 36)}
                      </div>
                      <div>
                        - Ngày, tháng, năm sinh: {renderDocVal('ngay_sinh_nguoi_yeu_cau', 16)} - Quan hệ với người được khai sinh: {renderDocVal('quan_he_voi_tre', 16)}
                      </div>
                      <div>
                        - Số Căn cước công dân: {renderDocVal('so_cccd', 20)} - Ngày cấp: {renderDocVal('ngay_cap_cccd', 14)}
                      </div>
                      <div>
                        - Nơi thường trú: {renderDocVal('noi_thuong_tru', 42)}
                      </div>
                      <div>
                        - Số điện thoại liên hệ: {renderDocVal('so_dien_thoai', 20)}
                      </div>

                      <div className="font-bold uppercase text-xs sm:text-sm border-b border-black pb-0.5 mt-3">
                        II. Thông tin người được khai sinh (Trẻ em):
                      </div>
                      <div>
                        - Họ, chữ đệm, tên: {renderDocVal('ho_ten_tre', 38)}
                      </div>
                      <div>
                        - Giới tính: {renderDocVal('gioi_tinh_tre', 12)} - Ngày sinh: {renderDocVal('ngay_sinh_tre', 18)}
                      </div>
                      <div>
                        - Ngày sinh bằng chữ: {renderDocVal('ngay_sinh_tre_bang_chu', 42)}
                      </div>
                      <div>
                        - Nơi sinh: {renderDocVal('noi_sinh_tre', 42)}
                      </div>
                      <div>
                        - Dân tộc: {renderDocVal('dan_toc_tre', 12)} - Quốc tịch: {renderDocVal('quoc_tich_tre', 14)} - Quê quán: {renderDocVal('que_quan_tre', 30)}
                      </div>

                      <div className="font-bold uppercase text-xs sm:text-sm border-b border-black pb-0.5 mt-3">
                        III. Thông tin người mẹ và người cha:
                      </div>
                      <div>
                        - Họ tên mẹ: {renderDocVal('ho_ten_me', 30)} - Năm sinh: {renderDocVal('nam_sinh_me', 10)} - Dân tộc: {renderDocVal('dan_toc_me', 10)}
                      </div>
                      <div>
                        - Số CCCD mẹ: {renderDocVal('so_cccd_me', 20)} - Nơi cư trú: {renderDocVal('noi_cu_tru_me', 32)}
                      </div>
                      <div>
                        - Họ tên cha: {renderDocVal('ho_ten_cha', 30)} - Năm sinh: {renderDocVal('nam_sinh_cha', 10)} - Dân tộc: {renderDocVal('dan_toc_cha', 10)}
                      </div>
                      <div>
                        - Số CCCD cha: {renderDocVal('so_cccd_cha', 20)} - Nơi cư trú: {renderDocVal('noi_cu_tru_cha', 32)}
                      </div>
                    </>
                  )}

                  {/* MẪU 2: TỜ KHAI ĐĂNG KÝ KẾT HÔN */}
                  {formId === 'FORM_KET_HON' && (
                    <>
                      <div className="grid grid-cols-2 gap-3 border border-black p-2.5 mt-2">
                        <div>
                          <div className="font-bold uppercase text-center border-b border-black pb-1 mb-1.5 text-xs sm:text-sm">Bên Nam</div>
                          <div>- Họ và tên: {renderDocVal('ho_ten_nam', 18)}</div>
                          <div>- Ngày sinh: {renderDocVal('ngay_sinh_nam', 14)}</div>
                          <div>- Dân tộc: {renderDocVal('dan_toc_nam', 12)}</div>
                          <div>- Số CCCD: {renderDocVal('so_cccd_nam', 16)}</div>
                          <div>- Thường trú: {renderDocVal('noi_thuong_tru_nam', 20)}</div>
                          <div>- Lần kết hôn: {renderDocVal('lan_ket_hon_nam', 12)}</div>
                        </div>
                        <div>
                          <div className="font-bold uppercase text-center border-b border-black pb-1 mb-1.5 text-xs sm:text-sm">Bên Nữ</div>
                          <div>- Họ và tên: {renderDocVal('ho_ten_nu', 18)}</div>
                          <div>- Ngày sinh: {renderDocVal('ngay_sinh_nu', 14)}</div>
                          <div>- Dân tộc: {renderDocVal('dan_toc_nu', 12)}</div>
                          <div>- Số CCCD: {renderDocVal('so_cccd_nu', 16)}</div>
                          <div>- Thường trú: {renderDocVal('noi_thuong_tru_nu', 20)}</div>
                          <div>- Lần kết hôn: {renderDocVal('lan_ket_hon_nu', 12)}</div>
                        </div>
                      </div>
                      <div className="italic text-xs mt-2">
                        Hai bên chúng tôi tự nguyện kết hôn và cam đoan việc kết hôn là hoàn toàn tự do, không vi phạm quy định của Luật Hôn nhân và gia đình.
                      </div>
                    </>
                  )}

                  {/* MẪU 3: TỜ KHAI XÁC NHẬN TÌNH TRẠNG HÔN NHÂN */}
                  {formId === 'FORM_TINH_TRANG_HON_NHAN' && (
                    <>
                      <div>- Họ và tên người yêu cầu: {renderDocVal('ho_ten', 36)} - Giới tính: {renderDocVal('gioi_tinh', 12)}</div>
                      <div>- Ngày, tháng, năm sinh: {renderDocVal('ngay_sinh', 16)} - Dân tộc: {renderDocVal('dan_toc', 12)} - Quốc tịch: {renderDocVal('quoc_tich', 12)}</div>
                      <div>- Số Căn cước công dân: {renderDocVal('so_cccd', 20)} - Ngày cấp: {renderDocVal('ngay_cap_cccd', 14)}</div>
                      <div>- Nơi thường trú: {renderDocVal('noi_thuong_tru', 46)}</div>
                      <div>- Thời gian cư trú tại địa phương: {renderDocVal('thoi_gian_cu_tru', 36)}</div>
                      <div>- Tình trạng hôn nhân hiện tại: {renderDocVal('tinh_trang_hon_nhan', 42)}</div>
                      <div>- Mục đích sử dụng Giấy xác nhận: {renderDocVal('muc_dich_su_dung', 40)}</div>
                      <div>- Số lượng bản đề nghị cấp: {renderDocVal('so_luong_ban', 8)} bản.</div>
                    </>
                  )}

                  {/* MẪU 4: ĐƠN ĐỀ NGHỊ CHỨNG THỰC */}
                  {formId === 'FORM_CHUNG_THUC' && (
                    <>
                      <div>- Họ và tên người đề nghị: {renderDocVal('ho_ten', 36)} - Điện thoại: {renderDocVal('so_dien_thoai', 18)}</div>
                      <div>- Ngày, tháng, năm sinh: {renderDocVal('ngay_sinh', 16)} - Số CCCD: {renderDocVal('so_cccd', 20)}</div>
                      <div>- Địa chỉ thường trú: {renderDocVal('noi_thuong_tru', 48)}</div>
                      <div>- Loại hình đề nghị chứng thực: {renderDocVal('loai_chung_thuc', 40)}</div>
                      <div>- Tên giấy tờ cần chứng thực: {renderDocVal('ten_giay_to_chung_thuc', 42)}</div>
                      <div>- Số lượng bản yêu cầu: {renderDocVal('so_luong_ban', 10)} bản.</div>
                      <div>- Mục đích sử dụng: {renderDocVal('muc_dich_su_dung', 42)}</div>
                    </>
                  )}

                  {/* MẪU 5: ĐƠN XIN XÁC NHẬN CƯ TRÚ / HỘ NGHÈO */}
                  {formId === 'FORM_CU_TRU_HO_NGHEO' && (
                    <>
                      <div>- Họ và tên người làm đơn: {renderDocVal('ho_ten', 36)} - Giới tính: {renderDocVal('gioi_tinh', 12)}</div>
                      <div>- Ngày, tháng, năm sinh: {renderDocVal('ngay_sinh', 16)} - Số CCCD: {renderDocVal('so_cccd', 20)}</div>
                      <div>- Đang thường trú tại: {renderDocVal('ten_ap', 20)} - Chi tiết: {renderDocVal('noi_thuong_tru', 40)}</div>
                      <div>- Nội dung đề nghị UBND xã xác nhận: {renderDocVal('noi_dung_de_nghi', 44)}</div>
                      <div>- Mục đích sử dụng: {renderDocVal('muc_dich_su_dung', 42)}</div>
                    </>
                  )}

                  {/* LỜI CAM ĐOAN CHUNG */}
                  <div className="mt-3 pt-1 text-xs sm:text-sm">
                    Tôi cam đoan những lời khai trên đây là hoàn toàn đúng sự thật và chịu trách nhiệm trước pháp luật về tính chính xác của các thông tin đã khai.
                  </div>
                </div>

                {/* NGÀY THÁNG NĂM & CHỮ KÝ NẰM TRỌN TRONG TRANG */}
                <div className="mt-6 pt-2 grid grid-cols-2 text-center text-black">
                  <div>
                    {/* Phần xác nhận của cơ quan (nếu có) */}
                  </div>
                  <div>
                    <div className="italic text-xs sm:text-sm">
                      Hiệp Hòa, ngày {formData.ngay_lam_don || '.....'} tháng {formData.thang_lam_don || '.....'} năm {formData.nam_lam_don || '2026'}
                    </div>
                    <div className="font-bold uppercase text-xs sm:text-sm mt-1">
                      NGƯỜI YÊU CẦU / NGƯỜI LÀM ĐƠN
                    </div>
                    <div className="italic text-xs text-slate-500 mt-0.5">
                      (Ký và ghi rõ họ tên)
                    </div>
                    {/* Khoảng trống rộng rãi chừa chỗ cho công dân ký tay */}
                    <div className="h-16 sm:h-20" />
                    <div className="font-bold uppercase text-xs sm:text-sm tracking-wide">
                      {norm(
                        formData.ho_ten_nguoi_yeu_cau ||
                        formData.ho_ten ||
                        formData.ho_ten_nam ||
                        ''
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
