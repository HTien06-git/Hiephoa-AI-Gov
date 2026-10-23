import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/apiClient';

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
      recognition.continuous = true; // Tiếp tục nghe cho đến khi người dùng nói xong hoặc bấm tắt
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          setTranscript(prev => {
            const updated = prev ? `${prev} ${final.trim()}` : final.trim();
            return updated;
          });
          setInterimTranscript('');

          // Reset silence timer: sau 1.5s không nói thêm thì tự động hoàn tất
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            try {
              recognition.stop();
            } catch (e) {}
          }, 1500);
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
