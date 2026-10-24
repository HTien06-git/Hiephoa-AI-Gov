import React from 'react';
import { Volume2, VolumeX, PhoneCall, Trash2, Eye } from 'lucide-react';

/**
 * Thanh Công Cụ Trợ Năng (Accessibility Bar V6.5)
 * - Tinh chỉnh bố cục hoàn toàn cân đối, đồng bộ tỷ lệ trên cả điện thoại và máy tính.
 * - Triệt tiêu hiện tượng "cái dài cái ngắn cái cao cái thấp" trên màn hình điện thoại.
 * - Cỡ chữ chia đều 3 nút (33.3% mỗi nút).
 * - Nút Loa và Tổng đài chia đều 2 nút đối xứng 50% - 50% chuẩn mực cùng chiều cao h-10.
 */
export default function AccessibilityBar({
  fontScale,
  setFontScale,
  isAudioEnabled,
  toggleAudio,
  clearSecurityData,
  hasData
}) {
  return (
    <aside
      aria-label="Thanh công cụ trợ năng"
      className="bg-[#FFFBEB] border-b border-amber-200/90 py-2 sm:py-2.5 px-3 sm:px-6 shadow-2xs z-20 select-none"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-slate-800">
        
        {/* ======================================================== */}
        {/* KHU VỰC 1: CỠ CHỮ CHO BÀ CON (CÂN ĐỐI 3 NÚT BẰNG NHAU 100%) */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-1 shrink-0 whitespace-nowrap">
            <Eye className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>Cỡ chữ:</span>
          </span>

          <div className="grid grid-cols-3 flex-1 sm:flex-none sm:inline-grid sm:w-80 md:w-84 bg-white border border-amber-300 rounded-xl p-0.5 shadow-2xs gap-0.5">
            <button
              type="button"
              onClick={() => setFontScale('normal')}
              title="Cỡ chữ Vừa"
              className={`h-9 sm:h-9.5 px-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center whitespace-nowrap ${
                fontScale === 'normal'
                  ? 'bg-[#991B1B] text-white font-black shadow-xs'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              A (Vừa)
            </button>

            <button
              type="button"
              onClick={() => setFontScale('large')}
              title="Cỡ chữ To"
              className={`h-9 sm:h-9.5 px-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center whitespace-nowrap ${
                fontScale === 'large'
                  ? 'bg-[#991B1B] text-white font-black shadow-xs'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              A+ (To)
            </button>

            <button
              type="button"
              onClick={() => setFontScale('xlarge')}
              title="Cỡ chữ Siêu to"
              className={`h-9 sm:h-9.5 px-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center whitespace-nowrap ${
                fontScale === 'xlarge'
                  ? 'bg-[#991B1B] text-white font-black shadow-xs'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              A++ (Siêu to)
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KHU VỰC 2: LOA & TỔNG ĐÀI (CÂN ĐỐI 50% - 50% CÙNG CHIỀU CAO h-9) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {/* Nút Loa: BẬT / TẮT (50% trên mobile, bằng chiều cao nút Tổng đài) */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`h-9 sm:h-9.5 px-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 rounded-xl border transition-all shadow-2xs whitespace-nowrap ${
              isAudioEnabled
                ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
                : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
            }`}
            title="Bật hoặc Tắt đọc to giọng hướng dẫn"
          >
            {isAudioEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
                <span className="whitespace-nowrap">Loa: BẬT</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="whitespace-nowrap">Loa: TẮT</span>
              </>
            )}
          </button>

          {/* Hotline 1900 9095 (50% trên mobile, bằng chiều cao nút Loa) */}
          <a
            href="tel:19009095"
            className="h-9 sm:h-9.5 px-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 rounded-xl bg-[#1E3A8A] text-white hover:bg-blue-900 border border-blue-950 transition-all shadow-2xs whitespace-nowrap"
            title="Gọi tổng đài hỗ trợ thủ tục hành chính công"
          >
            <PhoneCall className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="whitespace-nowrap">Tổng đài: 1900 9095</span>
          </a>

          {/* Nút xóa dữ liệu bảo mật nếu có */}
          {hasData && (
            <button
              type="button"
              onClick={clearSecurityData}
              className="col-span-2 sm:col-span-1 h-9 sm:h-9.5 px-3 text-xs font-bold flex items-center justify-center gap-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 transition-all shadow-2xs"
              title="Xóa thông tin cá nhân khỏi máy"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Xóa Dữ Liệu</span>
            </button>
          )}
        </div>

      </div>
    </aside>
  );
}
