import React, { useState } from 'react';
import { Printer, X, Plus, Trash2, Calendar, User, FileText, Check, Clock, ShieldCheck } from 'lucide-react';

/**
 * AppointmentSlipModal: Soạn thảo & In Giấy tiếp nhận hồ sơ và hẹn trả kết quả
 * Chuẩn Nghị định 61/2018/NĐ-CP & Thông tư 01/2018/TT-VPCP của Văn phòng Chính phủ
 * Bắt buộc font chữ: Times New Roman ('Times New Roman', Times, serif)
 */
export default function AppointmentSlipModal({ submission, currentUser, onClose }) {
  if (!submission) return null;

  // Lấy dữ liệu ban đầu từ submission
  const initCitizenName = submission.citizenName || submission.formData?.ho_ten || submission.formData?.ho_ten_nguoi_yeu_cau || submission.formData?.ho_ten_nguoi_khai || 'Nguyễn Văn A';
  const initCccd = submission.citizenCccd || submission.formData?.so_cccd || submission.formData?.so_cccd_nguoi_yeu_cau || submission.formData?.so_dinh_danh || '072096001234';
  const initPhone = submission.citizenPhone || submission.formData?.so_dien_thoai || submission.formData?.sdt || '0912345678';
  const initAddress = submission.hamlet || submission.formData?.dia_chi_thuong_tru || submission.formData?.noi_thuong_tru || 'Xã Hiệp Hòa, tỉnh Tây Ninh';
  const initOfficer = currentUser?.name || 'Cán bộ Tiếp nhận Một cửa';

  // Tính ngày hẹn trả kết quả mặc định (Thường sau 1-3 ngày làm việc)
  const defaultReceiptDate = new Date(submission.createdAt || Date.now());
  const defaultReturnDate = new Date(defaultReceiptDate.getTime() + 2 * 24 * 60 * 60 * 1000);

  const formatDateTimeStr = (d) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours} giờ ${minutes} phút, ngày ${day}/${month}/${year}`;
  };

  const [slipData, setSlipData] = useState({
    slipNumber: `${submission.submissionCode}/TNHH-HH`,
    citizenName: initCitizenName,
    citizenCccd: initCccd,
    citizenPhone: initPhone,
    citizenAddress: initAddress,
    procedureTitle: submission.procedureTitle || 'Thủ tục hành chính',
    receiptTime: formatDateTimeStr(defaultReceiptDate),
    appointmentReturnTime: formatDateTimeStr(defaultReturnDate),
    officerName: initOfficer,
    location: 'Bộ phận Tiếp nhận và Trả kết quả UBND xã Hiệp Hòa (Ấp An Hòa, xã Hiệp Hòa, tỉnh Tây Ninh)',
    notes: 'Khi đến nhận kết quả, người nộp hồ sơ mang theo Giấy tiếp nhận này và xuất trình bản chính Căn cước công dân để đối chiếu.',
    documents: [
      { id: 1, name: `Tờ khai ${submission.procedureTitle || 'theo mẫu'}`, quantity: '01 bản chính', status: 'Đầy đủ, hợp lệ' },
      { id: 2, name: 'Bản sao thẻ Căn cước công dân / Định danh điện tử', quantity: '01 bản sao', status: 'Đã đối chiếu bản chính' },
      { id: 3, name: 'Các văn bản, chứng từ kèm theo theo quy định', quantity: '01 bộ', status: 'Đạt yêu cầu' }
    ]
  });

  const [activeTab, setActiveTab] = useState('preview'); // 'edit' | 'preview'

  const handleAddDoc = () => {
    setSlipData(prev => ({
      ...prev,
      documents: [
        ...prev.documents,
        { id: Date.now(), name: 'Giấy tờ bổ sung khác...', quantity: '01 bản', status: 'Bản chính / bản sao' }
      ]
    }));
  };

  const handleRemoveDoc = (id) => {
    setSlipData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id)
    }));
  };

  const handleUpdateDoc = (id, field, value) => {
    setSlipData(prev => ({
      ...prev,
      documents: prev.documents.map(d => (d.id === id ? { ...d, [field]: value } : d))
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Stylesheet chuyên biệt cho in ấn: Ép font chữ Times New Roman và ẩn toàn bộ giao diện thừa */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-appointment-slip, #printable-appointment-slip * {
            visibility: visible;
          }
          #printable-appointment-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            padding: 15mm 20mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border-2 border-amber-400 overflow-hidden flex flex-col max-h-[95vh] my-auto">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#7F1D1D] text-white p-3.5 sm:p-4 flex items-center justify-between border-b-2 border-amber-400 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase text-amber-200">
                Soạn & In Giấy Tiếp Nhận Hồ Sơ Và Hẹn Trả Kết Quả
              </h3>
              <p className="text-[11px] text-amber-100/90 font-medium">
                Mã hồ sơ: <strong className="font-mono text-white">{submission.submissionCode}</strong> • Phông chữ chuẩn hành chính: <strong>Times New Roman</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="h-9 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Giấy Hẹn (A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-red-950 hover:bg-black text-white flex items-center justify-center transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab chuyển đổi Soạn Thảo <-> Xem Trước Bản In */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-[#991B1B] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              📄 Xem Trước Bản In (Times New Roman)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'edit'
                  ? 'bg-[#991B1B] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              ✏️ Soạn / Điều Chỉnh Thông Tin Giấy Hẹn
            </button>
          </div>
          <span className="text-[11px] text-slate-500 italic hidden sm:inline">
            💡 Tự động điền theo dữ liệu hồ sơ vừa thụ lý
          </span>
        </div>

        {/* Nội dung chính Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          
          {/* TAB 1: FORM SOẠN THẢO CHI TIẾT */}
          {activeTab === 'edit' && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h4 className="font-black text-slate-800 uppercase text-xs sm:text-sm border-b pb-2 text-[#991B1B]">
                1. Thông tin người nộp & tiếp nhận hồ sơ
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Họ và tên người nộp hồ sơ:
                  </label>
                  <input
                    type="text"
                    value={slipData.citizenName}
                    onChange={(e) => setSlipData({ ...slipData, citizenName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số CCCD / Định danh cá nhân:
                  </label>
                  <input
                    type="text"
                    value={slipData.citizenCccd}
                    onChange={(e) => setSlipData({ ...slipData, citizenCccd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số điện thoại liên lạc:
                  </label>
                  <input
                    type="text"
                    value={slipData.citizenPhone}
                    onChange={(e) => setSlipData({ ...slipData, citizenPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Địa chỉ thường trú:
                  </label>
                  <input
                    type="text"
                    value={slipData.citizenAddress}
                    onChange={(e) => setSlipData({ ...slipData, citizenAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nội dung yêu cầu giải quyết (Tên thủ tục):
                  </label>
                  <input
                    type="text"
                    value={slipData.procedureTitle}
                    onChange={(e) => setSlipData({ ...slipData, procedureTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Thời gian tiếp nhận:
                  </label>
                  <input
                    type="text"
                    value={slipData.receiptTime}
                    onChange={(e) => setSlipData({ ...slipData, receiptTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Thời gian hẹn trả kết quả:
                  </label>
                  <input
                    type="text"
                    value={slipData.appointmentReturnTime}
                    onChange={(e) => setSlipData({ ...slipData, appointmentReturnTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-[#991B1B] focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cán bộ tiếp nhận hồ sơ:
                  </label>
                  <input
                    type="text"
                    value={slipData.officerName}
                    onChange={(e) => setSlipData({ ...slipData, officerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số tiếp nhận giấy hẹn:
                  </label>
                  <input
                    type="text"
                    value={slipData.slipNumber}
                    onChange={(e) => setSlipData({ ...slipData, slipNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              {/* Danh sách thành phần hồ sơ nộp */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-800 uppercase text-xs text-[#991B1B]">
                    2. Danh mục giấy tờ đã tiếp nhận
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddDoc}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm giấy tờ</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {slipData.documents.map((doc, index) => (
                    <div key={doc.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="w-5 text-center font-bold text-slate-500 shrink-0">{index + 1}.</span>
                      <input
                        type="text"
                        value={doc.name}
                        onChange={(e) => handleUpdateDoc(doc.id, 'name', e.target.value)}
                        placeholder="Tên loại giấy tờ..."
                        className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={doc.quantity}
                        onChange={(e) => handleUpdateDoc(doc.id, 'quantity', e.target.value)}
                        placeholder="Số lượng (bản)..."
                        className="w-28 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={doc.status}
                        onChange={(e) => handleUpdateDoc(doc.id, 'status', e.target.value)}
                        placeholder="Tình trạng..."
                        className="w-36 px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dặn dò công dân */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Trách nhiệm & Dặn dò người nộp hồ sơ khi đến nhận kết quả:
                </label>
                <textarea
                  rows={2}
                  value={slipData.notes}
                  onChange={(e) => setSlipData({ ...slipData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-normal focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold text-xs"
                >
                  Xác nhận & Xem bản in
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BẢN IN GIẤY HẸN KHỔ A4 (FONT CHỮ TIMES NEW ROMAN) */}
          <div
            id="printable-appointment-slip"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
            className={`bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-300 text-black leading-relaxed ${
              activeTab !== 'preview' ? 'hidden sm:block opacity-60' : 'block'
            }`}
          >
            {/* Header Quốc hiệu - Cơ quan ban hành */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
              <tbody>
                <tr style={{ verticalAlign: 'top' }}>
                  <td style={{ width: '45%', textAlign: 'center' }}>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      ỦY BAN NHÂN DÂN XÃ HIỆP HÒA
                    </div>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'underline' }}>
                      BỘ PHẬN TIẾP NHẬN VÀ TRẢ KẾT QUẢ
                    </div>
                    <div style={{ fontSize: '11pt', marginTop: '6px' }}>
                      Số: {slipData.slipNumber}
                    </div>
                  </td>
                  <td style={{ width: '55%', textAlign: 'center' }}>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </div>
                    <div style={{ fontSize: '13pt', fontWeight: 'bold' }}>
                      Độc lập - Tự do - Hạnh phúc
                    </div>
                    <div style={{ fontSize: '11pt', margin: '4px auto 8px auto', borderBottom: '1px solid black', width: '150px' }} />
                    <div style={{ fontSize: '12pt', fontStyle: 'italic' }}>
                      Hiệp Hòa, ngày {currentDay} tháng {currentMonth} năm {currentYear}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tiêu đề Giấy hẹn */}
            <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '18px' }}>
              <div style={{ fontSize: '15pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                GIẤY TIẾP NHẬN HỒ SƠ VÀ HẸN TRẢ KẾT QUẢ
              </div>
              <div style={{ fontSize: '12pt', fontStyle: 'italic', marginTop: '4px' }}>
                Mã số hồ sơ điện tử: <strong>{submission.submissionCode}</strong>
              </div>
            </div>

            {/* Nội dung tiếp nhận */}
            <div style={{ fontSize: '13pt', lineHeight: '1.6', textAlign: 'justify' }}>
              <p style={{ margin: '6px 0' }}>
                Bộ phận Tiếp nhận và Trả kết quả Ủy ban nhân dân xã Hiệp Hòa tiếp nhận hồ sơ của:
              </p>
              
              <p style={{ margin: '4px 0', textIndent: '15px' }}>
                - Ông / Bà: <strong>{slipData.citizenName}</strong>
              </p>
              <p style={{ margin: '4px 0', textIndent: '15px' }}>
                - Số Căn cước công dân / Định danh: <strong>{slipData.citizenCccd}</strong>
                &nbsp;&nbsp;&nbsp;&nbsp;Điện thoại liên hệ: <strong>{slipData.citizenPhone}</strong>
              </p>
              <p style={{ margin: '4px 0', textIndent: '15px' }}>
                - Nơi thường trú: {slipData.citizenAddress}
              </p>
              <p style={{ margin: '4px 0', textIndent: '15px' }}>
                - Nội dung yêu cầu giải quyết: <strong>{slipData.procedureTitle}</strong>
              </p>

              <p style={{ margin: '8px 0 4px 0' }}>
                <strong>Thành phần hồ sơ tiếp nhận gồm:</strong>
              </p>

              {/* Bảng danh sách giấy tờ nộp */}
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0', fontSize: '12pt' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center', width: '40px' }}>STT</th>
                    <th style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'left' }}>Tên loại giấy tờ, tài liệu</th>
                    <th style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center', width: '110px' }}>Số lượng</th>
                    <th style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center', width: '160px' }}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {slipData.documents.map((doc, idx) => (
                    <tr key={doc.id}>
                      <td style={{ border: '1px solid black', padding: '5px 8px', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid black', padding: '5px 8px' }}>{doc.name}</td>
                      <td style={{ border: '1px solid black', padding: '5px 8px', textAlign: 'center' }}>{doc.quantity}</td>
                      <td style={{ border: '1px solid black', padding: '5px 8px', textAlign: 'center' }}>{doc.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p style={{ margin: '6px 0', textIndent: '15px' }}>
                - Số lượng hồ sơ: <strong>01 bộ</strong>.
              </p>
              <p style={{ margin: '6px 0', textIndent: '15px' }}>
                - Thời gian tiếp nhận: <strong>{slipData.receiptTime}</strong>.
              </p>
              <p style={{ margin: '6px 0', textIndent: '15px' }}>
                - Thời gian hẹn trả kết quả: <strong style={{ textDecoration: 'underline' }}>{slipData.appointmentReturnTime}</strong>.
              </p>
              <p style={{ margin: '6px 0', textIndent: '15px' }}>
                - Địa điểm trả kết quả: {slipData.location}.
              </p>
              <p style={{ margin: '6px 0', textIndent: '15px', fontStyle: 'italic' }}>
                - Ghi chú: {slipData.notes}
              </p>
            </div>

            {/* Chữ ký 2 bên */}
            <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ verticalAlign: 'top', textAlign: 'center' }}>
                  <td style={{ width: '50%' }}>
                    <div style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      NGƯỜI NỘP HỒ SƠ
                    </div>
                    <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>
                      (Ký và ghi rõ họ tên)
                    </div>
                    <div style={{ height: '75px' }} />
                    <div style={{ fontSize: '13pt', fontWeight: 'bold' }}>
                      {slipData.citizenName}
                    </div>
                  </td>
                  <td style={{ width: '50%' }}>
                    <div style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      NGƯỜI TIẾP NHẬN HỒ SƠ
                    </div>
                    <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>
                      (Ký, đóng dấu hoặc xác thực điện tử)
                    </div>
                    <div style={{ height: '75px' }} />
                    <div style={{ fontSize: '13pt', fontWeight: 'bold' }}>
                      {slipData.officerName}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>

        </div>

        {/* Footer Modal */}
        <div className="bg-white p-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="text-[11px] text-slate-500 font-sans">
            Mẫu 01 theo Nghị định 61/2018/NĐ-CP • Font chữ bắt buộc: <strong>Times New Roman</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>In Ngay (Khổ A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
