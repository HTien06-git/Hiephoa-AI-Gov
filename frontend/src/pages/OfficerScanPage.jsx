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
  AlertTriangle,
  Volume2,
  BarChart2,
  Filter,
  Calendar,
  Camera,
  Upload
} from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { docxExportService } from '../services/docxExportService';
import { apiClient } from '../services/apiClient';
import { saveClientSnapshot } from '../services/persistentBackup';
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
    totalVisits: 0,
    aiVoiceConsultations: 0,
    autoFormsCreated: 0,
    preCheckDocs: 0,
    completedSubmissions: 0
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
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Excel Export states (Hạng mục 5)
  const [showExcelPanel, setShowExcelPanel] = useState(false);
  const [excelFilter, setExcelFilter] = useState({
    range: 'today',
    startDate: '',
    endDate: '',
    status: 'ALL',
    procedureId: 'ALL'
  });
  const [isExporting, setIsExporting] = useState(false);

  // QR Scanner States & Refs
  const [cameraRunning, setCameraRunning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [quickManualCode, setQuickManualCode] = useState('');
  const html5QrCodeRef = useRef(null);
  const qrFileInputRef = useRef(null);

  // Gọi Loa state (Hạng mục 8.2)
  const [callingOutCode, setCallingOutCode] = useState(null);

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

  // Dừng máy quét camera an toàn
  const stopQrCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (e) {
      console.warn('Stop camera error:', e);
    } finally {
      setCameraRunning(false);
    }
  };

  // Khởi động máy quét camera trực tiếp
  const startQrCamera = async () => {
    setCameraError('');
    try {
      const container = document.getElementById('officer-qr-reader');
      if (!container) {
        setCameraError('Không tìm thấy khung quét camera trên màn hình.');
        return;
      }

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('officer-qr-reader');
      }

      const qr = html5QrCodeRef.current;
      if (qr.isScanning) {
        await qr.stop();
      }

      await qr.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleProcessQrCode(decodedText);
          stopQrCamera();
        },
        () => {}
      );
      setCameraRunning(true);
    } catch (err) {
      console.error('Camera start error:', err);
      setCameraError('Không thể mở Camera (Có thể do thiết bị không có webcam hoặc trình duyệt chưa được cấp quyền truy cập Camera). Cán bộ có thể dùng tính năng Tải Ảnh Mã QR hoặc Nhập Mã Trực Tiếp bên dưới.');
      setCameraRunning(false);
    }
  };

  // Dọn dẹp khi chuyển tab
  useEffect(() => {
    if (activeTab === 'scan_camera') {
      const timer = setTimeout(() => {
        startQrCamera();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopQrCamera();
      };
    } else {
      stopQrCamera();
    }
  }, [activeTab]);

  // Quét mã QR từ file ảnh người dân gửi
  const handleScanQrFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5Qr = new Html5Qrcode('officer-qr-file-dummy');
      const decodedText = await html5Qr.scanFile(file, true);
      html5Qr.clear();
      setActionNotification('Đã giải mã thành công từ tệp ảnh mã QR!');
      handleProcessQrCode(decodedText);
    } catch (err) {
      alert('Không nhận diện được mã QR trong ảnh này. Cán bộ vui lòng chọn ảnh chụp rõ nét hơn hoặc nhập mã hồ sơ.');
    }
    e.target.value = '';
  };

  // Xử lý khi quét mã QR hoặc tìm mã hồ sơ (hỗ trợ mọi định dạng JSON, text, token)
  const handleProcessQrCode = async (raw) => {
    if (!raw) return;
    const trimmed = String(raw).trim();

    try {
      // 1. Nếu là JSON
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        if (parsed.code) {
          handleSelectSubmissionByCode(parsed.code);
          return;
        }
        if (parsed.submissionCode) {
          handleSelectSubmissionByCode(parsed.submissionCode);
          return;
        }
      }

      // 2. Nếu là chuỗi có chứa mã HH-xxxx
      const match = trimmed.match(/HH-\d{3,5}/i);
      if (match) {
        handleSelectSubmissionByCode(match[0].toUpperCase());
        return;
      }

      // 3. Nếu là chuỗi số CCCD 12 số
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length >= 9) {
        handleSelectSubmissionByCode(digits);
        return;
      }

      handleSelectSubmissionByCode(trimmed);
    } catch (e) {
      handleSelectSubmissionByCode(trimmed);
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

  // Xuất Sổ theo dõi và danh sách hồ sơ trong ngày sang file Word (.docx) chuẩn Times New Roman
  const handleExportDailyDocx = async () => {
    try {
      await docxExportService.exportDailySubmissionsWord(liveQueue, user);
      setActionNotification('Đã tải về Sổ theo dõi hồ sơ trong ngày (.docx) phông Times New Roman thành công!');
    } catch (e) {
      alert('Không thể xuất file Word: ' + e.message);
    }
    setTimeout(() => setActionNotification(''), 3500);
  };

  // Xuất Báo Cáo Thống Kê Tổng Hợp sang file Word (.docx) chuẩn Nghị định 30/2020/NĐ-CP
  const handleExportWordReport = async () => {
    setIsExporting(true);
    try {
      const now = new Date();
      let startDate = excelFilter.startDate;
      let endDate = excelFilter.endDate;

      if (excelFilter.range === 'today') {
        startDate = now.toISOString().split('T')[0];
        endDate = startDate;
      } else if (excelFilter.range === '7days') {
        const d = new Date(now);
        d.setDate(d.getDate() - 6);
        startDate = d.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      } else if (excelFilter.range === 'month') {
        startDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
        endDate = now.toISOString().split('T')[0];
      } else if (excelFilter.range === 'quarter') {
        const q = Math.floor(now.getMonth() / 3);
        startDate = `${now.getFullYear()}-${String(q*3+1).padStart(2,'0')}-01`;
        endDate = now.toISOString().split('T')[0];
      } else if (excelFilter.range === 'year') {
        startDate = `${now.getFullYear()}-01-01`;
        endDate = now.toISOString().split('T')[0];
      }

      // Lọc danh sách hồ sơ tương ứng
      let filtered = [...liveQueue];
      if (startDate) {
        const from = new Date(startDate);
        from.setHours(0, 0, 0, 0);
        filtered = filtered.filter(s => new Date(s.createdAt) >= from);
      }
      if (endDate) {
        const to = new Date(endDate);
        to.setHours(23, 59, 59, 999);
        filtered = filtered.filter(s => new Date(s.createdAt) <= to);
      }
      if (excelFilter.status && excelFilter.status !== 'ALL') {
        filtered = filtered.filter(s => s.status === excelFilter.status);
      }

      await docxExportService.exportOfficialReportDocx(filtered, {
        range: excelFilter.range,
        startDate,
        endDate,
        status: excelFilter.status
      }, user);

      setActionNotification('Đã xuất Báo cáo Thống kê Tổng hợp sang file Word (.docx) chuẩn thể thức nhà nước thành công!');
    } catch (e) {
      alert('Lỗi xuất báo cáo Word: ' + e.message);
    } finally {
      setIsExporting(false);
    }
    setTimeout(() => setActionNotification(''), 4000);
  };

  // Gọi Loa mời công dân lên quầy (Hạng mục 8.2)
  const handleAnnounceCallout = (sub) => {
    setCallingOutCode(sub.submissionCode);
    const msg = `Trân trọng kính mời công dân ${sub.citizenName}, mã hồ sơ ${sub.submissionCode}, đến Quầy tiếp nhận Một cửa UBND xã Hiệp Hòa để đối chiếu bản chính và ký xác nhận tờ khai!`;

    // Phát bằng TTS server
    const audio = new Audio(`/api/tts?text=${encodeURIComponent(msg)}`);
    audio.playsInline = true;
    audio.play().catch(() => {
      // Fallback Web Speech
      if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(msg);
        utt.lang = 'vi-VN';
        utt.rate = 0.9;
        window.speechSynthesis.speak(utt);
      }
    });

    setActionNotification(`📢 Đã phát loa mời: ${sub.citizenName} (${sub.submissionCode})`);
    setTimeout(() => {
      setCallingOutCode(null);
      setActionNotification('');
    }, 4000);
  };

  // Thực hiện Reset toàn bộ hồ sơ trong hệ thống (Chỉ dành cho Admin)
  const handleExecuteResetAll = async () => {
    if (resetConfirmInput.trim().toUpperCase() !== 'RESET') {
      alert('Vui lòng nhập đúng chữ RESET vào ô xác nhận để thực hiện.');
      return;
    }
    setIsResetting(true);
    try {
      const res = await apiClient.resetAllSubmissions();
      if (res && res.success) {
        setLiveQueue([]);
        setSelectedSubmission(null);
        setReceiptRecord(null);
        setShowResetConfirmModal(false);
        setResetConfirmInput('');
        setActionNotification('Đã xóa và làm sạch toàn bộ hồ sơ trong hệ thống thành công! Sẵn sàng vận hành thực tế.');
        fetchLiveQueue();
      } else {
        alert('Lỗi: ' + (res.error || 'Không thể reset hồ sơ'));
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ khi reset.');
    } finally {
      setIsResetting(false);
    }
    setTimeout(() => setActionNotification(''), 4000);
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

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* NÚT LƯU DANH SÁCH HỒ SƠ TRONG NGÀY SANG FILE WORD (TIMES NEW ROMAN) */}
                      <button
                        type="button"
                        onClick={handleExportDailyDocx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-black flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                        title="Lưu danh sách hồ sơ đã nộp và xử lý trong ngày sang file Word (.docx) chuẩn phông chữ Times New Roman"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>Xuất Sổ Word (.docx)</span>
                      </button>

                      {/* NÚT MỞ PANEL THỐNG KÊ & XUẤT WORD CHUẨN NHÀ NƯỚC (Hạng mục 5) */}
                      <button
                        type="button"
                        onClick={() => setShowExcelPanel(prev => !prev)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 shadow-2xs active:scale-95 transition-all
                          ${showExcelPanel
                            ? 'bg-blue-800 text-white'
                            : 'bg-blue-700 hover:bg-blue-800 text-white'}`}
                        title="Thống kê và xuất báo cáo tổng hợp hồ sơ chuẩn thể thức văn bản nhà nước (.docx)"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-300" />
                        <span>📄 Xuất Báo Cáo Word</span>
                      </button>

                      {/* NÚT RESET TOÀN BỘ HỒ SƠ (CHỈ HIỂN THỊ VỚI QUẢN TRỊ VIÊN) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setResetConfirmInput('');
                            setShowResetConfirmModal(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                          title="Làm sạch toàn bộ hồ sơ thủ tục đã nộp trong hệ thống để sẵn sàng vận hành thực tế"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-300" />
                          <span>Reset Hồ Sơ</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={fetchLiveQueue}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
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

                {/* PANEL THỐNG KÊ & XUẤT BÁO CÁO WORD (.DOCX) CHUẨN NHÀ NƯỚC (Hạng mục 5) */}
                {showExcelPanel && (
                  <div className="bg-blue-50 border border-blue-300 rounded-2xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
                      <FileText className="w-4 h-4 text-blue-700" />
                      <span>Thống Kê & Xuất Báo Cáo Tổng Hợp Ra File Word (.docx) Chuẩn Nhà Nước</span>
                    </div>

                    {/* Mốc thời gian nhanh */}
                    <div>
                      <div className="text-[11px] font-bold text-blue-900 mb-1.5 uppercase tracking-wide">Khoảng thời gian:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { key: 'today', label: 'Hôm nay' },
                          { key: '7days', label: '7 ngày qua' },
                          { key: 'month', label: 'Tháng này' },
                          { key: 'quarter', label: 'Quý này' },
                          { key: 'year', label: 'Năm nay' },
                          { key: 'custom', label: 'Tùy chọn' }
                        ].map(r => (
                          <button
                            key={r.key}
                            onClick={() => setExcelFilter(f => ({ ...f, range: r.key }))}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all
                              ${excelFilter.range === r.key
                                ? 'bg-blue-700 text-white border-blue-700'
                                : 'bg-white text-blue-900 border-blue-300 hover:bg-blue-100'}`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Khoảng thời gian tùy chọn */}
                    {excelFilter.range === 'custom' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <label className="text-[11px] font-bold text-blue-900">Từ:</label>
                          <input type="date" value={excelFilter.startDate}
                            onChange={e => setExcelFilter(f => ({ ...f, startDate: e.target.value }))}
                            className="text-xs border border-blue-300 rounded-lg px-2 py-1 bg-white text-blue-900" />
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="text-[11px] font-bold text-blue-900">Đến:</label>
                          <input type="date" value={excelFilter.endDate}
                            onChange={e => setExcelFilter(f => ({ ...f, endDate: e.target.value }))}
                            className="text-xs border border-blue-300 rounded-lg px-2 py-1 bg-white text-blue-900" />
                        </div>
                      </div>
                    )}

                    {/* Bộ lọc Trạng thái */}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1">
                        <label className="text-[11px] font-bold text-blue-900">Trạng thái:</label>
                        <select value={excelFilter.status}
                          onChange={e => setExcelFilter(f => ({ ...f, status: e.target.value }))}
                          className="text-xs border border-blue-300 rounded-lg px-2 py-1 bg-white text-blue-900"
                        >
                          <option value="ALL">Tất cả trạng thái</option>
                          <option value="WAITING">Chờ tiếp nhận</option>
                          <option value="PROCESSING">Đang xử lý tại quầy</option>
                          <option value="COMPLETED">Đã hoàn tất & Trả KQ</option>
                          <option value="NEEDS_SUPPLEMENT">Cần bổ sung giấy tờ</option>
                        </select>
                      </div>
                    </div>

                    {/* Nút xuất */}
                    <button
                      type="button"
                      onClick={handleExportWordReport}
                      disabled={isExporting}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4 text-amber-300" />
                      {isExporting ? '⏳ Đang tạo file Word OpenXML...' : '📄 Tải File Word Báo Cáo (.docx) Chuẩn Nghị Định 30/2020/NĐ-CP'}
                    </button>
                  </div>
                )}

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

                          {/* Nút Gọi Loa mời công dân lên quầy (Hạng mục 8.2) */}
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnnounceCallout(sub);
                              }}
                              disabled={callingOutCode === sub.submissionCode}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs
                                ${callingOutCode === sub.submissionCode
                                  ? 'bg-amber-100 text-amber-700 cursor-wait animate-pulse'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'}`}
                              title="Phát loa mời công dân lên quầy tiếp nhận"
                            >
                              <Volume2 className="w-3.5 h-3.5 shrink-0" />
                              <span>{callingOutCode === sub.submissionCode ? '📢 Đang phát...' : '📢 Gọi Loa'}</span>
                            </button>
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
          {/* TAB 2: QUÉT MÃ QR ĐA NĂNG (CAMERA + TẢI ẢNH + BẮN MÃ)   */}
          {/* ======================================================== */}
          {activeTab === 'scan_camera' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto text-center space-y-5 animate-scale-up">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#991B1B] text-xs font-black uppercase">
                <Scan className="w-4 h-4 text-amber-600" />
                <span>BỘ TIẾP NHẬN MÃ QR ĐIỆN TỬ CÁN BỘ MỘT CỬA</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Quét Mã QR Hoặc Nhập Mã Tiếp Nhận Hồ Sơ
              </h2>

              {/* KHUNG QUÉT CAMERA */}
              <div className="space-y-3">
                <div
                  id="officer-qr-reader"
                  className="mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-red-500 max-w-sm bg-slate-950 min-h-[260px] flex items-center justify-center relative text-white"
                >
                  {!cameraRunning && (
                    <div className="p-4 text-slate-400 text-xs space-y-2">
                      <Camera className="w-10 h-10 mx-auto text-slate-500" />
                      <div>Camera đang tạm dừng hoặc chưa được mở.</div>
                      <button
                        type="button"
                        onClick={startQrCamera}
                        className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all inline-flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-300" />
                        <span>Bật Máy Quét Camera</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Điều khiển Camera */}
                <div className="flex items-center justify-center gap-2">
                  {cameraRunning ? (
                    <button
                      type="button"
                      onClick={stopQrCamera}
                      className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Tạm Dừng Camera</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startQrCamera}
                      className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-300" />
                      <span>Bật Lại Camera</span>
                    </button>
                  )}
                </div>

                {cameraError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold text-left">
                    ⚠️ {cameraError}
                  </div>
                )}
              </div>

              {/* TÙY CHỌN 2: TẢI ẢNH MÃ QR TỪ MÁY TÍNH */}
              <div className="pt-3 border-t border-slate-200">
                <input
                  type="file"
                  ref={qrFileInputRef}
                  onChange={handleScanQrFile}
                  accept="image/*"
                  className="hidden"
                />
                <div id="officer-qr-file-dummy" className="hidden" />

                <div className="text-xs font-bold text-slate-600 mb-2">
                  Hoặc nếu người dân gửi ảnh mã QR qua Zalo/điện thoại:
                </div>
                <button
                  type="button"
                  onClick={() => qrFileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs sm:text-sm inline-flex items-center gap-2 border border-amber-300 transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4 text-amber-800" />
                  <span>Chọn Tệp Ảnh Mã QR Để Giải Mã Ngay</span>
                </button>
              </div>

              {/* TÙY CHỌN 3: BẮN SÚNG MÃ VẠCH HOẶC GÕ MÃ HỒ SƠ / CCCD */}
              <div className="pt-3 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-600 mb-2">
                  Dành cho máy quét mã vạch USB cầm tay hoặc gõ mã trực tiếp:
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (quickManualCode.trim()) {
                      handleProcessQrCode(quickManualCode.trim());
                      setQuickManualCode('');
                    }
                  }}
                  className="flex items-center gap-2 max-w-md mx-auto"
                >
                  <input
                    type="text"
                    value={quickManualCode}
                    onChange={(e) => setQuickManualCode(e.target.value)}
                    placeholder="Quét mã vạch hoặc nhập HH-1024 / 12 số CCCD..."
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-red-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm shrink-0 active:scale-95"
                  >
                    Tiếp nhận
                  </button>
                </form>
              </div>

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

      {/* MODAL CẢNH BÁO QUAN TRỌNG: RESET TOÀN BỘ HỒ SƠ THỦ TỤC ĐÃ NỘP (DÀNH CHO ADMIN) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border-2 border-rose-500 overflow-hidden flex flex-col my-auto animate-scale-up">
            
            {/* Header cảnh báo đỏ */}
            <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white p-4 sm:p-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-300 animate-bounce" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                  CẢNH BÁO NGUY HIỂM — QUẢN TRỊ VIÊN
                </div>
                <h3 className="text-base sm:text-lg font-black leading-snug">
                  Xác Nhận Reset Toàn Bộ Hồ Sơ Đã Nộp
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Nội dung lưu ý quan trọng */}
            <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950 space-y-2">
                <div className="font-black text-rose-900 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>⚠️ LƯU Ý ĐẶC BIỆT KHI BẤM RESET:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-rose-900/90 list-disc list-inside">
                  <li>Hành động này sẽ <strong>XÓA SẠCH TOÀN BỘ</strong> tất cả hồ sơ thủ tục hành chính mà người dân đã nộp trên hệ thống.</li>
                  <li>Hàng đợi trực tuyến của Cán bộ Một cửa sẽ được đưa về trạng thái trắng sạch ban đầu (0 hồ sơ) để <strong>sẵn sàng tiếp nhận hồ sơ thực tế</strong>.</li>
                  <li>Mọi thông tin người dân đã khai báo trước đây <strong>sẽ không thể khôi phục lại</strong>.</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                  Nhập chữ <span className="text-red-600 font-mono text-sm underline">RESET</span> vào ô dưới đây để xác nhận:
                </label>
                <input
                  type="text"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  placeholder="Gõ chữ RESET để mở khóa nút xóa..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border-2 border-slate-300 rounded-xl font-mono font-bold text-red-600 outline-none focus:border-red-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Hàng nút bấm */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              >
                Hủy bỏ (Giữ nguyên)
              </button>
              <button
                type="button"
                disabled={resetConfirmInput.trim().toUpperCase() !== 'RESET' || isResetting}
                onClick={handleExecuteResetAll}
                className={`px-5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all ${
                  resetConfirmInput.trim().toUpperCase() === 'RESET' && !isResetting
                    ? 'bg-red-700 hover:bg-red-800 text-white cursor-pointer active:scale-95 ring-2 ring-red-400'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isResetting ? (
                  <span>Đang xóa toàn bộ dữ liệu...</span>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                    <span>Xác Nhận Xóa Toàn Bộ Hồ Sơ</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

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
