import React from 'react';
import { MessageSquareText, FileEdit, QrCode, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function KTechEcosystemSteps() {
  const steps = [
    {
      step: '01',
      title: 'Hỏi Đáp Giọng Nói & Tra Cứu Luật',
      desc: 'Bà con hỏi trực tiếp bằng giọng nói; AI đối soát Luật Việt Nam và Thư Viện Pháp Luật để hướng dẫn đúng quy định.',
      icon: MessageSquareText,
      badge: 'Trợ lý AI 24/7',
      color: 'from-amber-600 to-red-600',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200'
    },
    {
      step: '02',
      title: 'Điền Đơn Tự Động (Voice / CCCD)',
      desc: 'Quét thẻ CCCD hoặc nói từng câu; AI tự động điền chính xác vào mẫu đơn Word .docx chuẩn của UBND xã Hiệp Hòa.',
      icon: FileEdit,
      badge: 'Zero-Data Retention',
      color: 'from-red-600 to-rose-700',
      badgeColor: 'bg-red-100 text-red-900 border-red-200'
    },
    {
      step: '03',
      title: 'Kiểm Tra Hồ Sơ & Nhận Mã QR Một Cửa',
      desc: 'AI Vision thẩm định giấy tờ, cấp Mã QR trực tuyến gửi ngay sang màn hình máy tính Cán bộ Một cửa trong 10 giây.',
      icon: QrCode,
      badge: 'Đồng bộ Thời gian thực',
      color: 'from-emerald-600 to-teal-700',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200'
    }
  ];

  return (
    <section className="my-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3.5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#991B1B] text-xs font-black uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>QUY TRÌNH TINH GỌN HIỆN ĐẠI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Hệ Sinh Thái 03 Bước Tự Động Hóa Hồ Sơ
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Giải pháp công nghệ phục vụ nhân dân xã Hiệp Hòa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Step indicator watermark */}
              <span className="absolute -top-3 -right-2 text-6xl font-black text-slate-100 select-none pointer-events-none group-hover:text-amber-50 transition-colors">
                {st.step}
              </span>

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${st.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${st.badgeColor}`}>
                    {st.badge}
                  </span>
                </div>

                <div className="text-xs font-black text-amber-800 uppercase tracking-wider mb-0.5">
                  Bước {st.step}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                  {st.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tiện lợi • Nhanh chóng • Chuẩn xác</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
