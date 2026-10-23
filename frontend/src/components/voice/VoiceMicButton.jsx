import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Sparkles, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import TrongDongWatermark from '../common/TrongDongWatermark';

export default function VoiceMicButton({ onQuerySubmit, isSpeaking, stopSpeaking }) {
  const [textInput, setTextInput] = useState('');
  const lastSubmittedQueryRef = useRef('');

  const {
    isListening,
    transcript,
    interimTranscript,
    rawTranscript,
    error,
    toggleListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    onResult: (finalText) => {
      const cleaned = finalText ? finalText.trim() : '';
      if (cleaned.length > 1 && cleaned !== lastSubmittedQueryRef.current) {
        lastSubmittedQueryRef.current = cleaned;
        setTextInput('');
        resetTranscript();
        onQuerySubmit(cleaned);
      }
    }
  });

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const query = textInput.trim();
    if (query) {
      lastSubmittedQueryRef.current = query;
      onQuerySubmit(query);
      setTextInput('');
      resetTranscript();
    }
  };

  const handleMicClick = () => {
    if (isSpeaking) stopSpeaking();
    toggleListening();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-300/80 p-5 md:p-7 my-6 text-center relative overflow-hidden">
      {/* Vị trí 2: Họa tiết Trống Đồng Đông Sơn chìm ở nền trung tâm */}
      <div className="absolute -top-16 -right-16 w-80 h-80 pointer-events-none opacity-[0.09]">
        <TrongDongWatermark size={320} color="#D97706" />
      </div>
      <div className="absolute -bottom-16 -left-16 w-80 h-80 pointer-events-none opacity-[0.09]">
        <TrongDongWatermark size={320} color="#D97706" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-[#991B1B] text-xs sm:text-sm font-extrabold mb-3 shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
          <span className="uppercase tracking-wide">TRỢ LÝ TRÒ CHUYỆN TRỰC TIẾP (VOICE-FIRST)</span>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          Bà con chạm vào nút Micro màu đỏ rồi nói chuyện trực tiếp!
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl mx-auto leading-relaxed">
          Ví dụ: <span className="font-bold text-[#991B1B]">"Làm giấy khai sinh cho con cần những gì?"</span> hoặc <span className="font-bold text-[#991B1B]">"Cha mẹ muốn tặng cho đất thì thủ tục ra sao?"</span>
        </p>

        {/* Nút Micro trung tâm cực lớn với VÒNG HOA VĂN TRỐNG ĐỒNG ĐỒNG TÂM bao quanh */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center w-44 h-44 sm:w-52 sm:h-52">
            {/* Vòng Trống Đồng bao quanh nút Mic, xoay nhẹ và tỏa sáng khi đang lắng nghe */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ${
              isListening ? 'opacity-90 scale-105' : 'opacity-40 hover:opacity-60'
            }`}>
              <TrongDongWatermark
                size={200}
                color={isListening ? "#DC2626" : "#D97706"}
                opacity={isListening ? 0.75 : 0.45}
                spin={true}
              />
            </div>

            {/* Nút Micro chính */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative select-none z-10 ${
                isListening
                  ? 'bg-red-600 text-white animate-mic-pulse ring-8 ring-red-300'
                  : 'bg-gradient-to-tr from-[#991B1B] to-rose-600 text-white hover:scale-105 active:scale-95 hover:shadow-red-500/50'
              }`}
              title={isListening ? 'Đang lắng nghe... Chạm lần nữa để gửi câu hỏi' : 'Chạm vào Micro để bắt đầu nói'}
            >
              <Mic className={`w-12 h-12 sm:w-14 sm:h-14 ${isListening ? 'animate-bounce' : ''}`} />
            </button>
          </div>

          {/* Nhãn trạng thái */}
          <div className="mt-4">
            {isListening ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-[#991B1B] font-black text-base sm:text-lg animate-pulse border border-red-300">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping flex-shrink-0" />
                <span>Đang lắng nghe bà con nói... (Nói xong tự động trả lời)</span>
              </div>
            ) : (
              <span className="text-sm sm:text-base font-bold text-slate-800 inline-flex items-center gap-1.5">
                👉 Chạm vào Micro màu đỏ để BẮT ĐẦU TRÒ CHUYỆN
              </span>
            )}
          </div>

          {/* Chữ hiển thị thời gian thực khi đang nói */}
          {(transcript || interimTranscript) && (
            <div className="mt-4 px-5 py-3 bg-amber-50 rounded-2xl border-2 border-amber-300 text-slate-900 text-base sm:text-lg font-bold max-w-xl mx-auto shadow-sm animate-fade-in">
              <span className="text-amber-800 text-xs uppercase block font-black mb-1">Lời nói của bà con:</span>
              "{transcript || interimTranscript}"
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm font-semibold text-rose-600 bg-rose-50 px-4 py-1.5 rounded-xl border border-rose-200 inline-block">
              {error}
            </p>
          )}
        </div>

        {/* Ô nhập liệu văn bản trực tiếp cho bà con muốn gõ phím */}
        <form onSubmit={handleManualSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Hoặc bà con có thể gõ câu hỏi vào đây rồi bấm nút Gửi..."
            className="flex-1 px-4 py-3 sm:py-3.5 text-base sm:text-lg rounded-2xl border-2 border-slate-300 focus:border-[#991B1B] focus:ring-2 focus:ring-red-200 outline-none transition-all shadow-inner bg-slate-50"
          />
          <button
            type="submit"
            className="h-full px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#991B1B] hover:bg-red-800 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 flex-shrink-0"
          >
            <span>Gửi</span>
            <Send className="w-5 h-5 flex-shrink-0" />
          </button>
        </form>
      </div>
    </div>
  );
}
