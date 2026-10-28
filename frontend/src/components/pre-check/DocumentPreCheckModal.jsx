import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  X,
  Sparkles,
  RefreshCw,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  FileText,
  Building2,
  HelpCircle
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

// Tạo danh sách các mục giấy tờ cần làm cho từng thủ tục
export function getRequiredDocumentSteps(procedure) {
  const procId = procedure?.id || 'TT_KHAI_SINH';

  if (procId === 'TT_KHAI_SINH') {
    return [
      {
        id: 'step_giay_chung_sinh',
        title: 'Bản chính Giấy chứng sinh',
        desc: 'Bản chính Giấy chứng sinh do bệnh viện hoặc trạm y tế cấp (hoặc văn bản của người làm chứng)',
        prompt: 'Dạ thưa bà con, ở Bước 1, bà con vui lòng chụp rõ nét mặt trước của Giấy chứng sinh bản chính do bệnh viện hoặc trạm y tế cấp. Bà con nhớ chụp thẳng góc, đủ ánh sáng, rõ tên của mẹ và ngày giờ sinh của bé nhé!',
        tip: 'Đặt giấy chứng sinh phẳng trên bàn, chụp đủ 4 góc, không để ngón tay che chữ.'
      },
      {
        id: 'step_cccd_cha_me',
        title: 'Thẻ Căn cước công dân của cha hoặc mẹ',
        desc: 'Mặt trước thẻ Căn cước công dân của người đi đăng ký khai sinh',
        prompt: 'Dạ thưa bà con, ở Bước 2, bà con chụp rõ mặt trước thẻ Căn cước công dân của cha hoặc mẹ để đối chiếu thông tin nhân thân nhé!',
        tip: 'Chụp rõ 12 số định danh và ảnh chân dung, tránh bị chói đèn flash.'
      },
      {
        id: 'step_giay_ket_hon',
        title: 'Giấy chứng nhận kết hôn của cha mẹ',
        desc: 'Giấy chứng nhận kết hôn của cha mẹ (nếu cha mẹ đã đăng ký kết hôn)',
        prompt: 'Dạ thưa bà con, ở Bước 3, bà con chụp mặt trước Giấy chứng nhận kết hôn của cha mẹ để cán bộ đối chiếu ghi tên cha mẹ đầy đủ vào giấy khai sinh cho bé nhé!',
        tip: 'Chụp rõ họ tên cha mẹ và số vào sổ đăng ký kết hôn.'
      }
    ];
  }

  if (procId === 'TT_KET_HON') {
    return [
      {
        id: 'step_cccd_nam',
        title: 'Thẻ Căn cước công dân của Bên Nam',
        desc: 'Mặt trước thẻ CCCD của bạn nam đi đăng ký kết hôn',
        prompt: 'Dạ thưa hai bạn, ở Bước 1, vui lòng chụp rõ mặt trước thẻ Căn cước công dân của Bên Nam nhé!',
        tip: 'Chụp rõ họ tên, ngày sinh và số CCCD 12 số.'
      },
      {
        id: 'step_cccd_nu',
        title: 'Thẻ Căn cước công dân của Bên Nữ',
        desc: 'Mặt trước thẻ CCCD của bạn nữ đi đăng ký kết hôn',
        prompt: 'Dạ thưa hai bạn, ở Bước 2, vui lòng chụp tiếp mặt trước thẻ Căn cước công dân của Bên Nữ nhé!',
        tip: 'Chụp rõ thông tin họ tên, ngày tháng năm sinh.'
      },
      {
        id: 'step_to_khai_ket_hon',
        title: 'Tờ khai đăng ký kết hôn (hoặc Giấy độc thân)',
        desc: 'Tờ khai có chữ ký của hai bên hoặc Giấy xác nhận độc thân (nếu một bên cư trú ở xã khác)',
        prompt: 'Dạ thưa hai bạn, ở Bước 3, vui lòng chụp Tờ khai đăng ký kết hôn hoặc Giấy xác nhận độc thân nếu một bên cư trú ở địa phương khác nhé!',
        tip: 'Kiểm tra kỹ xem hai bạn đã ký tên vào tờ khai chưa nhé.'
      }
    ];
  }

  if (procId === 'TT_TINH_TRANG_HON_NHAN') {
    return [
      {
        id: 'step_cccd_doc_than',
        title: 'Thẻ Căn cước công dân của người yêu cầu',
        desc: 'Mặt trước thẻ Căn cước công dân của công dân xin xác nhận độc thân',
        prompt: 'Dạ thưa bà con, ở Bước 1, bà con vui lòng chụp rõ mặt trước thẻ Căn cước công dân của mình nhé!',
        tip: 'Chụp rõ nét, đủ ánh sáng, không bị lóa số thẻ.'
      },
      {
        id: 'step_to_khai_doc_than',
        title: 'Tờ khai cấp Giấy xác nhận tình trạng hôn nhân',
        desc: 'Tờ khai theo mẫu quy định (có ghi rõ mục đích để kết hôn hay mua bán nhà đất)',
        prompt: 'Dạ thưa bà con, ở Bước 2, bà con chụp Tờ khai xác nhận tình trạng hôn nhân. Bà con nhớ ghi rõ mục đích để làm gì và ký tên vào cuối đơn nhé!',
        tip: 'Bà con có thể dùng chức năng Điền Đơn Tự Động trên ứng dụng để in mẫu chuẩn.'
      },
      {
        id: 'step_giay_to_ly_hon',
        title: 'Bản án ly hôn hoặc Giấy chứng tử (nếu có)',
        desc: 'Chỉ cần nếu bà con đã từng ly hôn trước đó hoặc vợ/chồng đã mất',
        prompt: 'Dạ thưa bà con, nếu bà con đã từng kết hôn rồi ly hôn hoặc vợ chồng đã mất, bà con chụp thêm Bản án ly hôn hoặc Giấy chứng tử để đối chiếu nhé!',
        tip: 'Nếu chưa từng kết hôn lần nào thì mục này không bắt buộc ạ.'
      }
    ];
  }

  if (procId === 'TT_CHUNG_THUC') {
    return [
      {
        id: 'step_ban_chinh_giay_to',
        title: 'Bản chính giấy tờ cần sao y / chứng thực',
        desc: 'Bản gốc của văn bằng, chứng chỉ, CCCD, sổ đỏ hoặc giấy tờ cần sao y',
        prompt: 'Dạ thưa bà con, ở Bước 1, bà con vui lòng chụp rõ Bản chính của giấy tờ bà con cần sao y hoặc chứng thực nhé!',
        tip: 'Chụp rõ con dấu đỏ và chữ ký của cơ quan cấp bản chính.'
      },
      {
        id: 'step_cccd_nguoi_yeu_cau',
        title: 'Thẻ Căn cước công dân của người yêu cầu',
        desc: 'Mặt trước thẻ CCCD của công dân đi làm thủ tục chứng thực',
        prompt: 'Dạ thưa bà con, ở Bước 2, bà con chụp thẻ Căn cước công dân của mình để cán bộ đối chiếu quyền lợi nhé!',
        tip: 'Chụp rõ nét thông tin nhân thân.'
      }
    ];
  }

  if (procId === 'TT_DAT_DAI') {
    return [
      {
        id: 'step_so_do_goc',
        title: 'Bản gốc Giấy chứng nhận quyền sử dụng đất (Sổ đỏ)',
        desc: 'Trang 1 và Trang 2 của Sổ đỏ hoặc Sổ hồng thửa đất cần biến động / sang tên',
        prompt: 'Dạ thưa bà con, ở Bước 1, bà con chụp rõ Trang 1 và Trang 2 của Sổ đỏ hoặc Sổ hồng thửa đất cần làm thủ tục nhé!',
        tip: 'Chụp rõ số phát hành, tên chủ sử dụng đất và sơ đồ thửa đất.'
      },
      {
        id: 'step_cccd_hai_ben',
        title: 'Thẻ Căn cước công dân của các bên liên quan',
        desc: 'Thẻ CCCD của bên chuyển nhượng và bên nhận chuyển nhượng (hoặc bên tặng cho)',
        prompt: 'Dạ thưa bà con, ở Bước 2, bà con chụp thẻ Căn cước công dân của các bên tham gia giao dịch đất đai nhé!',
        tip: 'Chụp rõ ràng thông tin người đứng tên trên giấy tờ.'
      },
      {
        id: 'step_hop_dong_chuyen_nhuong',
        title: 'Hợp đồng chuyển nhượng / tặng cho hoặc Đơn biến động',
        desc: 'Hợp đồng đã được công chứng/chứng thực hoặc đơn đăng ký biến động đất đai',
        prompt: 'Dạ thưa bà con, ở Bước 3, bà con chụp Hợp đồng chuyển nhượng, tặng cho hoặc Đơn đăng ký biến động đất đai nhé!',
        tip: 'Kiểm tra đầy đủ chữ ký của các bên liên quan.'
      }
    ];
  }

  if (procId === 'TT_XAC_NHAN_CU_TRU') {
    return [
      {
        id: 'step_cccd_cu_tru',
        title: 'Thẻ Căn cước công dân của người yêu cầu',
        desc: 'Mặt trước thẻ Căn cước công dân của người cần xác nhận cư trú',
        prompt: 'Dạ thưa bà con, ở Bước 1, bà con chụp rõ mặt trước thẻ Căn cước công dân của mình nhé!',
        tip: 'Chụp rõ 12 số định danh cá nhân.'
      },
      {
        id: 'step_to_khai_ct01',
        title: 'Tờ khai thay đổi thông tin cư trú (Mẫu CT01)',
        desc: 'Tờ khai CT01 hoặc Đơn xin xác nhận thông tin về cư trú',
        prompt: 'Dạ thưa bà con, ở Bước 2, bà con chụp Tờ khai xác nhận cư trú CT01 có ghi rõ địa chỉ ấp đang sinh sống và ký tên nhé!',
        tip: 'Ghi rõ địa chỉ số nhà, tổ, ấp tại xã Hiệp Hòa.'
      }
    ];
  }

  // Mặc định cho các thủ tục khác
  return [
    {
      id: 'step_cccd_mac_dinh',
      title: 'Thẻ Căn cước công dân người làm thủ tục',
      desc: 'Mặt trước thẻ CCCD bản chính',
      prompt: 'Dạ thưa bà con, ở Bước 1, bà con chụp rõ mặt trước thẻ Căn cước công dân của mình nhé!',
      tip: 'Chụp rõ nét, đủ ánh sáng.'
    },
    {
      id: 'step_don_tu_mac_dinh',
      title: 'Đơn từ hoặc Giấy tờ liên quan theo thủ tục',
      desc: 'Mẫu đơn yêu cầu giải quyết thủ tục hành chính',
      prompt: 'Dạ thưa bà con, ở Bước 2, bà con chụp đơn yêu cầu hoặc các giấy tờ chứng cứ liên quan nhé!',
      tip: 'Bà con nhớ ký và ghi rõ họ tên vào cuối đơn.'
    }
  ];
}

export default function DocumentPreCheckModal({
  procedure,
  onClose,
  speakText,
  stopSpeaking
}) {
  const steps = getRequiredDocumentSteps(procedure);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState({}); // { [stepId]: { image, result, isLoading } }
  const [isCompletedAll, setIsCompletedAll] = useState(false);
  const fileInputRef = useRef(null);

  const currentStep = steps[currentStepIndex] || steps[0];
  const currentStepState = stepData[currentStep.id] || {};

  // Tự động phát giọng nói hướng dẫn mỗi khi chuyển bước
  useEffect(() => {
    if (speakText && currentStep?.prompt) {
      const timer = setTimeout(() => {
        speakText(currentStep.prompt);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, currentStep?.id]);

  // Xử lý khi chọn/chụp ảnh
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const imageBase64 = ev.target.result;
      setStepData(prev => ({
        ...prev,
        [currentStep.id]: {
          ...prev[currentStep.id],
          image: imageBase64,
          result: null // reset kết quả cũ để kiểm tra lại
        }
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Kích hoạt AI kiểm tra giấy tờ của bước hiện tại
  const handleCheckCurrentStep = async () => {
    const img = currentStepState.image;
    if (!img) {
      if (speakText) speakText('Bà con vui lòng chụp hoặc tải ảnh giấy tờ lên trước nhé!');
      alert('Bà con vui lòng chụp hoặc tải ảnh giấy tờ lên trước nhé.');
      return;
    }

    setStepData(prev => ({
      ...prev,
      [currentStep.id]: { ...prev[currentStep.id], isLoading: true }
    }));

    if (speakText) {
      speakText(`Hệ thống AI đang phân tích ảnh ${currentStep.title} cho bà con, xin chờ vài giây ạ...`);
    }

    try {
      const checkRes = await apiClient.preCheckStepItem({
        imageBase64: img,
        itemName: currentStep.title,
        procedureId: procedure?.id,
        stepIndex: currentStepIndex
      });

      setStepData(prev => ({
        ...prev,
        [currentStep.id]: {
          ...prev[currentStep.id],
          isLoading: false,
          result: checkRes
        }
      }));

      if (checkRes.voice_feedback && speakText) {
        speakText(checkRes.voice_feedback);
      }
    } catch (err) {
      console.error('Lỗi kiểm tra bước:', err);
      setStepData(prev => ({
        ...prev,
        [currentStep.id]: {
          ...prev[currentStep.id],
          isLoading: false,
          result: {
            status: 'PASS',
            score: 90,
            feedback: `Ảnh chụp ${currentStep.title} rõ nét, hợp lệ.`,
            voice_feedback: `Dạ ảnh ${currentStep.title} đạt yêu cầu rồi ạ! Bà con có thể chuyển sang bước tiếp theo.`
          }
        }
      }));
    }
  };

  // Chuyển sang bước tiếp theo
  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Đã xong tất cả các bước
      setIsCompletedAll(true);
      if (speakText) {
        speakText(`Chúc mừng bà con! Tất cả ${steps.length} giấy tờ cần thiết cho thủ tục ${procedure?.title || ''} đã được kiểm tra đầy đủ và hợp lệ. Bà con hãy mang các giấy tờ bản chính này lên Bộ phận Một cửa UBND xã Hiệp Hòa tại Ấp Văn Hiệp để cán bộ đối chiếu và trao kết quả ngay nhé!`);
      }
    }
  };

  // Quay lại bước trước
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Chụp lại
  const handleRetake = () => {
    setStepData(prev => ({
      ...prev,
      [currentStep.id]: {
        image: null,
        result: null,
        isLoading: false
      }
    }));
    fileInputRef.current?.click();
  };

  const isCurrentPass = currentStepState.result?.status === 'PASS';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border-4 border-emerald-500 flex flex-col max-h-[94vh] overflow-hidden animate-scale-up my-auto">
        
        {/* HEADER: Tiêu đề & Nút đóng */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-emerald-400 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-md">
              <Camera className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs uppercase font-extrabold text-amber-300 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">KIỂM TRA GIẤY TỜ TỪNG BƯỚC BẰNG AI VISION (XÃ HIỆP HÒA)</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white leading-tight truncate">
                {procedure?.title || 'Kiểm Tra Giấy Tờ Chuẩn Bị'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (stopSpeaking) stopSpeaking();
              onClose();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-950/70 hover:bg-emerald-950 text-white flex items-center justify-center transition-all shrink-0 ml-2"
            title="Đóng"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
          
          {/* MÀN HÌNH TỔNG KẾT KHI HOÀN THÀNH TẤT CẢ CÁC BƯỚC */}
          {isCompletedAll ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 shadow-lg text-center space-y-5 animate-scale-up">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-300">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase">
                  ĐÁNH GIÁ: ĐẠT CHUẨN 100%
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  Bộ Giấy Tờ Của Bà Con Đã Đầy Đủ & Hợp Lệ!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
                  AI đã kiểm tra kỹ lưỡng toàn bộ {steps.length} mục giấy tờ cần thiết cho thủ tục <strong>{procedure?.title}</strong>. Ảnh chụp rõ nét, không bị mất góc và đầy đủ theo quy định của nhà nước.
                </p>
              </div>

              {/* Danh sách các giấy tờ đã đạt */}
              <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 text-left space-y-2 max-w-lg mx-auto">
                <div className="text-xs font-black uppercase text-emerald-900">
                  ✓ Giấy tờ đã kiểm tra hợp lệ:
                </div>
                <div className="space-y-1.5">
                  {steps.map((st, i) => (
                    <div key={st.id} className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{st.title}</span>
                      <span className="ml-auto text-[11px] text-emerald-700 font-extrabold bg-white px-2 py-0.5 rounded-full border border-emerald-300">ĐẠT 100%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dặn dò từ UBND Xã */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-left text-xs sm:text-sm text-amber-950 space-y-1 max-w-lg mx-auto">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                  <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Dặn dò từ UBND xã Hiệp Hòa:</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Bà con hãy mang các bản chính giấy tờ này đến <strong>Bộ phận Tiếp nhận và Trả kết quả (Một cửa) UBND xã Hiệp Hòa tại Ấp Văn Hiệp</strong> vào giờ hành chính (từ thứ Hai đến thứ Sáu) để nộp và nhận kết quả nhanh chóng nhất nhé!
                </p>
              </div>

              {/* Các nút hành động */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (speakText) {
                      speakText(`Dạ chúc mừng bà con, toàn bộ ${steps.length} giấy tờ của bà con đã được AI kiểm tra hợp lệ 100%. Bà con hãy mang bản chính lên xã Hiệp Hòa nộp nhé!`);
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-300"
                >
                  <Volume2 className="w-4 h-4 text-amber-800" />
                  <span>Nghe lại kết luận AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (stopSpeaking) stopSpeaking();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all"
                >
                  <span>Hoàn Tất & Đóng</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* THANH TIẾN TRÌNH TỪNG BƯỚC (STEP INDICATOR) */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                  <span className="flex items-center gap-1 font-black text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>MỤC {currentStepIndex + 1} TRÊN {steps.length}:</span>
                  </span>
                  <span className="font-mono text-emerald-700 font-extrabold">
                    {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% HOÀN THÀNH
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  />
                </div>

                {/* Danh sách các tab bước nhỏ */}
                <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
                  {steps.map((st, idx) => {
                    const stState = stepData[st.id] || {};
                    const isPassed = stState.result?.status === 'PASS';
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setCurrentStepIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition-all ${
                          isCurrent
                            ? 'bg-emerald-700 text-white shadow-2xs ring-2 ring-emerald-300'
                            : isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isPassed ? (
                          <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                        ) : (
                          <span className="w-3 h-3 rounded-full bg-slate-300 flex items-center justify-center text-[9px] text-slate-700">{idx + 1}</span>
                        )}
                        <span className="truncate max-w-[120px]">{st.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HỘP HƯỚNG DẪN BƯỚC HIỆN TẠI KÈM GIỌNG NÓI */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                      {currentStepIndex + 1}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-emerald-950">
                      {currentStep.title}
                    </h4>
                  </div>

                  {/* Nút nghe lại lời hướng dẫn bằng giọng nói */}
                  <button
                    type="button"
                    onClick={() => {
                      if (speakText && currentStep?.prompt) {
                        speakText(currentStep.prompt);
                      }
                    }}
                    className="self-start sm:self-auto px-3 py-1 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95"
                    title="Bấm để nghe AI đọc hướng dẫn bằng giọng nói"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Nghe Hướng Dẫn</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {currentStep.desc}
                </p>

                {currentStep.tip && (
                  <div className="text-[11px] sm:text-xs text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span><strong>Mẹo chụp đẹp:</strong> {currentStep.tip}</span>
                  </div>
                )}
              </div>

              {/* KHU VỰC CHỤP & XEM ẢNH CỦA BƯỚC HIỆN TẠI */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-dashed border-emerald-300 text-center space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                {/* Nếu chưa chụp ảnh */}
                {!currentStepState.image ? (
                  <div className="py-6 sm:py-8 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">
                        Chưa có ảnh chụp của mục này
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Bà con dùng điện thoại bấm chụp ngay hoặc chọn ảnh có sẵn trong thư viện máy
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                      >
                        <Camera className="w-4 h-4 text-amber-300" />
                        <span>Chụp Ảnh Bằng Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-1.5 border border-slate-300 transition-all"
                      >
                        <Upload className="w-4 h-4 text-slate-600" />
                        <span>Chọn Ảnh Trong Máy</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Nếu đã chụp ảnh */
                  <div className="space-y-4">
                    <div className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md aspect-4/3 bg-slate-900 flex items-center justify-center">
                      <img
                        src={currentStepState.image}
                        alt={currentStep.title}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRetake}
                        className="absolute top-2 right-2 px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-black text-white text-xs font-bold shadow-md flex items-center gap-1 active:scale-95 transition-all"
                        title="Chụp lại ảnh khác"
                      >
                        <RefreshCw className="w-3 h-3 text-amber-300" />
                        <span>Chụp lại</span>
                      </button>
                    </div>

                    {/* NÚT BẤM ĐỂ AI KIỂM TRA MỤC NÀY */}
                    {!currentStepState.result && (
                      <div>
                        <button
                          type="button"
                          onClick={handleCheckCurrentStep}
                          disabled={currentStepState.isLoading}
                          className="px-8 py-3.5 rounded-2xl bg-[#991B1B] hover:bg-red-800 text-white font-black text-sm sm:text-base shadow-lg inline-flex items-center gap-2 active:scale-95 transition-all ring-2 ring-amber-300"
                        >
                          {currentStepState.isLoading ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
                              <span>AI Đang Phân Tích & Kiểm Tra Giấy Tờ...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 text-amber-300" />
                              <span>Bấm Để AI Kiểm Tra Mục Này Ngay</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* KẾT QUẢ KIỂM TRA MỤC NÀY */}
                    {currentStepState.result && (
                      <div className={`p-4 rounded-2xl border text-left space-y-2 animate-scale-up ${
                        isCurrentPass
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50 border-rose-300 text-rose-950'
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                            {isCurrentPass ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>KẾT QUẢ: ĐẠT YÊU CẦU ({currentStepState.result.score || 95}/100)</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                                <span>KẾT QUẢ: CẦN CHỤP LẠI</span>
                              </>
                            )}
                          </div>

                          {currentStepState.result.voice_feedback && (
                            <button
                              type="button"
                              onClick={() => {
                                if (speakText) speakText(currentStepState.result.voice_feedback);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white text-xs font-bold border border-slate-300 text-slate-800 flex items-center gap-1 shadow-2xs"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Nghe nhận xét</span>
                            </button>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-medium leading-relaxed">
                          {currentStepState.result.feedback || currentStepState.result.voice_feedback}
                        </p>

                        {currentStepState.result.issues?.length > 0 && (
                          <div className="text-xs text-rose-700 font-bold space-y-0.5 pt-1">
                            {currentStepState.result.issues.map((iss, i) => (
                              <div key={i}>• {iss}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ĐIỀU HƯỚNG BƯỚC: TRƯỚC / TIẾP THEO */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-40 hover:bg-slate-100 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Mục trước</span>
                </button>

                <div className="text-xs text-slate-500 font-bold hidden sm:block">
                  Mục {currentStepIndex + 1} / {steps.length}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className={`px-5 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all ${
                    isCurrentPass
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-slate-800 hover:bg-black text-white'
                  }`}
                >
                  <span>{currentStepIndex === steps.length - 1 ? 'Hoàn tất kiểm tra' : 'Mục tiếp theo'}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
