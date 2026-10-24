import React from 'react';
import { ShieldCheck, UserCheck, Users, Sparkles, Star } from 'lucide-react';
import TrongDongOrnament from '../common/TrongDongOrnament';

export default function Header({ currentMode, setCurrentMode }) {
  return (
    <header className="relative select-none z-30">
      
      {/* 1. THANH TIÊU NGỮ TRÊN CÙNG (TOP SLOGAN BAR) */}
      <div className="bg-[#630F12] text-amber-100/95 border-b border-amber-500/30 py-1.5 px-4 text-center text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-inner">
        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — ĐỘC LẬP - TỰ DO - HẠNH PHÚC
      </div>

      {/* 2. KHU VỰC BANNER HEADER CHÍNH (MAIN GOVERNMENT HEADER) */}
      <div className="bg-gradient-to-r from-[#7F1416] via-[#991B1B] to-[#7F1416] relative overflow-hidden border-b-2 border-amber-500/80 text-white shadow-lg">
        
        {/* Họa tiết Trống Đồng lớn (440px) bên phải Header xoay chậm */}
        <div className="absolute -right-16 -top-28 w-[440px] h-[440px] pointer-events-none opacity-[0.15]">
          <TrongDongOrnament size={440} color="#F59E0B" spin={true} spinDuration={120} />
        </div>

        {/* Họa tiết Trống Đồng vừa (260px) tỏa sáng sau biểu tượng góc trái */}
        <div className="absolute -left-12 -top-12 w-[260px] h-[260px] pointer-events-none opacity-[0.12]">
          <TrongDongOrnament size={260} color="#FDE68A" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-3.5 sm:py-5 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* BÊN TRÁI: BIỂU TƯỢNG QUỐC GIA & CỤM TIÊU ĐỀ CHÍNH QUYỀN (HÌNH 7 CHUẨN MỰC) */}
          <div className="flex items-center gap-3.5 sm:gap-4 w-full lg:w-auto justify-center sm:justify-start">
            
            {/* Biểu tượng Trống Đồng Tròn: Đường kính 56px-64px có Ngôi sao vàng 5 cánh chính giữa */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#B91C1C] to-[#7F1D1D] border-2 border-amber-400 shadow-xl flex items-center justify-center shrink-0 relative overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <TrongDongOrnament size={70} color="#F59E0B" spin={true} spinDuration={60} />
              </div>
              <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-400 text-amber-300 drop-shadow-md relative z-10" />
            </div>

            {/* Cụm Tiêu Đề Cơ Quan 3 Dòng Trang Nghiêm */}
            <div className="text-left">
              {/* Dòng 1: Chữ vàng kim in hoa */}
              <div className="text-amber-300 font-bold text-[11px] sm:text-xs md:text-sm tracking-wide uppercase">
                ỦY BAN NHÂN DÂN XÃ HIỆP HÒA — TỈNH TÂY NINH
              </div>

              {/* Dòng 2: Tiêu đề lớn màu trắng uy nghiêm */}
              <h1 className="text-white font-extrabold text-base sm:text-xl lg:text-[24px] leading-snug tracking-tight mt-0.5">
                TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG XÃ HIỆP HÒA
              </h1>

              {/* Dòng 3: Huy hiệu & Mô tả nền tảng */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="bg-amber-400 text-[#7F1D1D] font-extrabold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-md uppercase shadow-xs">
                  HIỆP HÒA AI-GOV
                </span>
                <span className="text-amber-50/95 text-xs sm:text-sm font-medium">
                  Chuyên viên Hành chính công AI Đa phương thức 24/7
                </span>
              </div>
            </div>

          </div>

          {/* BÊN PHẢI: CỤM ĐIỀU HƯỚNG & BẢO MẬT */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Huy hiệu bảo mật Zero-Data */}
            <div className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-black/25 border border-emerald-400/40 px-3.5 py-1.5 text-xs font-medium text-emerald-300 whitespace-nowrap shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-Data Retention: Xử lý an toàn trên máy</span>
            </div>

            {/* Cụm 2 nút chuyển đổi: Dành cho Nhân Dân | Cán Bộ Một Cửa */}
            <div className="inline-grid grid-cols-2 rounded-xl bg-black/30 p-1 border border-amber-400/30 shadow-md">
              <button
                type="button"
                onClick={() => setCurrentMode('citizen')}
                className={`h-10 px-4 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-2 transition-all ${
                  currentMode === 'citizen'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-amber-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Dành cho Nhân Dân</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentMode('officer')}
                className={`h-10 px-4 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-2 transition-all ${
                  currentMode === 'officer'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-amber-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Cán Bộ Một Cửa</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. ĐƯỜNG DIỀM HOA VĂN ĐÔNG SƠN (6px SẮC VÀNG ĐỒNG) */}
      <div 
        className="w-full h-[6px] bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 shadow-xs" 
        title="Đường diềm hoa văn Đông Sơn"
      />

    </header>
  );
}
