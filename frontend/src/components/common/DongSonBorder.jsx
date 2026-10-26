import React from 'react';

/**
 * DongSonFretworkBorder V7 – Đường diềm hoa văn kỷ hà Trống Đồng Đông Sơn
 * Cao 14px, chạy ngang toàn màn hình, màu Vàng Đồng rõ nét
 */
export default function DongSonFretworkBorder({ position = 'top', className = '' }) {
  const width = 2400;
  const height = 14;
  const repeatUnit = 24;

  // Tạo dải hoa văn chữ S gãy khúc và răng cưa
  const buildPattern = () => {
    const units = Math.ceil(width / repeatUnit) + 1;
    const paths = [];
    for (let i = 0; i < units; i++) {
      const x = i * repeatUnit;
      // Hình thoi nhỏ
      paths.push(`M${x + 12},1 L${x + 20},7 L${x + 12},13 L${x + 4},7 Z`);
      // Chữ S gãy nhỏ nối 2 hình thoi
      paths.push(`M${x + 20},7 L${x + 24},4 M${x + 24},10 L${x + 20},7`);
    }
    return paths.join(' ');
  };

  return (
    <div
      className={`w-full overflow-hidden relative ${className}`}
      style={{ height: `${height}px`, backgroundColor: '#450A0A' }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMinYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient vàng đồng */}
        <defs>
          <linearGradient id="dongson-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="20%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        {/* Đường kẻ trên và dưới */}
        <line x1="0" y1="1" x2={width} y2="1" stroke="#D97706" strokeWidth="1.5" />
        <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="#D97706" strokeWidth="1.5" />

        {/* Dải hoa văn hình thoi và chữ S gãy khúc */}
        <path d={buildPattern()} fill="#D97706" stroke="#F59E0B" strokeWidth="0.5" />

        {/* Chấm đồng nhỏ chạy giữa */}
        {[...Array(Math.ceil(width / 24))].map((_, i) => (
          <circle key={i} cx={i * 24} cy={7} r="1.5" fill="#F59E0B" />
        ))}
      </svg>
    </div>
  );
}
