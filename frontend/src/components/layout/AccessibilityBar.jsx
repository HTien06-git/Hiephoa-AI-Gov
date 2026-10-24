import React from 'react';
import { Volume2, VolumeX, PhoneCall, Trash2, Type } from 'lucide-react';

export default function AccessibilityBar({
  fontScale,
  setFontScale,
  isAudioEnabled,
  toggleAudio,
  clearSecurityData,
  hasData
}) {
  return (
    <div className="sticky top-[60px] sm:top-[68px] z-40 bg-amber-50/95 backdrop-blur-xs border-b border-amber-200/80 px-3 py-1.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-slate-800">
        
        {/* Nhóm Cỡ chữ: A | A+ | A++ (3 nút nhỏ gọn bằng nhau) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-[11px] sm:text-xs font-bold text-amber-900 hidden xs:inline-flex items-center gap-1 mr-0.5">
            <Type className="w-3.5 h-3.5 text-amber-700" />
            <span>Cỡ chữ:</span>
          </span>

          <div className="inline-flex p-0.5 bg-white border border-amber-300 rounded-lg shadow-2xs">
            <button
              type="button"
              onClick={() => setFontScale('normal')}
              title="Cỡ chữ Vừa"
              className={`h-7 px-2 text-xs font-bold rounded transition-all ${
                fontScale === 'normal'
                  ? 'bg-[#991B1B] text-white font-black shadow-xs'
                  : 'text-slate-700 hover:bg-amber-100/60'
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontScale('large')}
              title="Cỡ chữ To"
              className={`h-7 px-2 text-xs font-bold rounded transition-all ${
                fontScale === 'large'
                  ? 'bg-[#991B1B] text-white font-black shadow-xs'
                  : 'text-slate-700 hover:bg-amber-100/60'
              }`}
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontScale('xlarge')}
              title="Cỡ chữ Siêu to"
              className={`h-7 px-2 text-xs font-bold rounded transition-all ${
                fontScale === 'xlarge'
                  ? 'bg-[#991B1B] text-white font-black shadow-xs'
                  : 'text-slate-700 hover:bg-amber-100/60'
              }`}
            >
              A++
            </button>
          </div>
        </div>

        {/* Nhóm Hỗ trợ: Loa BẬT/TẮT + Hotline 1900 9095 */}
        <div className="flex items-center gap-1.5">
          {/* Nút Loa */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`h-7 px-2.5 text-xs font-bold inline-flex items-center gap-1 rounded-lg border transition-all ${
              isAudioEnabled
                ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
                : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
            }`}
            title="Bật hoặc Tắt đọc to giọng hướng dẫn"
          >
            {isAudioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-200" />
                <span>Loa: BẬT</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>Loa: TẮT</span>
              </>
            )}
          </button>

          {/* Hotline 1900 9095 */}
          <a
            href="tel:19009095"
            className="h-7 px-2.5 text-xs font-bold inline-flex items-center gap-1 rounded-lg bg-blue-700 text-white hover:bg-blue-800 border border-blue-900 transition-all shadow-2xs"
            title="Gọi tổng đài hỗ trợ hành chính công"
          >
            <PhoneCall className="w-3 h-3 text-amber-300" />
            <span>1900 9095</span>
          </a>

          {/* Xóa dữ liệu tạm nếu có */}
          {hasData && (
            <button
              type="button"
              onClick={clearSecurityData}
              className="h-7 px-2 text-xs font-bold inline-flex items-center gap-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200"
              title="Xóa dữ liệu cá nhân"
            >
              <Trash2 className="w-3 h-3 text-rose-600" />
              <span className="hidden sm:inline">Xóa dữ liệu</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
