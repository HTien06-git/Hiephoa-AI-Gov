import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, X, ChevronRight, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

/**
 * Thông Báo Nhắc Kết Quả Hồ Sơ Trên Thiết Bị Người Dân (Device Application Notification Toast)
 * - Tự động ghi nhớ các mã hồ sơ người dân đã tạo hoặc tra cứu trên thiết bị này qua localStorage.
 * - Polling ngầm trạng thái xử lý hồ sơ từ Cán bộ Một cửa.
 * - Khi hồ sơ được TIẾP NHẬN (Processing), HOÀN TẤT (Completed) hoặc CẦN BỔ SUNG:
 *   Hiển thị thông báo nổi bật nhắc bà con xem kết quả kèm nút bấm mở ngay modal tra cứu.
 */
export default function CitizenDeviceNotificationToast({ onOpenLookupWithCode, speakText }) {
  const [activeAlert, setActiveAlert] = useState(null);
  const [dismissedMap, setDismissedMap] = useState({});
  const lastSpokenStatusRef = useRef({});

  useEffect(() => {
    const checkTrackedSubmissions = async () => {
      try {
        let codes = [];
        try {
          codes = JSON.parse(localStorage.getItem('hh_tracked_submissions') || '[]');
        } catch (e) {
          codes = [];
        }

        // Lấy tối đa 5 mã hồ sơ gần nhất mà người dân đã tạo hoặc tra cứu
        const codesToCheck = codes.length > 0 ? codes.slice(0, 5) : ['HH-1022'];

        for (const code of codesToCheck) {
          try {
            const res = await apiClient.getSubmission(code);
            if (res && res.success && res.submission) {
              const sub = res.submission;
              const statusKey = `${sub.submissionCode}_${sub.status}_${sub.updatedAt}`;

              // Nếu trạng thái chưa bị người dân đóng
              if (!dismissedMap[statusKey]) {
                setActiveAlert(sub);

                // Đọc giọng nói nhắc nhở 1 lần khi có trạng thái mới
                if (speakText && lastSpokenStatusRef.current[sub.submissionCode] !== sub.status) {
                  lastSpokenStatusRef.current[sub.submissionCode] = sub.status;
                  if (sub.status === 'COMPLETED') {
                    speakText(`Thông báo từ UBND xã Hiệp Hòa: Hồ sơ ${sub.submissionCode} của bà con đã được xử lý xong. Kính mời bà con xem kết quả và bấm xác nhận đã nhận thông tin!`);
                  } else if (sub.status === 'PROCESSING') {
                    speakText(`UBND xã Hiệp Hòa thông báo: Hồ sơ ${sub.submissionCode} của bà con đang được cán bộ một cửa thụ lý xử lý.`);
                  } else if (sub.status === 'NEEDS_SUPPLEMENT') {
                    speakText(`UBND xã Hiệp Hòa thông báo: Hồ sơ ${sub.submissionCode} cần bổ sung giấy tờ theo ghi chú của cán bộ.`);
                  }
                }
                break; // Ưu tiên hiển thị thông báo hồ sơ tìm thấy đầu tiên
              }
            }
          } catch (e) {
            // bỏ qua lỗi từng mã
          }
        }
      } catch (err) {
        // Polling im lặng không làm phiền người dùng
      }
    };

    // Kiểm tra ngay sau 1.5 giây khi mở trang và sau đó lặp lại mỗi 3 giây để đồng bộ tức thì
    const initialTimer = setTimeout(checkTrackedSubmissions, 1500);
    const interval = setInterval(checkTrackedSubmissions, 3000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissedMap, speakText]);

  if (!activeAlert) return null;

  const handleDismiss = () => {
    const statusKey = `${activeAlert.submissionCode}_${activeAlert.status}_${activeAlert.updatedAt}`;
    setDismissedMap(prev => ({ ...prev, [statusKey]: true }));
    setActiveAlert(null);
  };

  // Hành động: Đã nhận thông tin & Thoát -> Làm sạch lịch sử thiết bị
  const handleAcknowledgeAndExit = () => {
    try {
      // 1. Xóa danh sách hồ sơ theo dõi
      localStorage.removeItem('hh_tracked_submissions');
      // 2. Xóa phiên điền đơn trong sessionStorage
      sessionStorage.clear();
      // 3. Xóa các khóa lưu trữ nháp
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('hiep_hoa_') || k.startsWith('hh_'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {}

    // 4. Phát sự kiện toàn cục để form và modal làm sạch trắng tinh
    window.dispatchEvent(new CustomEvent('hh_clear_citizen_session'));

    if (speakText) {
      speakText('Bà con đã xác nhận nhận thông tin thành công. Toàn bộ lịch sử hồ sơ trên thiết bị đã được làm sạch để bà con an tâm nộp hồ sơ mới!');
    }

    setActiveAlert(null);
  };

  const handleView = () => {
    if (onOpenLookupWithCode) {
      onOpenLookupWithCode(activeAlert.submissionCode);
    }
    handleDismiss();
  };

  const isCompleted = activeAlert.status === 'COMPLETED';
  const isProcessing = activeAlert.status === 'PROCESSING';
  const isNeedsSupplement = activeAlert.status === 'NEEDS_SUPPLEMENT';

  return (
    <div 
      role="alert"
      aria-live="polite"
      className="fixed top-4 right-3 left-3 sm:left-auto sm:right-6 z-50 max-w-md animate-slide-in select-none"
    >
      <div className={`p-3.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.35)] border-2 backdrop-blur-md transition-all ${
        isCompleted
          ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#064E3B] text-white border-emerald-400'
          : isProcessing
          ? 'bg-gradient-to-r from-[#6B0F12] via-[#8B1418] to-[#5C0A0D] text-white border-amber-400'
          : isNeedsSupplement
          ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-950 text-white border-amber-300'
          : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-amber-400'
      }`}>
        <div className="flex items-start gap-2.5">
          {/* Biểu tượng trạng thái */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isCompleted
              ? 'bg-emerald-500 text-white'
              : isProcessing
              ? 'bg-amber-400 text-stone-950 animate-pulse'
              : 'bg-amber-500 text-stone-950'
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isProcessing ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : isNeedsSupplement ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>

          {/* Nội dung thông báo */}
          <div className="flex-1 min-w-0 pr-1 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/25">
                UBND XÃ HIỆP HÒA NHẮC BÁO
              </span>
              <span className="text-[10px] font-bold text-amber-300 font-mono">
                {activeAlert.submissionCode}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-black mt-1 leading-snug">
              {isCompleted ? (
                <span>🎉 Hồ sơ đã được xử lý xong! Mời bà con xem kết quả</span>
              ) : isProcessing ? (
                <span>⏱️ Cán bộ đang xử lý & in ấn tờ khai tại quầy Một cửa</span>
              ) : isNeedsSupplement ? (
                <span>⚠️ Cán bộ yêu cầu bổ sung giấy tờ</span>
              ) : (
                <span>🔔 Hồ sơ đang trong hàng đợi tiếp nhận trực tuyến</span>
              )}
            </h4>

            <p className="text-[11px] text-amber-100/90 mt-0.5 line-clamp-1">
              Thủ tục: <strong>{activeAlert.procedureTitle}</strong>
            </p>

            {/* Hàng nút tác vụ thông báo */}
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleView}
                className="px-3 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1 shadow-md active:scale-95 transition-all bg-amber-400 text-stone-950 hover:bg-amber-300"
              >
                <span>Xem chi tiết</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>

              {/* NÚT ĐÃ NHẬN THÔNG TIN & THOÁT (LÀM SẠCH LỊCH SỬ THIẾT BỊ) */}
              <button
                type="button"
                onClick={handleAcknowledgeAndExit}
                className="px-3 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1 shadow-md active:scale-95 transition-all bg-emerald-500 hover:bg-emerald-400 text-white border border-emerald-300 ring-2 ring-emerald-400/50"
                title="Bấm để xác nhận đã nhận thông tin và làm sạch lịch sử thiết bị để làm hồ sơ mới không bị đụng chạm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Đã nhận thông tin & Thoát</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-2 py-1.5 rounded-xl text-[11px] font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Để sau
              </button>
            </div>

            <p className="text-[10px] text-amber-200/80 mt-1.5 italic">
              💡 Bấm "Đã nhận thông tin & Thoát" sẽ xóa sạch lịch sử trên thiết bị để bà con làm hồ sơ mới không bị đụng chạm.
            </p>
          </div>

          {/* Nút đóng */}
          <button
            type="button"
            onClick={handleDismiss}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
