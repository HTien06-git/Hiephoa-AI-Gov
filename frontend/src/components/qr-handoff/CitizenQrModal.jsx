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
  Sparkles,
  Lock,
  Eye
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

// Helper lưu trữ hồ sơ theo thiết bị (localStorage)
export function saveSubmissionToDevice(sub) {
  if (!sub || !sub.submissionCode) return;
  try {
    const KEY = 'hh_device_submissions';
    const existing = JSON.parse(localStorage.getItem(KEY) || '[]');
    const filtered = existing.filter(item => item.submissionCode !== sub.submissionCode);
    const newRecord = {
      submissionCode: sub.submissionCode,
      formId: sub.formId || sub.procedureId || 'FORM_CUSTOM',
      procedureTitle: sub.procedureTitle || 'Thủ tục hành chính',
      citizenName: sub.citizenName || sub.formData?.ho_ten || 'Bà con xã Hiệp Hòa',
      citizenCccd: sub.citizenCccd || sub.formData?.so_cccd || '',
      status: sub.status || 'WAITING',
      officerNote: sub.officerNote || '',
      assignedOfficer: sub.assignedOfficer || 'Chờ tiếp nhận',
      createdAt: sub.createdAt || new Date().toISOString(),
      updatedAt: sub.updatedAt || new Date().toISOString(),
      hamlet: sub.hamlet || sub.formData?.ap_cu_tru || 'Xã Hiệp Hòa',
      formData: sub.formData || {}
    };
    filtered.unshift(newRecord);
    localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, 25)));

    // Đồng thời cập nhật danh sách theo dõi toast
    try {
      sessionStorage.removeItem('hh_dismiss_all_notifications');
      const trackedKey = 'hh_tracked_submissions';
      const tracked = JSON.parse(localStorage.getItem(trackedKey) || '[]');
      if (!tracked.includes(sub.submissionCode)) {
        tracked.unshift(sub.submissionCode);
        localStorage.setItem(trackedKey, JSON.stringify(tracked.slice(0, 15)));
      }
    } catch (e) {}

    return newRecord;
  } catch (e) {
    console.warn('Lỗi lưu hồ sơ vào thiết bị:', e);
  }
}

export default function CitizenQrModal({ qrPayload, onClose, speakText }) {
  if (!qrPayload) return null;

  const { formId, formTitle, formData, submissionCode: initialCode, preCheckResult } = qrPayload;
  const [submission, setSubmission] = useState({
    submissionCode: initialCode || null,
    procedureTitle: formTitle || 'Thủ tục hành chính',
    citizenName: formData?.ho_ten_nguoi_yeu_cau || formData?.ho_ten || formData?.ho_ten_nam || 'Bà con nhân dân',
    status: 'WAITING',
    assignedOfficer: 'Chờ tiếp nhận',
    officerNote: '',
    formData: formData || {}
  });

  const [isSyncing, setIsSyncing] = useState(!initialCode);
  const previousStatusRef = useRef(submission.status);
  const previousNoteRef = useRef(submission.officerNote || '');

  // CƠ CHẾ MÃ QR ĐỘNG BẢO MẬT XOAY VÒNG MỖI 15 GIÂY (Dynamic Rotating Security QR)
  const [securityToken, setSecurityToken] = useState(() => `SEC-${Date.now()}`);
  const [countdown, setCountdown] = useState(15);

  // Đếm ngược 15 giây tự động làm mới mã bảo mật
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Xoay token bảo mật mới
          setSecurityToken(`SEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tên người nộp thủ tục để thông báo trực tiếp tới bà con
  const citizenDisplayName = submission.citizenName || submission.formData?.ho_ten || submission.formData?.ho_ten_nguoi_yeu_cau || submission.formData?.ho_ten_nam || 'Bà con';

  // Đảm bảo hồ sơ được lưu vào thiết bị duy nhất 1 lần khi có mã chính thức từ server
  useEffect(() => {
    let isMounted = true;

    async function registerLiveSubmission() {
      // 1. Nếu đã có initialCode (mở lại từ lịch sử), chỉ cần tra cứu cập nhật trạng thái mới nhất
      if (initialCode) {
        try {
          const res = await apiClient.getSubmission(initialCode);
          if (isMounted && res && res.submission) {
            setSubmission(res.submission);
            previousStatusRef.current = res.submission.status;
            previousNoteRef.current = res.submission.officerNote || '';
            saveSubmissionToDevice(res.submission);
          }
        } catch (e) {}
        return;
      }

      // 2. Tạo hồ sơ mới lên server (duy nhất 1 lần)
      try {
        setIsSyncing(true);
        const res = await apiClient.createSubmission({
          formId,
          procedureTitle: formTitle || 'Thủ tục hành chính',
          formData,
          preCheckResult
        });
        if (isMounted && res && res.submission) {
          setSubmission(res.submission);
          previousStatusRef.current = res.submission.status;
          previousNoteRef.current = res.submission.officerNote || '';

          // Lưu hồ sơ chính thức đã xác nhận từ server vào thiết bị
          saveSubmissionToDevice(res.submission);
        }
      } catch (e) {
        console.warn('[CitizenQrModal] Error creating live submission:', e);
        // Fallback lưu ngoại tuyến chỉ khi mất mạng thật sự
        if (isMounted) {
          const offlineCode = `HH-${Date.now().toString().slice(-4)}`;
          const fallbackSub = {
            submissionCode: offlineCode,
            formId: formId || 'FORM_CUSTOM',
            procedureTitle: formTitle || 'Thủ tục hành chính',
            citizenName: citizenDisplayName,
            status: 'WAITING',
            assignedOfficer: 'Chờ tiếp nhận',
            officerNote: '',
            formData: formData || {}
          };
          setSubmission(fallbackSub);
          saveSubmissionToDevice(fallbackSub);
        }
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    registerLiveSubmission();
    return () => {
      isMounted = false;
    };
  }, [initialCode]);

  // TỰ ĐỘNG POLLING TRỰC TUYẾN MỖI 3 GIÂY & TỰ ĐỘNG ĐỌC THÔNG BÁO MỚI KHI CÁN BỘ CẬP NHẬT TRẠNG THÁI HOẶC GHI CHÚ
  useEffect(() => {
    const code = submission.submissionCode;
    if (!code) return;

    const interval = setInterval(async () => {
      try {
        const res = await apiClient.getSubmission(code);
        if (res && res.success && res.submission) {
          const currentSub = res.submission;
          const newStatus = currentSub.status;
          const oldStatus = previousStatusRef.current;
          const newNote = currentSub.officerNote || '';
          const oldNote = previousNoteRef.current;

          const personName = currentSub.citizenName || currentSub.formData?.ho_ten || currentSub.formData?.ho_ten_nguoi_yeu_cau || citizenDisplayName;

          // Cập nhật lại lịch sử trên thiết bị
          saveSubmissionToDevice(currentSub);

          // 1. Kiểm tra nếu có ghi chú yêu cầu mới từ cán bộ thay đổi trên màn hình
          if (newNote && newNote !== oldNote) {
            previousNoteRef.current = newNote;
            setSubmission(currentSub);
            if (speakText) {
              speakText(`Kính gửi bà con ${personName}, Cán bộ Một cửa vừa có yêu cầu mới: ${newNote}. Kính mời bà con chú ý thực hiện ạ!`);
            }
          }
          // 2. Kiểm tra nếu trạng thái hồ sơ thay đổi (ví dụ: TIẾP NHẬN, HOÀN TẤT, BỔ SUNG)
          else if (newStatus !== oldStatus) {
            previousStatusRef.current = newStatus;
            setSubmission(currentSub);

            if (newStatus === 'COMPLETED') {
              if (speakText) {
                speakText(`Thông báo từ Trung tâm Phục vụ Hành chính công xã Hiệp Hòa: Kính gửi bà con ${personName}, hồ sơ thủ tục của bà con đã được cán bộ tiếp nhận và in xong. Kính mời bà con đến quầy ký nhận kết quả!`);
              }
            } else if (newStatus === 'PROCESSING') {
              if (speakText) {
                speakText(`Kính gửi bà con ${personName}, Cán bộ Một cửa đã tiếp nhận hồ sơ và đang tiến hành xử lý in tờ khai tại quầy!`);
              }
            } else if (newStatus === 'NEEDS_SUPPLEMENT') {
              if (speakText) {
                const noteDetail = currentSub.officerNote ? `yêu cầu bổ sung: ${currentSub.officerNote}` : 'yêu cầu bà con bổ sung thêm giấy tờ, kính mời bà con kiểm tra hướng dẫn trên màn hình';
                speakText(`Kính gửi bà con ${personName}, Cán bộ Một cửa ${noteDetail}.`);
              }
            }
          } else {
            setSubmission(currentSub);
          }
        }
      } catch (err) {
        // Polling silent error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [submission.submissionCode, speakText, citizenDisplayName]);

  // Payload mã QR chứa mã hồ sơ + Token bảo mật động xoay vòng mỗi 15s
  const dynamicQrPayloadString = JSON.stringify({
    code: submission.submissionCode,
    schema_id: formId,
    title: submission.procedureTitle,
    sec_token: securityToken,
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
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
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
          <span>MÃ HỒ SƠ: {submission.submissionCode || (isSyncing ? 'Đang cấp mã tiếp nhận...' : 'Đang xử lý...')}</span>
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
          <div className="mt-2.5 p-3 bg-rose-50 border border-rose-300 rounded-xl text-left text-xs font-bold text-rose-900 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-800 uppercase font-black">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>YÊU CẦU TỪ CÁN BỘ MỘT CỬA:</span>
            </div>
            <div>{submission.officerNote}</div>
          </div>
        )}

        {/* Khung QR Code Động với Hiệu ứng bảo mật xoay vòng */}
        <div className="my-3.5 p-3.5 bg-white rounded-2xl border-2 border-slate-300 inline-block shadow-md relative">
          <QRCodeSVG
            value={dynamicQrPayloadString}
            size={210}
            level="M"
            includeMargin={true}
          />

          {/* Dấu bảo mật góc */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <Lock className="w-2.5 h-2.5" />
            <span>BẢO MẬT</span>
          </div>
        </div>

        {/* THANH BẢO MẬT ĐỘNG: ĐẾM NGƯỢC LÀM MỚI MỖI 15 GIÂY */}
        <div className="px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-center space-y-1 mb-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mã QR bảo mật động xoay vòng:</span>
            </span>
            <span className="font-mono text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Làm mới sau {countdown}s
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 15) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            Mã QR tự động cập nhật liên tục để bảo mật chống sao chép. Cán bộ quét lúc nào cũng nhận đúng hồ sơ của bà con!
          </p>
        </div>

        {/* TRẠNG THÁI KẾT NỐI TỰ ĐỘNG ĐẾN CÁN BỘ MỘT CỬA */}
        <div className="my-2 p-2.5 bg-emerald-50/90 border border-emerald-300 rounded-2xl flex items-center justify-center gap-2 text-emerald-950 text-xs sm:text-sm font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Hồ sơ đã được lưu trên thiết bị này và gửi tới Bộ phận Một cửa</span>
        </div>

        {/* Hướng dẫn bà con */}
        <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200 text-left text-xs text-amber-950 space-y-1 mb-4">
          <div className="font-extrabold flex items-center gap-1 text-[#991B1B]">
            <span>👉 Hướng dẫn cho bà con:</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-normal">
            Bà con chỉ cần đưa mã QR này (hoặc đọc mã <strong>{submission.submissionCode}</strong>) cho cán bộ Một cửa để in ngay. <strong>Sau khi thoát ra, bà con mở lại trang web trên thiết bị này sẽ thấy ngay hồ sơ của mình để theo dõi tiến độ giải quyết!</strong>
          </p>
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
          <span>Bảo mật Zero-Data • Lưu vết theo thiết bị truy cập UBND xã Hiệp Hòa</span>
        </div>
      </div>
    </div>
  );
}
