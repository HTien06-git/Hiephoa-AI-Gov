import React, { useState, useEffect } from 'react';
import { ChevronRight, FileCheck, Smartphone } from 'lucide-react';
import Header from '../components/layout/Header';
import AccessibilityBar from '../components/layout/AccessibilityBar';
import HeroVoiceStation from '../components/voice/HeroVoiceStation';
import CategoryGrid from '../components/categories/CategoryGrid';
import DvcGuideSection from '../components/dvc-guide/DvcGuideSection';
import RagChatDrawer from '../components/rag-chat/RagChatDrawer';
import SmartAutoFormModal from '../components/auto-form/SmartAutoFormModal';
import DocumentPreCheckModal from '../components/pre-check/DocumentPreCheckModal';
import CitizenQrModal from '../components/qr-handoff/CitizenQrModal';
import CitizenLookupModal, { getDeviceSubmissions } from '../components/qr-handoff/CitizenLookupModal';
import QuickActionFloatingDock from '../components/layout/QuickActionFloatingDock';
import CitizenDeviceNotificationToast from '../components/layout/CitizenDeviceNotificationToast';
import TrongDongMasterpiece from '../components/common/TrongDongMasterpiece';
import DongSonBorder from '../components/common/DongSonBorder';

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
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [deviceSubmissionsCount, setDeviceSubmissionsCount] = useState(0);

  // Theo dõi số lượng hồ sơ đã nộp trên thiết bị này
  useEffect(() => {
    const updateCount = () => {
      const list = getDeviceSubmissions();
      setDeviceSubmissionsCount(list.length);
    };
    updateCount();
    const interval = setInterval(updateCount, 3000);
    return () => clearInterval(interval);
  }, [qrPayload, isLookupOpen]);

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
      {/* Nền Trống Đồng Masterpiece V7 - opacity cao hơn, rõ nét hơn */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="w-[850px] h-[850px] lg:w-[1050px] lg:h-[1050px]">
          <TrongDongMasterpiece size={1050} color="#D97706" accentColor="#B45309" opacity={0.055} spin={true} spinDuration={240} />
        </div>
      </div>

      <div className="relative z-10">
        {/* Header chuẩn Cổng Dịch vụ công Chính phủ với Trống Đồng Masterpiece V7 */}
        <Header currentMode="citizen" setCurrentMode={(m) => m === 'officer' && onSwitchToOfficer()} />
        {/* Đường diềm Đông Sơn bên dưới footer phìến truy cập */}

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
          
          {/* BANNER THÔNG BÁO HỒ SƠ ĐÃ NỘP TRÊN THIẾT BỊ NÀY */}
          {deviceSubmissionsCount > 0 && (
            <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-red-50 border-2 border-amber-400 shadow-md flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 sm:gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#991B1B] text-amber-300 flex items-center justify-center shrink-0 font-black shadow-xs ring-2 ring-amber-300">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-slate-900 whitespace-nowrap">
                      Hồ sơ trên thiết bị này
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-700 text-amber-300 text-[10px] sm:text-xs font-black whitespace-nowrap shrink-0">
                      {deviceSubmissionsCount} hồ sơ
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-600 mt-0.5 line-clamp-1 sm:line-clamp-2">
                    Bà con có thể xem ngay tiến độ đã giải quyết chưa, hoặc mở lại mã QR.
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end xs:justify-start shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setLookupInitialQuery('');
                    setIsLookupOpen(true);
                  }}
                  className="w-full xs:w-auto px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-black text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>Xem hồ sơ</span>
                  <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* KHU VỰC 1: TRUNG TÂM TƯ VẤN GIỌNG NÓI & HỎI ĐÁP PHÁP LUẬT AI 24/7 (Hero Voice Station) */}
          <HeroVoiceStation
            onQuerySubmit={handleQuerySubmit}
            isSpeaking={isSpeaking}
            stopSpeaking={stop}
            speak={speak}
            isAudioEnabled={isAudioEnabled}
            isQueryLoading={isQueryLoading}
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

      {/* Loading Modal phản hồi tức thì khi người dân đặt câu hỏi */}
      {isQueryLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-2 border-amber-400 flex flex-col items-center text-center">
            <div className="w-12 h-12 border-4 border-[#991B1B] border-t-amber-400 rounded-full animate-spin mb-3.5" />
            <h3 className="text-base font-black text-slate-900 mb-1">
              Chuyên viên AI đang tra cứu...
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Hệ thống đang đối chiếu dữ liệu UBND xã Hiệp Hòa &amp; Thư Viện Pháp Luật
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* THANH NÚT CHỨC NĂNG NHANH CỐ ĐỊNH PHÍA DƯỚI MÀN HÌNH     */}
      {/* Ẩn hoàn toàn khi đang mở phần trả kết quả hoặc modal     */}
      {/* ======================================================== */}
      {!chatResult && !autoFormProc && !preCheckProc && !qrPayload && !isLookupOpen && (
        <QuickActionFloatingDock
          onActivateMic={handleActivateMic}
          onOpenLookup={() => {
            setLookupInitialQuery('');
            setIsLookupOpen(true);
          }}
          onScrollToProcedures={handleScrollToProcedures}
          onOpenPreCheck={handleOpenPreCheckDefault}
          onScrollToTop={handleScrollToTop}
          deviceCount={deviceSubmissionsCount}
        />
      )}

      {/* ======================================================== */}
      {/* FOOTER CHÍNH QUYỀN XÃ HIỆP HÒA (ĐỎ HOÀNG GIA - VÀNG ĐỒNG) */}
      {/* Không dùng màu đen, hoa văn Trống Đồng, chữ không bị nhảy dòng */}
      {/* ======================================================== */}
      {/* ĐƯỜNG DIỀM ĐÔNG SƠN TRƯỚC FOOTER */}
      <DongSonBorder />

      <footer className="bg-gradient-to-br from-[#690F12] via-[#851417] to-[#550A0C] text-amber-50/95 py-10 px-4 sm:px-6 border-t-2 border-amber-500/80 relative mt-0 overflow-hidden shadow-2xl z-10">
        {/* Đường diềm Đông Sơn vàng kim */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700" />
        
        {/* Họa tiết Trống Đồng Masterpiece V7 chìm góc Footer - rõ nét hơn */}
        <div className="absolute -right-16 -bottom-16 w-72 h-72 pointer-events-none">
          <TrongDongMasterpiece size={288} color="#FBBF24" accentColor="#F59E0B" opacity={0.15} />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 relative z-10">
          {/* Cột 1: Đơn vị hành chính (Chiếm 5/12 cột để tiêu đề nằm trọn 1 dòng) */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="text-amber-300 font-black text-xs sm:text-sm lg:text-[15px] uppercase tracking-normal sm:tracking-tight md:tracking-wide leading-tight whitespace-nowrap">
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

          {/* Cột 2: Đường dây nóng Dịch vụ công (Chiếm 3/12 cột) */}
          <div className="md:col-span-3 space-y-2.5">
            <div className="text-amber-300 font-extrabold text-xs sm:text-sm lg:text-[15px] uppercase tracking-wider leading-tight whitespace-nowrap">
              Đường Dây Nóng Hỗ Trợ
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <p className="text-white flex items-center gap-1.5 flex-wrap">
                <span>📞</span>
                <strong>Tổng đài DVC:</strong>{' '}
                <a href="tel:18001096" className="text-amber-300 font-extrabold hover:underline text-sm sm:text-base">1800 1096</a>
              </p>
              <p className="text-amber-100/80 text-xs leading-relaxed">
                Tiếp nhận phản ánh, kiến nghị và hướng dẫn thủ tục hành chính công 24/7.
              </p>
            </div>
          </div>

          {/* Cột 3: Bảo mật & Bản quyền (Chiếm 4/12 cột) */}
          <div className="md:col-span-4 space-y-2.5">
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
