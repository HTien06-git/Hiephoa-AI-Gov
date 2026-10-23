import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  X,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function DocumentPreCheckModal({
  procedure,
  onClose,
  speakText,
  stopSpeaking
}) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleRunPreCheck = async () => {
    if (images.length === 0) {
      alert('Bà con vui lòng chụp hoặc tải ít nhất 1 ảnh giấy tờ lên nhé.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    speakText('Đang kiểm tra sơ bộ giấy tờ cho bà con, xin chờ vài giây ạ...');

    try {
      const checkRes = await apiClient.preCheckDocuments(images, procedure?.id);
      setResult(checkRes);
      if (checkRes.voice_summary) {
        speakText(checkRes.voice_summary);
      }
    } catch (err) {
      console.error('Pre-check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border-4 border-emerald-500 flex flex-col max-h-[92vh] overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-800 text-white p-5 flex items-center justify-between border-b-2 border-emerald-400">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-lg">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
                Trợ lý Kiểm tra Sơ bộ Hồ sơ Trước Khi Đến Xã
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">
                {procedure?.title || 'Kiểm Tra Ảnh Giấy Tờ'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-emerald-950/60 hover:bg-emerald-950 text-white flex items-center justify-center transition-all"
            title="Đóng cửa sổ"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-slate-50">
          
          {/* Guide Banner */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-950">
            <h4 className="font-extrabold text-base md:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Chụp ảnh các giấy tờ bà con đã chuẩn bị ở nhà</span>
            </h4>
            <p className="text-sm md:text-base mt-1 text-slate-700 leading-relaxed">
              Trí tuệ nhân tạo (AI Vision) sẽ kiểm tra giúp bà con xem đã đủ giấy tờ chưa, ảnh có bị mờ hoặc mất góc không, và nhắc bà con ký tên vào tờ khai trước khi đến UBND xã Hiệp Hòa để không phải đi lại nhiều lần!
            </p>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-emerald-400 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5 text-amber-200" />
                <span>Bấm Chụp Ảnh Giấy Tờ Bằng Điện Thoại</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center justify-center gap-2 border border-slate-300 transition-all"
              >
                <Upload className="w-5 h-5 text-slate-600" />
                <span>Chọn Ảnh Có Sẵn Trong Máy</span>
              </button>
            </div>

            {/* Images Preview List */}
            {images.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-bold text-slate-700 mb-3 text-left">
                  Đã chụp ({images.length} ảnh):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-emerald-300 shadow-sm aspect-4/3 bg-slate-100">
                      <img src={img} alt={`Giấy tờ ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow-md"
                        title="Xóa ảnh này"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  {/* Add more button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 aspect-4/3 transition-colors"
                  >
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">Thêm ảnh khác</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Run Check */}
          {images.length > 0 && (
            <div className="text-center">
              <button
                onClick={handleRunPreCheck}
                disabled={isLoading}
                className="px-8 py-4 rounded-2xl bg-gov-red hover:bg-red-800 text-white font-black text-lg shadow-xl inline-flex items-center gap-3 active:scale-95 transition-all"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
                    <span>AI Đang Phân Tích Giấy Tờ Của Bà Con...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-amber-300" />
                    <span>Bấm Để AI Kiểm Tra Sơ Bộ Ngay</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* RESULTS DISPLAY */}
          {result && (
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-lg space-y-4 animate-scale-up">
              
              {/* Header Status & Score */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4">
                <div className="flex items-center gap-3">
                  {result.status === 'PASS' ? (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-extrabold uppercase text-slate-500">Kết quả đánh giá</div>
                    <div className="text-xl font-black text-slate-900">
                      {result.status === 'PASS'
                        ? 'Hồ Sơ Đầy Đủ & Hợp Lệ Sơ Bộ'
                        : 'Hồ Sơ Cần Lưu Ý Bổ Sung Thêm'}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-center">
                  <div className="text-xs font-extrabold text-emerald-800 uppercase">Điểm tin cậy</div>
                  <div className="text-2xl font-black text-emerald-700">{result.score || 90}/100</div>
                </div>
              </div>

              {/* Voice Summary Audio */}
              {result.voice_summary && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-6 h-6 text-gov-red flex-shrink-0 animate-pulse" />
                    <p className="text-base font-semibold text-slate-900">
                      {result.voice_summary}
                    </p>
                  </div>
                  <button
                    onClick={() => speakText(result.voice_summary)}
                    className="px-3.5 py-1.5 rounded-xl bg-gov-red text-white text-xs font-bold hover:bg-red-800 flex-shrink-0"
                  >
                    Nghe lại
                  </button>
                </div>
              )}

              {/* Detected Documents */}
              {result.detected_documents?.length > 0 && (
                <div>
                  <h5 className="font-extrabold text-sm uppercase text-slate-500 mb-2">
                    ✓ Giấy tờ đã nhận diện được:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {result.detected_documents.map((d, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{d}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues & Reminders */}
              {result.issues?.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                  <h5 className="font-extrabold text-sm uppercase text-rose-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Lưu ý quan trọng cho bà con:</span>
                  </h5>
                  <ul className="space-y-1.5">
                    {result.issues.map((iss, i) => (
                      <li key={i} className="text-sm md:text-base font-medium text-rose-800 flex items-start gap-2">
                        <span>•</span>
                        <span>{iss}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
