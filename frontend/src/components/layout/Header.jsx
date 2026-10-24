import React from 'react';
import { ShieldCheck, UserCheck, Users, Sparkles } from 'lucide-react';
import TrongDongOrnament from '../common/TrongDongOrnament';

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

        {/* Họa tiết Trống Đồng lớn (480px) bên phải Header xoay chậm tạo chiều sâu nghệ thuật */}
        <div className="absolute -right-20 -top-32 w-[480px] h-[480px] pointer-events-none opacity-[0.16] text-amber-400">
          <TrongDongOrnament size={480} color="#FBBF24" spin={true} spinDuration={150} />
        </div>

        {/* Họa tiết Trống Đồng vừa (280px) tỏa sáng chìm phía sau logo góc trái */}
        <div className="absolute -left-12 -top-14 w-[280px] h-[280px] pointer-events-none opacity-[0.12] text-amber-200">
          <TrongDongOrnament size={280} color="#FDE68A" spin={true} spinDuration={100} />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4.5 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* BÊN TRÁI: LOGO NỀN TẢNG (HÌNH 2) & CỤM TIÊU ĐỀ CHÍNH QUYỀN TRANG NGHIÊM */}
          <div className="flex items-center gap-3.5 sm:gap-4.5 w-full lg:w-auto justify-center sm:justify-start">
            
            {/* LOGO NỀN TẢNG (HÌNH 2: 5 BÀN TAY VÀNG TẠO HÌNH NGÔI SAO TRÊN NỀN ĐỎ) */}
            <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] shrink-0 group flex items-center justify-center">
              {/* Vòng hào quang phát sáng nhẹ phía sau logo */}
              <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-md animate-pulse pointer-events-none" />
              
              {/* Vòng Trống Đồng Đông Sơn vàng kim bao quanh logo xoay nhẹ nhàng */}
              <div className="absolute -inset-1 opacity-70 pointer-events-none">
                <TrongDongOrnament size={80} color="#F59E0B" spin={true} spinDuration={80} />
              </div>

              {/* Khung tròn viền vàng chứa Logo Nền tảng chính thức */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-300 bg-[#A6181B] shadow-[0_4px_16px_rgba(0,0,0,0.45)] ring-2 ring-amber-500/50 flex items-center justify-center p-0.5">
                <img
                  src="/logo_hiephoa.png"
                  alt="Logo Nền tảng Hiệp Hòa AI-Gov"
                  className="w-full h-full object-cover rounded-full transform group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Dự phòng an toàn nếu tải ảnh lỗi
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo_gov.png';
                  }}
                />
              </div>
            </div>

            {/* CỤM TIÊU ĐỀ CHÍNH QUYỀN 3 DÒNG CHUẨN MỰC HÌNH 7 */}
            <div className="text-left">
              {/* Dòng 1: Đơn vị chủ quản (Chữ vàng kim in hoa thanh lịch) */}
              <div className="text-amber-300 font-extrabold text-[11px] sm:text-xs md:text-sm tracking-wider uppercase flex items-center gap-1.5 drop-shadow-xs">
                <span>ỦY BAN NHÂN DÂN XÃ HIỆP HÒA — TỈNH TÂY NINH</span>
              </div>

              {/* Dòng 2: Tiêu đề lớn màu trắng uy nghiêm */}
              <h1 className="text-white font-black text-base sm:text-xl lg:text-[23px] leading-snug tracking-tight mt-0.5 drop-shadow-md">
                TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG XÃ HIỆP HÒA
              </h1>

              {/* Dòng 3: Huy hiệu Nền tảng Vàng Kim & Mô tả chuyên viên AI */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-[#6B0F12] font-black text-[11px] sm:text-xs px-2.5 py-0.5 rounded-md uppercase shadow-sm tracking-wide border border-amber-200/60 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#6B0F12]" />
                  <span>HIỆP HÒA AI-GOV</span>
                </span>
                <span className="text-amber-100/90 text-xs sm:text-sm font-medium">
                  Chuyên viên Hành chính công AI Đa phương thức 24/7
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Trực tuyến</span>
                </span>
              </div>
            </div>

          </div>

          {/* BÊN PHẢI: CỤM ĐIỀU HƯỚNG & BẢO MẬT HIỆN ĐẠI */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Huy hiệu bảo mật Zero-Data */}
            <div className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-black/35 border border-emerald-400/40 px-3.5 py-1.5 text-xs font-medium text-emerald-300 whitespace-nowrap shadow-inner backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-Data Retention: Xử lý an toàn trên máy</span>
            </div>

            {/* Cụm 2 nút chuyển đổi: Dành cho Nhân Dân | Cán Bộ Một Cửa */}
            <div className="inline-grid grid-cols-2 rounded-xl bg-black/40 p-1 border border-amber-400/40 shadow-xl backdrop-blur-xs gap-0.5">
              <button
                type="button"
                onClick={() => setCurrentMode('citizen')}
                className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-2 transition-all ${
                  currentMode === 'citizen'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-amber-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Dành cho Nhân Dân</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentMode('officer')}
                className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-2 transition-all ${
                  currentMode === 'officer'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-amber-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Cán Bộ Một Cửa</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ĐƯỜNG DIỀM HOA VĂN ĐÔNG SƠN (6px SẮC VÀNG ĐỒNG CHUYỂN SẮC) */}
      <div 
        className="relative w-full h-[6px] bg-gradient-to-r from-amber-800 via-amber-300 to-amber-800 shadow-md" 
        title="Đường diềm hoa văn Trống Đồng Đông Sơn"
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-200/70" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-amber-900/60" />
      </div>

    </header>
  );
}
