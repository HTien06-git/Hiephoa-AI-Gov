import React, { useState } from 'react';
import {
  ExternalLink,
  Smartphone,
  CheckCircle,
  Volume2,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

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
    <section className="my-10 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl border-4 border-gov-gold">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-blue-700/50 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-xs font-black uppercase mb-2">
            <Sparkles className="w-4 h-4 text-gov-red" />
            <span>KẾT NỐI CHUYỂN ĐỔI SỐ QUỐC GIA & TỈNH TÂY NINH</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Cổng Dịch Vụ Công Trực Tuyến & Cẩm Nang VNeID
          </h2>
          <p className="text-blue-200 text-base mt-1 max-w-2xl">
            Bà con nhân dân xã Hiệp Hòa có thể nộp hồ sơ trực tuyến ngay tại nhà thông qua Cổng DVC và tài khoản định danh VNeID mà không cần xếp hàng!
          </p>
        </div>

        {/* 3 Deep-link Portal Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
          <a
            href="https://dichvucong.tayninh.gov.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-gov-gold hover:bg-amber-400 text-slate-950 font-black text-sm md:text-base flex items-center justify-between gap-2 shadow-lg transition-transform active:scale-95"
          >
            <span>Cổng DVC Tỉnh Tây Ninh</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href="https://dichvucong.gov.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm md:text-base flex items-center justify-between gap-2 border border-white/20 transition-all"
          >
            <span>Cổng DVC Quốc Gia</span>
            <ExternalLink className="w-4 h-4 text-amber-300" />
          </a>

          <a
            href="https://dichvucong.bocongan.gov.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm md:text-base flex items-center justify-between gap-2 border border-white/20 transition-all"
          >
            <span>Cổng DVC Bộ Công An (Cư trú)</span>
            <ExternalLink className="w-4 h-4 text-amber-300" />
          </a>
        </div>
      </div>

      {/* CẨM NANG VNEID "CẦM TAY CHỈ VIỆC" */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-black text-amber-300 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-amber-400" />
            <span>Cẩm Nang VNeID "Cầm Tay Chỉ Việc" (Có Giọng Đọc Từng Bước)</span>
          </h3>
          <span className="text-xs text-blue-200 hidden sm:inline">
            Bấm vào từng bước để nghe AI đọc to hướng dẫn
          </span>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {VNEID_STEPS.map((s, index) => {
            const isActive = activeStep === index;
            return (
              <div
                key={s.step}
                onClick={() => handleReadStep(index)}
                className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between ${
                  isActive
                    ? 'bg-blue-800/80 border-amber-400 shadow-xl scale-102 ring-4 ring-amber-400/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      isActive ? 'bg-amber-400 text-blue-950' : 'bg-blue-600 text-white'
                    }`}>
                      {s.step}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadStep(index);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300"
                      title="Đọc bước này"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-base md:text-lg font-black text-white leading-snug">
                    {s.title}
                  </h4>
                  <p className="text-sm text-blue-100 mt-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-xs font-semibold text-amber-300">
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
