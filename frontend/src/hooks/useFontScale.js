import { useState, useEffect } from 'react';

/**
 * Hook điều khiển kích thước chữ cho người lớn tuổi:
 * - normal: 18px (Chữ vừa - A)
 * - large: 22px (Chữ to - A+)
 * - xlarge: 26px (Chữ siêu to - A++)
 */
export function useFontScale() {
  const [scale, setScale] = useState(() => {
    return localStorage.getItem('hiep_hoa_font_scale') || 'normal';
  });

  useEffect(() => {
    let size = '16px';
    if (scale === 'large') size = '18px';
    if (scale === 'xlarge') size = '20px';

    document.documentElement.style.setProperty('--base-font-size', size);
    localStorage.setItem('hiep_hoa_font_scale', scale);
  }, [scale]);

  return {
    scale,
    setScale,
    isNormal: scale === 'normal',
    isLarge: scale === 'large',
    isXLarge: scale === 'xlarge'
  };
}
