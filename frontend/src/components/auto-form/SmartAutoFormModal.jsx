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

  // Lắng nghe sự kiện làm sạch dữ liệu khi công dân bấm "Đã nhận thông tin & Thoát"
  useEffect(() => {
    const handleClearSession = () => {
      setFormData({});
      sessionStorage.removeItem(`hiep_hoa_form_v3_${schema.id}`);
    };
    window.addEventListener('hh_clear_citizen_session', handleClearSession);
    return () => window.removeEventListener('hh_clear_citizen_session', handleClearSession);
  }, [schema.id]);

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
      setNotification('Không thể đọc rõ thông tin thẻ CCCD từ hình ảnh này. Bà con vui lòng chụp lại rõ nét hơn hoặc điền trực tiếp vào biểu mẫu.');
      if (speakText) speakText('Không thể đọc rõ thông tin từ hình ảnh. Bà con vui lòng chụp lại ảnh rõ hơn hoặc điền thông tin vào các ô bên dưới nhé.');
    } finally {
      setIsOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

  // Helper render trường dữ liệu trong bản A4 (chuẩn văn bản hành chính, không bị nhảy dòng hay tách chữ)
  const renderDocVal = (fieldName, dotLength = 32) => {
    let val = formData[fieldName];
    // Tự động chuẩn hóa hiển thị ngày tháng năm sinh dạng 00/00/0000 (DD/MM/YYYY) có dấu gạch
    if (val && (fieldName.includes('ngay_sinh') || fieldName.includes('ngay_cap') || fieldName.includes('date'))) {
      val = formatToSlashDate(val);
    }
    if (val && String(val).trim() !== '') {
      return (
        <span className="font-bold underline decoration-slate-400 decoration-1 text-slate-950 px-1 inline-block align-baseline whitespace-pre-wrap">
          {norm(String(val))}
        </span>
      );
    }
    const minW = Math.max(dotLength * 5.5, 75);
    return (
      <span
        style={{ minWidth: `${minW}px` }}
        className="inline-block border-b border-dotted border-slate-400 mx-1 align-baseline text-transparent select-none h-[1.1em]"
      >
        .
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
              <div className="text-[9px] sm:text-xs uppercase font-extrabold text-amber-300 tracking-wider flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-amber-300 shrink-0" />
                <span>BIỂU MẪU CHUẨN QUỐC GIA (XÃ HIỆP HÒA)</span>
              </div>
              <h3 className="text-xs sm:text-lg md:text-xl font-black text-white leading-tight line-clamp-2">
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

        {/* ======================================================== */}
        {/* CHUYỂN ĐỔI CHẾ ĐỘ TRÊN ĐIỆN THOẠI (1 DÒNG DUY NHẤT 3 TAB)  */}
        {/* ======================================================== */}
        <div className="lg:hidden p-2 bg-amber-50 border-b border-amber-300 flex-shrink-0">
          <div className="grid grid-cols-3 bg-amber-200/60 p-1 rounded-2xl border border-amber-300 shadow-xs gap-1">
            <button
              type="button"
              onClick={() => {
                setMobileView('form');
                setInputMode('data_input');
              }}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                mobileView === 'form' && inputMode === 'data_input'
                  ? 'bg-[#991B1B] text-white shadow-sm'
                  : 'text-amber-950 hover:bg-white/60'
              }`}
            >
              <Edit3 className="w-3 h-3 shrink-0" />
              <span className="truncate">Tự Điền Đơn</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileView('form');
                setInputMode('voice_wizard');
              }}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                mobileView === 'form' && inputMode === 'voice_wizard'
                  ? 'bg-[#991B1B] text-white shadow-sm'
                  : 'text-amber-950 hover:bg-white/60'
              }`}
            >
              <Mic className="w-3 h-3 text-amber-300 shrink-0" />
              <span className="truncate">AI Hỏi Từng Bước</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileView('preview')}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                mobileView === 'preview'
                  ? 'bg-[#991B1B] text-white shadow-sm'
                  : 'text-amber-950 hover:bg-white/60'
              }`}
            >
              <FileText className="w-3 h-3 shrink-0" />
              <span className="truncate">Xem A4 ({progressPercent}%)</span>
            </button>
          </div>
        </div>

        {/* THANH CHUYỂN CHẾ ĐỘ TRÊN DESKTOP (MÀN HÌNH LỚN) */}
        <div className="hidden lg:flex bg-amber-50 px-4 py-2 border-b border-amber-200 items-center justify-between text-xs text-amber-950 font-semibold flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 bg-amber-200/70 rounded-xl border border-amber-300">
              <button
                type="button"
                onClick={() => setInputMode('data_input')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  inputMode === 'voice_wizard'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-amber-100'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-amber-300" />
                <span>Trợ Lý Giọng Nói Điền Từng Bước</span>
              </button>
            </div>

            <span className="text-slate-600 text-[11px]">
              (Bà con có thể gõ trực tiếp hoặc để AI hỏi từng câu bằng giọng nói)
            </span>
          </div>

          <div className="flex items-center gap-2">
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
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>Các trường thông tin cần điền:</span>
                    <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium inline-block w-fit">💡 Chạm Mic bên cạnh để đọc thay vì gõ phím</span>
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

                {/* Chân cột trái: Nút xuất file, xem A4 & Nộp QR */}
                <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (onGenerateQr) {
                          onGenerateQr({
                            formId,
                            formTitle: schema.title || procedure?.title || 'Thủ tục hành chính',
                            procedureId: procedure?.id || formId,
                            schema,
                            formData
                          });
                        }
                      }}
                      className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-red-700 to-[#991B1B] hover:from-red-800 hover:to-red-900 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all ring-2 ring-amber-300"
                      title="Tạo mã QR lưu hồ sơ lên điện thoại của bà con và gửi tới Cán bộ"
                    >
                      <QrCode className="w-4 h-4 text-amber-300 shrink-0" />
                      <span className="whitespace-nowrap">Tạo Mã QR & Nộp Hồ Sơ</span>
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
                    className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-stone-950 shrink-0" />
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
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Họ, chữ đệm, tên:</span>
                        {renderDocVal('ho_ten_nguoi_yeu_cau', 36)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Ngày, tháng, năm sinh:</span>
                          {renderDocVal('ngay_sinh_nguoi_yeu_cau', 16)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Quan hệ với người được khai sinh:</span>
                          {renderDocVal('quan_he_voi_tre', 16)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Số Căn cước công dân:</span>
                          {renderDocVal('so_cccd', 20)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Ngày cấp:</span>
                          {renderDocVal('ngay_cap_cccd', 14)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Nơi thường trú:</span>
                        {renderDocVal('noi_thuong_tru', 42)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Số điện thoại liên hệ:</span>
                        {renderDocVal('so_dien_thoai', 20)}
                      </div>

                      <div className="font-bold uppercase text-xs sm:text-sm border-b border-black pb-0.5 mt-3">
                        II. Thông tin người được khai sinh (Trẻ em):
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Họ, chữ đệm, tên:</span>
                        {renderDocVal('ho_ten_tre', 38)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Giới tính:</span>
                          {renderDocVal('gioi_tinh_tre', 12)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Ngày sinh:</span>
                          {renderDocVal('ngay_sinh_tre', 18)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Ngày sinh bằng chữ:</span>
                        {renderDocVal('ngay_sinh_tre_bang_chu', 42)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Nơi sinh:</span>
                        {renderDocVal('noi_sinh_tre', 42)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Dân tộc:</span>
                          {renderDocVal('dan_toc_tre', 12)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Quốc tịch:</span>
                          {renderDocVal('quoc_tich_tre', 14)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Quê quán:</span>
                          {renderDocVal('que_quan_tre', 30)}
                        </span>
                      </div>

                      <div className="font-bold uppercase text-xs sm:text-sm border-b border-black pb-0.5 mt-3">
                        III. Thông tin người mẹ và người cha:
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Họ tên mẹ:</span>
                          {renderDocVal('ho_ten_me', 30)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Năm sinh:</span>
                          {renderDocVal('nam_sinh_me', 10)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Dân tộc:</span>
                          {renderDocVal('dan_toc_me', 10)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Số CCCD mẹ:</span>
                          {renderDocVal('so_cccd_me', 20)}
                        </span>
                        <span className="inline-flex items-baseline gap-1">
                          <span className="whitespace-nowrap">- Nơi cư trú:</span>
                          {renderDocVal('noi_cu_tru_me', 32)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Họ tên cha:</span>
                          {renderDocVal('ho_ten_cha', 30)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Năm sinh:</span>
                          {renderDocVal('nam_sinh_cha', 10)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Dân tộc:</span>
                          {renderDocVal('dan_toc_cha', 10)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span>- Số CCCD cha:</span>
                          {renderDocVal('so_cccd_cha', 20)}
                        </span>
                        <span className="inline-flex items-baseline gap-1">
                          <span className="whitespace-nowrap">- Nơi cư trú:</span>
                          {renderDocVal('noi_cu_tru_cha', 32)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* MẪU 2: TỜ KHAI ĐĂNG KÝ KẾT HÔN */}
                  {formId === 'FORM_KET_HON' && (
                    <>
                      <div className="grid grid-cols-2 gap-4 border border-black p-3 mt-2 rounded-xs">
                        <div className="space-y-1">
                          <div className="font-bold uppercase text-center border-b border-black pb-1 mb-2 text-xs sm:text-sm">Bên Nam</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Họ và tên:</span>{renderDocVal('ho_ten_nam', 18)}</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Ngày sinh:</span>{renderDocVal('ngay_sinh_nam', 14)}</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Dân tộc:</span>{renderDocVal('dan_toc_nam', 12)}</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Số CCCD:</span>{renderDocVal('so_cccd_nam', 16)}</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Thường trú:</span>{renderDocVal('noi_thuong_tru_nam', 20)}</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Lần kết hôn:</span>{renderDocVal('lan_ket_hon_nam', 12)}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold uppercase text-center border-b border-black pb-1 mb-2 text-xs sm:text-sm">Bên Nữ</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Họ và tên:</span>{renderDocVal('ho_ten_nu', 18)}</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Ngày sinh:</span>{renderDocVal('ngay_sinh_nu', 14)}</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Dân tộc:</span>{renderDocVal('dan_toc_nu', 12)}</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Số CCCD:</span>{renderDocVal('so_cccd_nu', 16)}</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Thường trú:</span>{renderDocVal('noi_thuong_tru_nu', 20)}</div>
                          <div className="flex items-baseline gap-1"><span className="whitespace-nowrap font-medium">- Lần kết hôn:</span>{renderDocVal('lan_ket_hon_nu', 12)}</div>
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
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Họ và tên người yêu cầu:</span>
                          {renderDocVal('ho_ten', 32)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Giới tính:</span>
                          {renderDocVal('gioi_tinh', 12)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Ngày, tháng, năm sinh:</span>
                          {renderDocVal('ngay_sinh', 16)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Dân tộc:</span>
                          {renderDocVal('dan_toc', 12)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Quốc tịch:</span>
                          {renderDocVal('quoc_tich', 12)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Số Căn cước công dân:</span>
                          {renderDocVal('so_cccd', 20)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Ngày cấp:</span>
                          {renderDocVal('ngay_cap_cccd', 14)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Nơi thường trú:</span>
                        {renderDocVal('noi_thuong_tru', 46)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Thời gian cư trú tại địa phương:</span>
                        {renderDocVal('thoi_gian_cu_tru', 36)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Tình trạng hôn nhân hiện tại:</span>
                        {renderDocVal('tinh_trang_hon_nhan', 42)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Mục đích sử dụng Giấy xác nhận:</span>
                        {renderDocVal('muc_dich_su_dung', 40)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-1 py-0.5">
                        <span className="font-medium">- Số lượng bản đề nghị cấp:</span>
                        {renderDocVal('so_luong_ban', 8)}
                        <span>bản.</span>
                      </div>
                    </>
                  )}

                  {/* MẪU 4: ĐƠN ĐỀ NGHỊ CHỨNG THỰC */}
                  {formId === 'FORM_CHUNG_THUC' && (
                    <>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Họ và tên người đề nghị:</span>
                          {renderDocVal('ho_ten', 32)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Điện thoại:</span>
                          {renderDocVal('so_dien_thoai', 18)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Ngày, tháng, năm sinh:</span>
                          {renderDocVal('ngay_sinh', 16)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Số CCCD:</span>
                          {renderDocVal('so_cccd', 20)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Địa chỉ thường trú:</span>
                        {renderDocVal('noi_thuong_tru', 48)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Loại hình đề nghị chứng thực:</span>
                        {renderDocVal('loai_chung_thuc', 40)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Tên giấy tờ cần chứng thực:</span>
                        {renderDocVal('ten_giay_to_chung_thuc', 42)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-1 py-0.5">
                        <span className="font-medium">- Số lượng bản yêu cầu:</span>
                        {renderDocVal('so_luong_ban', 10)}
                        <span>bản.</span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Mục đích sử dụng:</span>
                        {renderDocVal('muc_dich_su_dung', 42)}
                      </div>
                    </>
                  )}

                  {/* MẪU 5: ĐƠN XIN XÁC NHẬN CƯ TRÚ / HỘ NGHÈO */}
                  {formId === 'FORM_CU_TRU_HO_NGHEO' && (
                    <>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Họ và tên người làm đơn:</span>
                          {renderDocVal('ho_ten', 32)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Giới tính:</span>
                          {renderDocVal('gioi_tinh', 12)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Ngày, tháng, năm sinh:</span>
                          {renderDocVal('ngay_sinh', 16)}
                        </span>
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Số CCCD:</span>
                          {renderDocVal('so_cccd', 20)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-0.5">
                        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                          <span className="font-medium">- Đang thường trú tại:</span>
                          {renderDocVal('ten_ap', 20)}
                        </span>
                        <span className="inline-flex items-baseline gap-1">
                          <span className="whitespace-nowrap font-medium">- Chi tiết:</span>
                          {renderDocVal('noi_thuong_tru', 40)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Nội dung đề nghị UBND xã xác nhận:</span>
                        {renderDocVal('noi_dung_de_nghi', 44)}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                        <span className="shrink-0 font-medium">- Mục đích sử dụng:</span>
                        {renderDocVal('muc_dich_su_dung', 42)}
                      </div>
                    </>
                  )}

                  {/* LỜI CAM ĐOAN CHUNG */}
                  <div className="mt-3 pt-1 text-xs sm:text-sm">
                    Tôi cam đoan những lời khai trên đây là hoàn toàn đúng sự thật và chịu trách nhiệm trước pháp luật về tính chính xác của các thông tin đã khai.
                  </div>
                </div>

                {/* NGÀY THÁNG NĂM & CHỮ KÝ NẰM TRỌN TRONG TRANG (HẠNG MỤC 4) */}
                <div
                  className="mt-8 pt-3 grid grid-cols-2 text-center text-black"
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <div className="text-center px-2">
                    <div className="font-bold uppercase text-xs sm:text-sm">
                      XÁC NHẬN CỦA UBND XÃ HIỆP HÒA
                    </div>
                    <div className="italic text-xs text-slate-600 mt-0.5">
                      (Ký, đóng dấu tròn và ghi rõ họ tên)
                    </div>
                    {/* Khoảng trống ký tên & đóng dấu tối thiểu 3.8cm (115px) */}
                    <div className="min-h-[115px] sm:min-h-[125px] h-[3.8cm]" />
                    <div className="font-bold uppercase text-xs sm:text-sm tracking-wide text-slate-500">
                      ỦY BAN NHÂN DÂN XÃ HIỆP HÒA
                    </div>
                  </div>

                  <div className="text-center px-2">
                    <div className="italic text-xs sm:text-sm">
                      Hiệp Hòa, ngày {formData.ngay_lam_don || '.....'} tháng {formData.thang_lam_don || '.....'} năm {formData.nam_lam_don || '2026'}
                    </div>
                    <div className="font-bold uppercase text-xs sm:text-sm mt-1">
                      NGƯỜI LÀM ĐƠN / NGƯỜI YÊU CẦU
                    </div>
                    <div className="italic text-xs text-slate-600 mt-0.5">
                      (Ký và ghi rõ họ, chữ đệm, tên)
                    </div>
                    {/* Khoảng trống rộng rãi cho công dân ký tay tối thiểu 3.8cm (115px) */}
                    <div className="min-h-[115px] sm:min-h-[125px] h-[3.8cm]" />
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
