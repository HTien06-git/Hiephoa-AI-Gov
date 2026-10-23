import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Tách văn bản dài thành các câu ngắn (< 150 ký tự) để tránh lỗi tự ngắt sau 10s của Web Speech API trên Chrome/Safari
 */
function chunkTextForTTS(text) {
  if (!text) return [];

  // 1. Loại bỏ các ký tự markdown như *, #, _, `, >, [, ]
  const cleaned = text
    .normalize('NFC')
    .replace(/[*#_`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Tách theo dấu kết thúc câu (. ; ! ? \n)
  const rawSentences = cleaned.split(/(?<=[.!?;:\n])\s+/);
  const chunks = [];

  for (const raw of rawSentences) {
    const s = raw.trim();
    if (!s) continue;

    // Nếu một câu vẫn quá dài (> 140 ký tự), chia tiếp theo dấu phẩy
    if (s.length > 140) {
      const subParts = s.split(/(?<=[,])\s+/);
      let temp = '';
      for (const p of subParts) {
        if ((temp + ' ' + p).trim().length > 130) {
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

// Giữ tham chiếu toàn cục chống Chrome Garbage Collection giết âm thanh giữa chừng
if (typeof window !== 'undefined') {
  window.__activeSpeechUtterances = window.__activeSpeechUtterances || [];
}

// Hàm phát tiếng chuông tương tác (Chime Sound) bằng Web Audio API
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
  } catch (e) {
    // ignore audio context restrictions
  }
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
  const [voices, setVoices] = useState([]);

  const isCancelledRef = useRef(false);
  const chunksQueueRef = useRef([]);
  const currentIndexRef = useRef(0);

  // Load voices và giải phóng kẹt speechSynthesis
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const updateVoices = () => {
      try {
        const allVoices = window.speechSynthesis.getVoices() || [];
        const vnVoices = allVoices.filter(v => v.lang && (v.lang.startsWith('vi') || v.lang.includes('VN')));
        setVoices(vnVoices.length > 0 ? vnVoices : allVoices);
      } catch (err) {
        console.warn('Lỗi tải danh sách voices:', err);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    // Mở khóa AudioContext và SpeechSynthesis ngay khi người dùng chạm hoặc click lần đầu vào màn hình
    const handleFirstUserInteraction = () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
        playChime(440, 0.05); // Chime siêu nhỏ để mở kênh âm thanh trình duyệt
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

    if (!isAudioEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isAudioEnabled]);

  const stop = useCallback(() => {
    isCancelledRef.current = true;
    chunksQueueRef.current = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (typeof window !== 'undefined' && window.__activeSpeechUtterances) {
      window.__activeSpeechUtterances = [];
    }
    setIsSpeaking(false);
    setCurrentSentenceIndex(0);
    setTotalSentences(0);
  }, []);

  // Đọc tuần tự từng câu ngắn nối tiếp nhau
  const playNextChunk = useCallback((onEndCallback) => {
    if (isCancelledRef.current || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    // Đánh thức synthesizer nếu Chrome đang ở trạng thái paused
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

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

    const utterance = new SpeechSynthesisUtterance(textChunk);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95; // Tốc độ vừa phải truyền cảm
    utterance.pitch = 1.02;

    // Chọn giọng đọc tiếng Việt tốt nhất
    if (voices && voices.length > 0) {
      const bestVoice = 
        voices.find(v => v.lang && v.lang.startsWith('vi') && v.name.includes('HoaiMy')) ||
        voices.find(v => v.lang && v.lang.startsWith('vi') && v.name.includes('NamMinh')) ||
        voices.find(v => v.lang && v.lang.startsWith('vi') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
        voices.find(v => v.lang && v.lang.startsWith('vi') && v.name.includes('Google')) ||
        voices.find(v => v.lang && v.lang.startsWith('vi') && v.name.includes('Linh')) ||
        voices.find(v => v.lang && (v.lang.startsWith('vi') || v.lang.includes('VN')));

      if (bestVoice) {
        utterance.voice = bestVoice;
      }
    }

    // Giữ tham chiếu chống Garbage Collection
    if (window.__activeSpeechUtterances) {
      window.__activeSpeechUtterances.push(utterance);
    }

    utterance.onend = () => {
      // Dọn tham chiếu
      if (window.__activeSpeechUtterances) {
        const i = window.__activeSpeechUtterances.indexOf(utterance);
        if (i > -1) window.__activeSpeechUtterances.splice(i, 1);
      }

      if (!isCancelledRef.current) {
        currentIndexRef.current += 1;
        setTimeout(() => playNextChunk(onEndCallback), 50);
      }
    };

    utterance.onerror = (e) => {
      console.warn('[SpeechSynthesis] Chunk error:', e);
      if (window.__activeSpeechUtterances) {
        const i = window.__activeSpeechUtterances.indexOf(utterance);
        if (i > -1) window.__activeSpeechUtterances.splice(i, 1);
      }

      if (!isCancelledRef.current) {
        currentIndexRef.current += 1;
        setTimeout(() => playNextChunk(onEndCallback), 50);
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
      // Đánh thức nếu Chrome đang pause
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (err) {
      console.error('Lỗi khi gọi window.speechSynthesis.speak:', err);
    }
  }, [voices]);

  const speak = useCallback((text, onEndCallback) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Trình duyệt không hỗ trợ Web Speech Synthesis.');
      return;
    }

    if (!isAudioEnabled || !text) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Đánh thức AudioContext và synthesizer
    playChime();
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

    // Dừng câu cũ an toàn
    isCancelledRef.current = true;
    chunksQueueRef.current = [];
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}

    // Chia văn bản thành các câu ngắn thông minh (< 120 ký tự)
    const chunks = chunkTextForTTS(text);
    if (chunks.length === 0) return;

    // Chờ 120ms để Chrome hoàn tất cancel câu cũ trước khi nhận chuỗi mới (chống nuốt âm)
    setTimeout(() => {
      isCancelledRef.current = false;
      chunksQueueRef.current = chunks;
      currentIndexRef.current = 0;
      setTotalSentences(chunks.length);
      setCurrentSentenceIndex(1);
      setIsSpeaking(true);

      try {
        window.speechSynthesis.resume();
      } catch (e) {}

      playNextChunk(onEndCallback);
    }, 120);
  }, [isAudioEnabled, playNextChunk]);

  // Keep-alive timer chống Chrome tự ngắt âm thanh sau 14 giây
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
        playChime(659.25, 0.2); // Âm thanh báo BẬT LOA
        setTimeout(() => {
          speak('Hệ thống âm thanh hành chính công đã được bật.');
        }, 150);
      } else {
        playChime(392.00, 0.15); // Âm thanh báo TẮT LOA
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
    hasVoiceSupport: typeof window !== 'undefined' && 'speechSynthesis' in window
  };
}
