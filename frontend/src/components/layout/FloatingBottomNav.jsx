import React from 'react';
import { Home, Mic, Search, UserCheck } from 'lucide-react';

export default function FloatingBottomNav({
  onScrollToTop,
  onActivateMic,
  onOpenLookup,
  onSwitchToOfficer
}) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around shadow-lg">
      {/* 1. Trang chủ */}
      <button
        type="button"
        onClick={onScrollToTop}
        className="flex flex-col items-center justify-center py-1 px-2 text-slate-600 hover:text-[#991B1B] active:scale-95 transition-all"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">Trang chủ</span>
      </button>

      {/* 2. Hỏi AI (Mic) - Nút trung tâm nổi bật */}
      <button
        type="button"
        onClick={onActivateMic}
        className="flex flex-col items-center justify-center -mt-4"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#991B1B] to-rose-600 text-white flex items-center justify-center shadow-lg ring-4 ring-white active:scale-90 transition-transform">
          <Mic className="w-6 h-6 animate-pulse" />
        </div>
        <span className="text-[10px] font-black text-[#991B1B] mt-0.5">Hỏi AI (Mic)</span>
      </button>

      {/* 3. Tra cứu Mã Hồ sơ */}
      <button
        type="button"
        onClick={onOpenLookup}
        className="flex flex-col items-center justify-center py-1 px-2 text-slate-600 hover:text-[#991B1B] active:scale-95 transition-all"
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">Tra cứu Hồ sơ</span>
      </button>

      {/* 4. Cán bộ Một cửa */}
      <button
        type="button"
        onClick={onSwitchToOfficer}
        className="flex flex-col items-center justify-center py-1 px-2 text-slate-600 hover:text-[#991B1B] active:scale-95 transition-all"
      >
        <UserCheck className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">Cán bộ Một cửa</span>
      </button>
    </div>
  );
}
