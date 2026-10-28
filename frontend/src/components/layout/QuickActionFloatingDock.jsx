import React, { useState } from 'react';
import {
  Mic,
  Search,
  FileSignature,
  Camera,
  PhoneCall,
  ArrowUp,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/**
 * Thanh Nút Chức Năng Nhanh Cố Định Dưới Màn Hình (Fixed Floating Quick Action Dock V6.4)
 * - Tinh chỉnh thẩm mỹ biểu tượng chuyên nghiệp dạng Circular Badges đa sắc sang trọng.
 * - Hỗ trợ tính năng Thu gọn / Mở rộng giúp người dân không bị che khuất giao diện khi lướt đọc danh mục.
 * - Hoạt động mượt mà, phản hồi siêu nhạy trên cả Mobile và Desktop.
 */
export default function QuickActionFloatingDock({
  onActivateMic,
  onOpenLookup,
  onScrollToProcedures,
  onOpenPreCheck,
  onScrollToTop,
  deviceCount = 0
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Nếu đang thu gọn: hiển thị nút viên thuốc vàng kim tinh gọn
  if (isCollapsed) {
    return (
      <aside
        aria-label="Thanh công cụ thu gọn"
        style={{ zIndex: 60 }}
        className="fixed bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 select-none animate-fadeIn pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#690F12] text-amber-300 border-2 border-amber-400 shadow-[0_8px_30px_rgba(0,0,0,0.7)] text-xs font-black hover:scale-105 active:scale-95 transition-all"
          title="Bấm để mở thanh chức năng nhanh"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>Thao Tác Nhanh</span>
          <ChevronUp className="w-3.5 h-3.5 text-amber-200" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Thanh công cụ thao tác nhanh"
      style={{ zIndex: 60 }}
      className="fixed bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 select-none animate-fadeIn max-w-[96vw] pointer-events-auto"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#5B0B0E] border-2 border-amber-400 shadow-[0_12px_45px_rgba(0,0,0,0.85)]">

        {/* 1. NÚT MICRO - CHẠM & NÓI VỚI CHUYÊN VIÊN AI (Vàng Hoàng Gia tỏa sáng) */}
        <button
          type="button"
          onClick={onActivateMic}
          aria-label="Chạm và nói với Chuyên viên AI"
          title="Chạm và nói chuyện với Chuyên viên AI"
          className="relative group p-2 sm:p-2.5 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-stone-950 shadow-md hover:scale-110 active:scale-95 transition-all ring-2 ring-amber-200 shrink-0"
        >
          <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B0F12] animate-pulse" />
          <span className="sr-only">Nói với AI</span>
        </button>

        <div className="w-[1px] h-5 bg-amber-400/30" />

        {/* 2. NÚT TRA CỨU HỒ SƠ & CCCD (Badge Lam Ngọc Sapphire) */}
        <button
          type="button"
          onClick={onOpenLookup}
          aria-label="Tra cứu tiến độ hồ sơ CCCD"
          title={deviceCount > 0 ? `Bà con có ${deviceCount} hồ sơ trên thiết bị này` : "Tra cứu hồ sơ bằng CCCD hoặc Mã hồ sơ"}
          className="relative p-1.5 sm:p-2 rounded-full bg-gradient-to-tr from-cyan-700 to-blue-800 text-cyan-100 hover:text-white hover:scale-105 active:scale-95 transition-all border border-cyan-400/50 shadow-sm"
        >
          <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-200" />
          {deviceCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[#690F12] font-black text-[9px] flex items-center justify-center ring-1 ring-white animate-pulse">
              {deviceCount}
            </span>
          )}
          <span className="sr-only">Tra cứu</span>
        </button>

        {/* 3. NÚT DANH MỤC THỦ TỤC & ĐIỀN ĐƠN (Badge Hồng Ngọc Ruby) */}
        <button
          type="button"
          onClick={onScrollToProcedures}
          aria-label="Xem danh mục thủ tục và điền đơn"
          title="Danh mục thủ tục hành chính cấp xã"
          className="p-1.5 sm:p-2 rounded-full bg-gradient-to-tr from-red-700 to-rose-800 text-rose-100 hover:text-white hover:scale-105 active:scale-95 transition-all border border-rose-400/50 shadow-sm"
        >
          <FileSignature className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-rose-200" />
          <span className="sr-only">Thủ tục</span>
        </button>

        {/* 4. NÚT CHỤP ẢNH & KIỂM TRA GIẤY TỜ (Badge Thạch Anh Tím Amethyst) */}
        <button
          type="button"
          onClick={onOpenPreCheck}
          aria-label="Chụp ảnh kiểm tra giấy tờ trước khi nộp"
          title="AI kiểm tra ảnh chụp giấy tờ hợp lệ"
          className="p-1.5 sm:p-2 rounded-full bg-gradient-to-tr from-indigo-700 to-purple-800 text-purple-100 hover:text-white hover:scale-105 active:scale-95 transition-all border border-purple-400/50 shadow-sm"
        >
          <Camera className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-purple-200" />
          <span className="sr-only">Kiểm tra giấy tờ</span>
        </button>

        {/* 5. NÚT GỌI TỔNG ĐÀI HỖ TRỢ 1900 9095 (Badge Ngọc Lục Bảo Emerald) */}
        <a
          href="tel:19009095"
          aria-label="Gọi tổng đài tư vấn 1900 9095"
          title="Gọi tổng đài hỗ trợ: 1900 9095"
          className="p-1.5 sm:p-2 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-800 text-emerald-100 hover:text-white hover:scale-105 active:scale-95 transition-all border border-emerald-400/50 shadow-sm"
        >
          <PhoneCall className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-200" />
          <span className="sr-only">Tổng đài 1900 9095</span>
        </a>

        {/* 6. NÚT CUỘN LÊN ĐẦU TRANG */}
        <button
          type="button"
          onClick={onScrollToTop}
          aria-label="Cuộn mượt lên đầu trang"
          title="Lên đầu trang"
          className="p-1.5 sm:p-2 rounded-full bg-stone-800/80 text-amber-300 hover:text-amber-100 hover:bg-stone-700 active:scale-95 transition-all border border-amber-400/40"
        >
          <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300" />
          <span className="sr-only">Lên đầu trang</span>
        </button>

        <div className="w-[1px] h-5 bg-amber-400/30" />

        {/* 7. NÚT THU GỌN THANH TÁC VỤ */}
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          aria-label="Thu gọn thanh thao tác nhanh"
          title="Thu gọn thanh thao tác nhanh"
          className="p-1 sm:p-1.5 rounded-full text-amber-300/80 hover:text-amber-100 hover:bg-white/10 active:scale-95 transition-all"
        >
          <ChevronDown className="w-4 h-4 text-amber-300" />
          <span className="sr-only">Thu gọn</span>
        </button>

      </div>
    </aside>
  );
}
