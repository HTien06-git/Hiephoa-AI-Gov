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

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [totalSentences, setTotalSentences] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => {
    const saved = localStorage.getItem('hiep_hoa_audio_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [voices, setVoices] = useState([]);

  const isCancelledRef = useRef(false);
  const chunksQueueRef = useRef([]);
  const currentIndexRef = useRef(0);

  // Load voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const vnVoices = allVoices.filter(v => v.lang.startsWith('vi') || v.lang.includes('VN'));
      setVoices(vnVoices.length > 0 ? vnVoices : allVoices);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Save audio preference
  useEffect(() => {
    localStorage.setItem('hiep_hoa_audio_enabled', String(isAudioEnabled));
    if (!isAudioEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isAudioEnabled]);

  const stop = useCallback(() => {
    isCancelledRef.current = true;
    chunksQueueRef.current = [];
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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
    utterance.rate = 0.98; // Tốc độ chuẩn mực truyền cảm cho người dân và người lớn tuổi
    utterance.pitch = 1.02; // Âm vực ấm áp, thanh thoát và rõ chữ

    // Chọn giọng đọc tiếng Việt truyền cảm, rõ ràng nhất có trên thiết bị
    if (voices.length > 0) {
      const bestVoice = 
        voices.find(v => v.lang.startsWith('vi') && v.name.includes('HoaiMy')) ||
        voices.find(v => v.lang.startsWith('vi') && v.name.includes('NamMinh')) ||
        voices.find(v => v.lang.startsWith('vi') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
        voices.find(v => v.lang.startsWith('vi') && v.name.includes('Google')) ||
        voices.find(v => v.lang.startsWith('vi') && v.name.includes('Linh')) ||
        voices.find(v => v.lang.startsWith('vi') || v.lang.includes('VN'));

      if (bestVoice) {
        utterance.voice = bestVoice;
      }
    }

    utterance.onend = () => {
      if (!isCancelledRef.current) {
        currentIndexRef.current += 1;
        // Chờ 60ms rồi đọc câu kế tiếp
        setTimeout(() => playNextChunk(onEndCallback), 60);
      }
    };

    utterance.onerror = (e) => {
      console.warn('[SpeechSynthesis] Chunk error:', e);
      if (!isCancelledRef.current) {
        currentIndexRef.current += 1;
        setTimeout(() => playNextChunk(onEndCallback), 60);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const speak = useCallback((text, onEndCallback) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Trình duyệt không hỗ trợ Web Speech Synthesis.');
      return;
    }

    if (!isAudioEnabled || !text) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Cancel current queue
    stop();

    // Chia văn bản thành các câu ngắn thông minh
    const chunks = chunkTextForTTS(text);
    if (chunks.length === 0) return;

    isCancelledRef.current = false;
    chunksQueueRef.current = chunks;
    currentIndexRef.current = 0;
    setTotalSentences(chunks.length);
    setCurrentSentenceIndex(1);
    setIsSpeaking(true);

    // Chờ 50ms cho cancel hoàn tất
    setTimeout(() => {
      playNextChunk(onEndCallback);
    }, 50);
  }, [isAudioEnabled, stop, playNextChunk]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
  }, []);

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
