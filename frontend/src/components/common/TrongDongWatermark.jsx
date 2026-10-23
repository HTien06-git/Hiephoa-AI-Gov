import React from 'react';

/**
 * Component Mặt Trống Đồng Đông Sơn chi tiết (Trong Dong Dong Son Watermark)
 * Bao gồm:
 * - Ngôi sao 14 cánh sắc nét ở tâm
 * - Các vòng tròn đồng tâm với hoa văn răng cưa, chấm dải, kỷ hà
 * - Vòng 16 chim Lạc bay ngược chiều kim đồng hồ
 * - Vòng 12 hình nhân nhảy múa lễ hội Đông Sơn
 */
export default function TrongDongWatermark({
  size = 500,
  className = "",
  color = "#F59E0B",
  opacity = 0.14,
  spin = false
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${spin ? 'animate-[spin_120s_linear_infinite]' : ''} ${className}`}
      style={{ opacity }}
      fill="none"
      stroke={color}
    >
      <g transform="translate(400, 400)">
        {/* Vành ngoài cùng: Vòng chỉ kép và chấm tròn */}
        <circle r="392" strokeWidth="4" />
        <circle r="382" strokeWidth="2" strokeDasharray="6 4" />
        <circle r="370" strokeWidth="3" />

        {/* Vành hoa văn kỷ hà / chữ gãy khúc Đông Sơn */}
        <circle r="352" strokeWidth="1.5" strokeDasharray="10 6" />
        <circle r="338" strokeWidth="2.5" />

        {/* Vành 16 Chim Lạc sải cánh bay ngược chiều kim đồng hồ */}
        <circle r="320" strokeWidth="1.5" strokeDasharray="4 4" />
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={`lac-bird-${i}`} transform={`rotate(${angle}) translate(0, -290)`}>
              {/* Thân và bụng chim Lạc */}
              <path
                d="M-26,0 C-14,-9 12,-9 26,0 C14,-4 0,-5 -16,-2 Z"
                fill={color}
              />
              {/* Mỏ dài thanh thoát */}
              <path
                d="M26,0 L38,-7 L25,-2 Z"
                fill={color}
              />
              {/* Đôi cánh dài dang rộng vút cao */}
              <path
                d="M-2,-4 C-10,-22 -18,-26 -34,-24 C-20,-18 -12,-9 -4,-4 Z"
                fill={color}
              />
              {/* Đuôi xòe dài */}
              <path
                d="M-26,0 L-38,4 L-24,1 Z"
                fill={color}
              />
            </g>
          );
        })}
        <circle r="260" strokeWidth="3" />

        {/* Vành hoa văn răng cưa / răng chó */}
        <circle r="246" strokeWidth="1.5" strokeDasharray="5 5" />
        <circle r="232" strokeWidth="2.5" />

        {/* Vành 12 Hình nhân hóa trang lông chim nhảy múa hội mùa */}
        <circle r="216" strokeWidth="1.5" strokeDasharray="6 4" />
        {[...Array(12)].map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <g key={`dancer-${i}`} transform={`rotate(${angle}) translate(0, -196)`}>
              <circle cx="0" cy="-7" r="3.5" fill={color} />
              <line x1="0" y1="-3" x2="0" y2="9" strokeWidth="2.5" stroke={color} />
              <line x1="-9" y1="2" x2="9" y2="2" strokeWidth="2" stroke={color} />
              <line x1="0" y1="9" x2="-7" y2="17" strokeWidth="2" stroke={color} />
              <line x1="0" y1="9" x2="7" y2="17" strokeWidth="2" stroke={color} />
            </g>
          );
        })}
        <circle r="176" strokeWidth="3" />

        {/* Vành hoa văn vòng tròn đồng tâm có chấm giữa */}
        <circle r="162" strokeWidth="2" strokeDasharray="4 4" />
        <circle r="148" strokeWidth="2.5" />
        <circle r="130" strokeWidth="1.5" strokeDasharray="5 5" />

        {/* Vành bao quanh cụm Mặt Trời */}
        <circle r="110" strokeWidth="3" />

        {/* Mặt trời / Ngôi sao 14 cánh ở trung tâm Trống Đồng */}
        {[...Array(14)].map((_, i) => {
          const angle = (i * 360) / 14;
          return (
            <g key={`star-ray-${i}`} transform={`rotate(${angle})`}>
              {/* Tia sao nhọn hoắt vươn ra ngoài */}
              <polygon
                points="0,-106 -10,-36 0,-16 10,-36"
                fill={color}
              />
              {/* Họa tiết lông công / tam giác giữa hai tia */}
              <polygon
                points="0,-16 6,-32 0,-36 -6,-32"
                fill={color}
                opacity="0.6"
              />
            </g>
          );
        })}

        {/* Núm tròn ở chính giữa tâm trống */}
        <circle r="16" fill={color} />
        <circle r="8" fill="#7F1D1D" />
      </g>
    </svg>
  );
}
