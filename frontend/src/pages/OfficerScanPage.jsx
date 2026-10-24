import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Scan,
  Printer,
  CheckCircle2,
  FileText,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Clock,
  Building,
  AlertCircle,
  Download,
  Users,
  Search,
  Check,
  Eye,
  FileCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  Landmark,
  LogOut,
  RefreshCw,
  Edit3,
  Send,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { docxExportService } from '../services/docxExportService';
import { apiClient } from '../services/apiClient';
import TrongDongWatermark from '../components/common/TrongDongWatermark';
import DongSonBorder from '../components/common/DongSonBorder';
import AdminDeviceManager from '../components/admin/AdminDeviceManager';
import AppointmentSlipModal from '../components/officer/AppointmentSlipModal';

export default function OfficerScanPage({ onSwitchToCitizen, currentUser, authToken, onLogout }) {
  const user = currentUser || JSON.parse(localStorage.getItem('hiephoa_user') || sessionStorage.getItem('hiephoa_user') || '{}');
  const isAdmin = user?.role === 'ADMIN';

  // Tabs: 'live_queue' | 'scan_camera' | 'receipt_print' | 'admin_officers' | 'admin_devices'
  const [activeTab, setActiveTab] = useState('live_queue');
  const [liveQueue, setLiveQueue] = useState([]);
  const [realtimeStats, setRealtimeStats] = useState({
    totalVisits: 1420,
    aiVoiceConsultations: 896,
    autoFormsCreated: 352,
    preCheckDocs: 228,
    completedSubmissions: 194
  });
  const [activityFeed, setActivityFeed] = useState([]);
  const [isQueueLoading, setIsQueueLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editedFormData, setEditedFormData] = useState({});
  const [officerNoteInput, setOfficerNoteInput] = useState('');
  const [actionNotification, setActionNotification] = useState('');
  const [receiptRecord, setReceiptRecord] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentSubmission, setAppointmentSubmission] = useState(null);

  // Polling hàng đợi thời gian thực mỗi 3 giây
  const fetchLiveQueue = async () => {
    try {
      const res = await apiClient.getLiveQueue();
      if (res && res.success) {
        setLiveQueue(res.submissions || []);
        if (res.stats) setRealtimeStats(res.stats);
        if (res.activityFeed) setActivityFeed(res.activityFeed);
      }
    } catch (err) {
      console.warn('Queue polling error:', err);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
    const interval = setInterval(fetchLiveQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  // Khởi tạo máy quét mã QR bằng camera khi ở tab 'scan_camera'
  useEffect(() => {
    let html5QrcodeScanner;
    if (activeTab === 'scan_camera') {
      try {
        html5QrcodeScanner = new Html5QrcodeScanner(
          "officer-qr-reader",
          { fps: 10, qrbox: { width: 240, height: 240 } },
          false
        );

        html5QrcodeScanner.render(
          (decodedText) => {
            handleProcessQrCode(decodedText);
            try {
              html5QrcodeScanner.clear();
            } catch (e) {}
          },
          (error) => {}
        );
      } catch (e) {
        console.warn('Scanner init notice:', e);
      }
    }

    return () => {
      try {
        if (html5QrcodeScanner) html5QrcodeScanner.clear();
      } catch (e) {}
    };
  }, [activeTab]);

  // Xử lý khi quét mã QR hoặc tìm mã hồ sơ
  const handleProcessQrCode = async (raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.code) {
        handleSelectSubmissionByCode(parsed.code);
      } else {
        // Hồ sơ từ client
        const newSub = {
          submissionCode: `HH-${Math.floor(1024 + Math.random() * 50)}`,
          procedureTitle: parsed.title || 'Hồ sơ quét từ QR',
          citizenName: parsed.fields?.ho_ten || parsed.fields?.ho_ten_nguoi_yeu_cau || 'Bà con xã Hiệp Hòa',
          formData: parsed.fields || {},
          status: 'WAITING',
          createdAt: new Date().toISOString()
        };
        setSelectedSubmission(newSub);
        setEditedFormData(newSub.formData);
        setActiveTab('live_queue');
      }
    } catch (e) {
      // Nếu là chuỗi mã đơn thuần (ví dụ "HH-1021")
      if (raw && raw.startsWith('HH-')) {
        handleSelectSubmissionByCode(raw.trim());
      } else {
        alert('Mã QR không đúng định dạng hồ sơ điện tử xã Hiệp Hòa.');
      }
    }
  };

  const handleSelectSubmissionByCode = async (code) => {
    try {
      const res = await apiClient.getSubmission(code);
      if (res && res.success && res.submission) {
        setSelectedSubmission(res.submission);
        setEditedFormData(res.submission.formData || {});
        setOfficerNoteInput(res.submission.officerNote || '');
        setActiveTab('live_queue');
      } else {
        alert(`Không tìm thấy hồ sơ có mã ${code}`);
      }
    } catch (e) {
      alert(`Lỗi tra cứu mã hồ sơ ${code}`);
    }
  };

  const handleOpenSubmissionDetail = (sub) => {
    setSelectedSubmission(sub);
    setEditedFormData(sub.formData || {});
    setOfficerNoteInput(sub.officerNote || '');
  };

  // Cập nhật thông tin tờ khai trực tiếp
  const handleSaveFormData = async () => {
    if (!selectedSubmission) return;
    try {
      const res = await apiClient.updateSubmission(selectedSubmission.submissionCode, {
        formData: editedFormData
      });
      if (res && res.success) {
        setSelectedSubmission(res.submission);
        setActionNotification(`Đã lưu cập nhật tờ khai [${selectedSubmission.submissionCode}] thành công!`);
        fetchLiveQueue();
      }
    } catch (e) {
      alert('Không thể lưu thông tin tờ khai.');
    }
    setTimeout(() => setActionNotification(''), 3500);
  };

  // Chuyển trạng thái hồ sơ (TIẾP NHẬN / HOÀN THÀNH / BỔ SUNG)
  const handleChangeStatus = async (newStatus) => {
    if (!selectedSubmission) return;
    const officerName = user?.name || 'Trần Văn Hòa (Cán bộ Một cửa)';

    try {
      const res = await apiClient.updateSubmission(selectedSubmission.submissionCode, {
        status: newStatus,
        assignedOfficer: officerName,
        officerNote: officerNoteInput
      });

      if (res && res.success) {
        setSelectedSubmission(res.submission);
        setActionNotification(`Đã cập nhật trạng thái hồ sơ [${selectedSubmission.submissionCode}] sang: ${newStatus}!`);
        fetchLiveQueue();

        if (newStatus === 'COMPLETED') {
          setReceiptRecord(res.submission);
        }
      }
    } catch (e) {
      alert('Không thể cập nhật trạng thái hồ sơ.');
    }
    setTimeout(() => setActionNotification(''), 3500);
  };

  // Xuất file Word và in ấn tờ khai
  const handleExportWord = async () => {
    if (!selectedSubmission) return;
    const templateMap = {
      PROC_KHAI_SINH: 'mau_01_to_khai_dang_ky_khai_sinh.docx',
      PROC_KET_HON: 'mau_02_to_khai_dang_ky_ket_hon.docx',
      PROC_TINH_TRANG_HON_NHAN: 'mau_03_to_khai_xac_nhan_tinh_trang_hon_nhan.docx',
      PROC_CHUNG_THUC_SAO_Y: 'mau_04_don_de_nghi_chung_thuc.docx',
      PROC_XAC_NHAN_CU_TRU: 'mau_05_don_xin_xac_nhan_cu_tru_ho_ngheo.docx'
    };
    const templateName = templateMap[selectedSubmission.procedureId] || 'mau_01_to_khai_dang_ky_khai_sinh.docx';

    try {
      const outputFilename = `HIEP_HOA_${selectedSubmission.submissionCode}_${Date.now()}.docx`;
      await docxExportService.generateAndDownloadDocx(templateName, editedFormData, outputFilename);
      setActionNotification(`Đã xuất file Word chuẩn cho hồ sơ [${selectedSubmission.submissionCode}]!`);
    } catch (err) {
      alert('Lỗi xuất file Word: ' + err.message);
    }
    setTimeout(() => setActionNotification(''), 3500);
  };

  // Khôi phục 03 hồ sơ mẫu
  const handleResetDemoData = async () => {
    if (!window.confirm('Khôi phục hàng đợi về 03 hồ sơ mẫu thử nghiệm?')) return;
    try {
      await apiClient.resetDemoQueue();
      fetchLiveQueue();
      setActionNotification('Đã khôi phục 03 hồ sơ mẫu thành công!');
    } catch (e) {
      alert('Lỗi khôi phục hồ sơ mẫu.');
    }
    setTimeout(() => setActionNotification(''), 3500);
  };

  // Tìm kiếm trong hàng đợi
  const filteredQueue = liveQueue.filter(s =>
    s.submissionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.procedureTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.citizenCccd && s.citizenCccd.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      <div>
        {/* HEADER CÁN BỘ MỘT CỬA */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#7F1D1D] text-white shadow-md border-b-2 border-amber-400">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[64px] sm:h-[72px] flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md ring-2 ring-amber-400 overflow-hidden">
                <img src="/logo_gov.png" alt="Logo Cổng DVC" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs uppercase font-extrabold text-amber-300 tracking-wider flex items-center gap-1 truncate">
                  <Landmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">UBND XÃ HIỆP HÒA — TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG</span>
                </div>
                <h1 className="text-sm sm:text-lg md:text-xl font-black text-white leading-tight truncate">
                  TIẾP NHẬN HỒ SƠ ĐIỆN TỬ THỜI GIAN THỰC (V5.0)
                </h1>
              </div>
            </div>

            {/* Thông tin Cán bộ trực & Nút chuyển chế độ */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-red-950/70 border border-red-500/50 rounded-xl px-2.5 py-1 text-right hidden sm:block">
                <div className="text-[10px] text-amber-300 font-bold uppercase">
                  {isAdmin ? 'Quản Trị Viên:' : 'Cán bộ trực:'}
                </div>
                <div className="text-xs font-black text-white truncate max-w-[160px]">
                  {isAdmin ? 'ADMINISTRATOR' : (user?.name || 'Trần Văn Hòa')}
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="h-9 px-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden md:inline">Đăng Xuất</span>
                </button>
              )}

              <button
                type="button"
                onClick={onSwitchToCitizen}
                className="h-9 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-red-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Users className="w-3.5 h-3.5 text-red-950" />
                <span className="hidden sm:inline">Về Giao Diện Nhân Dân</span>
                <span className="sm:hidden">Nhân Dân</span>
              </button>
            </div>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
          
          {/* DẢI THỐNG KÊ KPI THỜI GIAN THỰC */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#991B1B] flex items-center justify-center shrink-0 font-black">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase text-slate-500">Hàng Đợi Trực Tuyến</div>
                <div className="text-lg sm:text-xl font-black text-slate-900">{liveQueue.length} hồ sơ</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-black">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase text-slate-500">Tờ Khai Tự Động</div>
                <div className="text-lg sm:text-xl font-black text-emerald-700">{realtimeStats.autoFormsCreated} đơn</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase text-slate-500">Đã Hoàn Thành</div>
                <div className="text-lg sm:text-xl font-black text-slate-900">{realtimeStats.completedSubmissions} hồ sơ</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-black">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase text-slate-500">Tư Vấn Giọng Nói AI</div>
                <div className="text-lg sm:text-xl font-black text-blue-700">{realtimeStats.aiVoiceConsultations} lượt</div>
              </div>
            </div>
          </div>

          {/* THANH ĐIỀU HƯỚNG TABS NGHIỆP VỤ */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 border-b border-slate-200 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('live_queue')}
              className={`h-10 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'live_queue'
                  ? 'bg-[#991B1B] text-white shadow-sm ring-2 ring-red-300'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>1. Hàng Đợi Trực Tuyến ({liveQueue.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scan_camera')}
              className={`h-10 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'scan_camera'
                  ? 'bg-[#991B1B] text-white shadow-sm ring-2 ring-red-300'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <Scan className="w-4 h-4 text-amber-300" />
              <span>2. Quét QR Camera</span>
            </button>

            {receiptRecord && (
              <button
                type="button"
                onClick={() => setActiveTab('receipt_print')}
                className={`h-10 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'receipt_print'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                }`}
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>3. In Giấy Hẹn ({receiptRecord.submissionCode})</span>
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin_officers')}
                  className={`h-10 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'admin_officers'
                      ? 'bg-purple-800 text-white shadow-sm ring-2 ring-purple-300'
                      : 'bg-purple-50 text-purple-900 border border-purple-200'
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Quản Lý Cán Bộ (Admin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('admin_devices')}
                  className={`h-10 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'admin_devices'
                      ? 'bg-amber-800 text-white shadow-sm ring-2 ring-amber-300'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Bảo Mật Thiết Bị Khóa 5 Lần</span>
                </button>
              </>
            )}
          </div>

          {/* THÔNG BÁO HÀNH ĐỘNG */}
          {actionNotification && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionNotification}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: HÀNG ĐỢI TIẾP NHẬN TRỰC TUYẾN (LIVE QUEUE)        */}
          {/* ======================================================== */}
          {activeTab === 'live_queue' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* CỘT TRÁI: DANH SÁCH HÀNG ĐỢI (5 CỘT TRÊN DESKTOP) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                      <span className="text-xs font-black text-slate-800 uppercase">
                        Hàng Đợi Trực Tuyến (Polling 3s)
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleResetDemoData}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                        title="Khôi phục 03 hồ sơ mẫu"
                      >
                        Khôi phục mẫu
                      </button>
                      <button
                        type="button"
                        onClick={fetchLiveQueue}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Đồng bộ ngay"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tìm kiếm */}
                  <div className="flex items-center w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm theo mã hồ sơ (HH-...), tên, CCCD..."
                      className="w-full bg-transparent text-xs outline-none text-slate-800"
                    />
                  </div>
                </div>

                {/* Danh sách items hàng đợi */}
                <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                  {filteredQueue.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      Không có hồ sơ nào trong hàng đợi.
                    </div>
                  ) : (
                    filteredQueue.map((sub) => {
                      const isSelected = selectedSubmission?.submissionCode === sub.submissionCode;
                      const isWaiting = sub.status === 'WAITING';
                      const isProcessing = sub.status === 'PROCESSING';
                      const isCompleted = sub.status === 'COMPLETED';
                      const isNeedsSupplement = sub.status === 'NEEDS_SUPPLEMENT';

                      return (
                        <div
                          key={sub.submissionCode}
                          onClick={() => handleOpenSubmissionDetail(sub)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'bg-red-50/70 border-red-600 shadow-sm ring-2 ring-red-200'
                              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                          }`}
                        >
                          {/* Huy hiệu MỚI VỪA GỬI nhấp nháy nếu là hồ sơ mới */}
                          {sub.isNew && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase shadow-xs animate-bounce">
                              MỚI VỪA GỬI
                            </span>
                          )}

                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-[#991B1B] text-amber-300 font-mono text-xs font-black">
                              {sub.submissionCode}
                            </span>
                            
                            {/* Trạng thái */}
                            {isCompleted ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                ĐÃ HOÀN TẤT
                              </span>
                            ) : isProcessing ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black animate-pulse">
                                ĐANG XỬ LÝ
                              </span>
                            ) : isNeedsSupplement ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                                CẦN BỔ SUNG
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200">
                                CHỜ TIẾP NHẬN
                              </span>
                            )}
                          </div>

                          <div className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                            {sub.procedureTitle}
                          </div>

                          <div className="text-xs text-slate-600 mt-0.5 flex items-center justify-between">
                            <span>Người nộp: <strong>{sub.citizenName}</strong></span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {new Date(sub.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                            <span>Ấp: {sub.hamlet || 'Hiệp Hòa'}</span>
                            {sub.citizenPhone && <span>• ĐT: {sub.citizenPhone}</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* CỘT PHẢI: CHI TIẾT HỒ SƠ, CHỈNH SỬA & THAO TÁC NGHIỆP VỤ (7 CỘT TRÊN DESKTOP) */}
              <div className="lg:col-span-7">
                {selectedSubmission ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
                    
                    {/* Header Chi tiết */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-[#991B1B] text-amber-300 font-mono text-sm font-black shadow-xs">
                            {selectedSubmission.submissionCode}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            Gửi lúc: {new Date(selectedSubmission.createdAt).toLocaleTimeString('vi-VN')}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                          {selectedSubmission.procedureTitle}
                        </h2>
                      </div>

                      {/* Trạng thái hiện tại */}
                      <div>
                        <span className="text-xs font-bold text-slate-500 block mb-0.5 sm:text-right">Trạng thái:</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black ${
                          selectedSubmission.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            : selectedSubmission.status === 'PROCESSING'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300 animate-pulse'
                            : selectedSubmission.status === 'NEEDS_SUPPLEMENT'
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          {selectedSubmission.status === 'COMPLETED' ? '✓ ĐÃ HOÀN TẤT & IN' :
                           selectedSubmission.status === 'PROCESSING' ? '⚙ ĐANG XỬ LÝ TẠI QUẦY' :
                           selectedSubmission.status === 'NEEDS_SUPPLEMENT' ? '⚠ CẦN BỔ SUNG' : '⏳ CHỜ TIẾP NHẬN'}
                        </span>
                      </div>
                    </div>

                    {/* CỤM NÚT CHUYỂN TRẠNG THÁI & GỬI THÔNG BÁO VỀ ĐIỆN THOẠI NGƯỜI DÂN */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-xs font-black text-slate-800 uppercase block">
                        Cập nhật trạng thái trực tuyến (Báo ngay về điện thoại người dân):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleChangeStatus('PROCESSING')}
                          className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-300" />
                          <span>1. Tiếp nhận xử lý tại quầy</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChangeStatus('COMPLETED')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                          <span>2. Mời lên quầy ký tên & Nhận kết quả</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChangeStatus('NEEDS_SUPPLEMENT')}
                          className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-white" />
                          <span>3. Yêu cầu bổ sung hồ sơ</span>
                        </button>
                      </div>

                      {/* Ô nhập ghi chú gửi lại người dân */}
                      <div className="pt-1.5 flex items-center gap-2">
                        <input
                          type="text"
                          value={officerNoteInput}
                          onChange={(e) => setOfficerNoteInput(e.target.value)}
                          placeholder="Nhập ghi chú hướng dẫn/bổ sung gửi cho người dân (Ví dụ: Mang thêm CCCD gốc...)"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-red-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleChangeStatus(selectedSubmission.status)}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-black text-white text-xs font-bold"
                        >
                          Lưu Ghi Chú
                        </button>
                      </div>
                    </div>

                    {/* BẢNG CHỈNH SỬA TRỰC TIẾP CÁC TRƯỜNG TỜ KHAI NGƯỜI DÂN ĐÃ KHAI */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-amber-600" />
                          <span>Thông Tin Tờ Khai Người Dân Đã Điền (Có thể chỉnh sửa):</span>
                        </span>

                        <button
                          type="button"
                          onClick={handleSaveFormData}
                          className="px-3 py-1.5 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Lưu Cập Nhật Tờ Khai</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto p-1 border rounded-xl border-slate-200">
                        {Object.entries(editedFormData).map(([key, val]) => (
                          <div key={key} className="p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5 truncate">
                              {key.replace(/_/g, ' ')}
                            </label>
                            <input
                              type="text"
                              value={val || ''}
                              onChange={(e) => setEditedFormData(prev => ({ ...prev, [key]: e.target.value }))}
                              className="w-full bg-white px-2 py-1 text-xs border border-slate-300 rounded font-semibold text-slate-900 outline-none focus:border-red-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CỤM NÚT XUẤT WORD VÀ IN ẤN */}
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleExportWord}
                        className="px-4 py-2.5 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95"
                      >
                        <Download className="w-4 h-4 text-amber-300" />
                        <span>Xuất File Word (.docx) Chuẩn Xã</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAppointmentSubmission(selectedSubmission);
                          setIsAppointmentModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 ring-2 ring-amber-400"
                        title="Soạn thảo & In giấy tiếp nhận hồ sơ và hẹn trả kết quả theo chuẩn phông chữ Times New Roman"
                      >
                        <Printer className="w-4 h-4 text-amber-300" />
                        <span>Soạn & In Giấy Hẹn (Times New Roman)</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-500 space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-slate-300" />
                    <div className="text-sm font-bold text-slate-700">Chưa chọn hồ sơ nào</div>
                    <p className="text-xs max-w-sm mx-auto">
                      Bấm vào một hồ sơ từ Hàng đợi trực tuyến bên trái hoặc chuyển sang Tab 2 để Quét mã QR từ điện thoại người dân.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: QUÉT MÃ QR CAMERA                                 */}
          {/* ======================================================== */}
          {activeTab === 'scan_camera' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm max-w-xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#991B1B] text-xs font-black uppercase">
                <Scan className="w-4 h-4 text-amber-600" />
                <span>QUÉT MÃ QR BẰNG CAMERA MÁY TÍNH / ĐIỆN THOẠI</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Đưa Mã QR Trên Điện Thoại Của Người Dân Vào Khung Quét
              </h2>
              <div id="officer-qr-reader" className="mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-red-400 max-w-sm" />
              <p className="text-xs text-slate-500">
                Sau khi quét thành công, hồ sơ sẽ tự động nạp vào màn hình tiếp nhận và đồng bộ trực tuyến.
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: IN BIÊN NHẬN HẸN TRẢ A4 (TIMES NEW ROMAN)         */}
          {/* ======================================================== */}
          {activeTab === 'receipt_print' && receiptRecord && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <div className="text-base font-black text-slate-900">
                    Bản In Giấy Tiếp Nhận Hồ Sơ & Hẹn Trả Kết Quả
                  </div>
                  <div className="text-xs text-slate-500">
                    Phông chữ chuẩn hành chính: <strong>Times New Roman</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAppointmentSubmission(receiptRecord);
                      setIsAppointmentModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Soạn / Chỉnh Sửa Giấy Hẹn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In Khổ A4</span>
                  </button>
                </div>
              </div>

              {/* Giấy hẹn khổ A4 chuẩn font Times New Roman */}
              <div
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
                className="p-8 bg-white rounded-2xl border text-sm text-black leading-relaxed space-y-4 shadow-xs"
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                  <tbody>
                    <tr style={{ verticalAlign: 'top' }}>
                      <td style={{ width: '45%', textAlign: 'center' }}>
                        <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          ỦY BAN NHÂN DÂN XÃ HIỆP HÒA
                        </div>
                        <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'underline' }}>
                          BỘ PHẬN TIẾP NHẬN VÀ TRẢ KẾT QUẢ
                        </div>
                        <div style={{ fontSize: '10pt', marginTop: '4px' }}>
                          Số: {receiptRecord.submissionCode}/TNHH-HH
                        </div>
                      </td>
                      <td style={{ width: '55%', textAlign: 'center' }}>
                        <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </div>
                        <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>
                          Độc lập - Tự do - Hạnh phúc
                        </div>
                        <div style={{ fontSize: '10pt', margin: '4px auto 6px auto', borderBottom: '1px solid black', width: '120px' }} />
                        <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>
                          Hiệp Hòa, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    GIẤY TIẾP NHẬN HỒ SƠ VÀ HẸN TRẢ KẾT QUẢ
                  </div>
                  <div style={{ fontSize: '11pt', fontStyle: 'italic', marginTop: '4px' }}>
                    Mã hồ sơ: <strong>{receiptRecord.submissionCode}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '12pt', lineHeight: '1.6' }} className="space-y-1.5">
                  <div>• <strong>Người nộp hồ sơ:</strong> {receiptRecord.citizenName}</div>
                  <div>• <strong>Số CCCD/Định danh:</strong> {receiptRecord.citizenCccd || '072096001234'}</div>
                  <div>• <strong>Địa chỉ thường trú:</strong> {receiptRecord.hamlet || 'Xã Hiệp Hòa, tỉnh Tây Ninh'}</div>
                  <div>• <strong>Nội dung yêu cầu giải quyết:</strong> {receiptRecord.procedureTitle}</div>
                  <div>• <strong>Thời gian tiếp nhận:</strong> {new Date(receiptRecord.createdAt).toLocaleString('vi-VN')}</div>
                  <div>• <strong>Thời gian hẹn trả kết quả:</strong> <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}</span></div>
                  <div>• <strong>Cán bộ thụ lý:</strong> {receiptRecord.assignedOfficer || user?.name || 'Trần Văn Hòa'}</div>
                </div>

                <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ verticalAlign: 'top', textAlign: 'center' }}>
                      <td style={{ width: '50%' }}>
                        <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase' }}>NGƯỜI NỘP HỒ SƠ</div>
                        <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
                        <div style={{ height: '60px' }} />
                        <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>{receiptRecord.citizenName}</div>
                      </td>
                      <td style={{ width: '50%' }}>
                        <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase' }}>CÁN BỘ TIẾP NHẬN</div>
                        <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>(Ký, đóng dấu hoặc xác thực)</div>
                        <div style={{ height: '60px' }} />
                        <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>{user?.name || 'Trần Văn Hòa'}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: QUẢN LÝ CÁN BỘ MỘT CỬA (ADMIN)                    */}
          {/* ======================================================== */}
          {activeTab === 'admin_officers' && isAdmin && (
            <AdminDeviceManager authToken={authToken} initialSubTab="OFFICERS" />
          )}

          {/* ======================================================== */}
          {/* TAB 5: BẢO MẬT THIẾT BỊ KHÓA 5 LẦN (ADMIN)              */}
          {/* ======================================================== */}
          {activeTab === 'admin_devices' && isAdmin && (
            <AdminDeviceManager authToken={authToken} initialSubTab="DEVICES" />
          )}

        </main>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-4 text-center text-xs border-t border-slate-800">
        © 2026 HIỆP HÒA AI-GOV • Trung tâm Phục vụ Hành chính công UBND xã Hiệp Hòa, tỉnh Tây Ninh.
      </footer>

      {/* MODAL SOẠN & IN GIẤY HẸN TRẢ KẾT QUẢ (TIMES NEW ROMAN) */}
      {isAppointmentModalOpen && appointmentSubmission && (
        <AppointmentSlipModal
          submission={appointmentSubmission}
          currentUser={user}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setAppointmentSubmission(null);
          }}
        />
      )}
    </div>
  );
}
