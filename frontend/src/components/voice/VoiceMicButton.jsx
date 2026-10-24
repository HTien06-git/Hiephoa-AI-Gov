import React, { useState, useRef } from 'react';
import { Mic, Send, Sparkles, Volume2, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import TrongDongWatermark from '../common/TrongDongWatermark';

export default function VoiceMicButton({ onQuerySubmit, isSpeaking, stopSpeaking }) {
  const [textInput, setTextInput] = useState('');
  const lastSubmittedQueryRef = useRef('');

  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    toggleListening
  } = useSpeechRecognition({
    onResult: (finalText) => {
      const cleaned = finalText ? finalText.trim() : '';
      if (cleaned.length > 1 && cleaned !== lastSubmittedQueryRef.current) {
        lastSubmittedQueryRef.current = cleaned;
        setTextInput('');
        onQuerySubmit(cleaned);
      }
    }
  });

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const query = textInput.trim();
    if (query) {
      lastSubmittedQueryRef.current = query;
      onQuerySubmit(query);
      setTextInput('');
    }
  };

  const handleMicClick = () => {
    if (isSpeaking && stopSpeaking) stopSpeaking();
    toggleListening();
  };

  const handleQuickQuestion = (q) => {
    lastSubmittedQueryRef.current = q;
    onQuerySubmit(q);
  };

  const quickChips = [
    'Làm khai sinh cho con cần giấy tờ gì?',
    'Đăng ký kết hôn tại xã Hiệp Hòa',
    'Thủ tục tặng cho đất đai',
    'Xác nhận tình trạng hôn nhân (Độc thân)'
  ];

  return (
    <section className="bg-gradient-to-br from-white via-amber-50/40 to-red-50/30 rounded-3xl shadow-sm border border-amber-200/90 p-4 sm:p-6 lg:p-8 my-4 relative overflow-hidden">
      {/* Họa tiết Trống Đồng Đông Sơn chìm tinh tế ở 2 góc */}
      <div className="absolute -top-16 -right-16 w-72 h-72 pointer-events-none opacity-[0.07]">
        <TrongDongWatermark size={290} color="#D97706" />
      </div>
      <div className="absolute -bottom-16 -left-16 w-72 h-72 pointer-events-none opacity-[0.06]">
        <TrongDongWatermark size={290} color="#991B1B" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* CỘT TRÁI (Mobile: Trên) - Thông tin giới thiệu & Câu hỏi gợi ý nhanh */}
        <div className="lg:col-span-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-red-100 text-[#991B1B] text-[9.5px] xs:text-[10.5px] sm:text-xs font-black uppercase mb-2.5 shadow-2xs whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">CHUYÊN VIÊN HÀNH CHÍNH CÔNG AI 24/7</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Trung Tâm Tư Vấn Thủ Tục & Pháp Luật Xã Hiệp Hòa
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            Bà con chạm vào nút Micro màu đỏ để <strong>nói chuyện trực tiếp</strong>, hoặc chọn câu hỏi nhanh bên dưới. AI sẽ tự động đọc to lời hướng dẫn chi tiết từng bước cho bà con!
          </p>

          {/* Quick Chips gợi ý câu hỏi */}
          <div className="mt-4">
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1 mb-2">
              <MessageSquare className="w-3 h-3 text-amber-700" />
              <span>Gợi ý câu hỏi phổ biến của bà con:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickQuestion(chip)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-700 hover:text-[#991B1B] text-xs font-semibold border border-slate-200 hover:border-red-300 transition-all text-left shadow-2xs active:scale-95"
                >
                  💬 {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (Mobile: Dưới) - Trung tâm Chạm & Nói + Khung gõ câu hỏi 100% không tràn viền */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center text-center">
          
          {/* Nút Micro trung tâm cực lớn với Vòng hoa văn Trống Đồng */}
          <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44">
            {/* Vòng Trống Đồng xoay nhẹ */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ${
              isListening ? 'opacity-90 scale-105' : 'opacity-35 hover:opacity-50'
            }`}>
              <TrongDongWatermark
                size={165}
                color={isListening ? "#DC2626" : "#D97706"}
                opacity={isListening ? 0.75 : 0.45}
                spin={true}
              />
            </div>

            {/* Nút Micro chính */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl relative select-none z-10 active:scale-95 ${
                isListening
                  ? 'bg-red-600 text-white animate-mic-pulse ring-8 ring-red-300'
                  : 'bg-gradient-to-tr from-[#991B1B] to-rose-600 text-white hover:scale-105 hover:shadow-red-500/40 ring-4 ring-amber-300/80'
              }`}
              title={isListening ? 'Đang lắng nghe... Chạm lần nữa để gửi' : 'Chạm vào Micro để bắt đầu nói'}
            >
              <Mic className={`w-10 h-10 sm:w-12 sm:h-12 ${isListening ? 'animate-bounce' : ''}`} />
            </button>
          </div>

          {/* Nhãn trạng thái Micro */}
          <div className="mt-2 mb-3">
            {isListening ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#991B1B] font-black text-xs sm:text-sm animate-pulse border border-red-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                <span>Đang lắng nghe... (Nói xong tự động trả lời)</span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-slate-800 inline-flex items-center gap-1">
                👉 Chạm vào Micro màu đỏ để <strong>NÓI CHUYỆN</strong>
              </span>
            )}
          </div>

          {/* Phiên âm trực tiếp nếu có */}
          {(transcript || interimTranscript) && (
            <div className="mb-3 px-3.5 py-2 bg-amber-50 rounded-xl border border-amber-300 text-slate-900 text-xs sm:text-sm font-bold w-full max-w-md shadow-2xs animate-fade-in text-left">
              <span className="text-amber-800 text-[10px] uppercase block font-black">Lời nói của bà con:</span>
              "{transcript || interimTranscript}"
            </div>
          )}

          {error && (
            <p className="mb-3 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          {/* KHUNG NHẬP CÂU HỎI THỐNG NHẤT 100% CHỐNG TRÀN VIỀN THEO CHUẨN MỤC II.2 */}
          <form onSubmit={handleManualSubmit} className="w-full max-w-md">
            <div className="flex items-center w-full rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm focus-within:border-red-700 focus-within:ring-2 focus-within:ring-red-700/20">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Hoặc gõ câu hỏi vào đây..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm sm:text-base outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-red-700 hover:bg-red-800 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white flex items-center gap-1 shadow-sm transition-all active:scale-95"
              >
                <span>Gửi</span>
                <Send className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </form>

        </div>

      </div>
    </section>
  );
}
