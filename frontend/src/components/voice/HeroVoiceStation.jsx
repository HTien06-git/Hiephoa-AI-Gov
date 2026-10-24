import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, Volume2, VolumeX, MessageSquare, Check, CheckCircle2 } from 'lucide-react';
import { useSpeechRecognition, deduplicateSpeechText } from '../../hooks/useSpeechRecognition';
import TrongDongOrnament from '../common/TrongDongOrnament';

export default function HeroVoiceStation({
  onQuerySubmit,
  isSpeaking,
  stopSpeaking,
  speak,
  isAudioEnabled
}) {
  const [textInput, setTextInput] = useState('');
  const lastSubmittedQueryRef = useRef('');
  const hasSpokenGreetingRef = useRef(false);

  const greetingText = "Kính chào bà con nhân dân xã Hiệp Hòa! Tôi là Chuyên viên Hành chính công AI. Bà con cần làm giấy tờ khai sinh, kết hôn, đất đai, chứng thực hay hỏi luật đời sống, hãy chạm vào Micro màu đỏ rồi nói, tôi sẽ hướng dẫn chi tiết từng bước cho bà con nghe!";

  // Tự động phát âm thanh chào mừng khi người dân tương tác hoặc truy cập
  useEffect(() => {
    if (!isAudioEnabled || !speak) return;

    const timer = setTimeout(() => {
      if (!hasSpokenGreetingRef.current) {
        speak(
          greetingText,
          () => {
            hasSpokenGreetingRef.current = true;
          },
          () => {}
        );
      }
    }, 400);

    const handleFirstInteraction = () => {
      if (!hasSpokenGreetingRef.current) {
        hasSpokenGreetingRef.current = true;
        speak(greetingText);
      }
    };

    window.addEventListener('click', handleFirstInteraction, { capture: true, once: true, passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true, passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
      window.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
    };
  }, [isAudioEnabled, speak]);

  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    toggleListening
  } = useSpeechRecognition({
    onResult: (finalText) => {
      const cleaned = finalText ? deduplicateSpeechText(finalText.trim()) : '';
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

  const handleToggleGreeting = () => {
    if (isSpeaking) {
      if (stopSpeaking) stopSpeaking();
    } else if (speak) {
      hasSpokenGreetingRef.current = true;
      speak(greetingText);
    }
  };

  const quickQuestions = [
    'Làm khai sinh cho con cần giấy tờ gì?',
    'Đăng ký kết hôn tại UBND xã Hiệp Hòa',
    'Thủ tục cha mẹ tặng cho đất cho con',
    'Xin giấy xác nhận tình trạng độc thân'
  ];

  return (
    <section id="voice-hero-section" className="max-w-6xl mx-auto mt-6 rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-white to-[#FEF9E7] border border-amber-300/80 shadow-md p-5 sm:p-8 relative overflow-hidden">
      
      {/* Họa tiết Trống Đồng mờ ở góc nền */}
      <div className="absolute -top-20 -right-20 w-80 h-80 pointer-events-none opacity-[0.06]">
        <TrongDongOrnament size={320} color="#D97706" />
      </div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 pointer-events-none opacity-[0.05]">
        <TrongDongOrnament size={320} color="#991B1B" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        
        {/* ======================================================== */}
        {/* CỘT TRÁI (60% TRÊN DESKTOP) - THÔNG TIN, LỜI CHÀO & CÂU HỎI */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 text-left space-y-3.5">
          
          {/* Huy hiệu nhỏ */}
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-red-100 text-[#991B1B] text-[9.5px] xs:text-[10.5px] sm:text-xs font-black uppercase shadow-2xs whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">TRỢ LÝ HÀNH CHÍNH CÔNG & PHÁP LUẬT XÃ HIỆP HÒA</span>
          </div>

          {/* Tiêu đề */}
          <h2 className="text-lg sm:text-2xl lg:text-[26px] font-black text-slate-900 tracking-tight leading-snug">
            Bà con cần làm giấy tờ hoặc hỏi&nbsp;luật, hãy chạm vào Micro để nói&nbsp;chuyện!
          </h2>

          {/* Hộp lời chào ngắn gọn kèm nút Nghe lời chào */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <p className="line-clamp-2">
              "{greetingText}"
            </p>
            <div className="mt-2 sm:mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleGreeting}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                  isSpeaking
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-[#991B1B] hover:bg-red-800 text-white'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-200" />
                    <span>Dừng đọc lời chào</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Nghe lời chào hướng dẫn</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                (Chạm vào mục nào, AI sẽ đọc to mục đó cho bà con)
              </span>
            </div>
          </div>

          {/* 4 Nút câu hỏi gợi ý phổ biến */}
          <div className="pt-1">
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1 mb-2">
              <MessageSquare className="w-3 h-3 text-amber-700" />
              <span>Gợi ý câu hỏi phổ biến của bà con:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    lastSubmittedQueryRef.current = q;
                    onQuerySubmit(q);
                  }}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-amber-50/80 text-slate-700 hover:text-[#991B1B] text-xs font-semibold border border-slate-200/90 hover:border-amber-300 transition-all text-left shadow-2xs active:scale-95 truncate flex items-center gap-1.5"
                >
                  <span className="text-amber-600 font-bold shrink-0">💬</span>
                  <span className="truncate">{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dải 3 cam kết ngắn gọn trên 1 dòng */}
          <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2 sm:gap-4 flex-wrap text-[11px] sm:text-xs text-slate-600 font-semibold">
            <span className="text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Tra cứu 5 giây
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-red-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-red-700 shrink-0" />
              Tự động điền đơn Word chuẩn
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              Trích dẫn Thư Viện Pháp Luật
            </span>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CỘT PHẢI (40% TRÊN DESKTOP) - NÚT MICRO & VÒNG TRỐNG ĐỒNG */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
          
          {/* Tâm điểm Nút Micro: Vòng Trống Đồng Vàng Kim 2 lớp */}
          <div className="relative flex items-center justify-center w-44 h-44 sm:w-48 sm:h-48 my-1">
            
            {/* Lớp hoa văn chim Lạc bên ngoài xoay nhẹ nhàng và phát sáng ánh vàng ấm */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700 ${
              isListening
                ? 'opacity-95 scale-105 drop-shadow-[0_0_18px_rgba(217,119,6,0.5)]'
                : 'opacity-40 hover:opacity-60 drop-shadow-[0_0_12px_rgba(217,119,6,0.25)]'
            }`}>
              <TrongDongOrnament
                size={185}
                color={isListening ? "#DC2626" : "#D97706"}
                spin={true}
                spinDuration={isListening ? 30 : 90}
              />
            </div>

            {/* Lớp trong đứng yên sắc nét */}
            <div className="absolute inset-2 flex items-center justify-center pointer-events-none opacity-50">
              <TrongDongOrnament
                size={145}
                color="#B45309"
                spin={false}
              />
            </div>

            {/* Nút Micro chính Đỏ Son Chính Phủ */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative select-none z-10 active:scale-95 ${
                isListening
                  ? 'bg-red-600 text-white animate-mic-pulse ring-8 ring-red-300'
                  : 'bg-gradient-to-tr from-[#991B1B] via-red-600 to-rose-600 text-white hover:scale-105 hover:shadow-red-500/40 ring-4 ring-amber-300/90'
              }`}
              title={isListening ? 'Đang lắng nghe... Chạm để gửi' : 'Chạm vào Micro để bắt đầu nói'}
            >
              <Mic className={`w-10 h-10 sm:w-11 sm:h-11 ${isListening ? 'animate-bounce' : ''}`} />
            </button>
          </div>

          {/* Dòng nhắc Micro */}
          <div className="mt-1 mb-3">
            {isListening ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#991B1B] font-black text-xs sm:text-sm animate-pulse border border-red-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                <span>Đang lắng nghe... (Nói xong tự động trả lời)</span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-slate-800 inline-flex items-center gap-1">
                👉 Chạm vào Micro màu đỏ để <strong>BẮT ĐẦU NÓI</strong>
              </span>
            )}
          </div>

          {/* Hiển thị câu nói của bà con theo thời gian thực */}
          {(transcript || interimTranscript) && (
            <div className="mb-3 px-3.5 py-2 bg-amber-50 rounded-xl border border-amber-300 text-slate-900 text-xs sm:text-sm font-bold w-full max-w-sm shadow-2xs animate-fade-in text-left">
              <span className="text-amber-800 text-[10px] uppercase block font-black">Lời nói của bà con:</span>
              "{deduplicateSpeechText(transcript || interimTranscript)}"
            </div>
          )}

          {error && (
            <p className="mb-3 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          {/* Thanh nhập câu hỏi trực tiếp kèm nút Gửi 100% không tràn viền */}
          <form onSubmit={handleManualSubmit} className="w-full max-w-sm">
            <div className="flex items-center w-full rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm focus-within:border-red-700 focus-within:ring-2 focus-within:ring-red-700/20">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Hoặc bà con gõ câu hỏi vào đây..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#991B1B] hover:bg-red-800 px-3.5 sm:px-4 py-2 sm:py-2 text-xs font-bold text-white flex items-center gap-1 shadow-xs transition-all active:scale-95"
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
