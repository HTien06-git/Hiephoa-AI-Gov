import React, { useState } from 'react';
import {
  Users,
  MapPin,
  FileCheck2,
  HeartHandshake,
  Scale,
  Volume2,
  FileText,
  Camera,
  ChevronRight,
  Sparkles,
  Banknote,
  Clock,
  Baby,
  Heart,
  ShieldCheck,
  Building2,
  Layers,
  ArrowRightCircle,
  Award,
  Landmark
} from 'lucide-react';

const ICON_MAP = {
  Users: Users,
  MapPin: MapPin,
  FileCheck2: FileCheck2,
  HeartHandshake: HeartHandshake,
  Scale: Scale
};

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
      {/* Tiêu đề mục Danh mục thủ tục */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
            <span className="whitespace-nowrap">DANH MỤC DỊCH VỤ CÔNG CẤP XÃ</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">
            05 Nhóm Thủ Tục Hành Chính Phổ Biến Nhất Tại Xã Hiệp Hòa
          </h2>
          <p className="text-sm md:text-base text-slate-600 mt-0.5">
            Chạm vào bất kỳ mục nào, Chuyên viên AI sẽ đọc to và hướng dẫn từng bước chi tiết cho bà con!
          </p>
        </div>

        {/* Nút lọc tất cả */}
        <button
          type="button"
          onClick={() => setSelectedCatId('all')}
          className={`h-11 px-4 rounded-xl text-sm md:text-base font-bold transition-all whitespace-nowrap inline-flex items-center justify-center gap-2 shadow-xs ${
            selectedCatId === 'all'
              ? 'bg-[#991B1B] text-white shadow-md font-black'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Tất cả thủ tục ({procedures.length})</span>
        </button>
      </div>

      {/* 5 Big Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8 auto-rows-fr">
        {categories.map((cat) => {
          // Định nghĩa style tĩnh chuẩn hành chính chuyên nghiệp, triệt tiêu lỗi mất icon / ô vuông trắng
          const styleConfig = {
            ho_tich_cu_tru: {
              badgeClass: 'bg-red-700 text-amber-300 shadow-md ring-2 ring-amber-400/60',
              icon: Baby,
              borderHover: 'hover:border-red-600'
            },
            dat_dai_xay_dung: {
              badgeClass: 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300/60',
              icon: Landmark,
              borderHover: 'hover:border-amber-600'
            },
            chung_thuc: {
              badgeClass: 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-300/60',
              icon: ShieldCheck,
              borderHover: 'hover:border-emerald-600'
            },
            chinh_sach_xa_hoi: {
              badgeClass: 'bg-blue-700 text-white shadow-md ring-2 ring-blue-300/60',
              icon: HeartHandshake,
              borderHover: 'hover:border-blue-600'
            },
            tu_van_phap_luat: {
              badgeClass: 'bg-indigo-800 text-amber-300 shadow-md ring-2 ring-amber-400/60',
              icon: Scale,
              borderHover: 'hover:border-indigo-600'
            }
          }[cat.id] || {
            badgeClass: 'bg-red-700 text-amber-300 shadow-md ring-2 ring-amber-400/60',
            icon: ICON_MAP[cat.icon] || FileText,
            borderHover: 'hover:border-red-600'
          };

          const IconComponent = styleConfig.icon;
          const isSelected = selectedCatId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCatId(isSelected ? 'all' : cat.id)}
              className={`p-4 md:p-5 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between border-2 shadow-xs relative overflow-hidden group h-full ${
                isSelected
                  ? 'border-[#991B1B] bg-red-50/40 ring-4 ring-red-100 shadow-md scale-102'
                  : `border-slate-200 bg-white ${styleConfig.borderHover} hover:shadow-md`
              }`}
            >
              <div>
                {/* Huy hiệu Icon (Icon Badge) 56px x 56px chuẩn Version 3.0 */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 flex-shrink-0 transition-transform group-hover:scale-105 ${styleConfig.badgeClass}`}>
                  <IconComponent className="w-7 h-7 flex-shrink-0 stroke-[2.2]" />
                </div>

                <div className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wide whitespace-nowrap">
                  {cat.badge}
                </div>
                <h3 className="text-base md:text-lg font-black text-slate-900 leading-snug mt-0.5">
                  {cat.name}
                </h3>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-[#991B1B]">
                <span className="line-clamp-1">{cat.description}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Danh sách thẻ thủ tục chi tiết với icon chuyên nghiệp */}
      <div className="space-y-4">
        {filteredProcedures.map((proc, index) => {
          const ProcIcon = PROCEDURE_ICONS[proc.id] || FileText;

          return (
            <div
              key={proc.id}
              className="bg-white rounded-3xl p-5 md:p-6 border-2 border-slate-200 hover:border-[#991B1B]/70 shadow-sm hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                
                {/* Cụm thông tin thủ tục */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    {/* Badge số thứ tự */}
                    <span className="px-3 py-1 rounded-full bg-red-100 text-[#991B1B] text-xs font-black inline-flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Thủ tục số {index + 1}</span>
                    </span>

                    {/* Badge Lệ phí */}
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap border border-slate-200">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{proc.checklist?.agency_deadline_fee?.fee || 'Miễn phí'}</span>
                    </span>

                    {/* Badge Thời gian giải quyết */}
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap border border-emerald-200">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{proc.checklist?.agency_deadline_fee?.deadline || 'Trong ngày'}</span>
                    </span>

                    {/* Badge Cơ quan tiếp nhận */}
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap border border-blue-200 hidden sm:inline-flex">
                      <Building2 className="w-3.5 h-3.5 text-blue-700" />
                      <span>Một cửa Xã Hiệp Hòa</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mt-1">
                    {/* Icon đại diện thủ tục */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-red-100 to-amber-100 border border-amber-300 text-[#991B1B] flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                      <ProcIcon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                        {proc.title}
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 mt-1 leading-relaxed">
                        {proc.short_desc}
                      </p>
                    </div>
                  </div>

                  {/* Nút Chạm & Nghe AI đọc to câu hỏi mẫu */}
                  <div className="mt-3.5">
                    <button
                      type="button"
                      onClick={() => handleSuggestedQuestionClick(proc)}
                      className="w-full text-left p-3.5 rounded-2xl bg-amber-50/90 hover:bg-amber-100 border border-amber-300 text-amber-950 flex items-start gap-3 transition-all group shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#991B1B] text-amber-300 flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform mt-0.5">
                        <Volume2 className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase font-black text-[#991B1B] tracking-wide whitespace-nowrap flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>CHẠM ĐỂ AI ĐỌC TO CÂU HỎI & CÂU TRẢ LỜI MẪU:</span>
                        </div>
                        <div className="text-base md:text-lg font-bold text-slate-900 mt-0.5">
                          "{proc.suggested_question}"
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3 Nút Hành Động Đồng Nhất Chuẩn Mực */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 lg:w-64 flex-shrink-0">
                  {/* Nút 1: Xem Checklist & Hỏi đáp */}
                  <button
                    type="button"
                    onClick={() => onSelectProcedure(proc)}
                    className="w-full h-12 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-extrabold text-sm md:text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span>Xem Hồ Sơ & Checklist</span>
                  </button>

                  {/* Nút 2: Điền Đơn Tự Động (Mở Word Canvas) */}
                  {proc.form_template_id && (
                    <button
                      type="button"
                      onClick={() => onOpenAutoForm(proc)}
                      className="w-full h-12 px-4 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-extrabold text-sm md:text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap ring-2 ring-amber-300/60"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                      <span>Điền Đơn Trong Word</span>
                    </button>
                  )}

                  {/* Nút 3: Kiểm Tra Ảnh Giấy Tờ Bằng AI Vision */}
                  <button
                    type="button"
                    onClick={() => onOpenPreCheck(proc)}
                    className="w-full h-12 px-4 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-extrabold text-sm md:text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                  >
                    <Camera className="w-4 h-4 text-amber-200 flex-shrink-0" />
                    <span>Kiểm Tra Ảnh Giấy Tờ</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
