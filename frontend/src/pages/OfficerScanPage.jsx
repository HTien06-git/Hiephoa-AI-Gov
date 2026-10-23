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
  LogOut
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { docxExportService } from '../services/docxExportService';
import TrongDongWatermark from '../components/common/TrongDongWatermark';
import DongSonBorder from '../components/common/DongSonBorder';
import AdminDeviceManager from '../components/admin/AdminDeviceManager';

export default function OfficerScanPage({ onSwitchToCitizen, currentUser, authToken, onLogout }) {
  const user = currentUser || JSON.parse(localStorage.getItem('hiephoa_user') || sessionStorage.getItem('hiephoa_user') || '{}');
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('scan_intake'); // 'scan_intake' | 'records_log' | 'receipt_print' | 'admin_security'
  const [scannedData, setScannedData] = useState(null);
  const [scanStatus, setScanStatus] = useState('IDLE'); // IDLE, SCANNING, SUCCESS
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [receiptRecord, setReceiptRecord] = useState(null);

  // Danh sách hồ sơ đã tiếp nhận trong ngày (Demo Data Thực tế tại Xã Hiệp Hòa)
  const [recordsList, setRecordsList] = useState([
    {
      code: 'HH-2026-0042',
      title: 'Đăng ký khai sinh',
      template: 'mau_01_to_khai_dang_ky_khai_sinh.docx',
      applicant: 'NGUYỄN VĂN AN',
      cccd: '072085012345',
      address: 'Ấp Văn Hiệp, xã Hiệp Hòa',
      time: '08:25 Hôm nay',
      status: 'ĐÃ DUYỆT',
      officer: 'Trần Văn Hòa (Công chức Tư pháp)',
      details: {
        ho_ten_nguoi_yeu_cau: 'NGUYỄN VĂN AN',
        so_cccd: '072085012345',
        ho_ten_tre: 'NGUYỄN MINH KHÔI',
        ngay_sinh_tre: '10/10/2026',
        noi_sinh_tre: 'Trung tâm Y tế huyện Đức Hòa',
        noi_thuong_tru: 'Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh'
      }
    },
    {
      code: 'HH-2026-0041',
      title: 'Đăng ký kết hôn',
      template: 'mau_02_to_khai_dang_ky_ket_hon.docx',
      applicant: 'TRẦN VĂN ĐỨC & NGUYỄN THỊ HOA',
      cccd: '072093005678',
      address: 'Ấp Hòa Hiệp, xã Hiệp Hòa',
      time: '09:10 Hôm nay',
      status: 'ĐÃ DUYỆT',
      officer: 'Trần Văn Hòa (Công chức Tư pháp)',
      details: {
        ho_ten_nam: 'TRẦN VĂN ĐỨC',
        ho_ten_nu: 'NGUYỄN THỊ HOA',
        so_cccd_nam: '072093005678',
        so_cccd_nu: '072196007890',
        noi_thuong_tru_nam: 'Ấp Văn Hiệp, xã Hiệp Hòa',
        noi_thuong_tru_nu: 'Ấp Hòa Hiệp, xã Hiệp Hòa'
      }
    },
    {
      code: 'HH-2026-0040',
      title: 'Xác nhận tình trạng hôn nhân (Độc thân)',
      template: 'mau_03_to_khai_xac_nhan_tinh_trang_hon_nhan.docx',
      applicant: 'LÊ HOÀNG NAM',
      cccd: '072096001234',
      address: 'Ấp Rừng Dầu, xã Hiệp Hòa',
      time: '10:15 Hôm nay',
      status: 'CHỜ BỔ SUNG',
      officer: 'Nguyễn Thị Bích (Cán bộ Một cửa)',
      details: {
        ho_ten: 'LÊ HOÀNG NAM',
        gioi_tinh: 'Nam',
        ngay_sinh: '15/06/1996',
        dan_toc: 'Kinh',
        quoc_tich: 'Việt Nam',
        noi_thuong_tru: 'Ấp Rừng Dầu, xã Hiệp Hòa, tỉnh Tây Ninh',
        so_cccd: '072096001234',
        tinh_trang_hon_nhan: 'Chưa đăng ký kết hôn với ai bao giờ (Độc thân)',
        muc_dich_su_dung: 'Để vay vốn ngân hàng thương mại phát triển kinh tế gia đình',
        so_luong_ban: '01'
      }
    },
    {
      code: 'HH-2026-0039',
      title: 'Chứng thực bản sao từ bản chính',
      template: 'mau_04_don_de_nghi_chung_thuc.docx',
      applicant: 'PHẠM VĂN THÀNH',
      cccd: '072085002345',
      address: 'Ấp Văn Hiệp, xã Hiệp Hòa',
      time: '10:45 Hôm nay',
      status: 'ĐÃ TRẢ KẾT QUẢ',
      officer: 'Nguyễn Thị Bích (Cán bộ Một cửa)',
      details: {
        ho_ten: 'PHẠM VĂN THÀNH',
        ngay_sinh: '12/11/1985',
        so_cccd: '072085002345',
        so_dien_thoai: '0938112233',
        noi_thuong_tru: 'Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh',
        loai_chung_thuc: 'Chứng thực bản sao từ bản chính',
        ten_giay_to_chung_thuc: 'Căn cước công dân và Giấy chứng nhận quyền sử dụng đất',
        so_luong_ban: '03',
        muc_dich_su_dung: 'Bổ sung hồ sơ hành chính vay vốn ngân hàng'
      }
    }
  ]);

  // Khởi tạo máy quét mã QR bằng camera
  useEffect(() => {
    let html5QrcodeScanner;
    try {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "officer-qr-reader",
        { fps: 10, qrbox: { width: 240, height: 240 } },
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          handleProcessPayload(decodedText);
          try {
            html5QrcodeScanner.clear();
          } catch (e) {}
        },
        (error) => {}
      );
    } catch (e) {
      console.warn('Scanner init notice:', e);
    }

    return () => {
      try {
        if (html5QrcodeScanner) html5QrcodeScanner.clear();
      } catch (e) {}
    };
  }, [activeTab]);

  const handleProcessPayload = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      setScannedData(parsed);
      setScanStatus('SUCCESS');
      setIsConfirmed(false);
    } catch (e) {
      alert('Mã QR không đúng định dạng hồ sơ điện tử xã Hiệp Hòa.');
    }
  };

  // Nạp dữ liệu mẫu nhanh để demo
  const handleLoadDemoRecord = () => {
    const demoPayload = {
      schema_id: "FORM_KHAI_SINH",
      title: "Tờ khai đăng ký khai sinh",
      time: Date.now(),
      fields: {
        ho_ten_nguoi_yeu_cau: "NGUYỄN VĂN AN",
        so_cccd: "072085012345",
        noi_thuong_tru: "Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh",
        ngay_sinh_nguoi_yeu_cau: "15/08/1962",
        quan_he_voi_tre: "Ông nội",
        so_dien_thoai: "0918123456",
        ho_ten_tre: "NGUYỄN MINH KHÔI",
        gioi_tinh_tre: "Nam",
        ngay_sinh_tre: "10/10/2026",
        ngay_sinh_tre_bang_chu: "Ngày mười tháng mười năm hai nghìn không trăm hai mươi sáu",
        noi_sinh_tre: "Bệnh viện Đa khoa Tây Ninh",
        dan_toc_tre: "Kinh",
        quoc_tich_tre: "Việt Nam",
        que_quan_tre: "Xã Hiệp Hòa, tỉnh Tây Ninh",
        ho_ten_me: "TRẦN THỊ HỒNG",
        nam_sinh_me: "1994",
        dan_toc_me: "Kinh",
        noi_cu_tru_me: "Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh",
        ho_ten_cha: "NGUYỄN VĂN TÀI",
        nam_sinh_cha: "1991",
        dan_toc_cha: "Kinh",
        noi_cu_tru_cha: "Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh",
        ngay_lam_don: String(new Date().getDate()).padStart(2, '0'),
        thang_lam_don: String(new Date().getMonth() + 1).padStart(2, '0'),
        nam_lam_don: String(new Date().getFullYear())
      }
    };
    setScannedData(demoPayload);
    setScanStatus('SUCCESS');
    setIsConfirmed(false);
  };

  // Xác nhận tiếp nhận và thêm vào sổ theo dõi
  const handleConfirmIntake = () => {
    if (!scannedData) return;
    const newRecord = {
      code: `HH-2026-${String(recordsList.length + 43).padStart(4, '0')}`,
      title: scannedData.title || 'Hồ sơ hành chính',
      template: scannedData.schema_id === 'FORM_KHAI_SINH' ? 'mau_01_to_khai_dang_ky_khai_sinh.docx' : 'mau_02_to_khai_dang_ky_ket_hon.docx',
      applicant: scannedData.fields?.ho_ten_nguoi_yeu_cau || scannedData.fields?.ho_ten || scannedData.fields?.ho_ten_nam || 'Công dân',
      cccd: scannedData.fields?.so_cccd || scannedData.fields?.so_cccd_nam || '072xxxxxxxxx',
      address: scannedData.fields?.noi_thuong_tru || 'Xã Hiệp Hòa, Tây Ninh',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' Hôm nay',
      status: 'ĐÃ DUYỆT',
      officer: 'Trần Văn Hòa (Công chức Tư pháp)',
      details: scannedData.fields
    };

    setRecordsList([newRecord, ...recordsList]);
    setIsConfirmed(true);
    setReceiptRecord(newRecord);
  };

  // Xuất file Word từ hồ sơ đã quét
  const handleExportWord = async (recordData) => {
    const data = recordData || scannedData;
    if (!data) return;
    try {
      const templateFilename = data.template || 'mau_01_to_khai_dang_ky_khai_sinh.docx';
      const fields = data.details || data.fields || {};
      const outputName = `HIEP_HOA_${data.code || 'HO_SO'}_${Date.now()}.docx`;
      await docxExportService.generateAndDownloadDocx(templateFilename, fields, outputName);
      alert(`Đã tải thành công file Word hồ sơ ${data.code || ''} về máy! Cán bộ có thể mở kiểm tra và in ấn.`);
    } catch (err) {
      alert('Không thể xuất file Word: ' + err.message);
    }
  };

  const filteredRecords = recordsList.filter(r =>
    r.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      <div>
        {/* HEADER CÁN BỘ MỘT CỬA */}
        <header className="relative bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#7F1D1D] text-white shadow-2xl overflow-hidden border-b-2 border-amber-400">
          <div className="absolute -right-20 -top-20 w-[420px] h-[420px] pointer-events-none opacity-10">
            <TrongDongWatermark size={420} color="#F59E0B" spin={true} />
          </div>

          <div className="max-w-7xl mx-auto px-4 py-3.5 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-2xl bg-white p-1.5 flex items-center justify-center flex-shrink-0 shadow-xl ring-2 ring-amber-400 overflow-hidden">
                <img src="/logo_gov.png" alt="Logo Cổng DVC" className="w-full h-full object-contain max-w-full max-h-full block" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] sm:text-xs uppercase font-extrabold text-amber-300 tracking-wider flex items-center gap-1.5 truncate">
                  <Landmark className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">UBND XÃ HIỆP HÒA — TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG</span>
                </div>
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white leading-snug">
                  HỆ THỐNG QUẢN LÝ TIẾP NHẬN HỒ SƠ ĐIỆN TỬ MỘT CỬA
                </h1>
                <div className="text-xs text-amber-100 font-medium mt-0.5 truncate">
                  Phân hệ Cán bộ Tiếp nhận • Mã hóa số hóa hồ sơ theo Quyết định 06/ĐA-CP
                </div>
              </div>
            </div>

            {/* Thông tin Cán bộ trực & Nút chuyển chế độ */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-950/70 border border-red-500/60 rounded-xl px-3 py-1.5 text-right hidden sm:block">
                <div className="text-[11px] text-amber-300 font-bold uppercase">
                  {isAdmin ? 'Quản Trị Viên:' : 'Cán bộ phụ trách:'}
                </div>
                <div className="text-xs font-black text-white">
                  {isAdmin ? 'ADMINISTRATOR (Hệ Thống)' : (user?.fullName || 'Trần Văn Hòa (Tư pháp - Hộ tịch)')}
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="h-10 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Đăng xuất khỏi tài khoản"
                >
                  <LogOut className="w-4 h-4 text-amber-300" />
                  <span className="hidden md:inline">Đăng Xuất</span>
                </button>
              )}

              <button
                type="button"
                onClick={onSwitchToCitizen}
                className="h-10 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-red-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all whitespace-nowrap cursor-pointer"
                title="Quay lại giao diện dành cho bà con nhân dân"
              >
                <Users className="w-4 h-4 text-red-950" />
                <span>Về Giao Diện Nhân Dân</span>
              </button>
            </div>
          </div>

          <DongSonBorder height={8} />
        </header>

        {/* NỘI DUNG CHÍNH */}
        <main className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          
          {/* THANH THỐNG KÊ KPI TIẾP NHẬN TRONG NGÀY (TOP METRICS) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-[#991B1B] flex items-center justify-center flex-shrink-0 font-black">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase text-slate-500">Tiếp nhận hôm nay</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{recordsList.length + 18} hồ sơ</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-black">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase text-slate-500">Quét QR số hóa</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700">100% tự động</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-black">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase text-slate-500">Đúng & Trước hạn</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">99.5%</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 font-black">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase text-slate-500">Thời gian xử lý</div>
                <div className="text-xl sm:text-2xl font-black text-blue-700">3.2 phút / hồ sơ</div>
              </div>
            </div>
          </div>

          {/* THANH ĐIỀU HƯỚNG TABS NGHIỆP VỤ */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 mb-6 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('scan_intake')}
              className={`h-11 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
                activeTab === 'scan_intake'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Scan className="w-4 h-4 text-amber-300" />
              <span>1. Quét Mã QR & Tiếp Nhận Hồ Sơ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('records_log')}
              className={`h-11 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
                activeTab === 'records_log'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>2. Sổ Theo Dõi Hồ Sơ Trong Ngày ({recordsList.length})</span>
            </button>

            {receiptRecord && (
              <button
                type="button"
                onClick={() => setActiveTab('receipt_print')}
                className={`h-11 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
                  activeTab === 'receipt_print'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                }`}
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>3. In Biên Nhận Hẹn Trả ({receiptRecord.code})</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin_security')}
                className={`h-11 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
                  activeTab === 'admin_security'
                    ? 'bg-gradient-to-r from-red-800 to-amber-700 text-white shadow-md border-2 border-amber-300'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Quản Trị Bảo Mật & Mở Khóa Thiết Bị (Admin)</span>
              </button>
            )}
          </div>


          {/* ======================================================== */}
          {/* TAB 1: QUÉT MÃ QR & TIẾP NHẬN HỒ SƠ MỚI                 */}
          {/* ======================================================== */}
          {activeTab === 'scan_intake' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Cột trái: Máy quét mã QR */}
              <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Scan className="w-5 h-5 text-red-700" />
                      <h3 className="text-base font-black text-slate-900">Máy Quét QR Hồ Sơ Một Cửa</h3>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Sẵn sàng quét
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4">
                    Đưa màn hình điện thoại của người dân có chứa <strong>Mã QR Hồ Sơ</strong> trước camera để hệ thống nạp dữ liệu trong 1 giây.
                  </p>

                  {/* Vùng Render Camera Scanner */}
                  <div id="officer-qr-reader" className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-red-300 bg-slate-50 min-h-[260px] flex items-center justify-center" />
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase">Hoặc nạp nhanh hồ sơ mẫu trình diễn:</div>
                  <button
                    type="button"
                    onClick={handleLoadDemoRecord}
                    className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-red-950" />
                    <span>Nạp Nhanh Hồ Sơ Mẫu (Khai Sinh Bé Minh Khôi)</span>
                  </button>
                </div>
              </div>

              {/* Cột phải: Dữ liệu hồ sơ vừa quét & Nút phê duyệt */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-700" />
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Thông Tin Hồ Sơ Điện Tử Tiếp Nhận
                      </h3>
                    </div>

                    {scanStatus === 'SUCCESS' && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Trích xuất hợp lệ</span>
                      </span>
                    )}
                  </div>

                  {scannedData ? (
                    <div className="space-y-4">
                      {/* Tiêu đề thủ tục */}
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-extrabold uppercase text-red-800">Thủ tục đăng ký:</div>
                          <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                            {scannedData.title}
                          </div>
                        </div>
                        <div className="text-right text-xs text-slate-500 font-semibold">
                          <div>Mã thủ tục: <strong>{scannedData.schema_id}</strong></div>
                          <div>Thời gian quét: {new Date().toLocaleTimeString('vi-VN')}</div>
                        </div>
                      </div>

                      {/* Bảng chi tiết các trường thông tin */}
                      <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700 uppercase">
                          Dữ liệu kê khai chi tiết:
                        </div>
                        <div className="divide-y divide-slate-200 max-h-[320px] overflow-y-auto text-xs sm:text-sm">
                          {Object.entries(scannedData.fields || {}).map(([k, v]) => (
                            <div key={k} className="p-2.5 px-4 flex items-start justify-between gap-4">
                              <span className="text-slate-500 font-semibold w-1/3">{k}:</span>
                              <span className="text-slate-900 font-bold w-2/3 text-right">{norm(String(v))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <QrCode className="w-16 h-16 mb-2 opacity-30" />
                      <div className="font-bold text-sm">Chưa có dữ liệu hồ sơ</div>
                      <p className="text-xs max-w-sm mt-1">
                        Hãy quét mã QR trên điện thoại công dân hoặc bấm "Nạp Nhanh Hồ Sơ Mẫu" ở bên trái để tiếp nhận.
                      </p>
                    </div>
                  )}
                </div>

                {/* Các thao tác phê duyệt */}
                {scannedData && (
                  <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setScannedData(null);
                        setScanStatus('IDLE');
                      }}
                      className="h-11 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                      <span>Hủy bỏ</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportWord()}
                        className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Download className="w-4 h-4 text-amber-300" />
                        <span>Xuất File Word (.docx)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmIntake}
                        className="h-11 px-5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>Xác Nhận Tiếp Nhận & In Biên Nhận</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SỔ THEO DÕI HỒ SƠ TRONG NGÀY                      */}
          {/* ======================================================== */}
          {activeTab === 'records_log' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Sổ Theo Dõi Tiếp Nhận & Trả Kết Quả Hồ Sơ Trong Ngày
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    UBND xã Hiệp Hòa • Ngày {new Date().toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên công dân, số CCCD, mã hồ sơ..."
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Bảng danh sách hồ sơ */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-extrabold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Mã Hồ Sơ</th>
                      <th className="p-3.5">Thủ Tục</th>
                      <th className="p-3.5">Công Dân Kê Khai</th>
                      <th className="p-3.5">Thời Gian</th>
                      <th className="p-3.5">Trạng Thái</th>
                      <th className="p-3.5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRecords.map((r) => (
                      <tr key={r.code} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-black text-red-900">{r.code}</td>
                        <td className="p-3.5 font-bold text-slate-900">{r.title}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{r.applicant}</div>
                          <div className="text-xs text-slate-500">CCCD: {r.cccd}</div>
                        </td>
                        <td className="p-3.5 text-slate-600 font-semibold">{r.time}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            r.status === 'ĐÃ DUYỆT'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : r.status === 'ĐÃ TRẢ KẾT QUẢ'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptRecord(r);
                              setActiveTab('receipt_print');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                            title="Xem và in Phiếu Hẹn Trả Kết Quả"
                          >
                            <Printer className="w-3.5 h-3.5 inline mr-1 text-slate-600" />
                            <span>Biên nhận</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportWord(r)}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition-all cursor-pointer"
                            title="Tải về file đơn Word chuẩn"
                          >
                            <Download className="w-3.5 h-3.5 inline mr-1 text-amber-700" />
                            <span>Word</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PHIẾU TIẾP NHẬN & HẸN TRẢ KẾT QUẢ (A4 CHUẨN)      */}
          {/* ======================================================== */}
          {activeTab === 'receipt_print' && receiptRecord && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Phiếu Tiếp Nhận Hồ Sơ Và Hẹn Trả Kết Quả
                  </h3>
                  <div className="text-xs text-slate-500">Mã hồ sơ: <strong>{receiptRecord.code}</strong></div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="h-10 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>In Phiếu Hẹn (Ctrl+P)</span>
                  </button>
                </div>
              </div>

              {/* Bản in phiếu hẹn A4 chuẩn quy định */}
              <div
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
                className="border border-slate-300 p-8 sm:p-12 bg-white text-black leading-relaxed"
              >
                <div className="text-center font-bold mb-4">
                  <div className="text-xs sm:text-sm uppercase">ỦY BAN NHÂN DÂN XÃ HIỆP HÒA</div>
                  <div className="text-xs sm:text-sm font-black">BỘ PHẬN TIẾP NHẬN VÀ TRẢ KẾT QUẢ</div>
                  <div className="w-24 h-[1px] bg-black mx-auto mt-1 mb-4" />

                  <h3 className="text-base sm:text-lg font-black uppercase mt-2">
                    GIẤY TIẾP NHẬN HỒ SƠ VÀ HẸN TRẢ KẾT QUẢ
                  </h3>
                  <div className="text-xs italic font-normal">Mã số hồ sơ: {receiptRecord.code}</div>
                </div>

                <div className="space-y-3 text-sm my-6">
                  <div>- Bộ phận Một cửa xã Hiệp Hòa tiếp nhận hồ sơ của: <strong>{receiptRecord.applicant}</strong></div>
                  <div>- Số Căn cước công dân: <strong>{receiptRecord.cccd}</strong></div>
                  <div>- Địa chỉ thường trú: {receiptRecord.address}</div>
                  <div>- Tên thủ tục hành chính: <strong>{receiptRecord.title}</strong></div>
                  <div>- Thời gian tiếp nhận: <strong>{receiptRecord.time}</strong></div>
                  <div>- Thời gian hẹn trả kết quả: <strong>Trong ngày làm việc (trước 16h30)</strong></div>
                  <div>- Cán bộ tiếp nhận hồ sơ: <strong>{receiptRecord.officer}</strong></div>
                </div>

                <div className="mt-8 grid grid-cols-2 text-center text-sm">
                  <div>
                    <div className="font-bold uppercase text-xs">NGƯỜI NỘP HỒ SƠ</div>
                    <div className="italic text-xs text-slate-500">(Ký và ghi rõ họ tên)</div>
                    <div className="h-16" />
                    <div className="font-bold uppercase">{receiptRecord.applicant}</div>
                  </div>
                  <div>
                    <div className="italic text-xs">Hiệp Hòa, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
                    <div className="font-bold uppercase text-xs mt-1">CÁN BỘ TIẾP NHẬN</div>
                    <div className="italic text-xs text-slate-500">(Ký và ghi rõ họ tên)</div>
                    <div className="h-16" />
                    <div className="font-bold uppercase">{receiptRecord.officer}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: QUẢN TRỊ BẢO MẬT & MỞ KHÓA THIẾT BỊ (ADMIN)       */}
          {/* ======================================================== */}
          {activeTab === 'admin_security' && (
            <AdminDeviceManager authToken={authToken} />
          )}

        </main>

      </div>

      {/* FOOTER CÁN BỘ */}
      <footer className="bg-slate-900 text-slate-400 py-4 px-4 text-center text-xs border-t border-slate-800">
        Trung tâm Phục vụ Hành chính công UBND xã Hiệp Hòa, tỉnh Tây Ninh • Hệ thống Quản trị Tiếp nhận Một cửa Điện tử
      </footer>
    </div>
  );
}
