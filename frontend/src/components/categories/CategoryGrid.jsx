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
  Camera,
  Layers,
  Building2,
  Clock,
  Banknote,
  Award,
  ChevronRight
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

  // Danh sách các tab bộ lọc ngang phong cách K-Tech
  const filterTabs = [
    { id: 'all', label: 'Tất cả', count: procedures.length },
    { id: 'ho_tich_cu_tru', label: 'Hộ tịch – Cư trú', count: 4 },
    { id: 'dat_dai_xay_dung', label: 'Đất đai – Xây dựng', count: 1 },
    { id: 'chung_thuc', label: 'Chứng thực', count: 1 },
    { id: 'chinh_sach_xa_hoi', label: 'Chính sách – Bảo trợ', count: 1 },
    { id: 'tu_van_phap_luat', label: 'Tư vấn Luật', count: 1 }
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
    <section className="my-6">
      {/* Tiêu đề mục Danh mục dịch vụ công */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>DANH MỤC DỊCH VỤ CÔNG CHUẨN HÓA</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mt-1">
            08 Thủ Tục Hành Chính Cấp Xã & Tư Vấn Pháp Luật
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Chạm vào bất kỳ thủ tục nào để AI đọc to hướng dẫn, tự động điền đơn Word hoặc kiểm tra ảnh giấy tờ.
          </p>
        </div>
      </div>

      {/* THANH TAB LỌC DANH MỤC NGANG (K-TECH FILTER PILLS) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar max-w-full">
        {filterTabs.map((tab) => {
          const isSelected = selectedCatId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCatId(tab.id)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 whitespace-nowrap ${
                isSelected
                  ? 'bg-[#991B1B] text-white shadow-sm ring-2 ring-red-300 font-black'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                isSelected ? 'bg-amber-400 text-red-950' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* LƯỚI THẺ THỦ TỤC 2 CỘT (DESKTOP) & 1 CỘT (MOBILE) KHÔNG TRÀN VIỀN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProcedures.map((proc, index) => {
          const ProcIcon = PROCEDURE_ICONS[proc.id] || FileText;
          const feeStr = proc.checklist?.agency_deadline_fee?.fee || 'Miễn phí (0 đồng)';
          const deadlineStr = proc.checklist?.agency_deadline_fee?.deadline || 'Giải quyết trong ngày';
          const isFree = feeStr.toLowerCase().includes('miễn phí') || feeStr.toLowerCase().includes('0 đồng');
          const isSameDay = deadlineStr.toLowerCase().includes('trong ngày');

          return (
            <div
              key={proc.id}
              className="rounded-2xl bg-white p-4 sm:p-5 shadow-2xs border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Header Thẻ: Icon chuyên nghiệp + Tên thủ tục + Badge ngắn gọn (chỉ 2-3 chữ) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-red-100 to-amber-100 border border-amber-300 text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                      <ProcIcon className="w-6 h-6 shrink-0" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-[#991B1B] text-[10px] sm:text-xs font-black whitespace-nowrap">
                          Thủ tục #{index + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap ${
                          isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isFree ? 'Miễn phí' : 'Theo quy định'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] sm:text-xs font-bold whitespace-nowrap">
                          {isSameDay ? 'Trong ngày' : 'Theo lịch hẹn'}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {proc.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Mô tả ngắn */}
                <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {proc.short_desc}
                </p>

                {/* KHUNG TÓM TẮT 2 DÒNG: CƠ QUAN & THỜI HẠN (TỰ ĐỘNG XUỐNG DÒNG, TUYỆT ĐỐI KHÔNG BỊ TRÀN) */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1 overflow-hidden">
                  <div className="flex items-start gap-1.5 whitespace-normal break-words">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Cơ quan:</strong> {proc.checklist?.agency_deadline_fee?.agency || 'UBND xã Hiệp Hòa, tỉnh Tây Ninh'}</span>
                  </div>
                  <div className="flex items-start gap-1.5 whitespace-normal break-words">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Thời hạn:</strong> {deadlineStr}</span>
                  </div>
                  <div className="flex items-start gap-1.5 whitespace-normal break-words">
                    <Banknote className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Lệ phí:</strong> {feeStr}</span>
                  </div>
                </div>

                {/* HỘP MÀU KEM: BẤM ĐỂ AI ĐỌC TO CÂU HỎI MẪU (100% TỰ XUỐNG DÒNG KHÔNG ĐÂM VIỀN) */}
                <button
                  type="button"
                  onClick={() => handleSuggestedQuestionClick(proc)}
                  className="mt-3 w-full text-left p-3 rounded-xl bg-amber-50/90 hover:bg-amber-100 border border-amber-200 flex items-start gap-2.5 transition-all group overflow-hidden shadow-2xs active:scale-98"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#991B1B] text-amber-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 break-words">
                    <div className="text-[10px] uppercase font-black text-[#991B1B] tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>CHẠM ĐỂ AI ĐỌC HƯỚNG DẪN MẪU:</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 break-words">
                      "{proc.suggested_question}"
                    </div>
                  </div>
                </button>
              </div>

              {/* CỤM 3 NÚT THAO TÁC ĐỒNG ĐỀU SANG TRỌNG */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Nút 1 (Chính): Điền Đơn Word & Tạo QR */}
                <button
                  type="button"
                  onClick={() => onOpenAutoForm(proc, 'data_input')}
                  className="w-full h-10 px-2 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 ring-1 ring-amber-300/60"
                  title="Điền đơn tự động và tạo mã QR"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">Điền Đơn & Mã QR</span>
                </button>

                {/* Nút 2: Xem Hồ Sơ & Hỏi AI */}
                <button
                  type="button"
                  onClick={() => onSelectProcedure(proc)}
                  className="w-full h-10 px-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                  title="Xem thành phần hồ sơ và hỏi đáp với AI"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                  <span className="truncate">Xem Hồ Sơ & Hỏi AI</span>
                </button>

                {/* Nút 3: Kiểm Tra Ảnh Giấy Tờ */}
                <button
                  type="button"
                  onClick={() => onOpenPreCheck(proc)}
                  className="w-full h-10 px-2 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                  title="Chụp ảnh giấy tờ để AI kiểm tra sơ bộ"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                  <span className="truncate">Kiểm Tra Giấy Tờ</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
