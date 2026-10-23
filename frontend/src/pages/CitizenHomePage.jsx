import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import AccessibilityBar from '../components/layout/AccessibilityBar';
import AutoVoiceOnboarding from '../components/voice/AutoVoiceOnboarding';
import VoiceMicButton from '../components/voice/VoiceMicButton';
import CategoryGrid from '../components/categories/CategoryGrid';
import RagChatDrawer from '../components/rag-chat/RagChatDrawer';
import SmartAutoFormModal from '../components/auto-form/SmartAutoFormModal';
import DocumentPreCheckModal from '../components/pre-check/DocumentPreCheckModal';
import CitizenQrModal from '../components/qr-handoff/CitizenQrModal';
import DvcGuideSection from '../components/dvc-guide/DvcGuideSection';

import { useFontScale } from '../hooks/useFontScale';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useZeroDataSession } from '../hooks/useZeroDataSession';
import { apiClient } from '../services/apiClient';

// Import offline data
import proceduresData from '../data/procedures_demo.json';
import localInfoData from '../data/local_info.json';

export default function CitizenHomePage({ onSwitchToOfficer }) {
  const { scale, setScale } = useFontScale();
  const { isSpeaking, isAudioEnabled, speak, stop, toggleAudio } = useSpeechSynthesis();
  const { formData, updateFormData, clearSecurityData, hasData } = useZeroDataSession();

  // Modals & Drawers state
  const [categories, setCategories] = useState(proceduresData.categories || []);
  const [procedures, setProcedures] = useState(proceduresData.procedures || []);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [chatResult, setChatResult] = useState(null);
  const [autoFormProc, setAutoFormProc] = useState(null);
  const [autoFormMode, setAutoFormMode] = useState('data_input');
  const [preCheckProc, setPreCheckProc] = useState(null);
  const [qrPayload, setQrPayload] = useState(null);

  const handleOpenAutoForm = (proc, mode = 'data_input') => {
    setAutoFormMode(mode);
    setAutoFormProc(proc);
  };
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  // Handle Citizen Query (from Voice Mic or input box)
  const handleQuerySubmit = async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    setIsQueryLoading(true);
    speak('Dạ, tôi đã nhận được câu hỏi của bà con, xin chờ tôi tra cứu luật và thủ tục trong giây lát ạ!');

    try {
      const response = await apiClient.chatQuery(queryText);
      if (response && response.data) {
        setChatResult(response.data);
        if (response.data.voice_text) {
          speak(response.data.voice_text);
        }
      }
    } catch (err) {
      console.error('Query submit error:', err);
    } finally {
      setIsQueryLoading(false);
    }
  };

  // When a procedure is clicked from the list
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
    speak(proc.voice_answer);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between overflow-x-hidden max-w-full">
      <div>
        {/* Header */}
        <Header currentMode="citizen" setCurrentMode={(m) => m === 'officer' && onSwitchToOfficer()} />

        {/* Fixed Accessibility Bar */}
        <AccessibilityBar
          fontScale={scale}
          setFontScale={setScale}
          isAudioEnabled={isAudioEnabled}
          toggleAudio={toggleAudio}
          clearSecurityData={clearSecurityData}
          hasData={hasData}
        />

        {/* Main Content Container */}
        <main className="max-w-7xl mx-auto px-4 py-4 md:py-6 overflow-x-hidden">
          
          {/* Auto Voice Onboarding Greeting */}
          <AutoVoiceOnboarding
            speak={speak}
            stop={stop}
            isAudioEnabled={isAudioEnabled}
          />

          {/* Central Voice Mic Button (Chạm & Nói 2 Chiều) */}
          <VoiceMicButton
            onQuerySubmit={handleQuerySubmit}
            isSpeaking={isSpeaking}
            stopSpeaking={stop}
          />

          {/* 5 Categories & 8 Procedures Grid */}
          <CategoryGrid
            categories={categories}
            procedures={procedures}
            onSelectProcedure={handleSelectProcedure}
            onOpenAutoForm={(proc, mode) => {
              setChatResult(null);
              handleOpenAutoForm(proc, mode);
            }}
            onOpenPreCheck={(proc) => {
              setChatResult(null);
              setPreCheckProc(proc);
            }}
            speakText={speak}
          />

          {/* DVC Portals & VNeID Handbook */}
          <DvcGuideSection speakText={speak} />

        </main>
      </div>

      {/* RAG Chat & Checklist Drawer */}
      {chatResult && (
        <RagChatDrawer
          chatResult={chatResult}
          onClose={() => setChatResult(null)}
          speakText={speak}
          stopSpeaking={stop}
          onOpenAutoForm={(proc, mode) => {
            setChatResult(null);
            handleOpenAutoForm(proc, mode);
          }}
          onOpenPreCheck={(proc) => setPreCheckProc(proc)}
        />
      )}

      {/* Smart Auto-Form Modal (Voice Wizard, OCR, Big Form, 4 Exports) */}
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

      {/* Document Pre-Check Modal (AI Document Pre-Check) */}
      {preCheckProc && (
        <DocumentPreCheckModal
          procedure={preCheckProc}
          onClose={() => setPreCheckProc(null)}
          speakText={speak}
          stopSpeaking={stop}
        />
      )}

      {/* Quick Citizen QR Code Modal */}
      {qrPayload && (
        <CitizenQrModal
          qrPayload={qrPayload}
          onClose={() => setQrPayload(null)}
          speakText={speak}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-10 px-4 border-t-4 border-gov-gold mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-amber-400 font-extrabold text-lg uppercase mb-2">
              Ủy ban nhân dân xã Hiệp Hòa
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trung tâm Phục vụ Hành chính công xã Hiệp Hòa, tỉnh Tây Ninh.
              Địa chỉ: Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh.
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Thời gian làm việc: Sáng 7h00 - 11h30, Chiều 13h30 - 17h00 (Thứ 2 đến Thứ 6).
            </p>
          </div>

          <div>
            <div className="text-amber-400 font-extrabold text-lg uppercase mb-2">
              Đường dây nóng hỗ trợ bà con
            </div>
            <p className="text-base font-bold text-white">
              Tổng đài tư vấn: <span className="text-gov-gold">1900 9095</span>
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Bộ phận Một cửa xã: 0276.3888.xxx
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Công an xã Hiệp Hòa (Cư trú & VNeID): 0276.3888.yyy
            </p>
          </div>

          <div>
            <div className="text-amber-400 font-extrabold text-lg uppercase mb-2">
              Bảo mật & Trợ năng cao tuổi
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-emerald-400">✓ Chuẩn Zero-Data Retention:</div>
              <div>Thông tin cá nhân trên đơn từ được xử lý cục bộ trên điện thoại của bà con và tự động xóa sạch khi kết thúc phiên.</div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              © 2026 HIỆP HÒA AI-GOV. Dự án tham gia Hội thi Đổi mới Sáng tạo & Chuyển đổi số.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
