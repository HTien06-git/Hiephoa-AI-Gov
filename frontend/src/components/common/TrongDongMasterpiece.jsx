import React from 'react';

/**
 * TrongDongMasterpiece – Phiên bản V7.0 ĐẠI TU
 * Mặt Trống Đồng Ngọc Lũ – Đông Sơn chất lượng cao, 5 vòng đồng tâm rõ nét
 * opacity cao hơn, strokeWidth dày hơn, nét vàng kim sắc nét trên nền đỏ son
 */
export default function TrongDongMasterpiece({
  size = 420,
  className = '',
  color = '#FBBF24',
  accentColor = '#F59E0B',
  opacity = 0.38,
  spin = false,
  spinDuration = 60,
  glow = false
}) {
  const glowStyle = glow ? {
    filter: `drop-shadow(0 0 8px ${color}88) drop-shadow(0 0 18px ${color}44)`
  } : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
      style={{
        opacity,
        animation: spin ? `spin ${spinDuration}s linear infinite` : 'none',
        ...glowStyle
      }}
      fill="none"
    >
      <g transform="translate(400, 400)">
        {/* ====================================================== */}
        {/* VÀNH NGOÀI CÙNG (Vành 5): Tia mặt trời và hình thoi */}
        {/* ====================================================== */}
        <circle r="392" stroke={color} strokeWidth="5" />
        <circle r="378" stroke={accentColor} strokeWidth="2" strokeDasharray="8 5" />
        <circle r="366" stroke={color} strokeWidth="4" />

        {/* Họa tiết răng cưa (tia mặt trời) chạy quanh ngoài cùng */}
        {[...Array(36)].map((_, i) => {
          const angle = (i * 360) / 36;
          const rad = angle * Math.PI / 180;
          const innerR = 366, outerR = 390;
          const x1 = Math.cos(rad) * innerR; const y1 = Math.sin(rad) * innerR;
          const x2 = Math.cos(rad) * outerR; const y2 = Math.sin(rad) * outerR;
          return <line key={`sun-ray-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth="2.5" />;
        })}

        {/* Hình thoi lồng nhau */}
        {[...Array(18)].map((_, i) => {
          const angle = (i * 360) / 18;
          const midR = 378;
          const r = angle * Math.PI / 180;
          const cx = Math.cos(r) * midR; const cy = Math.sin(r) * midR;
          return (
            <g key={`diamond-${i}`} transform={`translate(${cx},${cy}) rotate(${angle})`}>
              <polygon points="0,-6 5,0 0,6 -5,0" fill={color} stroke={accentColor} strokeWidth="0.8" />
            </g>
          );
        })}

        {/* ====================================================== */}
        {/* VÀNH 4: Chim Lạc sải cánh + hươu sao rõ nét */}
        {/* ====================================================== */}
        <circle r="348" stroke={color} strokeWidth="3" />
        <circle r="330" stroke={accentColor} strokeWidth="2" strokeDasharray="5 4" />

        {/* 16 Chim Lạc sải cánh rõ ràng bay ngược chiều kim đồng hồ */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={`lac-v7-${i}`} transform={`rotate(${angle}) translate(0, -310)`}>
              {/* Thân chim */}
              <ellipse cx="0" cy="2" rx="18" ry="8" fill={color} stroke={accentColor} strokeWidth="0.8" />
              {/* Đầu và mỏ dài */}
              <path d="M18,2 L28,-4 L20,-1 Z" fill={color} />
              {/* Cánh trên rộng */}
              <path d="M-4,-6 C-14,-26 -28,-30 -42,-26 C-30,-20 -18,-11 -6,-6 Z"
                fill={color} stroke={accentColor} strokeWidth="0.7" />
              {/* Cánh dưới */}
              <path d="M2,8 C-4,20 -8,28 -14,30 C-8,22 -4,14 0,8 Z"
                fill={accentColor} opacity="0.8" />
              {/* Đuôi xòe */}
              <path d="M-18,2 L-32,6 L-28,10 L-18,5 Z" fill={color} />
              <path d="M-18,2 L-30,-2 L-26,-6 L-18,-1 Z" fill={accentColor} opacity="0.9" />
            </g>
          );
        })}

        {/* 8 Hươu sao xen kẽ chim Lạc */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8 + 11.25;
          return (
            <g key={`deer-${i}`} transform={`rotate(${angle}) translate(0, -310)`}>
              <ellipse cx="0" cy="4" rx="10" ry="6" fill={color} stroke={accentColor} strokeWidth="0.8" />
              <circle cx="12" cy="-3" r="4" fill={color} />
              {/* Gạc hươu */}
              <path d="M12,-7 L14,-16 M14,-11 L18,-14 M14,-11 L10,-14" stroke={color} strokeWidth="1.8" />
              {/* Chân */}
              <line x1="-6" y1="10" x2="-8" y2="18" stroke={color} strokeWidth="1.8" />
              <line x1="0" y1="10" x2="0" y2="18" stroke={color} strokeWidth="1.8" />
              <line x1="6" y1="10" x2="8" y2="18" stroke={color} strokeWidth="1.8" />
            </g>
          );
        })}

        <circle r="270" stroke={color} strokeWidth="4" />

        {/* ====================================================== */}
        {/* VÀNH 3: Người múa lễ hội và nhà sàn Đông Sơn */}
        {/* ====================================================== */}
        <circle r="254" stroke={accentColor} strokeWidth="2" strokeDasharray="6 4" />
        <circle r="240" stroke={color} strokeWidth="3" />

        {/* 12 Hình nhân múa lễ hội Đông Sơn với lông chim */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <g key={`dancer-v7-${i}`} transform={`rotate(${angle}) translate(0, -220)`}>
              {/* Đầu */}
              <circle cx="0" cy="-10" r="5" fill={color} stroke={accentColor} strokeWidth="0.8" />
              {/* Mũ lông chim */}
              <path d="M-8,-15 L-3,-28 L0,-22 L3,-28 L8,-15" fill={color} />
              {/* Thân */}
              <line x1="0" y1="-5" x2="0" y2="10" stroke={color} strokeWidth="2.5" />
              {/* Tay giơ lên múa */}
              <line x1="-14" y1="-2" x2="0" y2="2" stroke={color} strokeWidth="2.2" />
              <line x1="0" y1="2" x2="14" y2="-2" stroke={color} strokeWidth="2.2" />
              {/* Chân */}
              <line x1="0" y1="10" x2="-8" y2="20" stroke={color} strokeWidth="2.2" />
              <line x1="0" y1="10" x2="8" y2="20" stroke={color} strokeWidth="2.2" />
            </g>
          );
        })}

        {/* 6 Nhà sàn Đông Sơn xen kẽ */}
        {[...Array(6)].map((_, i) => {
          const angle = (i * 360) / 6 + 15;
          return (
            <g key={`house-${i}`} transform={`rotate(${angle}) translate(0, -218)`}>
              {/* Mái nhà tam giác */}
              <polygon points="0,-16 -14,0 14,0" fill={color} stroke={accentColor} strokeWidth="0.8" />
              {/* Thân nhà */}
              <rect x="-10" y="0" width="20" height="12" fill="none" stroke={color} strokeWidth="1.8" />
              {/* Cột nhà sàn */}
              <line x1="-7" y1="12" x2="-7" y2="22" stroke={color} strokeWidth="1.8" />
              <line x1="7" y1="12" x2="7" y2="22" stroke={color} strokeWidth="1.8" />
            </g>
          );
        })}

        <circle r="186" stroke={color} strokeWidth="4" />

        {/* ====================================================== */}
        {/* VÀNH 2: Chấm nổi và hoa văn chữ S gãy khúc liên hoàn */}
        {/* ====================================================== */}
        <circle r="170" stroke={accentColor} strokeWidth="2" strokeDasharray="5 5" />
        <circle r="156" stroke={color} strokeWidth="3" />

        {/* Chấm tròn nổi mịn 24 điểm */}
        {[...Array(24)].map((_, i) => {
          const angle = (i * 360) / 24;
          const r = angle * Math.PI / 180;
          const cx = Math.cos(r) * 163; const cy = Math.sin(r) * 163;
          return <circle key={`dot-outer-${i}`} cx={cx} cy={cy} r="5" fill={color} />;
        })}

        {/* Hoa văn chữ S gãy khúc liên hoàn (văn kỷ hà) */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          const midR = 156;
          const r = angle * Math.PI / 180;
          const cx = Math.cos(r) * midR; const cy = Math.sin(r) * midR;
          return (
            <g key={`s-fret-${i}`} transform={`translate(${cx},${cy}) rotate(${angle + 90})`}>
              <path d="M-5,-8 C-5,-3 0,-3 0,0 C0,3 5,3 5,8"
                stroke={color} strokeWidth="2" fill="none" />
            </g>
          );
        })}

        <circle r="138" stroke={color} strokeWidth="3" />
        <circle r="124" stroke={accentColor} strokeWidth="2" strokeDasharray="4 4" />

        {/* Chấm tròn vòng trong */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          const r = angle * Math.PI / 180;
          const cx = Math.cos(r) * 131; const cy = Math.sin(r) * 131;
          return <circle key={`dot-inner-${i}`} cx={cx} cy={cy} r="4" fill={accentColor} />;
        })}

        {/* ====================================================== */}
        {/* VÀNH 1 (TÂM): Ngôi sao 14 cánh sắc nét màu Vàng Hoàng Kim */}
        {/* ====================================================== */}
        <circle r="112" stroke={color} strokeWidth="4" />
        <circle r="96" stroke={accentColor} strokeWidth="2" strokeDasharray="4 3" />

        {/* 14 Cánh sao chính nhọn và nổi bật */}
        {[...Array(14)].map((_, i) => {
          const angle = (i * 360) / 14;
          return (
            <g key={`star14-${i}`} transform={`rotate(${angle})`}>
              {/* Cánh sao dài, nhọn */}
              <polygon points="0,-108 -11,-42 0,-18 11,-42" fill={color} stroke={accentColor} strokeWidth="0.8" />
              {/* Cánh sao phụ giữa hai cánh chính */}
              <polygon points="0,-60 -5,-44 0,-36 5,-44" fill={accentColor} />
            </g>
          );
        })}

        {/* Vòng tâm đặc bao quanh núm */}
        <circle r="18" fill={color} />
        <circle r="12" fill={accentColor} />
        <circle r="7" fill="#7F1D1D" />
      </g>
    </svg>
  );
}
