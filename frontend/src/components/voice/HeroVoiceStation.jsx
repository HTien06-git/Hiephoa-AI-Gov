import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, Volume2, VolumeX, MessageSquare, Check, CheckCircle2 } from 'lucide-react';
import { useSpeechRecognition, deduplicateSpeechText } from '../../hooks/useSpeechRecognition';
import TrongDongOrnament from '../common/TrongDongOrnament';
import TrongDongMasterpiece from '../common/TrongDongMasterpiece';

export default function HeroVoiceStation({
  onQuerySubmit,
  isSpeaking,
  stopSpeaking,
  speak,
  isAudioEnabled,
  isQueryLoading = false
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
    e?.preventDefault?.();
    const speechText = (transcript || interimTranscript) ? deduplicateSpeechText(transcript || interimTranscript).trim() : '';
    const query = textInput.trim() || speechText;
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
            <span className="truncate">TRỢ LÝ PHÁP LUẬT & HÀNH CHÍNH CÔNG AI</span>
          </div>

          {/* Tiêu đề */}
          <h2 className="text-base sm:text-2xl lg:text-[26px] font-black text-slate-900 tracking-tight leading-snug">
            Bà con cần làm giấy tờ hoặc hỏi luật, hãy chạm vào Micro để nói chuyện!
          </h2>

          {/* Hộp lời chào ngắn gọn kèm nút Nghe lời chào */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <p className="line-clamp-3">
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
          
          {/* Tâm điểm Nút Micro: Đĩa Trống Đồng Đông Sơn Hoàng Kim 240px (Hạng mục 6.2 Vị trí 3) */}
          <div className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64 my-1">
            
            {/* Vòng hào quang vàng kim (golden pulse ring) khi đang nghe hoặc AI đang phát giọng nói */}
            {(isListening || isSpeaking) && (
              <div className="absolute inset-2 rounded-full border-2 border-amber-400/80 animate-ping pointer-events-none opacity-75" />
            )}

            {/* Đĩa Trống Đồng Đông Sơn 240px sắc nét với opacity: 0.75 */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700 ${
              isListening || isSpeaking
                ? 'opacity-95 scale-105 drop-shadow-[0_0_24px_rgba(245,158,11,0.65)]'
                : 'opacity-75 drop-shadow-[0_0_12px_rgba(217,119,6,0.35)]'
            }`}>
              <TrongDongMasterpiece
                size={240}
                color={isListening ? "#DC2626" : "#D97706"}
                accentColor="#B45309"
                opacity={1}
                spin={true}
                spinDuration={isListening ? 25 : 60}
                glow={isListening || isSpeaking}
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
            <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-300 text-slate-900 text-xs sm:text-sm font-bold w-full max-w-sm shadow-md animate-fade-in text-left">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-amber-800 text-[10.5px] uppercase font-black tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
                  Lời nói của bà con:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const text = deduplicateSpeechText(transcript || interimTranscript).trim();
                    if (text) {
                      lastSubmittedQueryRef.current = text;
                      onQuerySubmit(text);
                    }
                  }}
                  disabled={isQueryLoading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#991B1B] hover:bg-red-800 disabled:bg-slate-400 text-white text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span>🚀 Tra cứu ngay</span>
                </button>
              </div>
              <p className="text-slate-900 font-bold italic line-clamp-3 bg-white/80 p-2 rounded-lg border border-amber-200">
                "{deduplicateSpeechText(transcript || interimTranscript)}"
              </p>
            </div>
          )}

          {/* Huy hiệu hiển thị khi AI đang tra cứu */}
          {isQueryLoading && (
            <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs animate-pulse border border-amber-300 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping shrink-0" />
              <span>Chuyên viên AI đang tra cứu câu trả lời...</span>
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
                disabled={isQueryLoading}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={isQueryLoading}
                className="shrink-0 rounded-lg bg-[#991B1B] hover:bg-red-800 disabled:bg-slate-400 px-3.5 sm:px-4 py-2 sm:py-2 text-xs font-bold text-white flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>{isQueryLoading ? 'Đang gửi...' : 'Gửi'}</span>
                <Send className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </form>

        </div>

      </div>
    </section>
  );
}
