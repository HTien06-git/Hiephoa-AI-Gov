import React, { useEffect, useState } from 'react';
import { Volume2, Sparkles, X, Headphones, Bot, Landmark, CheckCircle } from 'lucide-react';

export default function AutoVoiceOnboarding({ speak, stop, isAudioEnabled }) {
  const [isOpen, setIsOpen] = useState(true);

  const greetingText = "Kính chào bà con nhân dân xã Hiệp Hòa! Tôi là Chuyên viên Hành chính công AI. Bà con cần làm giấy tờ khai sinh, kết hôn, đất đai, chứng thực hay hỏi luật, chỉ cần bấm vào nút Micro màu đỏ ở giữa màn hình rồi nói, hoặc chạm vào các ô chữ lớn bên dưới. Chạm vào mục nào tôi sẽ đọc to hướng dẫn mục đó cho bà con nghe!";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAudioEnabled && isOpen) {
        speak(greetingText);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-md relative my-5 overflow-hidden">
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

        <div>
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
              onClick={() => speak(greetingText)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white text-sm sm:text-base font-bold shadow-md transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Nghe lại lời chào</span>
            </button>
            <span className="text-xs text-slate-500 italic flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5 text-slate-400" />
              (Chạm vào bất kỳ mục nào trên màn hình, hệ thống sẽ tự động đọc to cho bà con nghe)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
