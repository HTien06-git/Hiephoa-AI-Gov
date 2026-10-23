import { useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'hiep_hoa_citizen_temp_data';

export function useZeroDataSession() {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [lastPurged, setLastPurged] = useState(null);

  // Auto clean up when browser tab/window is closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem(SESSION_KEY);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const updateFormData = useCallback((newValues) => {
    setFormData(prev => {
      const updated = { ...prev, ...newValues };
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const clearSecurityData = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setFormData({});
    setLastPurged(new Date().toLocaleTimeString('vi-VN'));
    console.log('[Zero-Data Retention] Toàn bộ dữ liệu cá nhân tạm thời đã được xóa sạch khỏi bộ nhớ trình duyệt.');
  }, []);

  return {
    formData,
    updateFormData,
    clearSecurityData,
    lastPurged,
    hasData: Object.keys(formData).length > 0
  };
}
