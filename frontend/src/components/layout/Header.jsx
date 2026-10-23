import React from 'react';
import { ShieldCheck, UserCheck, Users, Sparkles, Building2, Landmark } from 'lucide-react';
import TrongDongWatermark from '../common/TrongDongWatermark';
import DongSonBorder from '../common/DongSonBorder';

export default function Header({ currentMode, setCurrentMode }) {
  return (
    <header className="relative bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#7F1D1D] text-white shadow-2xl overflow-hidden">
      {/* Vị trí 1: Mặt Trống Đồng Đông Sơn đường kính lớn 500px xoay nhẹ chìm sang trọng ở góc phải */}
      <div className="absolute -right-24 -top-28 w-[500px] h-[500px] pointer-events-none z-0">
        <TrongDongWatermark size={500} opacity={0.14} spin={true} color="#F59E0B" />
      </div>
      {/* Mặt Trống Đồng phụ ở góc trái */}
      <div className="absolute -left-28 -bottom-36 w-[420px] h-[420px] pointer-events-none z-0">
        <TrongDongWatermark size={420} opacity={0.10} color="#FDE68A" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3.5 lg:gap-6">
          
          {/* Cụm Logo Nền Tảng Chuẩn Cổng Dịch Vụ Công Quốc Gia & Tên Cơ Quan */}
          <div className="flex items-center gap-3.5 sm:gap-4 w-full lg:w-auto justify-center lg:justify-start">
            
            {/* Logo Biểu Trưng Nền Tảng Cổng Dịch Vụ Công (Cánh tay hoa sen ngôi sao đỏ) */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 flex-shrink-0 shadow-xl ring-2 ring-amber-400 flex items-center justify-center hover:scale-105 transition-transform">
              <img
                src="/logo_gov.png"
                alt="Logo Cổng Dịch vụ công Quốc gia"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Tên cơ quan hành chính & slogan chuẩn mực */}
            <div className="text-center sm:text-left">
              <div className="text-[11px] sm:text-xs uppercase tracking-wider text-amber-300 font-extrabold flex items-center justify-center sm:justify-start gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>ỦY BAN NHÂN DÂN XÃ HIỆP HÒA — TỈNH TÂY NINH</span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-snug mt-0.5">
                TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 shadow-sm uppercase">
                  <Sparkles className="w-3 h-3 text-red-950 flex-shrink-0" />
                  HIỆP HÒA AI-GOV
                </span>
                <span className="text-xs text-amber-100/90 font-medium hidden sm:inline">
                  Nền tảng Tự động hóa Biểu mẫu & Trợ lý Pháp luật 24/7
                </span>
              </div>
            </div>
          </div>

          {/* Cụm Điều Khiển Chế Độ & Bảo Mật */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2.5 w-full lg:w-auto">
            {/* Zero-Data Retention Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-emerald-200 text-xs font-bold shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
              <span className="whitespace-nowrap">Bảo mật Zero-Data</span>
            </div>

            {/* Segmented Control Chuyển Chế Độ */}
            <div className="inline-flex p-1 rounded-2xl bg-red-950/80 border border-red-500/60 shadow-lg">
              <button
                type="button"
                onClick={() => setCurrentMode('citizen')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap ${
                  currentMode === 'citizen'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 shadow-md font-black'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>Bà Con Nhân Dân</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentMode('officer')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap ${
                  currentMode === 'officer'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 shadow-md font-black'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <UserCheck className="w-4 h-4 flex-shrink-0" />
                <span>Cán Bộ Một Cửa</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Vị trí 3: Đường diềm hoa văn Đông Sơn (DongSonBorder) 8px ngăn cách Header và nội dung */}
      <DongSonBorder height={8} />
    </header>
  );
}
