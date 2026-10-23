import React, { useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  FileCheck,
  Building,
  Clock,
  CircleDollarSign,
  BookOpen,
  Sparkles,
  X,
  FileText,
  Camera,
  ExternalLink,
  ShieldAlert,
  Scale,
  Award,
  Headphones,
  Mic,
  ChevronRight
} from 'lucide-react';
import ContextualChatBox from './ContextualChatBox';
import proceduresData from '../../data/procedures_demo.json';

export default function RagChatDrawer({
  chatResult,
  onClose,
  speakText,
  stopSpeaking,
  isSpeaking,
  onOpenAutoForm,
  onOpenPreCheck
}) {
  if (!chatResult) return null;

  const {
    answer,
    voice_text,
    checklist,
    matchedProcedure,
    legal_basis,
    intentType = 'PROCEDURE_GUIDE',
    sources = []
  } = chatResult;

  // Tự động nhận diện thủ tục liên quan để luôn có nút Điền Đơn và Giọng Nói Từng Bước
  const findMatchingProcedure = () => {
    if (matchedProcedure) return matchedProcedure;
    const textToMatch = `${answer || ''} ${voice_text || ''}`.toLowerCase();
    if (textToMatch.includes('khai sinh')) return proceduresData.procedures.find(p => p.id === 'TT_KHAI_SINH');
    if (textToMatch.includes('kết hôn')) return proceduresData.procedures.find(p => p.id === 'TT_KET_HON');
    if (textToMatch.includes('hôn nhân') || textToMatch.includes('độc thân')) return proceduresData.procedures.find(p => p.id === 'TT_TINH_TRANG_HON_NHAN');
    if (textToMatch.includes('chứng thực') || textToMatch.includes('sao y')) return proceduresData.procedures.find(p => p.id === 'TT_CHUNG_THUC_SAO_Y');
    if (textToMatch.includes('cư trú') || textToMatch.includes('hộ nghèo')) return proceduresData.procedures.find(p => p.id === 'TT_XAC_NHAN_CU_TRU');
    return null;
  };

  const activeProc = findMatchingProcedure();

  // Tổng hợp toàn bộ văn bản để tự động đọc liền mạch cho bà con
  const buildFullSpeechText = () => {
    let fullText = voice_text || '';

    // Nếu có Checklist 4 mục, đọc nối tiếp các bước chuẩn bị
    if (checklist) {
      let checklistText = '';
      if (checklist.original_docs_to_compare && checklist.original_docs_to_compare.length > 0) {
        checklistText += ` Về giấy tờ bản chính cần mang theo đối chiếu gồm có: ${checklist.original_docs_to_compare.join(', ')}.`;
      }
      if (checklist.submit_docs && checklist.submit_docs.length > 0) {
        checklistText += ` Về hồ sơ nộp lưu tại xã gồm có: ${checklist.submit_docs.join(', ')}.`;
      }
      if (checklist.agency_deadline_fee) {
        checklistText += ` Thời hạn giải quyết: ${checklist.agency_deadline_fee.deadline || 'trong ngày'}. Mức lệ phí: ${checklist.agency_deadline_fee.fee || 'miễn phí'}.`;
      }
      fullText += checklistText;
    }

    return fullText;
  };

  // Tự động phát âm thanh khi mở kết quả tư vấn
  useEffect(() => {
    const fullSpeech = buildFullSpeechText();
    if (fullSpeech && speakText) {
      const timer = setTimeout(() => {
        speakText(fullSpeech);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [chatResult]);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      if (stopSpeaking) stopSpeaking();
    } else {
      const fullSpeech = buildFullSpeechText();
      if (speakText && fullSpeech) speakText(fullSpeech);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left border-l-4 border-amber-400">
        
        {/* Header Drawer */}
        <div className="bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#6B1115] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-amber-400">
              <img
                src="/logo_gov.png"
                alt="Logo Cổng DVC"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-[11px] uppercase font-extrabold text-amber-300 tracking-wider">
                Trung tâm Phục vụ Hành chính công Xã Hiệp Hòa
              </div>
              <h3 className="text-base sm:text-xl font-black leading-snug">
                {checklist?.procedure_name || matchedProcedure?.title || (intentType === 'LEGAL_CONSULTATION' ? 'Tư Vấn & Giải Đáp Pháp Luật Đời Sống' : 'Chuyên Viên AI Trả Lời Bà Con')}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (stopSpeaking) stopSpeaking();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-red-950/70 hover:bg-red-950 text-white flex items-center justify-center transition-all flex-shrink-0"
            title="Đóng bảng hướng dẫn"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50">
          
          {/* Quick Voice Bar with Speaking Wave Indicator */}
          {voice_text && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  isSpeaking ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200' : 'bg-[#991B1B] text-amber-300'
                }`}>
                  <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <div className="text-[11px] uppercase font-black text-[#991B1B] flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Giọng Chuyên viên AI đọc to cho bà con nghe:</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 line-clamp-2">
                    {voice_text}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleSpeak}
                className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm flex items-center gap-2 flex-shrink-0 active:scale-95 transition-all whitespace-nowrap ${
                  isSpeaking
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-[#991B1B] text-white hover:bg-red-800'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Đang đọc... (Bấm dừng)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    <span>Đọc lại toàn bộ hướng dẫn</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* KHỐI HÀNH ĐỘNG NỔI BẬT: ĐIỀN ĐƠN WORD & HƯỚNG DẪN GIỌNG NÓI TỪNG BƯỚC */}
          {activeProc && (
            <div className="bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-amber-700 p-4 sm:p-5 rounded-3xl shadow-lg border-2 border-amber-300 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="text-xs uppercase font-extrabold text-amber-300 tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>BIỂU MẪU ĐIỀN ĐƠN TỰ ĐỘNG & XUẤT FILE WORD</span>
                </div>
                <h4 className="text-base sm:text-lg font-black mt-1 text-white">
                  {activeProc.title}
                </h4>
                <p className="text-xs text-amber-100/90 mt-0.5">
                  Bà con có thể tự gõ hoặc để Chuyên viên AI đọc từng câu hỏi để trả lời bằng giọng nói!
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-center sm:justify-end">
                {/* Nút 1: Điền đơn trực tuyến */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAutoForm(activeProc, 'data_input');
                  }}
                  className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap"
                  title="Mở biểu mẫu để tự gõ hoặc quét thẻ CCCD"
                >
                  <FileText className="w-4 h-4 text-red-950" />
                  <span>Điền Đơn Trong Word</span>
                </button>

                {/* Nút 2: Hướng dẫn điền form bằng giọng nói từng bước */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAutoForm(activeProc, 'voice_wizard');
                  }}
                  className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap ring-2 ring-emerald-300"
                  title="AI sẽ hỏi từng câu để bà con chỉ cần nói câu trả lời"
                >
                  <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Điền Bằng Giọng Nói (Từng Bước)</span>
                </button>
              </div>
            </div>
          )}

          {/* CHECKLIST 4 MỤC CHUẨN (CHỈ HIỂN THỊ KHI ĐÚNG LÀ THỦ TỤC HÀNH CHÍNH) */}
          {checklist && (
            <div className="bg-white rounded-3xl p-5 md:p-6 border-2 border-red-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b pb-3 border-red-100">
                <FileCheck className="w-6 h-6 text-[#991B1B] flex-shrink-0" />
                <h4 className="text-lg md:text-xl font-black text-slate-900">
                  BỘ CHECKLIST HỒ SƠ 4 MỤC CHUẨN (UBND XÃ HIỆP HÒA)
                </h4>
              </div>

              <div className="space-y-4">
                {/* Mục 1: Tên thủ tục */}
                <div className="bg-red-50/70 p-3.5 rounded-2xl border border-red-200">
                  <span className="text-[11px] uppercase font-black text-[#991B1B] block mb-1">
                    (1) Tên thủ tục hành chính:
                  </span>
                  <div className="text-base sm:text-lg font-bold text-slate-900">
                    {checklist.procedure_name}
                  </div>
                </div>

                {/* Mục 2: Bản chính mang theo đối chiếu */}
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200">
                  <span className="text-xs uppercase font-black text-amber-950 block mb-2 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                    (2) Bản chính mang theo để cán bộ Một cửa đối chiếu:
                  </span>
                  <ul className="space-y-2">
                    {checklist.original_docs_to_compare?.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm sm:text-base font-semibold text-slate-800">
                        <span className="text-amber-700 font-bold mt-0.5">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mục 3: Bản sao / Bản chính nộp lưu */}
                <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200">
                  <span className="text-xs uppercase font-black text-blue-950 block mb-2 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    (3) Bản sao / Bản chính nộp lưu tại xã:
                  </span>
                  <ul className="space-y-2">
                    {checklist.submit_docs?.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm sm:text-base font-semibold text-slate-800">
                        <span className="text-blue-700 font-bold mt-0.5">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mục 4: Cơ quan, Thời hạn & Lệ phí */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase mb-1">
                      <Building className="w-4 h-4 text-slate-700 flex-shrink-0" />
                      <span>Cơ quan giải quyết</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {checklist.agency_deadline_fee?.agency || 'UBND xã Hiệp Hòa'}
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase mb-1">
                      <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span>Thời hạn giải quyết</span>
                    </div>
                    <div className="text-sm font-bold text-emerald-900">
                      {checklist.agency_deadline_fee?.deadline || 'Trong ngày làm việc'}
                    </div>
                  </div>

                  <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase mb-1">
                      <CircleDollarSign className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span>Mức thu lệ phí</span>
                    </div>
                    <div className="text-sm font-bold text-amber-900">
                      {checklist.agency_deadline_fee?.fee || 'Miễn phí'}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* CĂN CỨ PHÁP LÝ & NGUỒN TRÍCH DẪN THƯ VIỆN PHÁP LUẬT */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#991B1B] font-bold text-sm uppercase">
              <Scale className="w-4 h-4" />
              <span>Căn cứ pháp lý theo quy định hiện hành:</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 italic">
              {legal_basis || 'Luật Hộ tịch, Luật Đất đai 2024, Nghị định 123/2015, Nghị định 144/2021 và các văn bản hướng dẫn.'}
            </div>

            {sources && sources.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500">Nguồn trích dẫn:</span>
                {sources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                  >
                    <span>{s.title}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* KHUNG TRÒ CHUYỆN LIÊN TỤC VÀ ĐẶT CÂU HỎI TRỰC TIẾP (MULTI-TURN CHAT) */}
          <ContextualChatBox
            procedure={activeProc}
            initialAnswer={answer}
            initialVoiceText={voice_text}
            initialSources={sources}
            speakText={speakText}
            stopSpeaking={stopSpeaking}
            onOpenAutoForm={(proc, mode) => {
              onClose();
              onOpenAutoForm(proc, mode);
            }}
          />

        </div>

        {/* Action Bottom Bar */}
        {activeProc && (
          <div className="bg-white p-3.5 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              {activeProc.form_template_id && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAutoForm(activeProc, 'data_input');
                    }}
                    className="h-11 px-4 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all whitespace-nowrap ring-2 ring-amber-300/60"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span>Điền Đơn Trong Word</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAutoForm(activeProc, 'voice_wizard');
                    }}
                    className="h-11 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all whitespace-nowrap"
                  >
                    <Mic className="w-4 h-4 text-amber-300 flex-shrink-0 animate-pulse" />
                    <span>Điền Bằng Giọng Nói</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPreCheck(activeProc);
                }}
                className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-300 transition-all whitespace-nowrap"
              >
                <Camera className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <span>Kiểm Tra Giấy Tờ</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
