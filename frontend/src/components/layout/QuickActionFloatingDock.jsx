import React from 'react';
import {
  Mic,
  Search,
  FileText,
  Camera,
  PhoneCall,
  ArrowUp
} from 'lucide-react';

/**
 * Thanh Nút Chức Năng Nhanh Cố Định Dưới Màn Hình (Fixed Floating Quick Action Dock)
 * - Cố định trên màn hình, khi cuộn trang lên xuống các nút vẫn giữ nguyên vị trí.
 * - Các nút chức năng nhanh mặc định dạng biểu tượng chuẩn mực, không cần chữ giải thích thêm.
 * - Hoạt động đồng bộ trên cả máy tính (Desktop) và điện thoại (Mobile).
 */
export default function QuickActionFloatingDock({
  onActivateMic,
  onOpenLookup,
  onScrollToProcedures,
  onOpenPreCheck,
  onScrollToTop
}) {
  return (
    <aside 
      aria-label="Thanh công cụ thao tác nhanh"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 select-none animate-fadeIn"
    >
      <div className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#690F12]/95 via-[#851417]/95 to-[#5C0A0D]/95 border-2 border-amber-400 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
        
        {/* 1. NÚT MICRO - CHẠM & NÓI VỚI CHUYÊN VIÊN AI (Nổi bật nhất ở trung tâm) */}
        <button
          type="button"
          onClick={onActivateMic}
          aria-label="Chạm và nói với Chuyên viên AI"
          title="Chạm và nói với Chuyên viên AI"
          className="relative group p-2.5 sm:p-3 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-stone-950 shadow-md hover:scale-110 active:scale-95 transition-all ring-2 ring-amber-200"
        >
          <Mic className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#7F1416] animate-pulse" />
          <span className="sr-only">Nói với AI</span>
        </button>

        <div className="w-[1px] h-6 bg-amber-400/30" />

        {/* 2. NÚT TRA CỨU MÃ HỒ SƠ TRỰC TUYẾN */}
        <button
          type="button"
          onClick={onOpenLookup}
          aria-label="Tra cứu tiến độ hồ sơ trực tuyến"
          title="Tra cứu tiến độ hồ sơ"
          className="p-2 sm:p-2.5 rounded-full text-amber-100 hover:text-white hover:bg-white/15 active:scale-95 transition-all"
        >
          <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          <span className="sr-only">Tra cứu</span>
        </button>

        {/* 3. NÚT CUỘN ĐẾN DANH MỤC THỦ TỤC & ĐIỀN ĐƠN */}
        <button
          type="button"
          onClick={onScrollToProcedures}
          aria-label="Xem danh mục thủ tục và điền đơn"
          title="Danh mục thủ tục hành chính"
          className="p-2 sm:p-2.5 rounded-full text-amber-100 hover:text-white hover:bg-white/15 active:scale-95 transition-all"
        >
          <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          <span className="sr-only">Thủ tục</span>
        </button>

        {/* 4. NÚT CHỤP ẢNH & KIỂM TRA GIẤY TỜ AI (OCR PRE-CHECK) */}
        <button
          type="button"
          onClick={onOpenPreCheck}
          aria-label="Chụp ảnh kiểm tra giấy tờ trước khi nộp"
          title="Kiểm tra ảnh giấy tờ bằng AI"
          className="p-2 sm:p-2.5 rounded-full text-amber-100 hover:text-white hover:bg-white/15 active:scale-95 transition-all"
        >
          <Camera className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          <span className="sr-only">Kiểm tra giấy tờ</span>
        </button>

        {/* 5. NÚT GỌI TỔNG ĐÀI HỖ TRỢ 1900 9095 */}
        <a
          href="tel:19009095"
          aria-label="Gọi tổng đài tư vấn 1900 9095"
          title="Gọi tổng đài: 1900 9095"
          className="p-2 sm:p-2.5 rounded-full text-amber-100 hover:text-white hover:bg-white/15 active:scale-95 transition-all"
        >
          <PhoneCall className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-300" />
          <span className="sr-only">Tổng đài</span>
        </a>

        <div className="w-[1px] h-6 bg-amber-400/30" />

        {/* 6. NÚT CUỘN LÊN ĐẦU TRANG */}
        <button
          type="button"
          onClick={onScrollToTop}
          aria-label="Cuộn mượt lên đầu trang"
          title="Lên đầu trang"
          className="p-2 sm:p-2.5 rounded-full text-amber-200 hover:text-amber-100 hover:bg-white/15 active:scale-95 transition-all"
        >
          <ArrowUp className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          <span className="sr-only">Lên đầu trang</span>
        </button>

      </div>
    </aside>
  );
}
