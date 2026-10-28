import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Phone,
  FileText,
  Sparkles,
  RefreshCw,
  Mic,
  Volume2,
  HelpCircle,
  Smartphone,
  QrCode,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import SatisfactionRating from '../common/SatisfactionRating';
import CitizenQrModal from './CitizenQrModal';

// Lấy danh sách hồ sơ trên thiết bị từ localStorage
export function getDeviceSubmissions() {
  try {
    const KEY = 'hh_device_submissions';
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    let list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    // Tự động dọn dẹp các hồ sơ tạm trùng lặp do phiên bản cũ sinh ra (ví dụ: HH-1024 tạm khi đã có hồ sơ chính thức)
    const hasOfficial = list.some(s => s.submissionCode && s.submissionCode !== 'HH-1024');
    if (hasOfficial) {
      const cleaned = list.filter(s => {
        if (s.submissionCode === 'HH-1024') {
          // Nếu đã có hồ sơ thật cùng tên công dân hoặc cùng tên thủ tục thì loại bỏ mã tạm HH-1024
          const matchReal = list.find(o => o.submissionCode !== 'HH-1024' && (o.citizenName === s.citizenName || o.procedureTitle === s.procedureTitle));
          if (matchReal) return false;
        }
        return true;
      });
      if (cleaned.length !== list.length) {
        localStorage.setItem(KEY, JSON.stringify(cleaned));
        list = cleaned;
      }
    }
    return list;
  } catch (e) {
    return [];
  }
}

// Xóa 1 hồ sơ khỏi bộ nhớ thiết bị
export function removeDeviceSubmission(code) {
  try {
    const KEY = 'hh_device_submissions';
    const list = getDeviceSubmissions().filter(s => s.submissionCode !== code);
    localStorage.setItem(KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    return [];
  }
}

// Chuyển đổi giọng nói tiếng Việt (số, chữ) thành mã số CCCD hoặc mã hồ sơ
export function parseSpokenQuery(text) {
  if (!text) return '';
  let str = text.toLowerCase()
    .replace(/[,.]/g, ' ')
    .replace(/\bhát\s+hát\b/g, 'HH-')
    .replace(/\bhát\b/g, 'H')
    .replace(/\bh\s+h\b/g, 'HH-')
    .replace(/\bhắc\s+hắc\b/g, 'HH-')
    .replace(/\bkhông\b/g, '0')
    .replace(/\bmột\b|\bmốt\b/g, '1')
    .replace(/\bhai\b/g, '2')
    .replace(/\bba\b/g, '3')
    .replace(/\bbốn\b|\btư\b/g, '4')
    .replace(/\bnăm\b|\blăm\b/g, '5')
    .replace(/\bsáu\b/g, '6')
    .replace(/\bbảy\b|\bbẩy\b/g, '7')
    .replace(/\btám\b/g, '8')
    .replace(/\bchín\b/g, '9');

  const hhMatch = str.match(/hh[-\s]?(\d{3,5})/i);
  if (hhMatch) {
    return `HH-${hhMatch[1]}`;
  }

  const digitsOnly = str.replace(/\D/g, '');
  if (digitsOnly.length >= 9) {
    return digitsOnly;
  }

  if (digitsOnly.length >= 3 && digitsOnly.length <= 6) {
    return `HH-${digitsOnly}`;
  }

  return str.trim();
}

export default function CitizenLookupModal({ onClose, speakText, initialQuery = '' }) {
  // Tab: 'device' (Hồ sơ trên thiết bị này) hoặc 'search' (Tra cứu theo CCCD / mã)
  const initialDeviceList = getDeviceSubmissions();
  const [activeTab, setActiveTab] = useState(
    initialQuery ? 'search' : (initialDeviceList.length > 0 ? 'device' : 'search')
  );

  const [deviceList, setDeviceList] = useState(initialDeviceList);
  const [searchCode, setSearchCode] = useState(initialQuery);
  const [submission, setSubmission] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingDevice, setIsRefreshingDevice] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');

  // Xem lại mã QR bảo mật động
  const [activeQrModalData, setActiveQrModalData] = useState(null);

  const { isListening, toggleListening } = useSpeechRecognition({
    onResult: (text) => {
      if (text && text.trim().length > 0) {
        const parsed = parseSpokenQuery(text);
        if (parsed) {
          setSearchCode(parsed);
          setVoiceNotice(`Đã nghe: "${parsed}"`);
          handleLookup(parsed);
          setTimeout(() => setVoiceNotice(''), 4000);
        }
      }
    }
  });

  // Tự động đồng bộ trạng thái mới nhất từ server cho các hồ sơ trên thiết bị
  const refreshDeviceSubmissions = async () => {
    const list = getDeviceSubmissions();
    if (!list || list.length === 0) {
      setDeviceList([]);
      return;
    }
    setIsRefreshingDevice(true);
    try {
      const updatedList = await Promise.all(
        list.map(async (item) => {
          try {
            const res = await apiClient.getSubmission(item.submissionCode);
            if (res && res.success && res.submission) {
              return {
                ...item,
                status: res.submission.status,
                officerNote: res.submission.officerNote || '',
                assignedOfficer: res.submission.assignedOfficer || item.assignedOfficer,
                updatedAt: res.submission.updatedAt || item.updatedAt
              };
            }
          } catch (e) {}
          return item;
        })
      );
      setDeviceList(updatedList);
      localStorage.setItem('hh_device_submissions', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Lỗi refresh hồ sơ thiết bị:', e);
    } finally {
      setIsRefreshingDevice(false);
    }
  };

  useEffect(() => {
    refreshDeviceSubmissions();
    // Tự động kiểm tra cập nhật mỗi 5 giây
    const interval = setInterval(refreshDeviceSubmissions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVoiceSearchClick = () => {
    if (isListening) {
      toggleListening();
    } else {
      if (speakText) {
        speakText('Bà con vui lòng đọc 12 số Căn cước công dân hoặc mã hồ sơ để em tra cứu giúp bà con nhé!');
      }
      toggleListening();
    }
  };

  const handleAiGuidanceVoice = () => {
    if (speakText) {
      speakText('Kính chào bà con! Bà con có thể xem lại ngay các hồ sơ đã nộp trên thiết bị này ở mục Hồ sơ trên thiết bị. Để tra cứu hồ sơ khác, bà con nhập 12 số Căn cước công dân hoặc chạm vào Micro để đọc mã hồ sơ ạ!');
    }
    setShowGuide(true);
  };

  const handleLookup = async (codeToSearch) => {
    const code = (codeToSearch || searchCode).trim();
    if (!code) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.getSubmission(code);
      if (res && res.success) {
        if (Array.isArray(res.submissions) && res.submissions.length > 1) {
          setSubmissionsList(res.submissions);
          setSubmission(res.submissions[0]);
        } else if (res.submission) {
          setSubmissionsList([res.submission]);
          setSubmission(res.submission);
        }

        // Lưu vào thiết bị để tự động hiển thị thông báo tiến độ
        try {
          sessionStorage.removeItem('hh_dismiss_all_notifications');
          const tracked = JSON.parse(localStorage.getItem('hh_tracked_submissions') || '[]');
          const targetCode = res.submission?.submissionCode;
          if (targetCode && !tracked.includes(targetCode)) {
            tracked.unshift(targetCode);
            localStorage.setItem('hh_tracked_submissions', JSON.stringify(tracked.slice(0, 10)));
          }
        } catch (e) {}

        if (speakText && res.submission) {
          speakSubmissionStatus(res.submission);
        }
      } else {
        setErrorMsg('Không tìm thấy hồ sơ với thông tin này. Bà con vui lòng kiểm tra lại số Căn cước công dân hoặc Mã hồ sơ (Ví dụ: 072096001234, HH-1021).');
        setSubmission(null);
        setSubmissionsList([]);
      }
    } catch (err) {
      setErrorMsg('Không thể tra cứu vào lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakSubmissionStatus = (sub) => {
    if (!speakText || !sub) return;
    const personName = sub.citizenName || sub.formData?.ho_ten || 'Bà con';
    const statusMap = {
      WAITING: `Hồ sơ ${sub.submissionCode} đang trong hàng đợi chờ tiếp nhận tại Bộ phận Một cửa xã Hiệp Hòa.`,
      PROCESSING: `Hồ sơ ${sub.submissionCode} đang được cán bộ thụ lý và in ấn tại quầy một cửa.`,
      COMPLETED: `Hồ sơ ${sub.submissionCode} đã được giải quyết xong hoàn tất. Kính mời bà con ${personName} đến quầy một cửa ký tên xác nhận và nhận kết quả.`,
      NEEDS_SUPPLEMENT: `Hồ sơ ${sub.submissionCode} có yêu cầu bổ sung từ cán bộ: ${sub.officerNote || 'Bà con vui lòng kiểm tra giấy tờ cần bổ sung'}.`
    };
    speakText(`Kính gửi bà con ${personName}: ${statusMap[sub.status] || 'Hồ sơ đang được xử lý.'}`);
  };

  const handleDeleteDeviceItem = (code, e) => {
    e.stopPropagation();
    if (window.confirm(`Bà con có chắc muốn xóa lịch sử hồ sơ ${code} khỏi thiết bị này không?`)) {
      const remaining = removeDeviceSubmission(code);
      setDeviceList(remaining);
      if (submission?.submissionCode === code) {
        setSubmission(null);
      }
    }
  };

  const handleOpenQrForDeviceItem = (item, e) => {
    e.stopPropagation();
    setActiveQrModalData({
      formId: item.formId || 'FORM_CUSTOM',
      formTitle: item.procedureTitle,
      submissionCode: item.submissionCode,
      formData: item.formData || {},
      citizenName: item.citizenName
    });
  };

  useEffect(() => {
    if (initialQuery) {
      setActiveTab('search');
      handleLookup(initialQuery);
    }
  }, [initialQuery]);

  // Polling mỗi 3s khi đang mở xem 1 hồ sơ
  useEffect(() => {
    if (!submission?.submissionCode) return;
    const interval = setInterval(async () => {
      try {
        const res = await apiClient.getSubmission(submission.submissionCode);
        if (res && res.success && res.submission) {
          setSubmission(res.submission);
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, [submission?.submissionCode]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border-2 border-amber-300 p-4 sm:p-6 text-left relative animate-scale-up my-auto max-h-[92vh] flex flex-col overflow-hidden">
          
          {/* Nút đóng */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tiêu đề Modal */}
          <div className="flex items-center gap-3 mb-3 shrink-0 pr-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#991B1B] to-red-600 text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Tra Cứu Tiến Độ Hồ Sơ Trực Tuyến
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                UBND xã Hiệp Hòa • Đồng bộ thời gian thực với Bộ phận Một cửa
              </p>
            </div>
          </div>

          {/* 2 TAB: HỒ SƠ TRÊN THIẾT BỊ NÀY & TÌM KIẾM THEO CCCD */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('device')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all min-w-0 ${
                activeTab === 'device'
                  ? 'bg-red-700 text-white shadow-sm ring-1 ring-red-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span className="truncate whitespace-nowrap">Hồ sơ trên máy này</span>
              {deviceList.length > 0 && (
                <span className={`px-2 py-0.2 rounded-full text-[11px] font-bold shrink-0 ${
                  activeTab === 'device' ? 'bg-amber-300 text-red-950' : 'bg-red-700 text-white'
                }`}>
                  {deviceList.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all min-w-0 ${
                activeTab === 'search'
                  ? 'bg-red-700 text-white shadow-sm ring-1 ring-red-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="truncate whitespace-nowrap">Tra cứu CCCD/Mã</span>
            </button>
          </div>

          {/* NỘI DUNG TAB 1: DANH SÁCH HỒ SƠ TRÊN THIẾT BỊ NÀY */}
          {activeTab === 'device' && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-1">
                <span className="font-bold flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Lịch sử nộp hồ sơ được lưu an toàn trên máy này:</span>
                </span>
                <button
                  type="button"
                  onClick={refreshDeviceSubmissions}
                  disabled={isRefreshingDevice}
                  className="text-[11px] font-bold text-red-700 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingDevice ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
              </div>

              {deviceList.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500">
                  <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Chưa có hồ sơ nào nộp trên thiết bị này</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Khi bà con hoàn tất điền đơn và bấm <strong>"Tạo Mã QR & Nộp"</strong>, hồ sơ sẽ tự động lưu lại đây để bà con theo dõi tiến độ giải quyết bất kỳ lúc nào!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('search')}
                    className="mt-4 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Tra cứu hồ sơ bằng CCCD hoặc Mã số
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {deviceList.map((item) => {
                    const isCompleted = item.status === 'COMPLETED';
                    const isProcessing = item.status === 'PROCESSING';
                    const isNeedsSupplement = item.status === 'NEEDS_SUPPLEMENT';

                    return (
                      <div
                        key={item.submissionCode}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          isCompleted
                            ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500 shadow-sm'
                            : isNeedsSupplement
                            ? 'bg-amber-50 border-amber-400 hover:border-amber-500 shadow-sm'
                            : isProcessing
                            ? 'bg-blue-50/70 border-blue-300 hover:border-blue-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#991B1B] text-amber-300 text-xs font-black tracking-wide">
                                {item.submissionCode}
                              </span>
                              <span className="text-xs text-slate-500">
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                }) : ''}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 leading-tight">
                              {item.procedureTitle}
                            </h4>
                            <p className="text-xs text-slate-600">
                              Người nộp: <strong>{item.citizenName}</strong>
                            </p>
                          </div>

                          {/* Nút xóa khỏi máy */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDeviceItem(item.submissionCode, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Xóa hồ sơ này khỏi thiết bị"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* TRẠNG THÁI HIỂN THỊ TRỰC QUAN */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200">
                          {isCompleted ? (
                            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-400 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>ĐÃ GIẢI QUYẾT XONG • MỜI BÀ CON ĐẾN QUẦY KÝ TÊN & NHẬN KẾT QUẢ</span>
                            </div>
                          ) : isProcessing ? (
                            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-950 text-xs font-black border border-blue-400 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-700 shrink-0 animate-spin" />
                              <span>CÁN BỘ ĐANG XỬ LÝ & IN TỜ KHAI TẠI QUẦY</span>
                            </div>
                          ) : isNeedsSupplement ? (
                            <div className="p-3 rounded-xl bg-amber-100 text-amber-950 text-xs font-bold border-2 border-amber-400 space-y-1">
                              <div className="flex items-center gap-1.5 text-amber-900 font-black">
                                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                                <span>CÁN BỘ YÊU CẦU BỔ SUNG GIẤY TỜ:</span>
                              </div>
                              <p className="text-slate-900 font-semibold pl-5 text-[11px] leading-relaxed">
                                {item.officerNote || 'Bà con vui lòng liên hệ quầy Một cửa để được hướng dẫn bổ sung chi tiết.'}
                              </p>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-black border border-amber-300 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping shrink-0" />
                              <span>ĐANG TRONG HÀNG ĐỢI TIẾP NHẬN TẠI BỘ PHẬN MỘT CỬA</span>
                            </div>
                          )}

                          {item.assignedOfficer && item.assignedOfficer !== 'Chờ tiếp nhận' && (
                            <div className="text-[11px] text-slate-600 mt-1.5 pl-1">
                              Cán bộ thụ lý: <strong>{item.assignedOfficer}</strong>
                            </div>
                          )}
                        </div>

                        {/* HÀNG NÚT HÀNH ĐỘNG CHO MỖI HỒ SƠ */}
                        <div className="mt-3 flex items-center gap-1.5 sm:gap-2 flex-wrap pt-2 border-t border-slate-100">
                          {/* Nút mở lại mã QR xoay vòng bảo mật */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenQrForDeviceItem(item, e)}
                            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#991B1B] hover:bg-red-800 text-amber-300 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all whitespace-nowrap"
                            title="Mở mã QR xoay vòng bảo mật để xuất trình cho cán bộ quét nhận diện"
                          >
                            <QrCode className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            <span>Mở Mã QR</span>
                          </button>

                          {/* Nút AI đọc tiến độ */}
                          <button
                            type="button"
                            onClick={() => speakSubmissionStatus(item)}
                            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 border border-amber-300 active:scale-95 transition-all whitespace-nowrap"
                            title="Nghe AI đọc tiến độ giải quyết hồ sơ này"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                            <span>Nghe AI Đọc</span>
                          </button>

                          {/* Nút xem chi tiết & đánh giá */}
                          <button
                            type="button"
                            onClick={() => {
                              setSearchCode(item.submissionCode);
                              setActiveTab('search');
                              handleLookup(item.submissionCode);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] sm:text-xs flex items-center gap-1 transition-all ml-auto whitespace-nowrap"
                          >
                            <span>Chi tiết</span>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* NỘI DUNG TAB 2: TÌM THEO CCCD / MÃ SỐ */}
          {activeTab === 'search' && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* Khung tìm kiếm mã hồ sơ hoặc số CCCD bằng Bàn phím & Giọng nói */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLookup();
                }}
                className="flex items-center gap-2 shrink-0"
              >
                <div className="flex items-center w-full rounded-xl border border-slate-300 bg-white p-1 shadow-xs focus-within:border-red-700 focus-within:ring-2 focus-within:ring-red-700/20">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Nhập hoặc chạm Mic đọc 12 số CCCD / Mã hồ sơ..."
                    className="min-w-0 flex-1 px-3 py-2 text-xs sm:text-sm outline-none font-bold text-slate-900 placeholder:text-slate-400"
                  />

                  {/* Nút Mic đọc số CCCD bằng giọng nói */}
                  <button
                    type="button"
                    onClick={handleVoiceSearchClick}
                    className={`p-2 rounded-lg font-bold text-xs flex items-center justify-center transition-all mr-1 ${
                      isListening
                        ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-300'
                        : 'bg-amber-100 hover:bg-amber-200 text-[#991B1B]'
                    }`}
                    title={isListening ? 'Đang nghe... Bấm để dừng' : 'Chạm để đọc 12 số CCCD hoặc mã hồ sơ'}
                  >
                    <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-white' : 'text-[#991B1B]'}`} />
                    <span className="sr-only">Nói để tra cứu</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="shrink-0 rounded-lg bg-[#991B1B] hover:bg-red-800 px-3.5 sm:px-4 py-2 text-xs font-bold text-white flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Tra cứu</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Trạng thái lắng nghe giọng nói */}
              {isListening && (
                <div className="px-3 py-1.5 rounded-lg bg-red-100 border border-red-300 text-red-900 text-xs font-bold flex items-center gap-2 animate-pulse shrink-0">
                  <Mic className="w-3.5 h-3.5 animate-bounce text-red-600 shrink-0" />
                  <span>🔴 Đang nghe bà con đọc... Đọc xong hệ thống tự tìm ngay!</span>
                </div>
              )}
              {voiceNotice && (
                <div className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold shrink-0">
                  {voiceNotice}
                </div>
              )}

              {/* Nút bấm mẫu thử nhanh & Hướng dẫn */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs shrink-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-500 text-[11px]">Thử nhanh:</span>
                  {['072096001234', 'HH-1021', 'HH-1022'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setSearchCode(code);
                        handleLookup(code);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-red-50 text-[#991B1B] font-bold border border-slate-200 text-[11px] transition-all"
                    >
                      {code}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAiGuidanceVoice}
                    className="text-[11px] font-bold text-[#991B1B] hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg border border-red-200 flex items-center gap-1 transition-all active:scale-95"
                    title="Bấm để nghe AI hướng dẫn tra cứu bằng giọng nói"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-red-700" />
                    <span>Nghe AI Hướng Dẫn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-0.5"
                  >
                    <span>{showGuide ? 'Ẩn' : '📖 Hướng dẫn'}</span>
                  </button>
                </div>
              </div>

              {/* Hộp hướng dẫn */}
              {showGuide && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-slate-700 space-y-1.5 shrink-0 animate-fade-in">
                  <div className="font-bold text-amber-900 flex items-center gap-1">
                    <span>👉 Cách tra cứu hồ sơ cho bà con:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                    <li><strong>Bằng Căn cước công dân:</strong> Bà con nhập 12 số CCCD để tìm toàn bộ hồ sơ của mình tại xã.</li>
                    <li><strong>Bằng Mã hồ sơ:</strong> Nhập mã dạng <code>HH-1021</code> in trên phiếu hẹn hoặc nhận khi điền đơn online.</li>
                    <li><strong>Bằng Giọng nói:</strong> Chạm vào nút Micro và đọc to, rõ ràng 12 số CCCD.</li>
                  </ul>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold shrink-0">
                  {errorMsg}
                </div>
              )}

              {/* Danh sách các hồ sơ nếu tìm thấy nhiều hơn 1 */}
              {submissionsList.length > 1 && (
                <div className="shrink-0">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Tìm thấy {submissionsList.length} hồ sơ liên quan (bấm để xem):
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {submissionsList.map((sub) => (
                      <button
                        key={sub.submissionCode}
                        type="button"
                        onClick={() => setSubmission(sub)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          submission?.submissionCode === sub.submissionCode
                            ? 'bg-red-700 text-white border-red-700 shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        {sub.submissionCode} - {sub.procedureTitle?.slice(0, 16)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chi tiết hồ sơ được tìm thấy */}
              {submission ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#991B1B] text-amber-300 text-xs font-black">
                      {submission.submissionCode}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                      <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                      <span>Tự đồng bộ mỗi 3s</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {submission.procedureTitle}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Người nộp: <strong>{submission.citizenName}</strong> {submission.citizenCccd ? `(CCCD: ${submission.citizenCccd})` : ''} • {submission.hamlet || 'Xã Hiệp Hòa'}
                    </div>
                  </div>

                  {/* Trạng thái */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Trạng thái hiện tại:
                    </span>
                    {submission.status === 'COMPLETED' ? (
                      <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>ĐÃ XỬ LÝ XONG • MỜI ĐẾN QUẦY KÝ TÊN & NHẬN KẾT QUẢ</span>
                      </div>
                    ) : submission.status === 'PROCESSING' ? (
                      <div className="p-2.5 rounded-xl bg-blue-100 text-blue-950 text-xs font-black border border-blue-400 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-700 shrink-0 animate-spin" />
                        <span>CÁN BỘ ĐANG XỬ LÝ & IN TỜ KHAI TẠI QUẦY</span>
                      </div>
                    ) : submission.status === 'NEEDS_SUPPLEMENT' ? (
                      <div className="p-3 rounded-xl bg-amber-100 text-amber-950 text-xs font-bold border-2 border-amber-400 space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-900 font-black">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>CÁN BỘ YÊU CẦU BỔ SUNG GIẤY TỜ:</span>
                        </div>
                        <p className="text-slate-900 font-semibold pl-5 text-[11px] leading-relaxed">
                          {submission.officerNote || 'Bà con vui lòng kiểm tra giấy tờ cần bổ sung theo hướng dẫn của cán bộ Một cửa.'}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-black border border-amber-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping shrink-0" />
                        <span>ĐANG TRONG HÀNG ĐỢI TIẾP NHẬN TRỰC TUYẾN</span>
                      </div>
                    )}
                  </div>

                  {submission.assignedOfficer && submission.assignedOfficer !== 'Chờ tiếp nhận' && (
                    <div className="text-xs text-slate-700">
                      <strong>Cán bộ thụ lý:</strong> {submission.assignedOfficer}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => speakSubmissionStatus(submission)}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1.5 border border-amber-300 active:scale-95 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span>Nghe AI Giải Thích Tiến Độ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveQrModalData({
                          formId: submission.formId || 'FORM_CUSTOM',
                          formTitle: submission.procedureTitle,
                          submissionCode: submission.submissionCode,
                          formData: submission.formData || {},
                          citizenName: submission.citizenName
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#991B1B] hover:bg-red-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all ml-auto"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span>Mở Mã QR Bảo Mật</span>
                    </button>
                  </div>

                  {/* Khảo sát mức độ hài lòng */}
                  <SatisfactionRating submissionCode={submission.submissionCode} />
                </div>
              ) : !errorMsg ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  Nhập số CCCD hoặc mã hồ sơ để xem tiến độ xử lý trực tuyến.
                </div>
              ) : null}
            </div>
          )}

        </div>
      </div>

      {/* Hiển thị lại CitizenQrModal khi người dân muốn mở mã QR xoay vòng bảo mật */}
      {activeQrModalData && (
        <CitizenQrModal
          qrPayload={activeQrModalData}
          onClose={() => setActiveQrModalData(null)}
          speakText={speakText}
        />
      )}
    </>
  );
}
