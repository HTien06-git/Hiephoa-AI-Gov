import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Tách văn bản dài thành các câu ngắn (< 110 ký tự) để phát thanh tự nhiên, dứt khoát
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

    if (s.length > 105) {
      const subParts = s.split(/(?<=[,])\s+/);
      let temp = '';
      for (const p of subParts) {
        if ((temp + ' ' + p).trim().length > 95) {
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

// Tốc độ đọc chuẩn hành chính công: 1.15x (nhanh, lưu loát, dứt khoát, tự nhiên)
const SPEECH_RATE = 1.15;

/**
 * THIẾT KẾ SINGLETON AUDIO DUY NHẤT TOÀN ỨNG DỤNG
 * Một phần cứng / tab trình duyệt chỉ có DUY NHẤT một thẻ Audio này.
 * Bất cứ khi nào gán .src mới, trình duyệt tự động ngắt âm thanh cũ,
 * triệt tiêu 100% tình trạng nhiều giọng đọc cùng lúc!
 */
let singletonAudio = null;
function getSingletonAudio() {
  if (!singletonAudio && typeof window !== 'undefined') {
    singletonAudio = new Audio();
    // Giữ trên window để debug nếu cần
    window.__hiephoaSingletonAudio = singletonAudio;
  }
  return singletonAudio;
}

// Dừng toàn bộ âm thanh ngay lập tức
function stopAudioGlobally() {
  if (singletonAudio) {
    try {
      singletonAudio.pause();
      singletonAudio.currentTime = 0;
      singletonAudio.onended = null;
      singletonAudio.onerror = null;
      singletonAudio.onplay = null;
      singletonAudio.removeAttribute('src');
      singletonAudio.load();
    } catch (e) {}
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
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

  // Token phiên độc nhất: Mỗi lần speak() tăng lên 1, huỷ mọi callback cũ
  const sessionTokenRef = useRef(0);
  const chunksQueueRef = useRef([]);
  const currentIndexRef = useRef(0);
  const nextTimerRef = useRef(null);

  // Mở khóa âm thanh khi người dùng chạm vào trang
  useEffect(() => {
    const unlock = () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
      } catch (e) {}
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock, { capture: true, passive: true });
    window.addEventListener('touchstart', unlock, { capture: true, passive: true });
    window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
    window.addEventListener('keydown', unlock, { capture: true, passive: true });

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Lưu trạng thái bật/tắt âm thanh
  useEffect(() => {
    try {
      localStorage.setItem('hiep_hoa_audio_enabled', String(isAudioEnabled));
    } catch (e) {}

    if (!isAudioEnabled) {
      stop();
    }
  }, [isAudioEnabled]);

  const stop = useCallback(() => {
    // Tăng token phiên để vô hiệu hóa toàn bộ callback dở
    sessionTokenRef.current += 1;
    chunksQueueRef.current = [];
    currentIndexRef.current = 0;

    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }

    stopAudioGlobally();

    setIsSpeaking(false);
    setCurrentSentenceIndex(0);
    setTotalSentences(0);
  }, []);

  // Phát câu đơn bằng DUY NHẤT 1 GIỌNG NỮ TIẾNG VIỆT trên SINGLETON AUDIO
  const playChunkAt = useCallback((index, currentToken, onEndCallback, onErrorCallback) => {
    // Nếu token phiên đã thay đổi (người dùng đã bấm stop hoặc đọc câu khác), dừng ngay lập tức
    if (sessionTokenRef.current !== currentToken) {
      setIsSpeaking(false);
      return;
    }

    const queue = chunksQueueRef.current;
    if (index >= queue.length) {
      setIsSpeaking(false);
      setCurrentSentenceIndex(0);
      setTotalSentences(0);
      if (onEndCallback) onEndCallback();
      return;
    }

    const textChunk = queue[index];
    setCurrentSentenceIndex(index + 1);

    const audio = getSingletonAudio();
    if (!audio) return;

    // Dừng sạch âm thanh cũ trước khi nạp câu mới
    try {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
      audio.onplay = null;
    } catch (e) {}

    const encoded = encodeURIComponent(textChunk);
    const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=vi&client=tw-ob`;
    const proxyUrl = `/api/tts?text=${encoded}`;

    let hasAdvanced = false;
    let hasTriedProxy = false;

    // Hàm chuyển sang câu tiếp theo một cách an toàn (CHỈ GỌI 1 LẦN DUY NHẤT)
    const advanceNext = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;

      audio.onended = null;
      audio.onerror = null;

      if (sessionTokenRef.current === currentToken) {
        // Khoảng nghỉ giữa 2 câu: 35ms (rất nhanh và liền mạch)
        nextTimerRef.current = setTimeout(() => {
          playChunkAt(index + 1, currentToken, onEndCallback, onErrorCallback);
        }, 35);
      }
    };

    audio.onended = advanceNext;

    audio.onerror = () => {
      // Nếu directUrl lỗi thì thử sang proxyUrl trên CÙNG 1 AUDIO ELEMENT
      if (!hasTriedProxy && sessionTokenRef.current === currentToken) {
        hasTriedProxy = true;
        audio.src = proxyUrl;
        audio.playbackRate = SPEECH_RATE;
        const p = audio.play();
        if (p !== undefined) {
          p.catch((err) => {
            if (onErrorCallback) onErrorCallback(err);
            advanceNext();
          });
        }
      } else {
        advanceNext();
      }
    };

    audio.onplay = () => {
      audio.playbackRate = SPEECH_RATE;
    };

    audio.defaultPlaybackRate = SPEECH_RATE;
    audio.playbackRate = SPEECH_RATE;
    audio.src = directUrl;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Nếu bị chặn autoplay của trình duyệt
        if (err && err.name === 'NotAllowedError') {
          if (onErrorCallback) onErrorCallback(err);
          stop();
          return;
        }

        // Nếu lỗi mạng trực tiếp, chuyển sang proxy
        if (!hasTriedProxy && sessionTokenRef.current === currentToken) {
          hasTriedProxy = true;
          audio.src = proxyUrl;
          audio.playbackRate = SPEECH_RATE;
          const p = audio.play();
          if (p !== undefined) {
            p.catch((proxyErr) => {
              if (onErrorCallback) onErrorCallback(proxyErr);
              advanceNext();
            });
          }
        }
      });
    }
  }, [stop]);

  const speak = useCallback((text, onEndCallback, onErrorCallback) => {
    if (!isAudioEnabled || !text || !text.trim()) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // 1. Dừng mọi âm thanh cũ và huỷ bỏ callback phiên cũ
    stop();

    // 2. Tạo mã phiên mới
    const currentToken = sessionTokenRef.current;

    // 3. Phân tách câu
    const chunks = chunkTextForTTS(text);
    if (chunks.length === 0) return;

    chunksQueueRef.current = chunks;
    currentIndexRef.current = 0;
    setTotalSentences(chunks.length);
    setCurrentSentenceIndex(1);
    setIsSpeaking(true);

    // 4. Phát câu đầu tiên
    playChunkAt(0, currentToken, onEndCallback, onErrorCallback);
  }, [isAudioEnabled, stop, playChunkAt]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          speak('Hệ thống âm thanh hành chính công đã sẵn sàng.');
        }, 80);
      } else {
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
