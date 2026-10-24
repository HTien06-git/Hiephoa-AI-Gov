import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, X, Bot, ChevronRight } from 'lucide-react';

export default function AutoVoiceOnboarding({ speak, stop, isSpeaking, isAudioEnabled }) {
  const [isOpen, setIsOpen] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const hasSpokenRef = useRef(false);

  const greetingText = "Kính chào bà con nhân dân xã Hiệp Hòa! Tôi là Chuyên viên Hành chính công AI. Bà con cần làm giấy tờ hoặc hỏi luật, hãy chạm vào Micro màu đỏ ở giữa màn hình rồi nói, hoặc bấm vào các nút bên dưới để tôi hướng dẫn!";

  // Tự động phát âm thanh chào đón khi truy cập
  useEffect(() => {
    if (!isAudioEnabled) return;

    const timer = setTimeout(() => {
      if (!hasSpokenRef.current) {
        speak(
          greetingText,
          () => {
            hasSpokenRef.current = true;
            setAutoplayBlocked(false);
          },
          (err) => {
            if (err && err.name === 'NotAllowedError') {
              setAutoplayBlocked(true);
            }
          }
        );
      }
    }, 350);

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
    <div className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl p-3 sm:p-4 shadow-sm relative my-3 overflow-hidden animate-fade-in max-w-full">
      <button
        type="button"
        onClick={() => {
          stop();
          setIsOpen(false);
        }}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/60 transition-colors z-10"
        title="Đóng lời chào"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3 pr-6">
        {/* Avatar Chuyên viên AI giới hạn kích thước tuyệt đối 40-48px */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#991B1B] to-rose-600 text-amber-300 p-1.5 flex items-center justify-center shrink-0 shadow-sm ring-2 ring-amber-300/80">
          <Bot className="w-6 h-6 text-white" />
        </div>

        {/* Nội dung lời chào gọn gàng */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-[#991B1B] border border-red-200 shrink-0">
              Chuyên viên AI 24/7
            </span>
            <span className="text-[11px] sm:text-xs text-emerald-700 font-bold hidden sm:inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              UBND xã Hiệp Hòa
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 font-medium line-clamp-2 mt-0.5 leading-snug">
            {greetingText}
          </p>
        </div>

        {/* Nút Nghe lời chào gọn gàng */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 ${
            isSpeaking
              ? 'bg-amber-600 text-white ring-2 ring-amber-300 animate-pulse'
              : 'bg-[#991B1B] hover:bg-red-800 text-white'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4 text-amber-200" />
              <span className="hidden sm:inline">Dừng</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>{autoplayBlocked ? 'Bật tiếng' : 'Nghe lời chào'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
