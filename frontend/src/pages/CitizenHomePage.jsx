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
import QuickActionFloatingDock from '../components/layout/QuickActionFloatingDock';
import CitizenDeviceNotificationToast from '../components/layout/CitizenDeviceNotificationToast';
import TrongDongOrnament from '../components/common/TrongDongOrnament';

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
  const [lookupInitialQuery, setLookupInitialQuery] = useState('');
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

  // Cuộn đến danh mục thủ tục
  const handleScrollToProcedures = () => {
    const procSection = document.getElementById('procedures-catalog-section');
    if (procSection) {
      procSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mở modal kiểm tra ảnh giấy tờ
  const handleOpenPreCheckDefault = () => {
    const defaultProc = procedures[0] || null;
    setPreCheckProc(defaultProc);
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
      intentType: 'PROCEDURE_GUIDE',
      sources: [
        { title: "Thư Viện Pháp Luật", url: "https://thuvienphapluat.vn/" },
        { title: "Cổng DVC Quốc Gia", url: proc.dvc_url || "https://dichvucong.gov.vn/" }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between overflow-x-hidden max-w-full pb-20 relative">
      
      {/* ======================================================== */}
      {/* BIỂU TƯỢNG TRỐNG ĐỒNG TO MỜ MỜ KÈM HIỆU ỨNG ÁNH KIM LÀM NỀN */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="w-[850px] h-[850px] lg:w-[1050px] lg:h-[1050px] opacity-[0.035] text-amber-700 select-none">
          <TrongDongOrnament size={1050} color="#D97706" spin={true} spinDuration={240} />
        </div>
      </div>

      <div className="relative z-10">
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

        {/* Main Content: Bố cục tinh gọn gồm 03 khu vực mạch lạc */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 overflow-x-hidden pb-32 sm:pb-28">
          
          {/* KHU VỰC 1: TRUNG TÂM TƯ VẤN GIỌNG NÓI & HỎI ĐÁP PHÁP LUẬT AI 24/7 (Hero Voice Station) */}
          <HeroVoiceStation
            onQuerySubmit={handleQuerySubmit}
            isSpeaking={isSpeaking}
            stopSpeaking={stop}
            speak={speak}
            isAudioEnabled={isAudioEnabled}
          />

          {/* KHU VỰC 2: DANH MỤC 08 THỦ TỤC HÀNH CHÍNH (Sạch sẽ, 2 nút chuẩn mực) */}
          <div id="procedures-catalog-section">
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
          </div>

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

      {/* Tra cứu mã hồ sơ trực tuyến Modal (Hỗ trợ CCCD & Mã hồ sơ) */}
      {isLookupOpen && (
        <CitizenLookupModal
          initialQuery={lookupInitialQuery}
          onClose={() => {
            setIsLookupOpen(false);
            setLookupInitialQuery('');
          }}
          speakText={speak}
        />
      )}

      {/* Thông Báo Nhắc Kết Quả Hồ Sơ Trên Thiết Bị Người Dân */}
      <CitizenDeviceNotificationToast
        onOpenLookupWithCode={(code) => {
          setLookupInitialQuery(code);
          setIsLookupOpen(true);
        }}
        speakText={speak}
      />

      {/* ======================================================== */}
      {/* THANH NÚT CHỨC NĂNG NHANH CỐ ĐỊNH PHÍA DƯỚI MÀN HÌNH     */}
      {/* Cố định vị trí, khi lướt lên xuống các nút vẫn giữ nguyên */}
      {/* ======================================================== */}
      <QuickActionFloatingDock
        onActivateMic={handleActivateMic}
        onOpenLookup={() => {
          setLookupInitialQuery('');
          setIsLookupOpen(true);
        }}
        onScrollToProcedures={handleScrollToProcedures}
        onOpenPreCheck={handleOpenPreCheckDefault}
        onScrollToTop={handleScrollToTop}
      />

      {/* ======================================================== */}
      {/* FOOTER CHÍNH QUYỀN XÃ HIỆP HÒA (ĐỎ HOÀNG GIA - VÀNG ĐỒNG) */}
      {/* Không dùng màu đen, hoa văn Trống Đồng, chữ không bị nhảy dòng */}
      {/* ======================================================== */}
      <footer className="bg-gradient-to-br from-[#690F12] via-[#851417] to-[#550A0C] text-amber-50/95 py-10 px-4 sm:px-6 border-t-2 border-amber-500/80 relative mt-16 overflow-hidden shadow-2xl z-10">
        {/* Đường diềm Đông Sơn vàng kim */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700" />
        
        {/* Họa tiết Trống Đồng chìm góc Footer */}
        <div className="absolute -right-16 -bottom-16 w-72 h-72 pointer-events-none opacity-[0.08] text-amber-300">
          <TrongDongOrnament size={288} color="#FBBF24" />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Cột 1: Đơn vị hành chính */}
          <div className="space-y-2.5">
            <div className="text-amber-300 font-extrabold text-sm sm:text-base uppercase tracking-wider leading-snug">
              Ủy Ban Nhân Dân Xã Hiệp Hòa — Tỉnh Tây Ninh
            </div>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              <strong>Trung tâm Phục vụ Hành chính công xã Hiệp Hòa</strong><br />
              Địa chỉ: Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh.
            </p>
            <p className="text-xs text-amber-200/80">
              Thời gian tiếp nhận: Sáng 07h00 - 11h30, Chiều 13h30 - 17h00 (Thứ 2 đến Thứ 6).
            </p>
          </div>

          {/* Cột 2: Đường dây nóng Dịch vụ công */}
          <div className="space-y-2.5">
            <div className="text-amber-300 font-extrabold text-sm sm:text-base uppercase tracking-wider leading-snug">
              Đường Dây Nóng Hỗ Trợ
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <p className="text-white flex items-center gap-1.5 flex-wrap">
                <span>📞</span>
                <strong>Tổng đài Dịch vụ công Quốc gia:</strong>{' '}
                <a href="tel:18001096" className="text-amber-300 font-extrabold hover:underline text-sm sm:text-base">1800 1096</a>
              </p>
              <p className="text-amber-100/80 text-xs leading-relaxed">
                Tiếp nhận phản ánh, kiến nghị và hướng dẫn thủ tục hành chính công 24/7.
              </p>
            </div>
          </div>

          {/* Cột 3: Bảo mật & Bản quyền */}
          <div className="space-y-2.5">
            <div className="text-amber-300 font-extrabold text-sm sm:text-base uppercase tracking-wider leading-snug">
              Bảo Mật Quyền Riêng Tư & Trợ Năng
            </div>
            <div className="p-3.5 rounded-2xl bg-black/30 border border-amber-400/30 text-xs text-amber-50 space-y-1 backdrop-blur-xs">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <span>🛡</span>
                <span>Chuẩn Zero-Data Retention:</span>
              </div>
              <p className="text-amber-100/80 text-[11px] leading-relaxed">
                Toàn bộ dữ liệu hồ sơ và giấy tờ cá nhân được xử lý cục bộ trên thiết bị và tự động giải phóng ngay khi hoàn thành phiên.
              </p>
            </div>
            <div className="text-[11px] text-amber-200/70 pt-1">
              © 2026 HIỆP HÒA AI-GOV. Nền tảng Chuyên viên Hành chính công AI Đa phương thức phục vụ Nhân dân.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
