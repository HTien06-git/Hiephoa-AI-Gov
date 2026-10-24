import React from 'react';
import { Volume2, VolumeX, PhoneCall, Trash2, Eye } from 'lucide-react';

export default function AccessibilityBar({
  fontScale,
  setFontScale,
  isAudioEnabled,
  toggleAudio,
  clearSecurityData,
  hasData
}) {
  return (
    <div className="bg-[#FFFBEB] border-b border-amber-200/80 py-2.5 px-4 shadow-2xs z-20">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-800">
        
        {/* BÊN TRÁI: CỠ CHỮ CHO BÀ CON A (Vừa) | A+ (To) | A++ (Siêu to) */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-1.5 whitespace-nowrap">
            <Eye className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>Cỡ chữ:</span>
          </span>

          <div className="inline-flex p-0.5 bg-white border border-amber-300 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setFontScale('normal')}
              title="Cỡ chữ Vừa"
              className={`h-9 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
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
              className={`h-9 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
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
              className={`h-9 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                fontScale === 'xlarge'
                  ? 'bg-[#991B1B] text-white font-black shadow-xs'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              A++ (Siêu to)
            </button>
          </div>
        </div>

        {/* BÊN PHẢI: LOA: BẬT / TẮT & TỔNG ĐÀI 1900 9095 CÙNG CHIỀU CAO h-9 */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Nút Loa: BẬT */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`h-9 px-3.5 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 rounded-xl border transition-all whitespace-nowrap shadow-2xs ${
              isAudioEnabled
                ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
                : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
            }`}
            title="Bật hoặc Tắt đọc to giọng hướng dẫn"
          >
            {isAudioEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
                <span>Loa: BẬT</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Loa: TẮT</span>
              </>
            )}
          </button>

          {/* Hotline 1900 9095 */}
          <a
            href="tel:19009095"
            className="h-9 px-3.5 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] text-white hover:bg-blue-900 border border-blue-950 transition-all shadow-2xs whitespace-nowrap"
            title="Gọi tổng đài hỗ trợ thủ tục hành chính công"
          >
            <PhoneCall className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Tổng đài: 1900 9095</span>
          </a>

          {/* Nút xóa dữ liệu bảo mật nếu có */}
          {hasData && (
            <button
              type="button"
              onClick={clearSecurityData}
              className="h-9 px-3 text-xs font-bold inline-flex items-center gap-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 transition-all whitespace-nowrap shadow-2xs"
              title="Xóa thông tin cá nhân khỏi máy"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="hidden sm:inline">Xóa Dữ Liệu</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
