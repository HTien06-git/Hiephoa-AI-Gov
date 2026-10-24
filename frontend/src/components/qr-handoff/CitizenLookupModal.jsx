import React, { useState, useEffect } from 'react';
import { Search, X, Clock, CheckCircle2, AlertCircle, Building2, User, Phone, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function CitizenLookupModal({ onClose, speakText }) {
  const [searchCode, setSearchCode] = useState('');
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async (codeToSearch) => {
    const code = (codeToSearch || searchCode).trim();
    if (!code) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.getSubmission(code);
      if (res && res.success && res.submission) {
        setSubmission(res.submission);
        if (speakText) {
          const statusMap = {
            WAITING: 'Hồ sơ đang trong hàng đợi chờ tiếp nhận tại Bộ phận Một cửa.',
            PROCESSING: 'Hồ sơ đang được cán bộ thụ lý và in ấn tại quầy.',
            COMPLETED: 'Hồ sơ đã được xử lý xong, kính mời bà con đến quầy ký xác nhận và nhận kết quả.',
            NEEDS_SUPPLEMENT: `Hồ sơ cần bổ sung: ${res.submission.officerNote || 'thêm giấy tờ theo yêu cầu của cán bộ'}.`
          };
          speakText(`Mã hồ sơ ${res.submission.submissionCode}: ${statusMap[res.submission.status] || ''}`);
        }
      } else {
        setErrorMsg('Không tìm thấy hồ sơ với mã số này. Bà con vui lòng kiểm tra lại mã số (Ví dụ: HH-1021, HH-1024).');
        setSubmission(null);
      }
    } catch (err) {
      setErrorMsg('Không thể tra cứu vào lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border-2 border-amber-300 p-5 sm:p-6 text-left relative animate-scale-up my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-[#991B1B] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Tra Cứu Hồ Sơ Trực Tuyến Thời Gian Thực
            </h3>
            <p className="text-xs text-slate-500">
              UBND xã Hiệp Hòa • Hệ thống tiếp nhận Một cửa
            </p>
          </div>
        </div>

        {/* Khung tìm kiếm mã hồ sơ */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="mt-3.5 flex items-center gap-2"
        >
          <div className="flex items-center w-full rounded-xl border border-slate-300 bg-white p-1 shadow-xs focus-within:border-red-700 focus-within:ring-2 focus-within:ring-red-700/20">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Nhập mã hồ sơ (Ví dụ: HH-1021, HH-1024)..."
              className="min-w-0 flex-1 px-3 py-2 text-sm outline-none uppercase font-bold text-slate-900"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="shrink-0 rounded-lg bg-[#991B1B] hover:bg-red-800 px-4 py-2 text-xs font-bold text-white flex items-center gap-1 shadow-xs active:scale-95"
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

        {/* Mã mẫu thử nhanh */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-xs text-slate-600">
          <span className="font-bold text-slate-700">Mã mẫu thử nghiệm:</span>
          {['HH-1021', 'HH-1022', 'HH-1023'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setSearchCode(code);
                handleLookup(code);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-red-50 text-[#991B1B] font-bold border border-slate-200 text-[11px]"
            >
              {code}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Kết quả tra cứu */}
        {submission && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
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
          </div>
        )}

      </div>
    </div>
  );
}
