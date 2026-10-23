import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Tách văn bản dài thành các câu ngắn (< 130 ký tự) để giọng đọc tự nhiên và phát audio trơn tru
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

    // Nếu câu dài hơn 120 ký tự, chia tiếp theo dấu phẩy
    if (s.length > 120) {
      const subParts = s.split(/(?<=[,])\s+/);
      let temp = '';
      for (const p of subParts) {
        if ((temp + ' ' + p).trim().length > 110) {
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

// Giữ tham chiếu toàn cục chống Chrome Garbage Collection
if (typeof window !== 'undefined') {
  window.__activeSpeechUtterances = window.__activeSpeechUtterances || [];
}

// Phát tiếng chuông nhẹ mở kênh âm thanh trình duyệt
function playChime(frequency = 587.33, duration = 0.15) {
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
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
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

  const isCancelledRef = useRef(false);
  const chunksQueueRef = useRef([]);
  const currentIndexRef = useRef(0);
  const currentAudioElementRef = useRef(null);

  // Mở khóa AudioContext ngay khi người dùng chạm hoặc click lần đầu vào trang
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
        playChime(440, 0.05);
      } catch (e) {}
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, []);

  // Save audio preference
  useEffect(() => {
    try {
      localStorage.setItem('hiep_hoa_audio_enabled', String(isAudioEnabled));
    } catch (e) {}

    if (!isAudioEnabled) {
      stop();
    }
  }, [isAudioEnabled]);

  const stop = useCallback(() => {
    isCancelledRef.current = true;
    chunksQueueRef.current = [];

    // Dừng HTML5 Audio nếu đang phát
    if (currentAudioElementRef.current) {
      try {
        currentAudioElementRef.current.pause();
        currentAudioElementRef.current.currentTime = 0;
        currentAudioElementRef.current = null;
      } catch (e) {}
    }

    // Dừng Web Speech API nếu đang phát
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    if (typeof window !== 'undefined' && window.__activeSpeechUtterances) {
      window.__activeSpeechUtterances = [];
    }

    setIsSpeaking(false);
    setCurrentSentenceIndex(0);
    setTotalSentences(0);
  }, []);

  // Đọc tuần tự từng câu bằng Dual-Engine (HTML5 Cloud Audio + Web Speech API Fallback)
  const playNextChunk = useCallback((onEndCallback) => {
    if (isCancelledRef.current) {
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

    // Kế hoạch 1: Sử dụng HTML5 Audio qua API /api/tts (Giọng đọc tiếng Việt chuẩn, không bao giờ ngắt)
    const playWithWebSpeech = () => {
      if (isCancelledRef.current || !('speechSynthesis' in window)) {
        setIsSpeaking(false);
        return;
      }

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (e) {}

      const utterance = new SpeechSynthesisUtterance(textChunk);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      utterance.pitch = 1.02;

      // Tìm voice tiếng Việt nếu có
      try {
        const voices = window.speechSynthesis.getVoices() || [];
        const vnVoice = voices.find(v => v.lang && (v.lang.startsWith('vi') || v.lang.includes('VN')));
        if (vnVoice) utterance.voice = vnVoice;
      } catch (e) {}

      if (window.__activeSpeechUtterances) {
        window.__activeSpeechUtterances.push(utterance);
      }

      utterance.onend = () => {
        if (window.__activeSpeechUtterances) {
          const i = window.__activeSpeechUtterances.indexOf(utterance);
          if (i > -1) window.__activeSpeechUtterances.splice(i, 1);
        }
        if (!isCancelledRef.current) {
          currentIndexRef.current += 1;
          setTimeout(() => playNextChunk(onEndCallback), 60);
        }
      };

      utterance.onerror = () => {
        if (window.__activeSpeechUtterances) {
          const i = window.__activeSpeechUtterances.indexOf(utterance);
          if (i > -1) window.__activeSpeechUtterances.splice(i, 1);
        }
        if (!isCancelledRef.current) {
          currentIndexRef.current += 1;
          setTimeout(() => playNextChunk(onEndCallback), 60);
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis fallback error:', err);
      }
    };

    // Thử phát bằng HTML5 Audio Endpoint trước
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(textChunk)}`;
      const audio = new Audio(audioUrl);
      currentAudioElementRef.current = audio;

      audio.onended = () => {
        currentAudioElementRef.current = null;
        if (!isCancelledRef.current) {
          currentIndexRef.current += 1;
          setTimeout(() => playNextChunk(onEndCallback), 60);
        }
      };

      audio.onerror = () => {
        currentAudioElementRef.current = null;
        // Nếu audio endpoint gặp lỗi mạng: chuyển sang Web Speech API
        playWithWebSpeech();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Trình duyệt chặn autoplay hoặc lỗi codec: fallback sang Web Speech API
          playWithWebSpeech();
        });
      }
    } catch (err) {
      playWithWebSpeech();
    }
  }, []);

  const speak = useCallback((text, onEndCallback) => {
    if (!isAudioEnabled || !text) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Dừng câu cũ
    stop();

    // Phát tiếng chuông nhẹ
    playChime();

    const chunks = chunkTextForTTS(text);
    if (chunks.length === 0) return;

    // Chờ 80ms rồi bắt đầu phát chuỗi câu
    setTimeout(() => {
      isCancelledRef.current = false;
      chunksQueueRef.current = chunks;
      currentIndexRef.current = 0;
      setTotalSentences(chunks.length);
      setCurrentSentenceIndex(1);
      setIsSpeaking(true);

      playNextChunk(onEndCallback);
    }, 80);
  }, [isAudioEnabled, stop, playNextChunk]);

  // Keep-alive loop chống ngắt âm thanh
  useEffect(() => {
    if (!isSpeaking) return;

    const interval = setInterval(() => {
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      } catch (e) {}
    }, 8000);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => {
      const next = !prev;
      if (next) {
        playChime(659.25, 0.2);
        setTimeout(() => {
          speak('Hệ thống âm thanh hành chính công đã được bật.');
        }, 150);
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
