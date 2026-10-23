import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  User,
  Bot
} from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { apiClient } from '../../services/apiClient';

export default function ContextualChatBox({
  procedure,
  initialAnswer,
  initialVoiceText,
  initialSources = [],
  speakText,
  stopSpeaking,
  onOpenAutoForm
}) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      content: initialAnswer,
      voiceText: initialVoiceText,
      sources: initialSources,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Suggested contextual questions
  const quickQuestions = [
    "Nếu tôi bị mất bản chính thì làm sao?",
    "Có nhờ người thân đi làm thay được không?",
    "Trường hợp của tôi cần chuẩn bị thêm giấy tờ gì?",
    "Thủ tục này có mất phí hay mất bao nhiêu ngày?"
  ];

  const { isListening, transcript, interimTranscript, toggleListening } = useSpeechRecognition({
    onResult: (text) => {
      if (text && text.trim().length > 1) {
        setInputText(text);
        handleSendMessage(text);
      }
    }
  });

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    if (stopSpeaking) stopSpeaking();

    // 1. Thêm tin nhắn của công dân vào danh sách
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    // 2. Chuẩn bị lịch sử hội thoại gửi lên backend
    const historyPayload = newMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const response = await apiClient.chatQuery(
        query,
        procedure?.id || null,
        procedure?.category_id || null,
        historyPayload
      );

      if (response && response.data) {
        const aiData = response.data;
        const aiMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: aiData.answer,
          voiceText: aiData.voice_text,
          sources: aiData.sources || [],
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);

        // Đọc to câu trả lời của AI
        if (aiData.voice_text && speakText) {
          speakText(aiData.voice_text);
        }
      }
    } catch (err) {
      console.error('Contextual chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-red-200/80 shadow-md p-5 md:p-6 mt-6">
      
      {/* Tiêu đề khung trò chuyện liên tục */}
      <div className="flex items-center justify-between border-b border-red-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#991B1B] text-amber-300 flex items-center justify-center shadow-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h4 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
            Hỏi Thêm Chuyên Viên AI Về Thủ Tục Này
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
          Hỏi đáp liên tục không giới hạn lượt
        </span>
      </div>

      {/* Lịch sử hội thoại (Chat History) */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-xs text-slate-500 font-bold px-1">
              {msg.role === 'user' ? (
                <>
                  <span>Bà con hỏi ({msg.timestamp})</span>
                  <User className="w-3.5 h-3.5 text-slate-600" />
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-[#991B1B]" />
                  <span className="text-[#991B1B]">Chuyên viên AI Xã Hiệp Hòa ({msg.timestamp})</span>
                </>
              )}
            </div>

            <div
              className={`p-4 rounded-2xl max-w-[92%] sm:max-w-[85%] text-base leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-[#991B1B] text-white font-semibold rounded-br-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-none whitespace-pre-line'
              }`}
            >
              {msg.content}

              {/* Nút nghe lại giọng đọc & nguồn Thư Viện Pháp Luật cho tin nhắn AI */}
              {msg.role === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  {msg.voiceText && (
                    <button
                      onClick={() => speakText(msg.voiceText)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#991B1B]" />
                      <span>Đọc to câu trả lời</span>
                    </button>
                  )}

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500">Nguồn:</span>
                      {msg.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-0.5 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                        >
                          <span>{s.title.length > 28 ? s.title.substring(0, 28) + '...' : s.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Cụm Nút Hành Động Điền Đơn & Giọng Nói Từng Bước Ngay Trong Tin Nhắn */}
                  {procedure && procedure.form_template_id && onOpenAutoForm && (
                    <div className="w-full pt-2.5 mt-2 border-t border-slate-200/80 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onOpenAutoForm(procedure, 'data_input')}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-red-950" />
                        <span>Điền Đơn Trong Word</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenAutoForm(procedure, 'voice_wizard')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>Điền Bằng Giọng Nói (Từng Bước)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 max-w-sm text-sm font-bold text-amber-900 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-[#991B1B]" />
            <span>Chuyên viên AI đang tra cứu Thư Viện Pháp Luật...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Câu hỏi gợi ý nhanh theo ngữ cảnh */}
      <div className="my-4 pt-3 border-t border-slate-200">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Gợi ý câu hỏi bà con hay thắc mắc nhất:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 transition-colors active:scale-98 text-left"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Thanh nhập tin nhắn trực tiếp luôn hiển thị (Sticky/Inline Input Bar) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 mt-2 bg-slate-50 p-1.5 rounded-2xl border-2 border-slate-300 focus-within:border-[#991B1B] transition-all"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Bà con còn thắc mắc gì cứ gõ hoặc bấm Mic hỏi tiếp tại đây..."
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base outline-none font-medium text-slate-900 placeholder:text-slate-400"
        />

        {/* Nút Micro thu âm ngay tại thanh chat */}
        <button
          type="button"
          onClick={toggleListening}
          className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
            isListening
              ? 'bg-red-600 text-white animate-mic-pulse ring-4 ring-red-200'
              : 'bg-red-100 hover:bg-red-200 text-[#991B1B]'
          }`}
          title="Bấm vào để nói câu hỏi"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Nút Gửi câu hỏi */}
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="h-11 px-4 sm:px-5 rounded-xl bg-[#991B1B] hover:bg-red-800 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all flex-shrink-0 whitespace-nowrap"
        >
          <span>Gửi</span>
          <Send className="w-4 h-4 flex-shrink-0" />
        </button>
      </form>

      {/* Hiển thị chữ đang nghe thời gian thực */}
      {(transcript || interimTranscript) && isListening && (
        <div className="mt-2 text-xs font-bold text-[#991B1B] animate-pulse px-2">
          Đang nghe: "{transcript || interimTranscript}"
        </div>
      )}
    </div>
  );
}
