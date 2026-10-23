import React from 'react';
import { Volume2, VolumeX, Trash2, PhoneCall, Eye } from 'lucide-react';

export default function AccessibilityBar({
  fontScale,
  setFontScale,
  isAudioEnabled,
  toggleAudio,
  clearSecurityData,
  hasData
}) {
  return (
    <div className="bg-[#FFFBEB] border-b border-amber-200/90 px-3 sm:px-4 py-2 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-slate-800">
        
        {/* Nhóm Trợ Năng: Cỡ chữ cho bà con */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5 whitespace-nowrap">
            <Eye className="w-4 h-4 text-[#D97706] flex-shrink-0" />
            <span>Cỡ chữ:</span>
          </span>

          <div className="inline-flex p-0.5 bg-white border border-amber-300 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setFontScale('normal')}
              title="Cỡ chữ tiêu chuẩn (16px)"
              className={`h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                fontScale === 'normal'
                  ? 'bg-[#991B1B] text-white shadow-xs font-black'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              A (Vừa)
            </button>
            <button
              type="button"
              onClick={() => setFontScale('large')}
              title="Cỡ chữ to (18px)"
              className={`h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                fontScale === 'large'
                  ? 'bg-[#991B1B] text-white shadow-xs font-black'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              A+ (To)
            </button>
            <button
              type="button"
              onClick={() => setFontScale('xlarge')}
              title="Cỡ chữ siêu to (20px)"
              className={`h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                fontScale === 'xlarge'
                  ? 'bg-[#991B1B] text-white shadow-xs font-black'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              A++ (Siêu to)
            </button>
          </div>
        </div>

        {/* Nhóm Hỗ Trợ: Loa + Tổng Đài + Xóa dữ liệu */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Nút Loa: BẬT / TẮT */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`h-8 sm:h-9 px-3 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 rounded-lg border transition-all whitespace-nowrap ${
              isAudioEnabled
                ? 'bg-[#059669] text-white border-emerald-700 shadow-2xs hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
            }`}
            title="Bật hoặc Tắt đọc to giọng hướng dẫn"
          >
            {isAudioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-white animate-pulse flex-shrink-0" />
                <span>Loa: BẬT</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <span>Loa: TẮT</span>
              </>
            )}
          </button>

          {/* Hotline Một Cửa Xã */}
          <a
            href="tel:19009095"
            className="h-8 sm:h-9 px-3 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] text-white border border-blue-800 shadow-2xs hover:bg-blue-800 transition-all whitespace-nowrap"
            title="Gọi tổng đài hỗ trợ thủ tục hành chính công"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <span>Tổng đài: 1900 9095</span>
          </a>

          {/* Nút Xóa Dữ Liệu Bảo Mật */}
          {hasData && (
            <button
              type="button"
              onClick={clearSecurityData}
              className="h-8 sm:h-9 px-2.5 text-xs font-bold inline-flex items-center gap-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 transition-all shadow-2xs whitespace-nowrap"
              title="Xóa ngay thông tin cá nhân khỏi bộ nhớ trình duyệt"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span>Xóa Dữ Liệu</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
