import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/apiClient';

/**
 * Hàm loại bỏ từ hoặc cụm từ lặp lại do cơ chế Web Speech API trên Android Chrome
 */
export function deduplicateSpeechText(text) {
  if (!text) return '';
  let str = text.trim().replace(/\s+/g, ' ');
  if (!str) return '';

  // 1. Khử lặp từ đơn: "hướng dẫn hướng dẫn" -> "hướng dẫn"
  let words = str.split(' ');
  let dedup = [];
  for (let i = 0; i < words.length; i++) {
    const cur = words[i];
    const prev = dedup[dedup.length - 1];
    if (!prev || cur.toLowerCase() !== prev.toLowerCase()) {
      dedup.push(cur);
    }
  }
  str = dedup.join(' ');

  // 2. Khử lặp lũy tiến do Android Chrome đẩy nhiều hypothesis cùng prefix:
  // "hướng dẫn tôi làm hướng dẫn tôi làm thủ tục công chứng" -> "hướng dẫn tôi làm thủ tục công chứng"
  words = str.split(' ');
  if (words.length > 2) {
    for (let cut = 1; cut < words.length - 1; cut++) {
      const prefix = words.slice(0, cut).join(' ').toLowerCase();
      const rest = words.slice(cut).join(' ').toLowerCase();
      if (rest.startsWith(prefix) || rest.includes(prefix)) {
        words = words.slice(cut);
        str = words.join(' ');
        cut = 0; // restart
      }
    }
  }

  // 3. Khử lặp cụm từ kép lặp lại ở cuối
  words = str.split(' ');
  const half = Math.floor(words.length / 2);
  for (let len = half; len >= 2; len--) {
    for (let start = 0; start <= words.length - 2 * len; start++) {
      const p1 = words.slice(start, start + len).join(' ').toLowerCase();
      const p2 = words.slice(start + len, start + 2 * len).join(' ').toLowerCase();
      if (p1 === p2) {
        words.splice(start, len);
        str = words.join(' ');
        break;
      }
    }
  }

  return str.trim();
}

/**
 * Hook nhận diện giọng nói tiếng Việt Dual-Mode siêu ổn định:
 * - Chế độ 1: Web Speech API (nhận diện tức thì trực tiếp trên trình duyệt)
 * - Chế độ 2: MediaRecorder + Gemini 2.5 Flash Audio STT (Dự phòng cho iOS / Zalo In-App Browser / Lỗi mạng Google)
 */
export function useSpeechRecognition({ onResult, lang = 'vi-VN' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('web_speech'); // 'web_speech' | 'media_recorder'

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);

  // Lưu onResult vào Ref để không bị re-trigger useEffect khi component cha re-render
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const isWebSpeechSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Hàm chuyển đổi sang chế độ ghi âm MediaRecorder dự phòng
  const fallbackToMediaRecorder = useCallback(() => {
    setMode('media_recorder');
    setError('Chuyển sang chế độ ghi âm AI dự phòng...');
  }, []);

  // Khởi tạo SpeechRecognition instance (Chỉ khởi tạo 1 lần theo lang)
  useEffect(() => {
    if (!isWebSpeechSupported) {
      setMode('media_recorder');
      return;
    }

    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false; // Tự dừng khi người dân nói xong dứt câu, triệt tiêu 100% lỗi lặp từ của Android Chrome
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let final = '';
        let interim = '';

        // Đọc danh sách kết quả và thay thế chuỗi lũy tiến (progressive hypothesis), tuyệt đối không nối chuỗi mù quáng
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (!item || !item[0]) continue;
          const text = (item[0].transcript || '').trim();
          if (!text) continue;

          if (item.isFinal) {
            if (final && (text.toLowerCase().startsWith(final.toLowerCase()) || text.toLowerCase().includes(final.toLowerCase()))) {
              final = text;
            } else if (final && final.toLowerCase().startsWith(text.toLowerCase())) {
              // Đã có bản dài hơn
            } else {
              final = final ? `${final} ${text}` : text;
            }
          } else {
            if (interim && (text.toLowerCase().startsWith(interim.toLowerCase()) || text.toLowerCase().includes(interim.toLowerCase()))) {
              interim = text;
            } else if (interim && interim.toLowerCase().startsWith(text.toLowerCase())) {
              // Đã có bản dài hơn
            } else {
              interim = interim ? `${interim} ${text}` : text;
            }
          }
        }

        const cleanFinal = deduplicateSpeechText(final);
        const cleanInterim = deduplicateSpeechText(interim);

        if (cleanInterim) {
          setInterimTranscript(cleanInterim);
        }

        if (cleanFinal) {
          setTranscript(cleanFinal);
          setInterimTranscript('');

          // Sau 1s im lặng thì tự động dừng và gửi câu hỏi
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            try {
              recognition.stop();
            } catch (e) {}
          }, 1000);
        }
      };

      recognition.onerror = async (e) => {
        console.warn('[useSpeechRecognition] Error:', e.error);
        if (e.error === 'no-speech') {
          // Chưa nghe thấy tiếng nói, không báo lỗi nghiêm trọng
        } else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setError('Bà con vui lòng bấm "Cho phép" sử dụng Micro trên trình duyệt để nói nhé.');
          setIsListening(false);
        } else if (e.error === 'network') {
          console.warn('[useSpeechRecognition] Network error on Google STT -> Fallback to MediaRecorder');
          setIsListening(false);
          fallbackToMediaRecorder();
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Cannot init SpeechRecognition:', err);
      setMode('media_recorder');
    }

    return () => {
      try {
        if (recognitionRef.current) recognitionRef.current.abort();
      } catch (e) {}
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isWebSpeechSupported, lang, fallbackToMediaRecorder]);

  // Bắt đầu thu âm bằng MediaRecorder (Fallback mode cho Gemini AI STT)
  const startMediaRecorder = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Tắt toàn bộ track microphone
        stream.getTracks().forEach(track => track.stop());

        if (audioBlob.size < 500) {
          setError('Chưa nghe rõ được câu nói, bà con vui lòng thử lại nhé.');
          return;
        }

        // Gửi lên backend Gemini Audio STT
        setInterimTranscript('Đang nhận diện giọng nói qua AI...');
        try {
          const res = await apiClient.voiceSpeechToText(audioBlob);
          setInterimTranscript('');
          if (res && res.success && res.transcript) {
            const finalTranscript = res.transcript.trim();
            setTranscript(finalTranscript);
            if (onResultRef.current) onResultRef.current(finalTranscript);
          } else {
            setError('Chưa nghe rõ câu hỏi, bà con bấm nút đỏ nói lại giúp nhé.');
          }
        } catch (err) {
          setInterimTranscript('');
          setError('Lỗi kết nối âm thanh, bà con có thể gõ chữ câu hỏi vào ô bên dưới nhé.');
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
      setError(null);
      setTranscript('');
      setInterimTranscript('');
    } catch (err) {
      console.error('MediaRecorder start error:', err);
      setError('Bà con vui lòng cấp quyền Micro trên thiết bị.');
      setIsListening(false);
    }
  };

  const stopMediaRecorder = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Khởi động lắng nghe an toàn (Ngắt Loa trước khi bật Mic)
  const startListening = useCallback(() => {
    // 1. Tự động ngắt Loa trước khi bật Mic để tránh mic thu tiếng của chính trợ lý
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setTranscript('');
    setInterimTranscript('');
    setError(null);

    // 2. Chờ 80ms rồi mới bắt đầu ghi âm
    setTimeout(() => {
      if (mode === 'media_recorder' || !recognitionRef.current) {
        startMediaRecorder();
        return;
      }

      try {
        try {
          recognitionRef.current.abort();
        } catch (e) {}

        recognitionRef.current.start();
      } catch (e) {
        console.warn('SpeechRecognition start failed, fallback to MediaRecorder:', e);
        startMediaRecorder();
      }
    }, 80);
  }, [mode]);

  const stopListening = useCallback(() => {
    if (mode === 'media_recorder' || (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording')) {
      stopMediaRecorder();
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, [mode]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  // Khi Web Speech API dừng và có nội dung câu nói -> trigger onResultRef
  useEffect(() => {
    if (!isListening && transcript && transcript.trim().length > 1 && mode === 'web_speech') {
      if (onResultRef.current) {
        onResultRef.current(transcript.trim());
      }
    }
  }, [isListening, transcript, mode]);

  return {
    isListening,
    transcript: transcript || interimTranscript,
    interimTranscript,
    rawTranscript: transcript,
    error,
    isSupported: true,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript: () => {
      setTranscript('');
      setInterimTranscript('');
    }
  };
}
