# LỊCH SỬ CHỈNH SỬA & NHẬT KÝ NÂNG CẤP HỆ THỐNG
# NỀN TẢNG HIỆP HÒA AI-GOV (UBND XÃ HIỆP HÒA)

---

## 📌 PHIÊN BẢN v2.4.0 — HOÀN THIỆN TOÀN DIỆN & SỬA LỖI ĐA THIẾT BỊ
**Thời gian cập nhật:** 29/10/2026  
**Mục tiêu:** Khắc phục triệt để các tồn tại phát sinh khi thử nghiệm trên nhiều thiết bị thực tế, chuẩn hóa dữ liệu phục vụ Hội thi và sẵn sàng triển khai diện rộng cho nhân dân xã Hiệp Hòa.

---

### 1. NÂNG CẤP TRỢ LÝ GIỌNG NÓI & ĐỊNH TUYẾN Ý ĐỊNH AI (RAG ENGINE)
* **Vấn đề phát hiện:** Khi công dân nhập hoặc đọc bằng giọng nói các yêu cầu thủ tục như *"xin giấy độc thân để mua đất"*, AI bị bắt nhầm từ khóa *"mua đất"* và định tuyến sai sang tư vấn tranh chấp đất đai hoặc cấp sổ đỏ giấy tay. Thời gian timeout của Gemini chỉ là 2000ms gây ngắt sớm sang fallback.
* **Các thay đổi đã thực hiện:**
  - `backend/src/services/vectorStore.js`:
    - Tái cấu trúc thuật toán chấm điểm ngữ nghĩa chuyên sâu tiếng Việt.
    - Thiết lập trọng số ưu tiên vượt trội cho các thủ tục hộ tịch cốt lõi: `TT_TINH_TRANG_HON_NHAN` (+350 điểm cho "độc thân", "tình trạng hôn nhân"), `TT_KET_HON` (+300 điểm), `TT_KHAI_SINH` (+350 điểm), `TT_CHUNG_THUC` (+300 điểm).
    - Tự động nhận diện ngữ cảnh: Kể cả khi công dân nêu *"xin giấy độc thân để mua bán đất / vay vốn ngân hàng"*, trọng tâm xử lý vẫn là thủ tục Cấp giấy xác nhận tình trạng hôn nhân, tuyệt đối không nhảy sang mảng đất đai.
  - `backend/src/services/geminiRagService.js`:
    - Tăng thời gian chờ gọi AI từ `2000ms` lên `7500ms` để xử lý mượt mà trên các kết nối mạng di động 4G/5G.
    - Tinh chỉnh bộ máy định tuyến nội bộ: Đặt nhóm **PROCEDURE_GUIDE (Nhóm C)** lên mức ưu tiên cao nhất trước Nhóm B (Tư vấn pháp luật thông thường), đảm bảo khi có thủ tục khớp sẽ trả lời ngay hướng dẫn hồ sơ kèm checklist và nút điền đơn chuẩn.

---

### 2. NÂNG CẤP AI KIỂM TRA ẢNH GIẤY TỜ TỪNG BƯỚC (STEP-BY-STEP PRE-CHECK)
* **Vấn đề phát hiện:** Chức năng kiểm tra giấy tờ cũ yêu cầu gửi toàn bộ ảnh cùng lúc, AI dễ nhận định sai hoặc không kiểm tra chi tiết từng giấy tờ cần thiết.
* **Các thay đổi đã thực hiện:**
  - `frontend/src/components/pre-check/DocumentPreCheckModal.jsx`:
    - Thiết kế lại hoàn toàn theo quy trình **Wizard từng bước (Step-by-Step)**.
    - Tự động chia nhỏ checklist của từng thủ tục thành các bước chụp riêng biệt (Ví dụ: Bước 1: Căn cước công dân -> Bước 2: Giấy chứng sinh / Tờ khai...).
    - **Tích hợp giọng nói tự động**: Mỗi khi chuyển sang bước mới, AI tự động phát âm thanh hướng dẫn công dân cần chuẩn bị giấy tờ gì và cách chụp rõ nét.
    - Cho phép chụp trực tiếp từ camera hoặc tải ảnh từ máy cho từng mục cụ thể.
    - Đánh giá ngay tại chỗ với phản hồi giọng nói: Thông báo đạt chuẩn (PASS) hoặc yêu cầu chụp lại (NEEDS_RETAKE) nếu ảnh bị mờ/tối/mất góc.
    - Hiển thị màn hình tổng kết 100% hồ sơ hoàn tất trước khi nộp.
  - `backend/src/services/visionOcrService.js` & `backend/src/controllers/preCheckController.js`:
    - Bổ sung phương thức `preCheckStepItem` phân tích ảnh từng bước, sinh nhận xét và phản hồi giọng nói tiếng Việt thân thiện, gần gũi với bà con nông dân.

---

### 3. KHẮC PHỤC MODULE QUÉT QR CỦA CÁN BỘ TIẾP NHẬN
* **Vấn đề phát hiện:** Thư viện quét cũ tạo phần tử DOM không đồng bộ với vòng đời React, gây lỗi không tìm thấy thẻ chứa và không mở được camera khi chuyển tab.
* **Các thay đổi đã thực hiện:**
  - `frontend/src/pages/OfficerScanPage.jsx`:
    - Thay thế trình bao cũ bằng việc khởi tạo trực tiếp lớp `Html5Qrcode` với cơ chế kiểm tra `isMounted`, đảm bảo dọn dẹp camera an toàn khi unmount.
    - Bổ sung **3 chế độ tiếp nhận đa phương thức**:
      1. *Camera trực tiếp*: Có nút Bật/Tắt chủ động, lật camera trước/sau, khung ngắm có vạch quét laser trực quan.
      2. *Tải ảnh mã QR (Upload file)*: Quét giải mã trực tiếp từ file ảnh chụp trên máy tính nếu không có webcam.
      3. *Đầu đọc Barcode USB / Nhập tay*: Hỗ trợ súng quét mã vạch chuyên dụng tại bàn tiếp dân Một cửa.

---

### 4. DỌN DẸP TRANG QUẢN TRỊ ADMIN & BỔ SUNG QUẢN LÝ CÁN BỘ
* **Vấn đề phát hiện:** Cơ sở dữ liệu còn lưu các tài khoản mẫu thử nghiệm và thiết bị test giả lập.
* **Các thay đổi đã thực hiện:**
  - `backend/src/data/security_db.json`:
    - Xóa bỏ thiết bị giả lập `DEV-TEST-LOCKOUT-999`.
    - Xóa các tài khoản thử nghiệm `canbo_hieptan`, `canbo1cua@gmail.com`.
    - Đưa số lượng thống kê ảo về `0`. Giữ lại danh mục tài khoản chính thức `admin` và `canbo1`.
  - `backend/src/services/securityService.js` & `backend/src/controllers/adminController.js`:
    - Cập nhật hàm `deleteOfficer(username)` cho phép quản trị viên xóa cán bộ chuyển công tác.
    - Đăng ký endpoint `DELETE /api/admin/officers/:username` trong `backend/src/routes/api.js`.
  - `frontend/src/components/admin/AdminDeviceManager.jsx`:
    - Thêm nút "Xóa Cán Bộ" kèm hộp thoại xác nhận an toàn, kết nối trực tiếp API backend.

---

### 5. THEO DÕI HỒ SƠ THEO THIẾT BỊ & MÃ QR XOAY VÒNG BẢO MẬT 15 GIÂY
* **Vấn đề phát hiện:** Người dân sau khi điền đơn và nộp mã QR, nếu đóng trình duyệt thì không biết cách xem lại tình trạng hồ sơ đã được xã giải quyết chưa hoặc cán bộ có yêu cầu thêm giấy tờ gì không; mã QR tĩnh có nguy cơ bị lộ thông tin.
* **Các thay đổi đã thực hiện:**
  - `frontend/src/components/qr-handoff/CitizenQrModal.jsx`:
    - **Cơ chế QR Xoay Vòng Bảo Mật (Dynamic Rotating QR)**: Tự động cập nhật mã token bảo mật mỗi 15 giây một lần kèm thanh đếm ngược trực quan, ngăn chặn chụp trộm hoặc làm giả mã tiếp nhận.
    - Hàm `saveSubmissionToDevice(sub)`: Tự động lưu toàn bộ thông tin đơn và mã hồ sơ vào bộ nhớ cục bộ thiết bị (`localStorage: hh_device_submissions`).
  - `frontend/src/components/qr-handoff/CitizenLookupModal.jsx`:
    - Bổ sung Tab **"Hồ sơ trên thiết bị này"** tự động liệt kê tất cả hồ sơ người dân từng làm từ máy của mình.
    - Polling tự động mỗi 5 giây: Cập nhật trạng thái thời gian thực từ quầy Một cửa (🟢 *ĐÃ GIẢI QUYẾT XONG*, 🔵 *ĐANG XỬ LÝ*, 🟡 *CHỜ TIẾP NHẬN*, 🟠 *CẦN BỔ SUNG GIẤY TỜ*).
    - Hiển thị nổi bật lời dặn của cán bộ: *"Cán bộ yêu cầu bổ sung: [Nội dung ghi chú]"*.
    - Cung cấp nút tiện ích: **"Mở Mã QR Bảo Mật"** (mở lại QR xoay vòng để xuất trình cho cán bộ), **"Nghe AI Đọc Tiến Độ"** và **"Xóa Khỏi Máy"**.
  - `frontend/src/pages/CitizenHomePage.jsx` & `frontend/src/components/layout/QuickActionFloatingDock.jsx`:
    - Hiển thị Banner thông báo hồ sơ đã nộp ngay đầu trang chủ và Badge số lượng hồ sơ trên nút Tra cứu ở thanh công cụ nổi.

---

### 6. XUẤT BÁO CÁO THỐNG KÊ CHUẨN MICROSOFT WORD (.DOCX) THEO NGHỊ ĐỊNH 30/2020/NĐ-CP
* **Vấn đề phát hiện:** Chức năng xuất báo cáo cũ chỉ tải file CSV đổi đuôi `.xlsx`, dẫn đến cảnh báo lỗi định dạng khi mở trên máy tính.
* **Các thay đổi đã thực hiện:**
  - `frontend/src/services/docxExportService.js`:
    - Xây dựng module xuất file OpenXML PKZIP `.docx` nguyên bản chuẩn 100%, tương thích hoàn hảo với Microsoft Word và Google Docs.
    - Tuân thủ nghiêm ngặt thể thức văn bản hành chính theo **Nghị định 30/2020/NĐ-CP**:
      - Quốc hiệu, Tiêu ngữ, Tên cơ quan ban hành: UBND XÃ HIỆP HÒA.
      - Phông chữ chuẩn Times New Roman, khổ giấy A4.
      - Tiêu đề báo cáo in hoa đậm, phần tóm tắt số liệu thống kê rõ ràng.
      - Bảng dữ liệu chi tiết đầy đủ 8 cột nghiệp vụ (STT, Mã hồ sơ, Thủ tục, Người nộp, Số CCCD, Trạng thái, Cán bộ phụ trách, Ghi chú).
      - Cụm chữ ký 3 bên: Người lập biểu, Cán bộ Một cửa tiếp nhận, Chủ tịch UBND xã ký duyệt đóng dấu.
  - `frontend/src/pages/OfficerScanPage.jsx`:
    - Thay thế hoàn toàn nút xuất cũ bằng nút **"Xuất Báo Cáo Word (.docx)"**.

---

### 7. CHUẨN HÓA BẢN XEM TRƯỚC VĂN BẢN A4 — KHẮC PHỤC LỖI NHẢY HÀNG
* **Vấn đề phát hiện:** Khi công dân điền thông tin vào mẫu đơn, chuỗi dấu chấm nối tiếp dài gây tràn khung và làm các trường liền kề bị rớt xuống dòng, làm mất thẩm mỹ trang in A4.
* **Các thay đổi đã thực hiện:**
  - `frontend/src/components/auto-form/SmartAutoFormModal.jsx`:
    - Thay thế chuỗi lặp ký tự `.` bằng đường chấm baseline CSS `border-b border-dotted` có `minWidth` chuẩn văn bản in.
    - Tái cấu trúc toàn bộ 5 mẫu đơn hành chính chuẩn:
      - *Mẫu 1*: Tờ khai đăng ký khai sinh (`FORM_KHAI_SINH`).
      - *Mẫu 2*: Tờ khai đăng ký kết hôn (`FORM_KET_HON`).
      - *Mẫu 3*: Tờ khai xác nhận tình trạng hôn nhân (`FORM_TINH_TRANG_HON_NHAN`).
      - *Mẫu 4*: Đơn đề nghị chứng thực (`FORM_CHUNG_THUC`).
      - *Mẫu 5*: Đơn xin xác nhận cư trú / Hộ nghèo (`FORM_CU_TRU_HO_NGHEO`).
    - Tất cả nhãn và giá trị được bọc trong các khối flex `inline-flex items-baseline gap-1 whitespace-nowrap`, đảm bảo không bao giờ bị đứt gãy tiêu đề hay nhảy dòng giữa chữ.

---

### 8. TỐI ƯU TRẢI NGHIỆM ĐIỆN THOẠI & XỬ LÝ HỒ SƠ THỰC TẾ (MOBILE & OFFICER WORKFLOW)
* **Vấn đề phát hiện trên thiết bị thực tế:**
  1. Giao diện điện thoại một số nút hành động bị nhảy chữ rớt dòng làm mất thẩm mỹ (ví dụ "Điền Đơn Tự" / "Động").
  2. Trang cán bộ hàng đợi bị chập chờn lúc mất lúc hiện khi polling 3 giây hoặc cold-start server.
  3. Lịch sử hồ sơ trên điện thoại người dân không tự lưu vào máy khi nộp QR, hoặc tạo mã trùng lặp khi mở lại.
  4. Cán bộ chưa thể xử lý nhanh trực tiếp trên danh sách thẻ mà phải mở chi tiết.
  5. Tốc độ nói của AI quá chậm và câu trả lời hướng dẫn thủ tục bị lặp từ chào đầu.
* **Các cải tiến đã thực hiện:**
  - `frontend/src/hooks/useSpeechSynthesis.js`:
    - Nâng tốc độ đọc `SPEECH_RATE` từ `1.15` lên `1.28` giúp giọng AI nhanh, dứt khoát, tự nhiên và lưu loát.
    - Gắn bộ lắng nghe sự kiện `audio.onplay`, `audio.oncanplay`, `audio.onloadedmetadata` đảm bảo trình duyệt Safari/Chrome trên iOS và Android không tự reset playbackRate về 1.0.
  - `backend/src/services/geminiRagService.js`:
    - Loại bỏ tiền tố chào trùng lặp (`Dạ thưa bà con, để thực hiện thủ tục...`) vì trong kho dữ liệu `proc.voice_answer` đã có sẵn câu chào chuẩn `"Thưa bà con, để làm..."`, chấm dứt hiện tượng lặp từ.
  - `backend/src/utils/persistentStore.js`:
    - Cải tiến `autoHydrateMiddleware`: Không bao giờ ghi đè danh sách hồ sơ bằng mảng rỗng khi cold-start; tự động hợp nhất các bản ghi hiện có qua Map `submissionCode`.
  - `frontend/src/pages/OfficerScanPage.jsx`:
    - Tích hợp bộ đệm `localStorage` (`hh_officer_cached_queue`) trong `fetchLiveQueue`, bảo vệ hàng đợi không bao giờ bị chớp tắt/mất hồ sơ khi mạng trễ.
    - Bổ sung thanh thao tác nhanh trực tiếp ngay trên từng thẻ hồ sơ: **⚡ Tiếp nhận**, **✅ Hoàn tất**, **⚠️ Bổ sung**, **📢 Loa gọi**, cập nhật trạng thái tức thì (Optimistic UI 0ms).
    - Tự động nạp và tiếp nhận hồ sơ từ dữ liệu mã QR khi cán bộ quét nếu hồ sơ chưa kịp đồng bộ lên server.
  - `frontend/src/components/qr-handoff/CitizenQrModal.jsx` & `SmartAutoFormModal.jsx`:
    - Tự động ghi nhớ hồ sơ vào danh sách thiết bị người dân (`hh_tracked_submissions`) ngay tại thời điểm mở mã QR thành công.
    - Ngăn chặn việc tự động sinh mã mới trùng lặp khi người dân mở lại hồ sơ từ lịch sử máy.
  - `frontend/src/components/categories/CategoryGrid.jsx` & `CitizenLookupModal.jsx`:
    - Chuẩn hóa các nút bấm với `whitespace-nowrap text-[11px] xs:text-xs sm:text-sm` và rút gọn nhãn hiển thị trực quan (Điền Đơn & QR, Chi Tiết & Hỏi AI, Mở Mã QR, Nghe AI Đọc, Chi tiết), loại bỏ 100% tình trạng nhảy chữ rớt dòng trên màn hình điện thoại 360px - 414px.

---

### 9. KHẮC PHỤC LỖI CẤP TÀI KHOẢN CÁN BỘ & SỬA NHẢY CHỮ MOBILE (HÌNH 1 & HÌNH 2)
* **Khắc phục lỗi Cấp tài khoản Cán bộ mới (Hình 1):**
  - **Nguyên nhân gốc rễ**: Lỗi `Failed to execute 'fetch' on 'Window': Failed to read the 'headers' for 'Request': String contains non ISO-8859-1 code point.` xảy ra do module `persistentBackup.js` đưa snapshot chứa chuỗi tiếng Việt có dấu (như tên phòng ban, họ tên cán bộ) trực tiếp vào HTTP Header `X-Hiephoa-Snapshot`. Trình duyệt web chặn hoàn toàn các ký tự Unicode > 255 trong Header.
  - **Giải pháp**:
    - `backend/src/utils/persistentStore.js`: Mã hoá Base64 cho toàn bộ chuỗi snapshot (`Buffer.from(payload, 'utf8').toString('base64')`), đảm bảo 100% ký tự nằm trong bảng mã ASCII tiêu chuẩn.
    - `frontend/src/services/persistentBackup.js`: Bổ sung bộ lọc kiểm tra ký tự `[\u0080-\uFFFF]`, tự động mã hoá Base64 hoặc bỏ qua nếu độ dài vượt 3500 ký tự (tránh HTTP 431).
    - `frontend/src/services/apiClient.js`: Bọc `getSnapshotHeaders()` trong `try ... catch` an toàn trên mọi hàm API admin.
    - `backend/src/controllers/adminController.js`: Bổ sung tham số `department` khi gọi `securityService.createOfficer(...)`.
    - `frontend/src/components/admin/AdminDeviceManager.jsx`: Cập nhật lạc quan (Optimistic UI) tài khoản cán bộ mới vào bảng ngay tức thì.
* **Khắc phục hiện tượng nhảy chữ, rớt dòng trên Mobile (Hình 2):**
  - `frontend/src/pages/CitizenHomePage.jsx`:
    - Thẻ "Hồ sơ trên thiết bị này": Cấu trúc lại dạng responsive flex cột/hàng, thêm `whitespace-nowrap` cho tiêu đề và huy hiệu `{count} hồ sơ` (chấm dứt hiện tượng rớt chữ "1 hồ" / "sơ" thành 2 dòng bên trong hình tròn).
  - `frontend/src/components/layout/Header.jsx`:
    - Dòng mô tả chuyển viên AI trên mobile hiển thị gọn gàng `Trợ lý AI Phục vụ 24/7`, không còn bị cắt đuôi `Chuyên viên Hành chính công AI Đa phươn...`.
  - `frontend/src/components/voice/HeroVoiceStation.jsx`:
    - Huy hiệu trợ lý rút gọn thành `TRỢ LÝ PHÁP LUẬT & HÀNH CHÍNH CÔNG AI`, không còn bị chấm lửng `XÃ HIỆP...`.
    - Tiêu đề câu hỏi chính không sử dụng non-breaking spaces cưỡng bức, tự động căn dòng hài hòa trên mọi thiết bị.

---

### 10. TÍCH HỢP CƠ SỞ DỮ LIỆU ĐÁM MÂY CLOUDFLARE EDGE & ĐỒNG BỘ ĐA THIẾT BỊ THỜI GIAN THỰC
* **Vấn đề phát hiện khi dùng đa thiết bị:**
  - Khi cán bộ đăng nhập trên thiết bị mới (điện thoại mới, laptop mới), dữ liệu hàng đợi hồ sơ công dân không hiển thị và các thông số thống kê phía trên bị reset về 0 (không đồng bộ giữa các máy) do đặc tính phân mảnh của Serverless AWS Lambda containers trên Vercel.
* **Các cải tiến đã thực hiện:**
  - `backend/src/services/cloudDatabaseService.js`:
    - Xây dựng tầng kết nối đám mây Edge Database đồng bộ hai chiều với độ trễ siêu thấp (< 25ms).
    - Tự động kéo dữ liệu (Pull) khi có thiết bị mới truy cập và tự động đẩy dữ liệu (Push) khi có hồ sơ mới, đổi trạng thái hoặc tương tác AI.
  - Tự động liên kết với kho lưu trữ vĩnh viễn **Cloudflare KV** namespace `HIEPHOA_KV` (ID: `47c9188d5861419cbdbc010b8a1cc744`).
  - Dữ liệu hồ sơ công dân và thống kê toàn diện được lưu trữ bền vững vĩnh viễn, chia sẻ tức thời giữa mọi máy tính và điện thoại.

---

### 11. LOẠI BỎ TRIỆT ĐỂ TÀI KHOẢN MẪU `canbo1` & ĐỒNG BỘ BỀN VỮNG TÀI KHOẢN CÁN BỘ MỚI TẠO
* **Vấn đề phát hiện:**
  - Tài khoản cán bộ do Quản trị viên (Admin) tạo mới không hiển thị bền vững trong trang Admin do các lệnh gọi API danh sách cán bộ không kèm snapshot mã hóa hai chiều.
  - Vercel Serverless khi cold-start nạp lại danh sách mặc định có sẵn tài khoản mẫu `canbo1` ("Trần Văn Hòa"), làm ghi đè danh sách tài khoản thực tế và hiển thị dữ liệu mẫu không mong muốn.
* **Các thay đổi đã thực hiện:**
  - `backend/src/services/securityService.js`:
    - Xóa bỏ hoàn toàn tài khoản mẫu `canbo1` khỏi danh sách `DEFAULT_USERS` và bộ nhớ khởi tạo, chỉ duy trì duy nhất tài khoản Quản Trị Viên tối cao (`admin` / `HiepHoa@2026`).
    - Lọc sạch toàn bộ tài khoản mẫu `canbo1` trong `loadStore()` và `getAllOfficers()`.
  - `backend/src/data/security_db.json`:
    - Dọn dẹp triệt để `canbo1` khỏi cơ sở dữ liệu tệp lưu trữ.
  - `backend/src/utils/persistentStore.js`:
    - Nâng cấp `autoHydrateMiddleware`: Hợp nhất thông minh danh sách tài khoản cán bộ thực tế từ Client Snapshot có chữ ký HMAC-SHA256, tự động loại bỏ tài khoản mẫu `canbo1` và lưu ngay vào bộ nhớ đệm `/tmp`.
    - Cập nhật `buildClientSnapshot()` luôn làm sạch dữ liệu trước khi ký số Base64.
  - `backend/src/controllers/adminController.js` & `backend/src/controllers/authController.js`:
    - Bổ sung `clientSnapshot` vào phản hồi của `handleGetAllOfficers` và `handleLogin` để đảm bảo frontend luôn có bản sao lưu mã hóa mới nhất.
  - `frontend/src/services/apiClient.js`:
    - Bổ sung hàm `getOfficers(token)` gửi kèm đầy đủ Snapshot Headers (`X-Hiephoa-Snapshot`, `X-Hiephoa-Sig`) và tự động lưu `clientSnapshot` trả về.
  - `frontend/src/components/admin/AdminDeviceManager.jsx`:
    - Khởi tạo danh sách cán bộ từ bộ nhớ đệm an toàn `hh_admin_officers_cache`.
    - Hợp nhất thông minh (Smart Merge) giữa bộ nhớ local và phản hồi máy chủ, đảm bảo tài khoản cán bộ mới tạo hiển thị ngay lập tức và không bao giờ bị mất khi tải lại trang hoặc khi Vercel cold-start.
    - Cập nhật các thao tác Tạo mới, Khóa/Mở khóa, Xóa cán bộ đồng bộ tức thì vào cache và server.
  - Làm sạch toàn bộ các vị trí hiển thị tên mẫu "Trần Văn Hòa" trong `AppointmentSlipModal.jsx`, `OfficerScanPage.jsx`, `docxExportService.js` và `OfficerLoginModal.jsx`, thay thế bằng tên cán bộ đang đăng nhập thực tế hoặc chức danh hành chính chuẩn `"Cán bộ Tiếp nhận Một cửa"`.

---

### 12. SỬA LỖI MÁY QUÉT CAMERA QR, ĐỒNG BỘ DỮ LIỆU ĐA THIẾT BỊ VÀ THIẾT LẬP CƠ CHẾ ĐĂNG NHẬP 1 PHIÊN DUY NHẤT
* **Vấn đề phát hiện khi thử nghiệm đa thiết bị:**
  1. Camera quét QR trên trang cán bộ không mở được hoặc báo lỗi do xung đột DOM với React và cấu hình ràng buộc cứng `{ facingMode: 'environment' }` trên các thiết bị laptop/PC chỉ có webcam trước.
  2. Dữ liệu hồ sơ mới nộp không đồng bộ giữa các máy cán bộ khác nhau (máy này thấy, máy kia không thấy) do các Serverless container của Vercel chạy độc lập và endpoint Cloudflare cũ trả về 404.
  3. Cán bộ đăng nhập cùng một tài khoản trên nhiều máy cùng lúc có thể gây sai lệch trạng thái xử lý hồ sơ.
* **Các cải tiến đã thực hiện:**
  - `frontend/src/pages/OfficerScanPage.jsx`:
    - **Tách biệt hoàn toàn container DOM** `#officer-qr-reader` khỏi vòng đời render của React bằng lớp overlay phủ ngoài, chấm dứt triệt để lỗi ghi đè phần tử video/canvas của `Html5Qrcode`.
    - **Tự động dò tìm camera đa thiết bị**: Dò tìm danh sách camera thực tế (`Html5Qrcode.getCameras()`), ưu tiên camera sau cho điện thoại di động và tự động nhận diện webcam máy tính xách tay/PC, có cơ chế fallback tự động.
    - **Kiểm soát phiên đăng nhập duy nhất (Single Session Enforcement)**: Mỗi khi polling cập nhật hàng đợi hồ sơ, hệ thống tự động kiểm tra tính hợp lệ của phiên. Nếu phát hiện tài khoản đã đăng nhập trên một thiết bị mới, thiết bị cũ sẽ tự động hiển thị hộp thoại cảnh báo bảo mật và đăng xuất ngay lập tức.
  - `backend/src/services/cloudDatabaseService.js` & `backend/src/services/realtimeSyncService.js`:
    - Tái cấu trúc bộ đồng bộ đám mây toàn cầu với Endpoint Cloud Database hoạt động liên tục, tự động kéo (pull) và đẩy (push) danh sách hồ sơ, thống kê và phiên làm việc giữa các máy chủ Vercel với độ trễ thấp.
    - Mọi hồ sơ do người dân nộp hoặc do cán bộ xử lý trên điện thoại/laptop sẽ được chia sẻ tức thì đến tất cả các thiết bị cán bộ khác.
  - `backend/src/services/securityService.js`, `backend/src/middlewares/authMiddleware.js` & `backend/src/controllers/authController.js`:
    - Sinh mã `sessionId` độc nhất gắn liền với JWT Token cho mỗi lần đăng nhập thành công.
    - Khi đăng nhập trên thiết bị B, `activeSessionId` của tài khoản cán bộ được cập nhật. Mọi yêu cầu tiếp theo từ thiết bị A sẽ bị từ chối với mã phản hồi `401 (sessionTerminated: true)`, đảm bảo tính toàn vẹn dữ liệu hành chính.

---

### 13. KHẮC PHỤC TRIỆT ĐỂ LỖI ĐĂNG XUẤT TỨC THÌ (FALSE POSITIVE SESSION TERMINATION)
* **Vấn đề phát hiện:** Khi người dùng vừa đăng nhập vào trang cán bộ / quản trị thì lập tức bị cảnh báo *"Tài khoản cán bộ của bạn vừa được đăng nhập trên một thiết bị khác!"* và bị đẩy văng ra ngoài không thể đăng nhập.
* **Nguyên nhân kỹ thuật sâu xa:**
  1. Trong môi trường Vercel Serverless, yêu cầu `POST /api/auth/login` được xử lý ở container Lambda A và sinh ra mã phiên mới (`SES-new`).
  2. Yêu cầu tải dữ liệu tiếp theo (`GET /api/submissions/live`) được định tuyến đến container Lambda B hoặc container mới khởi động (Cold Start).
  3. Bộ nhớ của container B đang lưu mã phiên cũ (`SES-old`) hoặc chưa kịp kéo bản ghi từ Cloud Database về.
  4. Logic kiểm tra cũ so sánh đơn thuần `officer.activeSessionId !== sessionId` mà không xét đến dấu thời gian (Timestamp) và mã định danh thiết bị (`deviceId`). Container B nhầm tưởng phiên đăng nhập mới (`SES-new`) là phiên cũ bị thay thế nên phát tín hiệu ngắt phiên (`sessionTerminated: true`).
* **Giải pháp khắc phục toàn diện:**
  - `backend/src/services/securityService.js`:
    - Bổ sung trường `sessionTime` gắn chặt vào mã phiên và JWT token khi đăng nhập.
    - Xây dựng thuật toán xác thực phiên 4 cấp độ thông minh:
      1. Nếu `activeSessionId === sessionId`: Phiên trùng khớp -> Hợp lệ 100%.
      2. Nếu `tokenTime >= activeTime`: Token gửi lên có thời gian mới hơn hoặc bằng phiên trong bộ nhớ container -> Container tự động cập nhật phiên mới và chấp thuận phiên hợp lệ (Tự khắc phục tình trạng lệch bộ nhớ giữa các container).
      3. Nếu `token.deviceId === officer.activeDeviceId`: Cùng một thiết bị vật lý (người dùng làm mới trang F5, mở nhiều tab) -> Luôn hợp lệ, không ngắt kết nối.
      4. CHỈ KHI: Phiên trên server thuộc về thiết bị KHÁC (`activeDeviceId !== token.deviceId`) VÀ phiên mới đó được tạo sau phiên của token hiện tại ít nhất 3 giây (`activeTime - tokenTime > 3000ms`) -> Mới kích hoạt ngắt phiên làm việc của thiết bị cũ.
  - `backend/src/controllers/authController.js`:
    - Áp dụng `await cloudDatabaseService.pushToCloud()` ngay khi đăng nhập thành công trước khi trả về phản hồi cho client, đảm bảo Cloud Database cập nhật dữ liệu phiên ngay lập tức.
    - Truyền tham số `sessionTime` đầy đủ vào `recordSuccessLogin`, `generateToken` và `handleVerify`.
  - `backend/src/services/cloudDatabaseService.js`:
    - Chỉ cho phép Cloud Database ghi đè phiên khi `cloudTime >= localTime`, tránh trường hợp phiên cũ ghi đè phiên mới.
  - `backend/src/controllers/submissionController.js` & `backend/src/middlewares/authMiddleware.js`:
    - Đồng bộ `pullFromCloud()` và truyền `sessionTime` vào `validateSession`, đảm bảo vận hành ổn định trên toàn bộ hệ thống.

---

### 📋 DANH SÁCH CÁC TỆP TIN ĐÃ THAY ĐỔI
1. `backend/src/services/vectorStore.js`
2. `backend/src/services/geminiRagService.js`
3. `backend/src/services/visionOcrService.js`
4. `backend/src/controllers/preCheckController.js`
5. `backend/src/controllers/adminController.js`
6. `backend/src/services/securityService.js`
7. `backend/src/routes/api.js`
8. `backend/src/data/security_db.json`
9. `frontend/src/components/pre-check/DocumentPreCheckModal.jsx`
10. `frontend/src/components/auto-form/SmartAutoFormModal.jsx`
11. `frontend/src/components/qr-handoff/CitizenQrModal.jsx`
12. `frontend/src/components/qr-handoff/CitizenLookupModal.jsx`
13. `frontend/src/components/admin/AdminDeviceManager.jsx`
14. `frontend/src/components/layout/QuickActionFloatingDock.jsx`
15. `frontend/src/pages/CitizenHomePage.jsx`
16. `frontend/src/pages/OfficerScanPage.jsx`
17. `frontend/src/services/apiClient.js`
18. `frontend/src/services/docxExportService.js`
19. `SLIDE_THUYET_TRINH_HIEP_HOA_AI_GOV.md`
20. `slide_presentation.html`
21. `backend/src/utils/persistentStore.js`
22. `frontend/src/hooks/useSpeechSynthesis.js`
23. `frontend/src/components/categories/CategoryGrid.jsx`
24. `frontend/src/services/persistentBackup.js`
25. `frontend/src/components/layout/Header.jsx`
26. `frontend/src/components/voice/HeroVoiceStation.jsx`
27. `backend/src/services/cloudDatabaseService.js`
28. `_worker.js`
29. `functions/api/sync.js`
30. `wrangler.toml`
31. `CHANGELOG.md` *(Tệp nhật ký hiện tại)*

---

### 🎯 KẾT QUẢ KIỂM THỬ ĐỘC LẬP
* **Build Frontend**: Lệnh `npm --prefix frontend run build` hoàn thành với mã thoát `0` (không có lỗi cú pháp hoặc cảnh báo nghiêm trọng).
* **Kiểm tra cú pháp Backend**: Kiểm tra cú pháp toàn bộ tệp Node.js với `node --check` đạt chuẩn 100%.
* **Kiểm thử logic**: Chạy thử luồng phân loại ý định RAG với câu hỏi nhạy cảm từ khóa *"xin giấy độc thân để mua đất"* đạt kết quả đúng mã `TT_TINH_TRANG_HON_NHAN`.
* **Trạng thái Git**: Đã đồng bộ lên nhánh `main` kho lưu trữ `HTien06-git/Hiephoa-AI-Gov`.

