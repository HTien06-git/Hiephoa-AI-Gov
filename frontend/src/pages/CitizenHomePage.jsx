import React, { useState } from 'react';
import Header from '../components/layout/Header';
import AccessibilityBar from '../components/layout/AccessibilityBar';
import HeroVoiceStation from '../components/voice/HeroVoiceStation';
import CategoryGrid from '../components/categories/CategoryGrid';
import DvcGuideSection from '../components/dvc-guide/DvcGuideSection';
import RagChatDrawer from '../components/rag-chat/RagChatDrawer';
import SmartAutoFormModal from '../components/auto-form/SmartAutoFormModal';
import DocumentPreCheckModal from '../components/pre-check/DocumentPreCheckModal';
import CitizenQrModal from '../components/qr-handoff/CitizenQrModal';
import CitizenLookupModal from '../components/qr-handoff/CitizenLookupModal';
import FloatingBottomNav from '../components/layout/FloatingBottomNav';

import { useFontScale } from '../hooks/useFontScale';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useZeroDataSession } from '../hooks/useZeroDataSession';
import { apiClient } from '../services/apiClient';

// Offline fallback data
import proceduresData from '../data/procedures_demo.json';

export default function CitizenHomePage({ onSwitchToOfficer }) {
  const { scale, setScale } = useFontScale();
  const { isSpeaking, isAudioEnabled, speak, stop, toggleAudio } = useSpeechSynthesis();
  const { clearSecurityData, hasData } = useZeroDataSession();

  // Modals & Drawers state
  const [categories] = useState(proceduresData.categories || []);
  const [procedures] = useState(proceduresData.procedures || []);
  const [, setSelectedProcedure] = useState(null);
  const [chatResult, setChatResult] = useState(null);
  const [autoFormProc, setAutoFormProc] = useState(null);
  const [autoFormMode, setAutoFormMode] = useState('data_input');
  const [preCheckProc, setPreCheckProc] = useState(null);
  const [qrPayload, setQrPayload] = useState(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [, setIsQueryLoading] = useState(false);

  const handleOpenAutoForm = (proc, mode = 'data_input') => {
    setAutoFormMode(mode);
    setAutoFormProc(proc);
  };

  // Cuộn mượt lên đầu trang
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cuộn đến phần Hero Voice
  const handleActivateMic = () => {
    const micSection = document.getElementById('voice-hero-section');
    if (micSection) {
      micSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Xử lý gửi câu hỏi người dân (từ Micro hoặc thanh nhập liệu)
  const handleQuerySubmit = async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    setIsQueryLoading(true);
    stop();

    try {
      const response = await apiClient.chatQuery(queryText);
      if (response && response.data) {
        setChatResult(response.data);
      }
    } catch (err) {
      console.error('Query submit error:', err);
    } finally {
      setIsQueryLoading(false);
    }
  };

  // Khi bấm xem chi tiết thủ tục
  const handleSelectProcedure = (proc) => {
    setSelectedProcedure(proc);
    setChatResult({
      answer: `### Hướng dẫn: ${proc.title}\n\n${proc.voice_answer}\n\n**Căn cứ pháp lý:** *${proc.legal_basis}*`,
      voice_text: proc.voice_answer,
      checklist: proc.checklist,
      matchedProcedure: proc,
      legal_basis: proc.legal_basis,
      sources: [
        { title: "Thư Viện Pháp Luật", url: "https://thuvienphapluat.vn/" },
        { title: "Cổng DVC Quốc Gia", url: proc.dvc_url || "https://dichvucong.gov.vn/" }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col justify-between overflow-x-hidden max-w-full pb-16 md:pb-0">
      <div>
        {/* Header chuẩn Cổng Dịch vụ công Chính phủ với Trống Đồng Đông Sơn */}
        <Header currentMode="citizen" setCurrentMode={(m) => m === 'officer' && onSwitchToOfficer()} />

        {/* Thanh Công Cụ Trợ Năng */}
        <AccessibilityBar
          fontScale={scale}
          setFontScale={setScale}
          isAudioEnabled={isAudioEnabled}
          toggleAudio={toggleAudio}
          clearSecurityData={clearSecurityData}
          hasData={hasData}
        />

        {/* Main Content: Bố cục tinh gọn chỉ gồm đúng 03 khu vực mạch lạc */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 overflow-x-hidden">
          
          {/* KHU VỰC 1: TRUNG TÂM TƯ VẤN GIỌNG NÓI & HỎI ĐÁP PHÁP LUẬT AI 24/7 (Hero Voice Station) */}
          <HeroVoiceStation
            onQuerySubmit={handleQuerySubmit}
            isSpeaking={isSpeaking}
            stopSpeaking={stop}
            speak={speak}
            isAudioEnabled={isAudioEnabled}
          />

          {/* KHU VỰC 2: DANH MỤC 08 THỦ TỤC HÀNH CHÍNH (Sạch sẽ, 2 nút chuẩn mực) */}
          <CategoryGrid
            categories={categories}
            procedures={procedures}
            onSelectProcedure={handleSelectProcedure}
            onOpenAutoForm={(proc, mode) => {
              stop();
              setChatResult(null);
              handleOpenAutoForm(proc, mode);
            }}
            onOpenPreCheck={(proc) => {
              stop();
              setChatResult(null);
              setPreCheckProc(proc);
            }}
            speakText={speak}
          />

          {/* KHU VỰC 3: CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN & CẨM NANG VNeID (Sắc Đỏ Thẫm Chính Phủ) */}
          <DvcGuideSection speakText={speak} />

        </main>
      </div>

      {/* RAG Chat & Checklist Drawer */}
      {chatResult && (
        <RagChatDrawer
          chatResult={chatResult}
          onClose={() => {
            stop();
            setChatResult(null);
          }}
          speakText={speak}
          stopSpeaking={stop}
          isSpeaking={isSpeaking}
          onOpenAutoForm={(proc, mode) => {
            stop();
            setChatResult(null);
            handleOpenAutoForm(proc, mode);
          }}
          onOpenPreCheck={(proc) => {
            stop();
            setPreCheckProc(proc);
          }}
        />
      )}

      {/* Smart Auto-Form Modal (Voice Wizard, OCR, Điền đơn, 4 Định dạng tải về) */}
      {autoFormProc && (
        <SmartAutoFormModal
          procedure={autoFormProc}
          initialMode={autoFormMode}
          onClose={() => setAutoFormProc(null)}
          speakText={speak}
          stopSpeaking={stop}
          onGenerateQr={(payload) => {
            setAutoFormProc(null);
            setQrPayload(payload);
          }}
        />
      )}

      {/* Document Pre-Check Modal (AI Kiểm tra ảnh chụp giấy tờ trước khi nộp) */}
      {preCheckProc && (
        <DocumentPreCheckModal
          procedure={preCheckProc}
          onClose={() => setPreCheckProc(null)}
          speakText={speak}
          stopSpeaking={stop}
        />
      )}

      {/* Citizen QR Code Modal (Mã QR bảo mật nộp hồ sơ tại Bộ phận Một cửa) */}
      {qrPayload && (
        <CitizenQrModal
          qrPayload={qrPayload}
          onClose={() => setQrPayload(null)}
          speakText={speak}
        />
      )}

      {/* Tra cứu mã hồ sơ trực tuyến Modal */}
      {isLookupOpen && (
        <CitizenLookupModal
          onClose={() => setIsLookupOpen(false)}
          speakText={speak}
        />
      )}

      {/* Floating Bottom Nav trên điện thoại (Mobile-only) */}
      <FloatingBottomNav
        onScrollToTop={handleScrollToTop}
        onActivateMic={handleActivateMic}
        onOpenLookup={() => setIsLookupOpen(true)}
        onSwitchToOfficer={onSwitchToOfficer}
      />

      {/* ======================================================== */}
      {/* FOOTER CHÍNH QUYỀN XÃ HIỆP HÒA (THÔNG TIN CHÍNH THỨC V6.0) */}
      {/* ======================================================== */}
      <footer className="bg-[#1C1917] text-stone-300 py-10 px-4 border-t-4 border-amber-500 relative mt-16">
        {/* Đường diềm Đông Sơn vàng kim */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột 1: Đơn vị hành chính */}
          <div className="space-y-2">
            <div className="text-amber-400 font-extrabold text-sm sm:text-base uppercase tracking-wide">
              Ủy Ban Nhân Dân Xã Hiệp Hòa — Tỉnh Tây Ninh
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              <strong>Trung tâm Phục vụ Hành chính công xã Hiệp Hòa</strong><br />
              Địa chỉ: Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh.
            </p>
            <p className="text-xs text-stone-400">
              Thời gian làm việc: Sáng 07h00 - 11h30, Chiều 13h30 - 17h00 (Thứ 2 đến Thứ 6).
            </p>
          </div>

          {/* Cột 2: Đường dây nóng & Kỹ thuật chính thức */}
          <div className="space-y-2">
            <div className="text-amber-400 font-extrabold text-sm sm:text-base uppercase tracking-wide">
              Đường Dây Nóng & Hỗ Trợ Kỹ Thuật
            </div>
            <div className="space-y-1 text-xs sm:text-sm">
              <p className="text-white">
                📞 <strong>Tổng đài Dịch vụ công Quốc gia:</strong>{' '}
                <a href="tel:18001096" className="text-amber-300 font-bold hover:underline">1800 1096</a>
              </p>
              <p className="text-stone-300">
                🛠 <strong>Hỗ trợ kỹ thuật dự án Hiệp Hòa AI-Gov:</strong>{' '}
                <a href="tel:0362872772" className="text-amber-300 font-bold hover:underline">0362 872 772</a>
              </p>
              <p className="text-stone-400 text-xs">
                Tác giả: <strong>Trương Hoàng Tiến</strong> – Bí thư Chi Đoàn ấp Văn Hiệp
              </p>
              <p className="text-stone-400 text-xs">
                Email: <span className="text-stone-300">truonghoangtien90@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Cột 3: Bảo mật & Bản quyền */}
          <div className="space-y-2">
            <div className="text-amber-400 font-extrabold text-sm sm:text-base uppercase tracking-wide">
              Bảo Mật Quyền Riêng Tư & Trợ Năng
            </div>
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>🛡</span>
                <span>Chuẩn Zero-Data Retention:</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Dữ liệu tờ khai và giấy tờ cá nhân được xử lý trực tiếp trên thiết bị của bà con và giải phóng ngay khi hoàn thành phiên.
              </p>
            </div>
            <div className="text-[11px] text-stone-500 pt-1">
              © 2026 HIỆP HÒA AI-GOV. Nền tảng Chuyên viên Hành chính công AI Đa phương thức phục vụ Nhân dân.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
