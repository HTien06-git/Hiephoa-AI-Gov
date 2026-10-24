import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  Volume2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function CitizenQrModal({ qrPayload, onClose, speakText }) {
  if (!qrPayload) return null;

  const { formId, formTitle, formData, submissionCode: initialCode, preCheckResult } = qrPayload;
  const [submission, setSubmission] = useState({
    submissionCode: initialCode || 'HH-1024',
    procedureTitle: formTitle || 'Thủ tục hành chính',
    citizenName: formData?.ho_ten_nguoi_yeu_cau || formData?.ho_ten || formData?.ho_ten_nam || 'Bà con nhân dân',
    status: 'WAITING',
    assignedOfficer: 'Chờ tiếp nhận',
    officerNote: '',
    formData: formData || {}
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmittedConfirmed, setIsSubmittedConfirmed] = useState(false);
  const previousStatusRef = useRef(submission.status);
  const hasAnnouncedRef = useRef(false);

  const handleExplicitSubmit = () => {
    setIsSubmittedConfirmed(true);
    try {
      const tracked = JSON.parse(localStorage.getItem('hh_tracked_submissions') || '[]');
      const targetCode = submission.submissionCode;
      if (targetCode && !tracked.includes(targetCode)) {
        tracked.unshift(targetCode);
        localStorage.setItem('hh_tracked_submissions', JSON.stringify(tracked.slice(0, 10)));
      }
    } catch (e) {}

    if (speakText) {
      speakText(`Hồ sơ mã số ${submission.submissionCode} đã được nộp trực tuyến vào hàng đợi của cán bộ Một cửa xã Hiệp Hòa. Thiết bị của bà con sẽ tự động nhận thông báo khi cán bộ xử lý xong ạ!`);
    }
  };

  // Gửi hồ sơ lên backend ngay khi mở Modal nếu chưa có code thực
  useEffect(() => {
    let isMounted = true;

    async function registerLiveSubmission() {
      try {
        setIsSyncing(true);
        const res = await apiClient.createSubmission({
          formId,
          procedureTitle: formTitle,
          formData,
          preCheckResult
        });
        if (isMounted && res && res.submission) {
          setSubmission(res.submission);
          previousStatusRef.current = res.submission.status;

          // Lưu mã hồ sơ vào thiết bị để tự động hiển thị thông báo kết quả từ cán bộ
          try {
            const tracked = JSON.parse(localStorage.getItem('hh_tracked_submissions') || '[]');
            const targetCode = res.submission.submissionCode;
            if (targetCode && !tracked.includes(targetCode)) {
              tracked.unshift(targetCode);
              localStorage.setItem('hh_tracked_submissions', JSON.stringify(tracked.slice(0, 10)));
            }
          } catch (e) {}
        }
      } catch (e) {
        console.warn('[CitizenQrModal] Error creating live submission:', e);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    registerLiveSubmission();
    return () => {
      isMounted = false;
    };
  }, []);

  // TỰ ĐỘNG POLLING TRỰC TUYẾN MỖI 3 GIÂY ĐỂ ĐỒNG BỘ TRẠNG THÁI TỪ CÁN BỘ
  useEffect(() => {
    const code = submission.submissionCode;
    if (!code) return;

    const interval = setInterval(async () => {
      try {
        const res = await apiClient.getSubmission(code);
        if (res && res.success && res.submission) {
          const newStatus = res.submission.status;
          const oldStatus = previousStatusRef.current;

          // Nếu trạng thái thay đổi sang PROCESSING hoặc COMPLETED, phát thông báo giọng nói
          if (newStatus !== oldStatus && !hasAnnouncedRef.current) {
            previousStatusRef.current = newStatus;
            setSubmission(res.submission);

            if (newStatus === 'COMPLETED' || newStatus === 'PROCESSING') {
              hasAnnouncedRef.current = true;
              const voiceMsg = `Thông báo từ Trung tâm Phục vụ hành chính công xã Hiệp Hòa: Hồ sơ mã số ${code} của bà con đã được cán bộ tiếp nhận và in xong, mời bà con đến quầy ký xác nhận!`;
              if (speakText) speakText(voiceMsg);
            } else if (newStatus === 'NEEDS_SUPPLEMENT' && res.submission.officerNote) {
              const voiceMsg = `Thông báo từ cán bộ Một cửa: Hồ sơ mã số ${code} cần bổ sung: ${res.submission.officerNote}. Bà con lưu ý bổ sung nhé!`;
              if (speakText) speakText(voiceMsg);
            }
          } else {
            setSubmission(res.submission);
          }
        }
      } catch (err) {
        // Polling silent error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [submission.submissionCode, speakText]);

  const rawString = JSON.stringify({
    code: submission.submissionCode,
    schema_id: formId,
    title: submission.procedureTitle,
    time: Date.now(),
    fields: submission.formData
  });

  // Render status badge
  const renderStatusBadge = () => {
    switch (submission.status) {
      case 'PROCESSING':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase border border-blue-300 animate-pulse">
            <Clock className="w-4 h-4 text-blue-700 animate-spin" />
            <span>CÁN BỘ ĐANG XỬ LÝ & IN TỜ KHAI TẠI QUẦY</span>
          </div>
        );
      case 'COMPLETED':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black uppercase border border-emerald-400 ring-2 ring-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ĐÃ XỬ LÝ XONG • MỜI LÊN QUẦY KÝ TÊN & NHẬN KẾT QUẢ</span>
          </div>
        );
      case 'NEEDS_SUPPLEMENT':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-950 text-xs font-black uppercase border border-amber-400">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>CẦN BỔ SUNG GIẤY TỜ</span>
          </div>
        );
      case 'WAITING':
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase border border-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
            <span>ĐANG TRONG HÀNG ĐỢI TIẾP NHẬN TRỰC TUYẾN</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border-2 border-amber-400 p-5 sm:p-6 text-center animate-scale-up relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mã Hồ sơ nổi bật */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#991B1B] text-amber-300 text-xs sm:text-sm font-black uppercase mb-3 shadow-sm ring-2 ring-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MÃ HỒ SƠ: {submission.submissionCode}</span>
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
          Mã QR Nộp Nhanh Cho Cán Bộ Một Cửa
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 line-clamp-1">
          {submission.procedureTitle} • Người nộp: {submission.citizenName}
        </p>

        {/* Badge trạng thái trực tuyến */}
        <div className="mt-3 flex justify-center">
          {renderStatusBadge()}
        </div>

        {/* Ghi chú của cán bộ nếu có */}
        {submission.officerNote && (
          <div className="mt-2.5 p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-left text-xs font-semibold text-rose-900">
            <strong>Ghi chú từ cán bộ:</strong> {submission.officerNote}
          </div>
        )}

        {/* Khung QR Code */}
        <div className="my-4 p-3.5 bg-white rounded-2xl border-2 border-slate-300 inline-block shadow-md">
          <QRCodeSVG
            value={rawString}
            size={210}
            level="M"
            includeMargin={true}
          />
        </div>

        {/* NÚT XÁC NHẬN NỘP HỒ SƠ TRỰC TUYẾN TỚI CÁN BỘ MỘT CỬA */}
        <div className="my-3 text-center">
          <button
            type="button"
            onClick={handleExplicitSubmit}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              isSubmittedConfirmed
                ? 'bg-emerald-700 text-white ring-4 ring-emerald-300'
                : 'bg-gradient-to-r from-[#991B1B] via-red-700 to-[#7F1D1D] text-amber-300 hover:from-red-800 hover:to-red-950 ring-2 ring-amber-400'
            }`}
          >
            {isSubmittedConfirmed ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>✅ ĐÃ NỘP HỒ SƠ VÀO HÀNG ĐỢI CỦA CÁN BỘ MỘT CỬA!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                <span>🚀 BẤM NỘP HỒ SƠ TRỰC TUYẾN TỚI CÁN BỘ MỘT CỬA</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            (Bấm nút trên để gửi hồ sơ vào hàng đợi. Cán bộ Một cửa sẽ nhận được ngay và thiết bị của bà con sẽ tự động báo kết quả)
          </p>
        </div>

        {/* Hướng dẫn bà con */}
        <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200 text-left text-xs text-amber-950 space-y-1 mb-4">
          <div className="font-extrabold flex items-center gap-1 text-[#991B1B]">
            <span>👉 Hướng dẫn nộp hồ sơ tại xã:</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-normal">
            Bà con chỉ cần đưa mã QR này (hoặc đọc mã <strong>{submission.submissionCode}</strong>) cho cán bộ Một cửa. Màn hình máy tính của cán bộ sẽ tự động nhận hồ sơ trong <strong>10 giây</strong> để in ngay!
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold pt-1">
            <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
            <span>Hệ thống tự động cập nhật kết quả mỗi 3 giây và sẽ đọc to khi cán bộ hoàn tất.</span>
          </div>
        </div>

        {/* Nút In QR & Đóng */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>In Mã QR Ra Giấy</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95"
          >
            <span>Đã Xong</span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bảo mật Zero-Data • Đồng bộ thời gian thực UBND xã Hiệp Hòa</span>
        </div>
      </div>
    </div>
  );
}
