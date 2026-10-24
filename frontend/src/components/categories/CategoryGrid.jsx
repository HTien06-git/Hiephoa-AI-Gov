import React, { useState } from 'react';
import {
  Baby,
  Heart,
  FileCheck2,
  ShieldCheck,
  MapPin,
  Scale,
  HeartHandshake,
  Users,
  FileText,
  Volume2,
  Sparkles,
  Building2,
  Clock,
  Banknote,
  HelpCircle,
  FileSignature
} from 'lucide-react';

// Map icon chuyên nghiệp cho từng thủ tục cụ thể
const PROCEDURE_ICONS = {
  PROC_KHAI_SINH: Baby,
  PROC_KET_HON: Heart,
  PROC_TINH_TRANG_HON_NHAN: FileCheck2,
  PROC_CHUNG_THUC_SAO_Y: ShieldCheck,
  PROC_XAC_NHAN_CU_TRU: MapPin,
  PROC_TANG_CHO_DAT: Scale,
  PROC_TRO_CAP_NGUOI_CAO_TUOI: HeartHandshake,
  PROC_HO_NGHEO_KHO_KHAN: Users
};

export default function CategoryGrid({
  categories = [],
  procedures = [],
  onSelectProcedure,
  onOpenAutoForm,
  onOpenPreCheck,
  speakText
}) {
  const [selectedCatId, setSelectedCatId] = useState('all');

  // Danh sách các tab bộ lọc ngang trang nhã, đúng tông nhà nước
  const filterTabs = [
    { id: 'all', label: 'Tất cả thủ tục', count: procedures.length },
    { id: 'ho_tich_cu_tru', label: 'Hộ tịch – Cư trú', count: 4 },
    { id: 'dat_dai_xay_dung', label: 'Đất đai – Xây dựng', count: 1 },
    { id: 'chung_thuc', label: 'Chứng thực sao y', count: 1 },
    { id: 'chinh_sach_xa_hoi', label: 'Chính sách – Bảo trợ', count: 1 },
    { id: 'tu_van_phap_luat', label: 'Tư vấn Pháp luật', count: 1 }
  ];

  const filteredProcedures = selectedCatId === 'all'
    ? procedures
    : procedures.filter(p => p.category_id === selectedCatId);

  const handleSuggestedQuestionClick = (proc) => {
    const fullText = `Bà con đang hỏi: "${proc.suggested_question}". ${proc.voice_answer}`;
    if (speakText) speakText(fullText);
    if (onSelectProcedure) onSelectProcedure(proc);
  };

  return (
    <section className="my-8">
      {/* Tiêu đề mục Danh mục dịch vụ công chuẩn hóa */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/80 text-[#991B1B] text-xs font-bold uppercase tracking-wider border border-red-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>DANH MỤC DỊCH VỤ CÔNG CHUẨN HÓA CẤP XÃ</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            08 Thủ Tục Hành Chính Trực Tuyến & Tư Vấn Pháp Luật
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Bà con chọn thủ tục bên dưới để hệ thống AI hướng dẫn hồ sơ, tự động điền đơn Word hoặc kiểm tra ảnh chụp giấy tờ trước khi nộp.
          </p>
        </div>
      </div>

      {/* THANH TAB LỌC 05 NHÓM DANH MỤC ĐỒNG BỘ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {filterTabs.map((tab) => {
          const isSelected = selectedCatId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCatId(tab.id)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 active:scale-95 whitespace-nowrap ${
                isSelected
                  ? 'bg-[#991B1B] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-amber-200/90 hover:border-amber-500 hover:text-amber-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                isSelected ? 'bg-amber-400 text-[#7F1D1D]' : 'bg-amber-50 text-amber-800'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* LƯỚI THẺ THỦ TỤC 2 CỘT — SẠCH SẼ, TINH TẾ, KHÔNG DÙNG 3 MÀU LÒE LOẸT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredProcedures.map((proc, index) => {
          const ProcIcon = PROCEDURE_ICONS[proc.id] || FileText;
          const feeStr = proc.checklist?.agency_deadline_fee?.fee || 'Miễn phí (0 đồng)';
          const deadlineStr = proc.checklist?.agency_deadline_fee?.deadline || 'Giải quyết trong ngày';
          const agencyStr = proc.checklist?.agency_deadline_fee?.agency || 'UBND xã Hiệp Hòa';
          const isFree = feeStr.toLowerCase().includes('miễn phí') || feeStr.toLowerCase().includes('0 đồng');

          return (
            <div
              key={proc.id}
              className="bg-white rounded-2xl border border-stone-200/90 hover:border-amber-500/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                {/* 1. Phần đầu thẻ: Icon trong huy hiệu Đỏ Son - Vàng Kim + Tên thủ tục + Nhãn trạng thái */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-[#991B1B] border border-red-200/60 flex items-center justify-center shrink-0 shadow-xs">
                      <ProcIcon className="w-6 h-6 shrink-0" />
                    </div>

                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md inline-block mb-1">
                        Thủ tục số #{index + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {proc.title}
                      </h3>
                    </div>
                  </div>

                  {/* Nhãn trạng thái gọn gàng */}
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    isFree
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {isFree ? 'Miễn phí' : 'Theo quy định'}
                  </span>
                </div>

                {/* 2. Khung thông tin cốt lõi (2 dòng sạch sẽ, uy tín) */}
                <div className="rounded-xl bg-stone-50 border border-stone-200/80 p-3 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#991B1B] shrink-0" />
                    <span className="truncate">
                      <strong className="text-slate-900">Cơ quan giải quyết:</strong> {agencyStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="truncate">
                      <strong className="text-slate-900">Thời hạn & Lệ phí:</strong> {deadlineStr} • {feeStr}
                    </span>
                  </div>
                </div>

                {/* 3. Thanh Nghe Hướng Dẫn Nhanh nền kem nhẹ */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSuggestedQuestionClick(proc)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSuggestedQuestionClick(proc); }}
                  className="bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 rounded-xl px-3.5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#991B1B] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-800 italic line-clamp-1">
                      "{proc.suggested_question}"
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#991B1B] shrink-0 hidden sm:inline">
                    Nghe AI đọc
                  </span>
                </div>
              </div>

              {/* 4. Chân thẻ chỉ gồm đúng 02 Nút Hành Động Chuẩn Mực */}
              <div className="grid grid-cols-2 gap-2.5 pt-4 mt-3 border-t border-stone-100">
                {/* Nút 1: Đỏ Son Chính Phủ */}
                <button
                  type="button"
                  onClick={() => onOpenAutoForm(proc, 'data_input')}
                  className="bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-semibold py-2.5 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98"
                >
                  <FileSignature className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="whitespace-nowrap">Điền Đơn & Mã QR</span>
                </button>

                {/* Nút 2: Trắng viền Vàng Đồng đậm */}
                <button
                  type="button"
                  onClick={() => onSelectProcedure(proc)}
                  className="bg-amber-50/60 hover:bg-amber-100/80 text-[#7F1D1D] border border-amber-400/80 font-semibold py-2.5 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors active:scale-98"
                >
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="whitespace-nowrap">Chi Tiết & Hỏi AI</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
