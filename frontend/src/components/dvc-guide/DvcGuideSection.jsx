import React, { useState } from 'react';
import {
  ExternalLink,
  Smartphone,
  Volume2,
  Sparkles
} from 'lucide-react';
import TrongDongOrnament from '../common/TrongDongOrnament';

const VNEID_STEPS = [
  {
    step: 1,
    title: "Mở ứng dụng VNeID trên điện thoại",
    desc: "Bà con mở ứng dụng VNeID trên điện thoại, đăng nhập bằng vân tay, khuôn mặt hoặc mật khẩu tài khoản Định danh điện tử mức độ 2.",
    tip: "Nếu chưa có tài khoản mức 2, bà con đem CCCD lên Công an xã Hiệp Hòa để kích hoạt miễn phí."
  },
  {
    step: 2,
    title: "Vào mục Dịch vụ công hoặc Quét QR",
    desc: "Tại màn hình chính VNeID, bà con chọn mục 'Thủ tục hành chính' hoặc quét mã liên kết Cổng Dịch vụ công tỉnh Tây Ninh.",
    tip: "Hệ thống tự động liên thông với Cổng DVC Quốc gia."
  },
  {
    step: 3,
    title: "Thông tin cá nhân tự động điền sẵn",
    desc: "Cơ sở dữ liệu quốc gia về dân cư sẽ tự động điền Họ tên, Số định danh 12 số, Quê quán và Nơi thường trú của bà con.",
    tip: "Bà con không cần phải tự gõ lại các thông tin này."
  },
  {
    step: 4,
    title: "Tải file Tờ khai vừa tạo & Bấm nộp",
    desc: "Bà con chọn đính kèm file Tờ khai Word hoặc PDF vừa tạo tự động từ trang HIỆP HÒA AI-GOV này, sau đó bấm nút 'Gửi hồ sơ'.",
    tip: "Cán bộ Một cửa xã Hiệp Hòa sẽ tiếp nhận điện tử và gửi thông báo kết quả qua tin nhắn SMS/VNeID."
  }
];

export default function DvcGuideSection({ speakText }) {
  const [activeStep, setActiveStep] = useState(0);

  const handleReadStep = (index) => {
    setActiveStep(index);
    const item = VNEID_STEPS[index];
    const text = `Bước ${item.step}: ${item.title}. ${item.desc}. Lưu ý: ${item.tip}`;
    if (speakText) speakText(text);
  };

  return (
    <section className="my-10 bg-gradient-to-br from-[#6B1114] via-[#7F1416] to-[#580C0E] border-2 border-amber-500/70 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
      
      {/* Họa tiết Trống Đồng Đông Sơn chìm góc nền sang trọng */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 opacity-10 pointer-events-none text-amber-300">
        <TrongDongOrnament size={320} animated={false} />
      </div>

      {/* Top Banner */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-amber-500/30 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-[#7F1D1D] text-xs font-extrabold uppercase mb-2 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#7F1D1D]" />
            <span>KẾT NỐI CHUYỂN ĐỔI SỐ QUỐC GIA & TỈNH TÂY NINH</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cổng Dịch Vụ Công Trực Tuyến & Cẩm Nang VNeID
          </h2>
          <p className="text-amber-100/90 text-sm sm:text-base mt-1 max-w-2xl leading-relaxed">
            Bà con nhân dân xã Hiệp Hòa có thể nộp hồ sơ trực tuyến ngay tại nhà thông qua Cổng DVC và tài khoản định danh VNeID mà không cần xếp hàng!
          </p>
        </div>

        {/* 03 Nút liên kết đồng bộ sắc Đỏ Rượu - Vàng Kim */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <a
            href="https://dichvucong.tayninh.gov.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-between gap-3 shadow-md transition-all active:scale-95"
          >
            <span>Cổng DVC Tỉnh Tây Ninh</span>
            <ExternalLink className="w-4 h-4 text-slate-950" />
          </a>

          <a
            href="https://dichvucong.gov.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-400/50 text-amber-100 font-semibold text-sm sm:text-base flex items-center justify-between gap-3 transition-all active:scale-95"
          >
            <span>Cổng DVC Quốc Gia</span>
            <ExternalLink className="w-4 h-4 text-amber-300" />
          </a>

          <a
            href="https://dichvucong.bocongan.gov.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-400/50 text-amber-100 font-semibold text-sm sm:text-base flex items-center justify-between gap-3 transition-all active:scale-95"
          >
            <span>Cổng DVC Bộ Công An (Cư trú)</span>
            <ExternalLink className="w-4 h-4 text-amber-300" />
          </a>
        </div>
      </div>

      {/* CẨM NANG VNEID "CẦM TAY CHỈ VIỆC" */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <span>Cẩm Nang VNeID "Cầm Tay Chỉ Việc" (Có Giọng Đọc Từng Bước)</span>
          </h3>
          <span className="text-xs text-amber-200/80 hidden sm:inline">
            Chạm vào từng bước để nghe AI đọc to hướng dẫn
          </span>
        </div>

        {/* 04 Thẻ bước hướng dẫn VNeID nền bg-black/25 border border-amber-400/30 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VNEID_STEPS.map((s, index) => {
            const isActive = activeStep === index;
            return (
              <div
                key={s.step}
                role="button"
                tabIndex={0}
                onClick={() => handleReadStep(index)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleReadStep(index); }}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                  isActive
                    ? 'bg-black/40 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-black/25 border-amber-400/30 hover:border-amber-400/70 hover:bg-black/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {/* Số thứ tự đặt trong vòng tròn vàng kim */}
                    <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-amber-400 text-[#7F1D1D] shadow-xs">
                      {s.step}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadStep(index);
                      }}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-amber-300"
                      title="Đọc bước này"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {s.title}
                  </h4>
                  <p className="text-xs text-amber-50/90 mt-1.5 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-amber-400/20 text-[11px] font-medium text-amber-300">
                  💡 {s.tip}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
