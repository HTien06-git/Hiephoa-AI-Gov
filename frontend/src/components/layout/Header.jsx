import React from 'react';
import { ShieldCheck, UserCheck, Users, Sparkles, Landmark } from 'lucide-react';
import TrongDongWatermark from '../common/TrongDongWatermark';

export default function Header({ currentMode, setCurrentMode }) {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#7F1D1D] text-white shadow-md">
      {/* Nền hoa văn Trống Đồng chìm tinh tế */}
      <div className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none overflow-hidden opacity-10">
        <TrongDongWatermark size={300} color="#F59E0B" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[60px] sm:h-[68px] flex items-center justify-between gap-3 relative z-10">
        
        {/* Brand Left: Huy hiệu Trống Đồng + Tên nền tảng */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white p-1 shrink-0 shadow-md ring-2 ring-amber-400 flex items-center justify-center">
            <img
              src="/logo_gov.png"
              alt="Logo Cổng DVC"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-xl font-black tracking-tight text-white uppercase whitespace-nowrap">
                HIỆP HÒA <span className="text-amber-300">AI-GOV</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-2.5 h-2.5" />
                V5.0 PILOT
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-amber-100/90 truncate font-medium">
              UBND xã Hiệp Hòa • Tây Ninh
            </p>
          </div>
        </div>

        {/* Brand Right: Switch Nhân Dân | Một Cửa */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zero-Data Badge (Desktop only) */}
          <div className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bảo mật Zero-Data</span>
          </div>

          {/* Cụm chuyển đổi nhanh Nhân Dân | Một Cửa */}
          <div className="inline-flex p-1 rounded-xl bg-red-950/70 border border-red-500/40 shadow-inner">
            <button
              type="button"
              onClick={() => setCurrentMode('citizen')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                currentMode === 'citizen'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 shadow-sm font-black'
                  : 'text-red-100 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Nhân Dân</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentMode('officer')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                currentMode === 'officer'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 shadow-sm font-black'
                  : 'text-red-100 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Một Cửa</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
