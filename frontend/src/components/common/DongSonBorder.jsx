import React from 'react';

/**
 * Đường diềm hoa văn kỷ hà Đông Sơn (Dong Son Border Pattern)
 * Dùng làm đường viền phân cách sang trọng với chiều cao 8px, họa tiết tam giác răng cưa và chấm tròn Đông Sơn màu vàng đồng
 */
export default function DongSonBorder({ height = 8, className = "" }) {
  return (
    <div 
      className={`w-full overflow-hidden select-none flex-shrink-0 bg-gradient-to-r from-[#B45309] via-[#F59E0B] to-[#B45309] ${className}`}
      style={{ height: `${height}px` }}
      title="Đường diềm hoa văn Trống Đồng Đông Sơn"
    >
      <svg
        width="100%"
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-80"
      >
        <defs>
          <pattern id="dongSonPattern" width="24" height={height} patternUnits="userSpaceOnUse">
            {/* Họa tiết răng cưa / tam giác kỷ hà đặc trưng Đông Sơn */}
            <polygon points="0,0 12,8 24,0" fill="#78350F" />
            <polygon points="0,8 12,0 24,8" fill="#FDE68A" opacity="0.9" />
            <circle cx="12" cy="4" r="1.5" fill="#B45309" />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill="url(#dongSonPattern)" />
      </svg>
    </div>
  );
}
