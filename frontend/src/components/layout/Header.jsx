import React from 'react';
import { ShieldCheck, UserCheck, Users, Sparkles } from 'lucide-react';
import TrongDongMasterpiece from '../common/TrongDongMasterpiece';
import DongSonBorder from '../common/DongSonBorder';

export default function Header({ currentMode, setCurrentMode }) {
  return (
    <header className="relative select-none z-30 shadow-md">
      
      {/* KHU VỰC BANNER HEADER CHÍNH (ĐỎ SON HOÀNG GIA - TRỐNG ĐỒNG ĐÔNG SƠN) */}
      <div className="bg-gradient-to-r from-[#690F12] via-[#8B1418] to-[#5C0A0D] relative overflow-hidden border-b border-amber-500/60 text-white">
        
        {/* Lớp ánh sáng vàng ấm tỏa tròn ở trung tâm */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 30% 50%, rgba(245, 158, 11, 0.25) 0%, rgba(185, 28, 28, 0) 70%)'
          }}
        />

        {/* Họa tiết Trống Đồng Masterpiece V7 lớn (420px) bên phải Header - opacity 0.42 rõ nét */}
        <div className="absolute -right-16 -top-28 w-[420px] h-[420px] pointer-events-none opacity-[0.42] text-amber-400">
          <TrongDongMasterpiece size={420} color="#FBBF24" accentColor="#F59E0B" opacity={1} spin={true} spinDuration={60} glow={false} />
        </div>

        {/* Họa tiết Trống Đồng Masterpiece vừa (260px) góc trái */}
        <div className="absolute -left-10 -top-12 w-[260px] h-[260px] pointer-events-none opacity-[0.28] text-amber-200">
          <TrongDongMasterpiece size={260} color="#FDE68A" accentColor="#FBBF24" opacity={1} spin={true} spinDuration={90} />
        </div>

        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3.5 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* BÊN TRÁI: LOGO NỀN TẢNG (HÌNH 2) & CỤM TIÊU ĐỀ CHÍNH QUYỀN TRANG NGHIÊM */}
          <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto justify-start min-w-0">
            
            {/* LOGO NỀN TẢNG (HÌNH 2: 5 BÀN TAY VÀNG TẠO HÌNH NGÔI SAO TRÊN NỀN ĐỎ) */}
            <div className="relative w-11 h-11 sm:w-16 sm:h-16 shrink-0 group flex items-center justify-center">
              {/* Vòng hào quang phát sáng nhẹ phía sau logo */}
              <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-md animate-pulse pointer-events-none" />
              
              {/* Vòng Trống Đồng Masterpiece V7 bao quanh logo */}
              <div className="absolute -inset-1 opacity-80 pointer-events-none">
                <TrongDongMasterpiece size={72} color="#F59E0B" accentColor="#FBBF24" opacity={1} spin={true} spinDuration={80} />
              </div>

              {/* Khung tròn viền vàng chứa Logo Nền tảng chính thức */}
              <div className="relative w-10 h-10 sm:w-15 sm:h-15 rounded-full overflow-hidden border-2 border-amber-300 bg-[#A6181B] shadow-[0_4px_16px_rgba(0,0,0,0.45)] ring-2 ring-amber-500/50 flex items-center justify-center p-0.5">
                <img
                  src="/logo_hiephoa.png"
                  alt="Logo Nền tảng Hiệp Hòa AI-Gov"
                  className="w-full h-full object-cover rounded-full transform group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo_gov.png';
                  }}
                />
              </div>
            </div>

            {/* CỤM TIÊU ĐỀ CHÍNH QUYỀN 3 DÒNG CHUẨN MỰC HÌNH 7 */}
            <div className="text-left min-w-0 flex-1 overflow-visible sm:overflow-hidden">
              {/* Dòng 1: Đơn vị chủ quản (Chữ vàng kim in hoa thanh lịch) */}
              <div className="text-amber-300 font-extrabold text-[8.5px] xs:text-[9.5px] sm:text-xs md:text-sm tracking-wide sm:tracking-wider uppercase drop-shadow-xs leading-tight whitespace-nowrap">
                ỦY BAN NHÂN DÂN XÃ HIỆP HÒA — TỈNH TÂY NINH
              </div>

              {/* Dòng 2: Tiêu đề lớn màu trắng uy nghiêm (LIỀN 1 HÀNG KHÔNG XUỐNG DÒNG & KHÔNG BỊ CHE KHUẤT) */}
              <h1
                style={{ fontSize: 'clamp(8.5px, 2.75vw, 22px)' }}
                className="text-white font-black tracking-tighter sm:tracking-tight whitespace-nowrap leading-tight drop-shadow-md mt-0.5"
              >
                TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG XÃ HIỆP HÒA
              </h1>

              {/* Dòng 3: Huy hiệu Nền tảng Vàng Kim & Mô tả chuyên viên AI */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-nowrap overflow-hidden">
                <span className="shrink-0 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-[#6B0F12] font-black text-[8px] xs:text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 rounded-md uppercase shadow-sm tracking-wide border border-amber-200/60 inline-flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#6B0F12]" />
                  <span>HIỆP HÒA AI-GOV</span>
                </span>
                <span className="text-amber-100/90 text-[8px] xs:text-[9.5px] sm:text-xs md:text-sm font-medium whitespace-nowrap truncate">
                  Chuyên viên Hành chính công AI Đa phương thức 24/7
                </span>
              </div>
            </div>

          </div>

          {/* BÊN PHẢI: CỤM ĐIỀU HƯỚNG & BẢO MẬT HIỆN ĐẠI */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto justify-center">
            {/* Huy hiệu bảo mật Zero-Data */}
            <div className="hidden 2xl:inline-flex items-center gap-1.5 rounded-full bg-black/35 border border-emerald-400/40 px-3 py-1.5 text-xs font-medium text-emerald-300 whitespace-nowrap shadow-inner backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-Data Retention</span>
            </div>

            {/* Cụm 2 nút chuyển đổi: Dành cho Nhân Dân | Cán Bộ Một Cửa */}
            <div className="inline-flex items-center rounded-xl bg-black/40 p-1 border border-amber-400/40 shadow-xl backdrop-blur-xs gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCurrentMode('citizen')}
                className={`flex-1 sm:flex-none h-8 sm:h-10 px-3 sm:px-4.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                  currentMode === 'citizen'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-amber-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="whitespace-nowrap">Dành cho Nhân Dân</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentMode('officer')}
                className={`flex-1 sm:flex-none h-8 sm:h-10 px-3 sm:px-4.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                  currentMode === 'officer'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-amber-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="whitespace-nowrap">Cán Bộ Một Cửa</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ĐƯỜNG DIỀM HOA VĂN ĐÔNG SƠN V7 (14px RÕ NÉT VÀNG ĐỒNG) */}
      <DongSonBorder />

    </header>
  );
}
