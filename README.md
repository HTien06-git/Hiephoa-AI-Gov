# HIỆP HÒA AI-GOV
## CHUYÊN VIÊN HÀNH CHÍNH CÔNG AI ĐA PHƯƠNG THỨC
**Đơn vị:** Trung tâm Phục vụ Hành chính công UBND xã Hiệp Hòa, tỉnh Tây Ninh  
**Mục tiêu:** Nền tảng tư vấn pháp luật, hướng dẫn thủ tục bằng giọng nói và tự động hóa hồ sơ hành chính công phục vụ nhân dân xã Hiệp Hòa, tỉnh Tây Ninh.

---

## 🌟 ĐẶC ĐIỂM NỔI BẬT & TRIẾT LÝ THIẾT KẾ
1. **Triết lý Elder-Friendly & Voice-First UI (Thân thiện tối đa với Người cao tuổi & Nông dân)**:
   - Giao diện phông chữ lớn, độ tương phản cao với nhận diện hành chính: Đỏ đô (`#B91C1C`) – Vàng kim (`#F59E0B`) – Xanh dương dịch vụ công (`#1D4ED8`).
   - Thanh điều khiển trợ năng (Accessibility Bar) tức thì: **Chữ vừa (A - 18px)** | **Chữ to (A+ - 22px)** | **Chữ siêu to (A++ - 26px)**.
   - Nút bật/tắt Loa phát thanh tự động đọc to mọi nội dung hướng dẫn.
   - Tự động phát lời chào thân thiện khi công dân quét mã QR hoặc truy cập trang web.
   - Nút Micro lớn ở trung tâm cho phép **Chạm & Nói 2 chiều tiếng Việt** (`vi-VN`).

2. **Bảo mật tuyệt đối — Chuẩn Zero-Data Retention & Client-Side Processing**:
   - Dữ liệu định danh cá nhân nhạy cảm của người dân (Họ tên, CCCD, ngày sinh, nơi thường trú) khi điền vào biểu mẫu được xử lý **100% cục bộ trên trình duyệt** (Client-side) thông qua `Docxtemplater` và `PizZip`.
   - Bộ nhớ tạm (`sessionStorage`) tự động giải phóng sạch sẽ khi người dân tải file hoặc tắt trình duyệt.
   - Không lưu trữ trái phép dữ liệu công dân lên máy chủ đám mây công cộng.

---

## 🏛️ 06 PHÂN HỆ NGHIỆP VỤ HOÀN CHỈNH
1. **Phân hệ 1 (Elder-Friendly & Voice-First UI)**:
   - 05 Nhóm thủ tục lớn trên trang chủ.
   - Chạm vào bất kỳ câu hỏi gợi ý nào, Chuyên viên AI tự động đọc to cả câu hỏi lẫn câu trả lời.
2. **Phân hệ 2 (Strict-Domain RAG AI & Bộ Checklist 4 Mục)**:
   - Tích hợp mô hình Google Gemini 2.5 Flash cùng kho tri thức pháp luật cấp xã (`legal_corpus.json`, `procedures_demo.json`).
   - Thiết lập System Prompt Guardrails chỉ tư vấn hành chính công và pháp luật Việt Nam.
   - Tự động xuất Bộ Checklist Hồ sơ 4 mục chuẩn:
     + (1) Tên thủ tục hành chính
     + (2) Bản chính mang theo để đối chiếu
     + (3) Bản sao / Bản chính nộp lưu
     + (4) Cơ quan giải quyết, Thời hạn & Lệ phí
3. **Phân hệ 3 (Smart Auto-Form & Xuất 4 Định dạng)**:
   - Hỗ trợ 3 cách điền đơn:
     + **Cách 1: Trợ lý giọng nói (Voice Wizard)** hỏi từng câu theo mẫu, công dân trả lời bằng giọng nói.
     + **Cách 2: Quét thẻ CCCD (AI Vision OCR)** trích xuất thông tin tự động trong 3 giây.
     + **Cách 3: Biểu mẫu chữ to** nhập liệu trực tiếp trên màn hình.
   - Điền thẳng vào 05 file biểu mẫu chuẩn `.docx` và xuất 4 định dạng: `.docx`, `.pdf`, `.png` và `In trực tiếp (Print)`.
4. **Phân hệ 4 (AI Document Pre-Check)**:
   - Công dân chụp ảnh giấy tờ đã chuẩn bị ở nhà (CCCD, Đơn từ, Giấy chứng sinh/Sổ đỏ...).
   - Gemini Vision kiểm tra: đã đủ số lượng chưa, đã ký tên vào đơn chưa, ảnh có mờ/nhòe/mất góc không và thông báo bằng giọng đọc to.
5. **Phân hệ 5 (Mã QR Hồ sơ Nhanh cho Cán bộ Một cửa)**:
   - Sau khi điền xong tờ khai, sinh mã QR hồ sơ tạm thời cho người dân.
   - Tại trang `/can-bo-mot-cua`, cán bộ Một cửa đưa camera quét mã QR, máy tính hiển thị toàn bộ hồ sơ trong vòng **10 giây** để kiểm tra và in xác nhận ngay.
6. **Phân hệ 6 (Deep-link Dịch vụ công & Cẩm nang VNeID)**:
   - Kết nối trực tiếp Cổng DVC Tỉnh Tây Ninh (`dichvucong.tayninh.gov.vn`) và Cổng DVC Quốc gia (`dichvucong.gov.vn`).
   - Cẩm nang VNeID mức 2 "Cầm tay chỉ việc" có giọng đọc hướng dẫn từng bước.

---

## 📁 CẤU TRÚC MÃ NGUỒN DỰ ÁN
```
hiep-hoa-ai-gov/
├── backend/                        # Máy chủ API, AI RAG & Xử lý nghiệp vụ
│   ├── src/
│   │   ├── config/                 # Cấu hình Gemini 2.5 Flash API, CORS
│   │   ├── controllers/            # ragController, ocrController, preCheckController, formController, procedureController
│   │   ├── services/
│   │   │   ├── geminiRagService.js # Lõi RAG AI + Guardrails + Bộ Checklist 4 mục
│   │   │   ├── visionOcrService.js # Quét CCCD OCR & Pre-check hồ sơ
│   │   │   └── vectorStore.js      # Tra cứu tri thức TTHC & Luật cấp xã
│   │   ├── middlewares/            # Rate limit, Zero-Data Retention sanitizer, Audit logger
│   │   ├── routes/api.js           # API Endpoints
│   │   ├── data/
│   │   │   ├── local_info.json     # UBND xã Hiệp Hòa & các ấp
│   │   │   ├── procedures_demo.json# 08 TTHC thuộc 05 nhóm danh mục
│   │   │   ├── legal_corpus.json   # Kho luật & giải thích bình dân
│   │   │   ├── form_schemas.json   # 05 Mẫu đơn & Kịch bản giọng nói
│   │   │   └── templates/          # 05 file biểu mẫu chuẩn .docx
│   │   └── utils/
│   │       └── reportLogger.js     # Ghi log lịch sử hệ thống vào /reports/
│   ├── package.json
│   ├── .env.example
│   └── server.js
├── frontend/                       # Ứng dụng Web Đa nền tảng (React + TailwindCSS + Vite)
│   ├── public/
│   │   └── templates/              # 05 file .docx mẫu phục vụ điền đơn Client-side
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             # Header Quốc huy, AccessibilityBar (A / A+ / A++), Loa toggle
│   │   │   ├── voice/              # AutoVoiceOnboarding, VoiceMicButton 2 chiều
│   │   │   ├── categories/         # 5 Nhóm thủ tục nút bấm lớn + Câu hỏi chạm-đọc
│   │   │   ├── rag-chat/           # Khung chat hỏi đáp luật + Checklist 4 mục
│   │   │   ├── auto-form/          # Điền đơn giọng nói, Quét CCCD OCR, Form chữ to + 4 định dạng xuất
│   │   │   ├── pre-check/          # Chụp ảnh kiểm tra sơ bộ hồ sơ (AI Pre-Check)
│   │   │   ├── qr-handoff/         # Mã QR hồ sơ nhanh cho công dân
│   │   │   └── dvc-guide/          # Deep-link Cổng DVC & Cẩm nang VNeID
│   │   ├── hooks/                  # useSpeechSynthesis, useSpeechRecognition, useFontScale, useZeroDataSession
│   │   ├── services/               # docxExportService, apiClient
│   │   ├── pages/
│   │   │   ├── CitizenHomePage.jsx # Trang chính phục vụ nhân dân xã Hiệp Hòa
│   │   │   └── OfficerScanPage.jsx # Trang quét QR cho Cán bộ Một cửa xã
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
├── reports/                        # BẮT BUỘC LƯU LỊCH SỬ THỰC HIỆN & CHỈNH SỬA
│   ├── CHANGELOG.md                # Nhật ký tổng hợp mọi phiên thực hiện
│   ├── system_audit_log.json       # Lịch sử hoạt động và truy vết tự động từ ReportLogger
│   └── 2026-10-23_1550_init_project_architecture.md
├── run_project.bat                 # Script chạy nhanh 1-click cả 2 máy chủ trên Windows
└── README.md
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Cách 1: Khởi động nhanh 1-Click (Khuyên dùng trên Windows)
Chỉ cần nhấp đúp chuột vào file:
```bat
run_project.bat
```
Hệ thống sẽ tự động mở đồng thời Backend API (Cổng 5000) và Frontend Web App (Cổng 5173).

---

### Cách 2: Chạy bằng dòng lệnh (Manual)

#### 1. Khởi động Backend:
```bash
cd backend
npm install
npm start
```
*Backend lắng nghe tại: `http://localhost:5000`*

#### 2. Khởi động Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend chạy tại: `http://localhost:5173`*

---

## 🔑 CẤU HÌNH GOOGLE GEMINI API (TÙY CHỌN)
Trong file `backend/.env`:
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=dien_api_key_cua_ban_vao_day
GEMINI_MODEL=gemini-2.5-flash
```
> **Lưu ý:** Nếu chưa có API Key hoặc chạy khi mất mạng, hệ thống tự động kích hoạt **Chế độ Tri thức Cấp xã (Local Grounded Knowledge Engine)** để đảm bảo toàn bộ tính năng demo và hội thi hoạt động mượt mà 100% không bị gián đoạn!

---

## 📱 CÁC ĐƯỜNG DẪN TRUY CẬP HỆ THỐNG
- **Giao diện Dành cho Nhân dân xã Hiệp Hòa:**  
  `http://localhost:5173/`
- **Giao diện Dành cho Cán bộ Một cửa Quét Mã QR:**  
  `http://localhost:5173/#/can-bo-mot-cua`
- **Kiểm tra trạng thái Backend (Health Check):**  
  `http://localhost:5000/health`
- **Xem Nhật ký Hệ thống (Audit Logs):**  
  `http://localhost:5000/api/audit-logs`
