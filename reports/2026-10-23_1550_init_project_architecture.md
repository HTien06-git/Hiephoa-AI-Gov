# BÁO CÁO PHIÊN THỰC HIỆN: KHỞI TẠO KIẾN TRÚC & HỆ THỐNG HIỆP HÒA AI-GOV
- **Mã phiên**: `2026-10-23_1550_init_project_architecture`
- **Thời gian**: 2026-10-23 15:52:00 (GMT+7)
- **Kỹ sư phụ trách**: Senior Full-Stack Architect & AI Engineer
- **Mục tiêu**: Xây dựng nền tảng Web App "HIỆP HÒA AI-GOV (Chuyên viên Hành chính công AI Đa phương thức)" phục vụ nhân dân xã Hiệp Hòa, tỉnh Tây Ninh.

---

## 1. Cấu trúc thư mục được khởi tạo
```
hiep-hoa-ai-gov/
├── backend/                        # Máy chủ API, AI RAG & Xử lý nghiệp vụ
│   ├── src/
│   │   ├── config/                 # Gemini API, Vector DB, CORS config
│   │   ├── controllers/            # ragController, ocrController, preCheckController, formController, procedureController
│   │   ├── services/
│   │   │   ├── geminiRagService.js # Lõi RAG AI + Guardrails + Bộ Checklist 4 mục
│   │   │   ├── visionOcrService.js # Quét CCCD OCR & Pre-check hồ sơ
│   │   │   └── vectorStore.js      # Kho ngữ liệu Luật & TTHC
│   │   ├── middlewares/            # Rate limiter, Zero-Data Retention sanitizer, Audit logger
│   │   ├── routes/                 # API endpoints
│   │   ├── data/
│   │   │   ├── local_info.json     # Thông tin UBND xã Hiệp Hòa & các ấp
│   │   │   ├── procedures_demo.json# 08 TTHC thuộc 05 nhóm danh mục
│   │   │   ├── legal_corpus.json   # Điều khoản Luật & giải thích bình dân
│   │   │   ├── form_schemas.json   # 05 Mẫu đơn & Kịch bản Giọng nói
│   │   │   └── templates/          # 05 file .docx mẫu
│   │   └── utils/
│   │       └── reportLogger.js     # Ghi log lịch sử hệ thống vào /reports/
│   ├── package.json
│   ├── .env.example
│   └── server.js
├── frontend/                       # Ứng dụng Web Đa nền tảng (React + TailwindCSS + Vite)
│   ├── public/
│   │   └── templates/              # 05 file .docx phục vụ điền đơn Client-side
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             # Header Quốc huy, Accessibility Bar (A / A+ / A++), Audio toggle
│   │   │   ├── voice/              # AutoVoiceOnboarding, VoiceMicButton 2 chiều
│   │   │   ├── categories/         # 5 Nhóm thủ tục nút lớn + Câu hỏi gợi ý chạm-đọc
│   │   │   ├── rag-chat/           # Khung chat RAG + Hiển thị Checklist 4 mục
│   │   │   ├── auto-form/          # Điền đơn giọng nói / Quét CCCD OCR / Form chữ to + Xuất 4 định dạng
│   │   │   ├── pre-check/          # Chụp ảnh kiểm tra sơ bộ hồ sơ (AI Document Pre-Check)
│   │   │   ├── qr-handoff/         # Mã QR hồ sơ tạm thời & Màn hình Quét QR Cán bộ Một cửa
│   │   │   └── dvc-guide/          # Deep-link Cổng DVC & Cẩm nang VNeID giọng đọc
│   │   ├── hooks/                  # useSpeechSynthesis, useSpeechRecognition, useFontScale, useZeroDataSession
│   │   ├── services/               # docxExportService, apiClient
│   │   ├── pages/                  # CitizenHomePage.jsx, OfficerScanPage.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
├── reports/                        # Lưu trữ lịch sử và kiểm thử dự án
│   ├── CHANGELOG.md
│   └── 2026-10-23_1550_init_project_architecture.md
└── README.md
```

## 2. Danh sách 05 Biểu mẫu được tích hợp
1. `mau_01_to_khai_dang_ky_khai_sinh.docx` - Tờ khai đăng ký khai sinh
2. `mau_02_to_khai_dang_ky_ket_hon.docx` - Tờ khai đăng ký kết hôn
3. `mau_03_to_khai_xac_nhan_tinh_trang_hon_nhan.docx` - Tờ khai xác nhận tình trạng hôn nhân
4. `mau_04_don_de_nghi_chung_thuc.docx` - Đơn đề nghị chứng thực
5. `mau_05_don_xin_xac_nhan_cu_tru_ho_ngheo.docx` - Đơn xin xác nhận cư trú / hoàn cảnh khó khăn

## 3. Ràng buộc bảo mật & Zero-Data Retention
- Thông tin định danh công dân (Họ tên, CCCD, ngày sinh, địa chỉ) được xử lý trực tiếp tại phía Client (Trình duyệt).
- Không lưu CCCD vào cơ sở dữ liệu vĩnh viễn. Bộ nhớ tạm thời bị hủy ngay khi xuất đơn hoặc khi kết thúc phiên.

---
*Báo cáo được khởi tạo tự động theo Quy tắc vận hành số 2 của Dự án.*
