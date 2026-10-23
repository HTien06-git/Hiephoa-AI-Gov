import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Tách văn bản dài thành các câu ngắn (< 110 ký tự) để phát thanh mượt mà, không bị ngắt quãng
 */
function chunkTextForTTS(text) {
  if (!text) return [];

  const cleaned = text
    .normalize('NFC')
    .replace(/[*#_`>\[\]\(\)]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Tách theo dấu kết thúc câu (. ; ! ? \n)
  const rawSentences = cleaned.split(/(?<=[.!?;:\n])\s+/);
  const chunks = [];

  for (const raw of rawSentences) {
    const s = raw.trim();
    if (!s) continue;

    if (s.length > 100) {
      const subParts = s.split(/(?<=[,])\s+/);
      let temp = '';
      for (const p of subParts) {
        if ((temp + ' ' + p).trim().length > 90) {
          if (temp.trim()) chunks.push(temp.trim());
          temp = p;
        } else {
          temp = temp ? `${temp} ${p}` : p;
        }
      }
      if (temp.trim()) chunks.push(temp.trim());
    } else {
      chunks.push(s);
    }
  }

  return chunks.length > 0 ? chunks : [cleaned];
}

// Mở khóa AudioContext và phát tiếng chuông thông báo
function playChime(frequency = 587.33, duration = 0.12) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [totalSentences, setTotalSentences] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('hiep_hoa_audio_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const sessionIdRef = useRef(0);
  const chunksQueueRef = useRef([]);
  const currentIndexRef = useRef(0);
  const currentAudioRef = useRef(null);
  const safetyTimeoutRef = useRef(null);
  const isAudioUnlockedRef = useRef(false);

  // Mở khóa âm thanh triệt để ngay lần chạm/nhấp chuột đầu tiên của người dùng
  useEffect(() => {
    const unlockAudio = () => {
      isAudioUnlockedRef.current = true;
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
        playChime(440, 0.05);
      } catch (e) {}

      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Lưu trạng thái loa vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hiep_hoa_audio_enabled', String(isAudioEnabled));
    } catch (e) {}

    if (!isAudioEnabled) {
      stop();
    }
  }, [isAudioEnabled]);

  const stop = useCallback(() => {
    // Tăng sessionId để hủy bỏ toàn bộ async callback đang chạy dở
    sessionIdRef.current += 1;
    chunksQueueRef.current = [];
    currentIndexRef.current = 0;

    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    // Dừng Audio element nếu đang phát
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.removeAttribute('src');
        currentAudioRef.current.load();
        currentAudioRef.current = null;
      } catch (e) {}
    }

    // Dừng Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    setIsSpeaking(false);
    setCurrentSentenceIndex(0);
    setTotalSentences(0);
  }, []);

  // Tầng 3: Web Speech API (Dự phòng cho máy có Voice Tiếng Việt hoặc Offline)
  const playChunkWithWebSpeech = (textChunk, currentSession, onChunkEnd) => {
    if (sessionIdRef.current !== currentSession) return;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onChunkEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

    const utterance = new SpeechSynthesisUtterance(textChunk);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    try {
      const voices = window.speechSynthesis.getVoices() || [];
      const vnVoice = voices.find(v => 
        (v.lang && (v.lang.startsWith('vi') || v.lang.includes('VN'))) ||
        (v.name && (v.name.includes('Vietnamese') || v.name.includes('Việt') || v.name.includes('An') || v.name.includes('HoaiMy')))
      );
      if (vnVoice) {
        utterance.voice = vnVoice;
      }
    } catch (e) {}

    // Giữ tham chiếu trên window để tránh Chromium Garbage Collector huỷ utterance giữa chừng
    window._govCurrentUtterance = utterance;

    let hasEnded = false;
    const finish = () => {
      if (hasEnded) return;
      hasEnded = true;
      window._govCurrentUtterance = null;
      if (sessionIdRef.current === currentSession) {
        onChunkEnd();
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      finish();
    }
  };

  // Tầng 2: Backend Proxy `/api/tts`
  const playChunkWithBackendProxy = (textChunk, currentSession, onChunkEnd) => {
    if (sessionIdRef.current !== currentSession) return;

    const encoded = encodeURIComponent(textChunk);
    const proxyUrl = `/api/tts?text=${encoded}`;

    const audio = new Audio();
    currentAudioRef.current = audio;

    let hasEnded = false;
    const finish = (fallback = false) => {
      if (hasEnded) return;
      hasEnded = true;
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      currentAudioRef.current = null;

      if (sessionIdRef.current === currentSession) {
        if (fallback) {
          playChunkWithWebSpeech(textChunk, currentSession, onChunkEnd);
        } else {
          onChunkEnd();
        }
      }
    };

    safetyTimeoutRef.current = setTimeout(() => {
      finish(true);
    }, 4000);

    audio.onended = () => finish(false);
    audio.onerror = () => finish(true);

    audio.src = proxyUrl;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => finish(true));
    }
  };

  // Tầng 1: Client-Side Google TTS (Phát trực tiếp từ IP máy khách, KHÔNG dùng crossOrigin để tránh lỗi CORS)
  const playChunkWithAudio = (textChunk, currentSession, onChunkEnd) => {
    if (sessionIdRef.current !== currentSession) return;

    try {
      const encoded = encodeURIComponent(textChunk);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=vi&client=tw-ob`;

      const audio = new Audio();
      // TUYỆT ĐỐI KHÔNG SET crossOrigin = 'anonymous' VÌ GOOGLE SẼ CHẶN CORS
      currentAudioRef.current = audio;

      let hasEnded = false;
      const finish = (fallback = false) => {
        if (hasEnded) return;
        hasEnded = true;
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }
        currentAudioRef.current = null;

        if (sessionIdRef.current === currentSession) {
          if (fallback) {
            // Chuyển sang Tầng 2: Backend Proxy
            playChunkWithBackendProxy(textChunk, currentSession, onChunkEnd);
          } else {
            onChunkEnd();
          }
        }
      };

      // Giới hạn thời gian tải 3.5 giây, nếu mạng chậm lập tức chuyển tầng dự phòng
      safetyTimeoutRef.current = setTimeout(() => {
        finish(true);
      }, 3500);

      audio.onended = () => finish(false);
      audio.onerror = () => finish(true);

      audio.src = url;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => finish(true));
      }
    } catch (err) {
      playChunkWithBackendProxy(textChunk, currentSession, onChunkEnd);
    }
  };

  // Đọc tuần tự từng câu trong hàng đợi
  const playNextChunk = useCallback((currentSession, onEndCallback) => {
    if (sessionIdRef.current !== currentSession) {
      setIsSpeaking(false);
      return;
    }

    const queue = chunksQueueRef.current;
    const index = currentIndexRef.current;

    if (index >= queue.length) {
      setIsSpeaking(false);
      setCurrentSentenceIndex(0);
      setTotalSentences(0);
      if (onEndCallback) onEndCallback();
      return;
    }

    const textChunk = queue[index];
    setCurrentSentenceIndex(index + 1);

    const onChunkSuccess = () => {
      if (sessionIdRef.current === currentSession) {
        currentIndexRef.current += 1;
        setTimeout(() => playNextChunk(currentSession, onEndCallback), 50);
      }
    };

    // Bắt đầu chu trình 3 tầng siêu ổn định:
    // Tầng 1 (Client Google TTS) -> Tầng 2 (Backend Proxy) -> Tầng 3 (Web Speech API)
    playChunkWithAudio(textChunk, currentSession, onChunkSuccess);
  }, []);

  const speak = useCallback((text, onEndCallback) => {
    if (!isAudioEnabled || !text || !text.trim()) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Dừng dứt khoát câu phát trước đó
    stop();

    // Tạo phiên phát mới để cô lập mọi luồng phát cũ
    const currentSession = sessionIdRef.current;

    // Phát tiếng chuông nhẹ
    playChime();

    const chunks = chunkTextForTTS(text);
    if (chunks.length === 0) return;

    // Chờ 80ms dọn sạch trạng thái cũ rồi phát phiên mới
    setTimeout(() => {
      if (sessionIdRef.current !== currentSession) return;

      chunksQueueRef.current = chunks;
      currentIndexRef.current = 0;
      setTotalSentences(chunks.length);
      setCurrentSentenceIndex(1);
      setIsSpeaking(true);

      playNextChunk(currentSession, onEndCallback);
    }, 80);
  }, [isAudioEnabled, stop, playNextChunk]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => {
      const next = !prev;
      if (next) {
        playChime(659.25, 0.2);
        setTimeout(() => {
          speak('Hệ thống âm thanh hành chính công đã sẵn sàng phục vụ.');
        }, 120);
      } else {
        playChime(392.00, 0.15);
        stop();
      }
      return next;
    });
  }, [speak, stop]);

  return {
    isSpeaking,
    isAudioEnabled,
    currentSentenceIndex,
    totalSentences,
    speak,
    stop,
    toggleAudio,
    hasVoiceSupport: true
  };
}
