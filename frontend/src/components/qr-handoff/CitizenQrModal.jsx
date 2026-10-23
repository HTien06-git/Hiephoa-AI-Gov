import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CitizenQrModal({ qrPayload, onClose, speakText }) {
  if (!qrPayload) return null;

  const { formId, formTitle, formData } = qrPayload;

  // Encode JSON payload safely
  const rawString = JSON.stringify({
    schema_id: formId,
    title: formTitle,
    time: Date.now(),
    fields: formData
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border-4 border-gov-gold p-6 text-center animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
          title="Đóng"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <QrCode className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>MÃ QR HỒ SƠ TỨC THÌ ĐÃ SẴN SÀNG</span>
        </div>

        <h3 className="text-xl md:text-2xl font-black text-slate-900">
          Mã QR Nộp Nhanh Cho Cán Bộ
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {formTitle}
        </p>

        {/* QR Code Canvas */}
        <div className="my-6 p-4 bg-white rounded-2xl border-2 border-slate-300 inline-block shadow-md">
          <QRCodeSVG
            value={rawString}
            size={240}
            level="M"
            includeMargin={true}
          />
        </div>

        <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-300 text-left text-sm text-amber-950 space-y-1 mb-5">
          <div className="font-extrabold flex items-center gap-1.5 text-gov-red">
            <span>👉 Hướng dẫn cho bà con khi đến xã:</span>
          </div>
          <p className="text-slate-800 leading-relaxed font-medium">
            Khi đến Bộ phận Một cửa UBND xã Hiệp Hòa, bà con chỉ cần đưa màn hình điện thoại có mã QR này cho Cán bộ tiếp nhận quét. Máy tính của cán bộ sẽ hiển thị toàn bộ hồ sơ trong <strong>10 giây</strong> để in và đóng dấu ngay, bà con không cần ngồi viết tay lại từ đầu!
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>In Mã QR Ra Giấy</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gov-red hover:bg-red-800 text-white font-bold text-sm"
          >
            <span>Đã Xong</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-500 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero-Data Retention: Mã QR lưu trữ an toàn trong máy bà con</span>
        </div>
      </div>
    </div>
  );
}
