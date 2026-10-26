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
  MicOff,
  Volume2,
  HelpCircle
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import SatisfactionRating from '../common/SatisfactionRating';

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

  // Kiểm tra nếu có dạng HH-1234
  const hhMatch = str.match(/hh[-\s]?(\d{3,5})/i);
  if (hhMatch) {
    return `HH-${hhMatch[1]}`;
  }

  // Lấy toàn bộ chữ số liên tục
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
  const [searchCode, setSearchCode] = useState(initialQuery);
  const [submission, setSubmission] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');

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
      speakText('Kính chào bà con! Để tra cứu tiến độ hồ sơ, bà con có thể gõ hoặc chạm vào Micro màu đỏ và đọc 12 số trên thẻ Căn cước công dân của mình, hoặc đọc mã hồ sơ ví dụ Hát Hát một không hai một. Hệ thống sẽ hiển thị kết quả từ cán bộ Một cửa ngay lập tức ạ!');
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
          const statusMap = {
            WAITING: 'Hồ sơ đang trong hàng đợi chờ tiếp nhận tại Bộ phận Một cửa.',
            PROCESSING: 'Hồ sơ đang được cán bộ thụ lý và in ấn tại quầy.',
            COMPLETED: 'Hồ sơ đã được xử lý xong, kính mời bà con đến quầy ký xác nhận và nhận kết quả.',
            NEEDS_SUPPLEMENT: `Hồ sơ cần bổ sung: ${res.submission.officerNote || 'thêm giấy tờ theo yêu cầu của cán bộ'}.`
          };
          const personName = res.submission.citizenName || res.submission.formData?.ho_ten || 'Bà con';
          speakText(`Kính gửi bà con ${personName}: ${statusMap[res.submission.status] || ''}`);
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

  useEffect(() => {
    if (initialQuery) {
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
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border-2 border-amber-300 p-5 sm:p-6 text-left relative animate-scale-up my-auto max-h-[90vh] flex flex-col overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-[#991B1B] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Tra Cứu Hồ Sơ Bằng CCCD & Mã Số
            </h3>
            <p className="text-xs text-slate-500">
              UBND xã Hiệp Hòa • Tra cứu tiến độ thời gian thực
            </p>
          </div>
        </div>

        {/* Khung tìm kiếm mã hồ sơ hoặc số CCCD bằng Bàn phím & Giọng nói */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="mt-2.5 flex items-center gap-2 shrink-0"
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
          <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-red-100 border border-red-300 text-red-900 text-xs font-bold flex items-center gap-2 animate-pulse shrink-0">
            <Mic className="w-3.5 h-3.5 animate-bounce text-red-600 shrink-0" />
            <span>🔴 Đang nghe bà con đọc... Đọc xong hệ thống tự tìm ngay!</span>
          </div>
        )}
        {voiceNotice && (
          <div className="mt-1 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold shrink-0">
            {voiceNotice}
          </div>
        )}

        {/* Nút bấm mẫu thử nhanh & Nút xem hướng dẫn & Nghe AI Hướng Dẫn */}
        <div className="mt-2 flex items-center justify-between gap-2 flex-wrap text-xs shrink-0">
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

        {/* Hộp hướng dẫn tra cứu chi tiết */}
        {showGuide && (
          <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-slate-700 space-y-1.5 shrink-0 animate-fade-in">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <span>👉 Cách tra cứu hồ sơ cho bà con:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
              <li><strong>Bằng Căn cước công dân:</strong> Bà con chỉ cần nhập 12 số CCCD của mình vào ô trên, hệ thống sẽ tự động tìm toàn bộ hồ sơ của bà con tại xã.</li>
              <li><strong>Bằng Mã hồ sơ:</strong> Nhập mã dạng <code>HH-1021</code> in trên phiếu hẹn hoặc nhận khi điền đơn online.</li>
              <li><strong>Bằng Số điện thoại:</strong> Nhập số điện thoại bà con đã cung cấp khi làm thủ tục.</li>
            </ul>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Danh sách các hồ sơ nếu tìm thấy nhiều hơn 1 */}
        {submissionsList.length > 1 && (
          <div className="mt-3 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Tìm thấy {submissionsList.length} hồ sơ liên quan (bấm để xem chi tiết):
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
                  {sub.submissionCode} - {sub.procedureTitle.slice(0, 15)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Khu vực chi tiết hồ sơ được chọn */}
        <div className="flex-1 overflow-y-auto mt-3">
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
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-950 text-xs font-black border border-blue-400 flex items-center gap-2 animate-pulse">
                    <Clock className="w-4 h-4 text-blue-700 shrink-0 animate-spin" />
                    <span>CÁN BỘ ĐANG XỬ LÝ & IN TỜ KHAI TẠI QUẦY</span>
                  </div>
                ) : submission.status === 'NEEDS_SUPPLEMENT' ? (
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-950 text-xs font-black border border-amber-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>CẦN BỔ SUNG GIẤY TỜ: {submission.officerNote || 'Xem hướng dẫn'}</span>
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
              {submission.officerNote && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950">
                  <strong>Ghi chú từ cán bộ:</strong> {submission.officerNote}
                </div>
              )}

              {/* Khảo sát mức độ hài lòng của nhân dân (Hạng mục 8.3) */}
              <SatisfactionRating submissionCode={submission.submissionCode} />
            </div>
          ) : !errorMsg ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium">
              Nhập số CCCD hoặc mã hồ sơ để xem tiến độ xử lý trực tuyến.
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
