import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Tách văn bản dài thành các câu ngắn (< 100 ký tự) để phát thanh tự nhiên, dứt khoát
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

    if (s.length > 95) {
      const subParts = s.split(/(?<=[,])\s+/);
      let temp = '';
      for (const p of subParts) {
        if ((temp + ' ' + p).trim().length > 85) {
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

// Tốc độ đọc chuẩn hành chính công: 1.16x (nhanh, lưu loát, dứt khoát, không bị chậm rè)
const SPEECH_RATE = 1.16;

// Biến lưu trữ Player duy nhất toàn cục để triệt tiêu 100% tình trạng 2 giọng phát cùng lúc
let globalAudioPlayer = null;

function stopAllAudioPlayback() {
  if (globalAudioPlayer) {
    try {
      globalAudioPlayer.pause();
      globalAudioPlayer.currentTime = 0;
      globalAudioPlayer.onended = null;
      globalAudioPlayer.onerror = null;
      globalAudioPlayer.removeAttribute('src');
      globalAudioPlayer.load();
    } catch (e) {}
    globalAudioPlayer = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

// Phát tiếng chuông nhẹ trước khi đọc
function playChime(frequency = 587.33, duration = 0.1) {
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
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
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
  const isAudioUnlockedRef = useRef(false);

  // Mở khóa âm thanh khi người dùng tương tác lần đầu
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

  // Lưu tùy chọn loa vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hiep_hoa_audio_enabled', String(isAudioEnabled));
    } catch (e) {}

    if (!isAudioEnabled) {
      stop();
    }
  }, [isAudioEnabled]);

  const stop = useCallback(() => {
    // Tăng sessionId để huỷ lập tức toàn bộ callback đang chờ
    sessionIdRef.current += 1;
    chunksQueueRef.current = [];
    currentIndexRef.current = 0;

    stopAllAudioPlayback();

    setIsSpeaking(false);
    setCurrentSentenceIndex(0);
    setTotalSentences(0);
  }, []);

  // Phát câu đơn bằng DUY NHẤT 1 GIỌNG NỮ TIẾNG VIỆT (Google Vietnamese Female Voice)
  const playFemaleChunk = (textChunk, currentSession, onChunkEnd, onError) => {
    if (sessionIdRef.current !== currentSession) return;

    // Luôn dừng bất kỳ audio nào trước khi phát câu mới
    stopAllAudioPlayback();

    const encoded = encodeURIComponent(textChunk);
    // Ưu tiên 1: URL trực tiếp máy khách (giọng nữ chuẩn, không qua trung gian)
    const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=vi&client=tw-ob`;
    // Ưu tiên 2: Backend proxy (cùng giọng nữ, phòng trường hợp mạng khách chặn)
    const proxyUrl = `/api/tts?text=${encoded}`;

    const audio = new Audio();
    globalAudioPlayer = audio;

    // TĂNG TỐC ĐỘ ĐỌC: Đọc nhanh, dứt khoát, tự nhiên (1.16x)
    audio.defaultPlaybackRate = SPEECH_RATE;
    audio.playbackRate = SPEECH_RATE;

    let hasEnded = false;
    let switchedToProxy = false;

    const cleanupAndNext = () => {
      if (hasEnded) return;
      hasEnded = true;
      if (globalAudioPlayer === audio) {
        globalAudioPlayer = null;
      }
      if (sessionIdRef.current === currentSession) {
        onChunkEnd();
      }
    };

    audio.onplay = () => {
      // Đảm bảo tốc độ 1.16x khi bắt đầu chạy
      audio.playbackRate = SPEECH_RATE;
    };

    audio.onended = cleanupAndNext;

    audio.onerror = () => {
      // Nếu URL trực tiếp lỗi, chuyển sang Proxy Backend (vẫn là GIỌNG NỮ DUY NHẤT)
      if (!switchedToProxy && sessionIdRef.current === currentSession) {
        switchedToProxy = true;
        audio.src = proxyUrl;
        audio.playbackRate = SPEECH_RATE;
        const p = audio.play();
        if (p !== undefined) {
          p.catch((err) => {
            if (onError) onError(err);
            cleanupAndNext();
          });
        }
      } else {
        cleanupAndNext();
      }
    };

    audio.src = directUrl;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Nếu bị chặn autoplay hoặc mạng không tải được directUrl
        if (err && err.name === 'NotAllowedError') {
          if (onError) onError(err);
          stop();
          return;
        }

        // Thử sang Proxy
        if (!switchedToProxy && sessionIdRef.current === currentSession) {
          switchedToProxy = true;
          audio.src = proxyUrl;
          audio.playbackRate = SPEECH_RATE;
          const p = audio.play();
          if (p !== undefined) {
            p.catch((proxyErr) => {
              if (onError) onError(proxyErr);
              cleanupAndNext();
            });
          }
        } else {
          cleanupAndNext();
        }
      });
    }
  };

  // Đọc tuần tự từng câu trong hàng đợi
  const playNextChunk = useCallback((currentSession, onEndCallback, onErrorCallback) => {
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
        // Khoảng nghỉ giữa các câu: 40ms (nhanh và liền mạch)
        setTimeout(() => playNextChunk(currentSession, onEndCallback, onErrorCallback), 40);
      }
    };

    playFemaleChunk(textChunk, currentSession, onChunkSuccess, onErrorCallback);
  }, []);

  const speak = useCallback((text, onEndCallback, onErrorCallback) => {
    if (!isAudioEnabled || !text || !text.trim()) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Dừng dứt khoát mọi âm thanh cũ trước đó
    stop();

    // Khởi tạo mã phiên độc nhất
    const currentSession = sessionIdRef.current;

    // Phát chuông báo nhẹ
    playChime();

    const chunks = chunkTextForTTS(text);
    if (chunks.length === 0) return;

    // Chờ 60ms dọn sạch trạng thái cũ rồi phát phiên mới
    setTimeout(() => {
      if (sessionIdRef.current !== currentSession) return;

      chunksQueueRef.current = chunks;
      currentIndexRef.current = 0;
      setTotalSentences(chunks.length);
      setCurrentSentenceIndex(1);
      setIsSpeaking(true);

      playNextChunk(currentSession, onEndCallback, onErrorCallback);
    }, 60);
  }, [isAudioEnabled, stop, playNextChunk]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => {
      const next = !prev;
      if (next) {
        playChime(659.25, 0.15);
        setTimeout(() => {
          speak('Hệ thống âm thanh hành chính công đã sẵn sàng.');
        }, 100);
      } else {
        playChime(392.00, 0.12);
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
