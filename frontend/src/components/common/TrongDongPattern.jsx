import React from 'react';

/**
 * Họa tiết Trống Đồng Đông Sơn nghệ thuật (Bronze Drum Watermark)
 * Chứa ngôi sao nhiều cánh ở tâm, các vòng chim Lạc bay ngược chiều kim đồng hồ,
 * và các vành hoa văn hình học, răng cưa đồng tâm đặc trưng của văn hóa Việt Nam.
 */
export default function TrongDongPattern({ className = "w-full h-full opacity-10", color = "#F59E0B" }) {
  return (
    <svg
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke={color}
    >
      <g transform="translate(400, 400)">
        {/* Vòng ngoài cùng */}
        <circle r="390" strokeWidth="3" opacity="0.6" />
        <circle r="380" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
        <circle r="365" strokeWidth="2" opacity="0.7" />

        {/* Vành hoa văn hình học chữ Hán / Gãy khúc */}
        <circle r="345" strokeWidth="1" strokeDasharray="8 6" opacity="0.6" />
        <circle r="330" strokeWidth="2" opacity="0.7" />

        {/* Vành 16 Chim Lạc bay ngược chiều kim đồng hồ */}
        <circle r="310" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={`bird-${i}`} transform={`rotate(${angle}) translate(0, -285)`}>
              {/* Thân chim Lạc */}
              <path
                d="M-25,0 C-15,-8 10,-8 25,0 C15,-3 0,-4 -15,-2 Z"
                fill={color}
                opacity="0.85"
              />
              {/* Mỏ dài vươn cao */}
              <path
                d="M25,0 L35,-6 L24,-2 Z"
                fill={color}
                opacity="0.9"
              />
              {/* Cánh xòe rộng */}
              <path
                d="M0,-3 C-8,-18 -15,-22 -30,-20 C-18,-15 -10,-8 -2,-3 Z"
                fill={color}
                opacity="0.8"
              />
              {/* Đuôi chim */}
              <path
                d="M-25,0 L-35,3 L-23,1 Z"
                fill={color}
                opacity="0.7"
              />
            </g>
          );
        })}
        <circle r="260" strokeWidth="2" opacity="0.7" />

        {/* Vành hoa văn răng lược / răng chó */}
        <circle r="245" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <circle r="230" strokeWidth="2" opacity="0.7" />

        {/* Vành 12 Hươu / Người giã gạo nhảy múa tượng trưng */}
        <circle r="215" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
        {[...Array(12)].map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <g key={`figure-${i}`} transform={`rotate(${angle}) translate(0, -195)`}>
              <circle cx="0" cy="-6" r="3" fill={color} opacity="0.8" />
              <line x1="0" y1="-3" x2="0" y2="8" strokeWidth="2" stroke={color} opacity="0.8" />
              <line x1="-8" y1="2" x2="8" y2="2" strokeWidth="1.5" stroke={color} opacity="0.8" />
              <line x1="0" y1="8" x2="-6" y2="16" strokeWidth="1.5" stroke={color} opacity="0.8" />
              <line x1="0" y1="8" x2="6" y2="16" strokeWidth="1.5" stroke={color} opacity="0.8" />
            </g>
          );
        })}
        <circle r="175" strokeWidth="2" opacity="0.7" />

        {/* Vòng hoa văn xoắn ốc kép */}
        <circle r="160" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        <circle r="145" strokeWidth="2" opacity="0.7" />
        <circle r="125" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

        {/* Vòng tia sáng mặt trời */}
        <circle r="105" strokeWidth="2" opacity="0.8" />

        {/* Ngôi sao 14 cánh ở tâm Trống Đồng */}
        {[...Array(14)].map((_, i) => {
          const angle = (i * 360) / 14;
          return (
            <g key={`ray-${i}`} transform={`rotate(${angle})`}>
              {/* Tia sao chính nhọn hoắt */}
              <polygon
                points="0,-102 -9,-35 0,-15 9,-35"
                fill={color}
                opacity="0.85"
              />
              {/* Họa tiết lông công xen kẽ giữa các tia sao */}
              <path
                d="M0,-30 C4,-45 8,-50 14,-55 C10,-48 6,-40 0,-30 Z"
                fill={color}
                opacity="0.5"
              />
            </g>
          );
        })}

        {/* Vòng tâm trống */}
        <circle r="22" fill={color} opacity="0.9" />
        <circle r="12" fill="#7F1D1D" opacity="0.8" />
        <circle r="5" fill={color} />
      </g>
    </svg>
  );
}
