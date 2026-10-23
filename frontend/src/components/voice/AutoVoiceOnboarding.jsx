import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, X, Headphones, Bot } from 'lucide-react';

export default function AutoVoiceOnboarding({ speak, stop, isSpeaking, isAudioEnabled }) {
  const [isOpen, setIsOpen] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const hasSpokenRef = useRef(false);

  const greetingText = "Kính chào bà con nhân dân xã Hiệp Hòa! Tôi là Chuyên viên Hành chính công AI. Bà con cần làm giấy tờ khai sinh, kết hôn, đất đai, chứng thực hay hỏi luật, chỉ cần bấm vào nút Micro màu đỏ ở giữa màn hình rồi nói, hoặc chạm vào các ô chữ lớn bên dưới. Chạm vào mục nào tôi sẽ đọc to hướng dẫn mục đó cho bà con nghe!";

  // TỰ ĐỘNG PHÁT ÂM THANH CHÀO VÀ HƯỚNG DẪN KHI NGƯỜI DÂN TRUY CẬP VÀO TRANG
  useEffect(() => {
    if (!isAudioEnabled) return;

    // 1. Kích hoạt tự đọc ngay sau 300ms khi người dân truy cập vào trang
    const timer = setTimeout(() => {
      if (!hasSpokenRef.current) {
        speak(
          greetingText,
          () => {
            hasSpokenRef.current = true;
            setAutoplayBlocked(false);
          },
          (err) => {
            // Nếu trình duyệt chặn phát âm thanh tự động (Autoplay Policy)
            if (err && err.name === 'NotAllowedError') {
              setAutoplayBlocked(true);
            }
          }
        );
      }
    }, 300);

    // 2. Cơ chế đón đầu toàn cục: Ngay khi người dân chạm vào màn hình (click chuột, chạm cảm ứng, cuộn trang),
    // hệ thống sẽ tự động phát ngay lời chào mà không cần tìm nút bấm!
    const handleFirstInteraction = () => {
      if (!hasSpokenRef.current) {
        hasSpokenRef.current = true;
        setAutoplayBlocked(false);
        speak(greetingText);
      }
    };

    window.addEventListener('click', handleFirstInteraction, { capture: true, once: true, passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true, passive: true });
    window.addEventListener('pointerdown', handleFirstInteraction, { capture: true, once: true, passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { capture: true, once: true, passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
      window.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
      window.removeEventListener('pointerdown', handleFirstInteraction, { capture: true });
      window.removeEventListener('keydown', handleFirstInteraction, { capture: true });
    };
  }, [isAudioEnabled, speak]);

  if (!isOpen) return null;

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stop();
    } else {
      hasSpokenRef.current = true;
      setAutoplayBlocked(false);
      speak(greetingText);
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-md relative my-5 overflow-hidden animate-fade-in">
      <button
        type="button"
        onClick={() => {
          stop();
          setIsOpen(false);
        }}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
        title="Đóng lời chào"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4 pr-8">
        {/* Logo Cổng DVC tròn */}
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 border-2 border-amber-400 text-[#991B1B] flex items-center justify-center flex-shrink-0 shadow-md">
          <img
            src="/logo_gov.png"
            alt="Logo Cổng DVC"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-[#991B1B] border border-red-200 flex items-center gap-1 shadow-2xs">
              <Bot className="w-3.5 h-3.5 text-[#991B1B]" />
              <span>Chuyên viên AI Phục vụ Nhân dân Xã Hiệp Hòa</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Sẵn sàng trợ giúp 24/7
            </span>
          </div>

          <p className="mt-2 text-base sm:text-lg text-slate-800 font-medium leading-relaxed">
            {greetingText}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm sm:text-base font-bold shadow-md transition-all active:scale-95 ${
                isSpeaking
                  ? 'bg-amber-600 hover:bg-amber-700 ring-4 ring-amber-300 animate-pulse'
                  : 'bg-[#991B1B] hover:bg-red-800 ring-2 ring-red-200'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5 text-amber-200 animate-spin" />
                  <span>Đang đọc lời chào... (Bấm để Dừng)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 text-amber-300 animate-bounce" />
                  <span>{autoplayBlocked ? 'Bấm vào đây để BẬT TIẾNG AI Chào Mừng' : 'Nghe lại lời chào của AI'}</span>
                </>
              )}
            </button>

            {autoplayBlocked && !isSpeaking && (
              <span className="text-xs sm:text-sm font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-lg border border-red-300 animate-pulse">
                👉 Chạm vào màn hình để BẬT TIẾNG Chuyên viên AI
              </span>
            )}

            <span className="text-xs text-slate-500 italic flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5 text-slate-400" />
              (Chạm vào bất kỳ mục nào trên màn hình, Chuyên viên AI sẽ tự động đọc to cho bà con nghe)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
