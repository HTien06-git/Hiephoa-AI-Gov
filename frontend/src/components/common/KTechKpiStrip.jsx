import React from 'react';
import { Zap, FileCheck2, Printer, ShieldCheck, Sparkles } from 'lucide-react';

export default function KTechKpiStrip() {
  const kpis = [
    {
      value: '5 – 10 Giây',
      label: 'Tra cứu giọng nói',
      subtext: 'Trợ lý AI trích dẫn Luật Việt Nam',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-200'
    },
    {
      value: '08+ Thủ Tục',
      label: 'Biểu mẫu chuẩn hóa',
      subtext: 'Áp dụng tại UBND xã Hiệp Hòa',
      icon: FileCheck2,
      color: 'from-red-600 to-rose-700',
      bgColor: 'bg-red-50/80',
      borderColor: 'border-red-200'
    },
    {
      value: '04 Định Dạng',
      label: 'Xuất hồ sơ đa kênh',
      subtext: 'Word .docx, PDF, Ảnh & In A4',
      icon: Printer,
      color: 'from-blue-600 to-indigo-700',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-200'
    },
    {
      value: '100% Bảo Mật',
      label: 'Xử lý Client-Side',
      subtext: 'Zero-Data Retention an toàn tuyệt đối',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-700',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-200'
    }
  ];

  return (
    <section className="my-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl p-3 sm:p-4 bg-white border ${kpi.borderColor} shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group overflow-hidden relative`}
            >
              {/* Background gradient accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-100 to-transparent pointer-events-none rounded-bl-3xl opacity-60" />

              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr ${kpi.color} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                  KPI #{idx + 1}
                </span>
              </div>

              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {kpi.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {kpi.label}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {kpi.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
