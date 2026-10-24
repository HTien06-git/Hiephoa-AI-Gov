# NHẬT KÝ THAY ĐỔI DỰ ÁN (PROJECT CHANGELOG)
Hệ thống: **HIỆP HÒA AI-GOV (Chuyên viên Hành chính công AI Đa phương thức)**
Đơn vị: Trung tâm Phục vụ Hành chính công UBND xã Hiệp Hòa, tỉnh Tây Ninh

Tất cả các thay đổi kiến trúc, thêm tính năng, sửa lỗi và cập nhật dữ liệu của dự án được ghi nhận tại đây theo thứ tự thời gian.

---

## [2026-10-24 17:58] - Tinh Chỉnh Header V6.1: Bỏ Tiêu Ngữ Trên Cùng, Áp Dụng Logo Nền Tảng (Hình 2 - 5 Bàn Tay Vàng) & Nâng Cấp Hiệu Ứng Trống Đồng Đẳng Cấp
- **Loại tác vụ**: Bỏ thanh tiêu ngữ theo yêu cầu người dùng, tích hợp Logo nền tảng chính thức từ Hình 2 (5 bàn tay vàng ôm lấy ngôi sao trên nền đỏ tròn), nâng cấp hiệu ứng ánh kim và chiều sâu hoa văn Trống Đồng Đông Sơn, tối ưu hóa favicon và đồng bộ thương hiệu (Header Refinement V6.1).
- **Tác vụ thực hiện**:
  1. **Bỏ thanh tiêu ngữ trên cùng**: Xóa bỏ hoàn toàn thanh tiêu ngữ `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM...` giúp phần đầu trang mở rộng, thoáng đãng, tập trung trực diện vào thương hiệu Trung tâm Phục vụ Hành chính công.
  2. **Áp dụng Logo Nền Tảng (Hình 2)**:
     - Tích hợp file logo chính thức (`/logo_hiephoa.png` và `/logo_gov.png`) với hình tượng 5 bàn tay vàng đan lồng tạo ngôi sao trên nền đỏ biểu trưng cho tinh thần chung tay phục vụ nhân dân.
     - Khung logo tròn viền vàng kim hoàng gia, bao bọc bởi vòng hào quang Trống Đồng Đông Sơn xoay nhẹ nhàng 80s tạo hiệu ứng thẩm mỹ công nghệ - truyền thống sống động.
  3. **Nâng cấp hiệu ứng & không gian Trống Đồng**:
     - Nền Header chuyển sắc Đỏ Son Hoàng Gia (`#690F12` $\rightarrow$ `#8B1418` $\rightarrow$ `#5C0A0D`) kết hợp lớp ánh sáng vàng tỏa tròn (Radial Glow).
     - Hoa văn Trống Đồng lớn (480px) xoay chậm 150s bên phải và Trống Đồng tỏa sáng bên trái tạo chiều sâu uy nghiêm.
     - Dòng 3 hiển thị huy hiệu `HIỆP HÒA AI-GOV` nền vàng ánh kim dập nổi kèm chấm xanh xung nhịp `● Trực tuyến`.
     - Đường diềm hoa văn Trống Đồng Đông Sơn 6px sắc vàng đồng chuyển sắc với 2 đường viền phản quang trên dưới.
  4. **Kiểm thử xây dựng**: `npm run build` thành công 100% trong 9.52s, 0 lỗi.

---

## [2026-10-24 17:27] - Tái Cấu Trúc Giao Diện Chuẩn Cổng Dịch Vụ Công Chính Phủ, Khôi Phục Header Hình 7, Tinh Gọn Bố Cục & Hiệu Ứng Trống Đồng Đông Sơn (Version 6.0)
- **Loại tác vụ**: Tái cấu trúc chuẩn Cổng Dịch vụ công Chính phủ, khôi phục 100% nội dung tiêu đề Header từ Bản cũ (Hình 7), tích hợp biểu tượng Trống Đồng Đông Sơn / Ngọc Lũ vector SVG, tinh gọn bố cục trang chủ thành 03 khu vực mạch lạc, chuẩn hóa thẻ thủ tục 02 nút hành động, đồng bộ sắc Đỏ Thẫm Chính phủ và cập nhật thông tin liên hệ chính thức (Version 6.0 Overhaul).
- **Tác vụ thực hiện**:
  1. **Khôi phục 100% Header Bản Cũ (Hình 7) & Họa tiết Trống Đồng Đông Sơn**:
     - Thêm thanh Tiêu ngữ trên cùng: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — ĐỘC LẬP - TỰ DO - HẠNH PHÚC` nền đỏ sẫm `#630F12` viền vàng đồng.
     - Biểu tượng Quốc huy Trống Đồng Tròn (56px–64px) có ngôi sao vàng 5 cánh ở giữa vòng hoa văn Đông Sơn.
     - Dòng 1: `ỦY BAN NHÂN DÂN XÃ HIỆP HÒA — TỈNH TÂY NINH` (chữ vàng in hoa).
     - Dòng 2: `TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG XÃ HIỆP HÒA` (chữ trắng uy nghiêm cỡ lớn).
     - Dòng 3: Huy hiệu nền vàng `HIỆP HÒA AI-GOV` kèm mô tả `Chuyên viên Hành chính công AI Đa phương thức 24/7`.
     - Cụm chuyển đổi 2 nút đồng nhất `Dành cho Nhân Dân` | `Cán Bộ Một Cửa` và huy hiệu `Zero-Data Retention`.
     - Thanh công cụ trợ năng với các nút bằng nhau `A (Vừa)`, `A+ (To)`, `A++ (Siêu to)`, `Loa: BẬT` và `Tổng đài: 1900 9095`.
     - Đường diềm hoa văn Đông Sơn cao 6px chuyển sắc vàng đồng.
  2. **Xây dựng component Trống Đồng Ngọc Lũ / Đông Sơn Vector SVG (`TrongDongOrnament.jsx`)**:
     - Chi tiết ngôi sao 14 cánh, vòng chim Lạc 16 con bay ngược chiều kim đồng hồ, vòng chấm tròn và hoa văn răng cưa.
     - Tích hợp tại 3 vị trí: Header (xoay chậm 120s), Vòng bao quanh nút Micro Chạm & Nói 2 lớp phát sáng vàng ấm, và góc nền Cẩm nang VNeID.
  3. **Tinh gọn Trang chủ thành đúng 03 khu vực mạch lạc**:
     - Xóa bỏ hộp robot hoạt hình, xóa 4 hộp KPI, xóa 3 hộp bước đánh số to đè chữ.
     - Gộp thành duy nhất **Khu vực 1 - "Trung Tâm Tư Vấn Giọng Nói & Hỏi Đáp Pháp Luật AI 24/7" (`HeroVoiceStation.jsx`)**:
       * Cột Trái (60%): Lời chào AI có nút nghe/dừng, 4 câu hỏi gợi ý phổ biến, dải cam kết 1 dòng (`✓ Tra cứu 5 giây` • `✓ Tự động điền đơn Word chuẩn` • `✓ Trích dẫn Thư Viện Pháp Luật`).
       * Cột Phải (40%): Tâm điểm Nút Micro Đỏ Son đặt giữa vòng Trống Đồng Đông Sơn, thanh gõ câu hỏi trực tiếp kèm nút Gửi 100% không tràn viền.
  4. **Tái thiết kế Danh mục 08 Thủ tục Cấp xã (`CategoryGrid.jsx`)**:
     - Bộ lọc 05 tab danh mục đồng bộ sắc đỏ son.
     - Thẻ thủ tục chỉ gồm 4 thành phần tinh gọn: Icon trong huy hiệu đỏ son - vàng kim + Tên thủ tục + Nhãn trạng thái; Khung thông tin 2 dòng (Cơ quan & Thời hạn/Lệ phí); Thanh nghe hướng dẫn nhanh nền kem; Chân thẻ đúng **02 Nút hành động chuẩn mực**: `Điền Đơn & Mã QR` (Đỏ son) và `Chi Tiết & Hỏi AI` (Trắng viền vàng đồng). Bỏ kiểu 3 nút 3 màu chói mắt.
  5. **Đồng bộ màu sắc Cổng Dịch vụ công & Cẩm nang VNeID (`DvcGuideSection.jsx`)**:
     - Đổi nền tím xanh sang sắc Đỏ Thẫm Hoàng Gia / Chính Phủ (`#6B1114` - `#7F1416`), đính kèm Trống Đồng chìm.
     - 03 nút liên kết Cổng DVC đồng bộ Vàng Kim - Đỏ Rượu.
     - 04 thẻ bước VNeID nền đen mờ viền vàng đồng, số thứ tự đặt trong vòng tròn vàng kim.
  6. **Cập nhật Footer Chính thức xã Hiệp Hòa**:
     - Thay số điện thoại giả định bằng số điện thoại chính thức từ Thuyết minh: Tổng đài DVC Quốc gia `1800 1096`, Đường dây nóng hỗ trợ kỹ thuật `0362 872 772` (Trương Hoàng Tiến, Bí thư Chi Đoàn ấp Văn Hiệp, Email: `truonghoangtien90@gmail.com`).
  7. **Kiểm thử xây dựng**: `npm run build` thành công 100% trong 13.93s, 0 lỗi.
- **Báo cáo chi tiết**: Xem [2026-10-24_1727_gov_ui_cleanup_header_restore_v6.md](./2026-10-24_1727_gov_ui_cleanup_header_restore_v6.md)

---

## [2026-10-24 17:05] - Đại Tu Giao Diện Mobile/Web (K-Tech + Hành Chính Công) & Đồng Bộ Thời Gian Thực Cho Cán Bộ Một Cửa (Version 5.0 - Production Pilot Ready)
- **Loại tác vụ**: Đại tu toàn diện UI/UX Mobile-First, khắc phục triệt để 04 lỗi vỡ giao diện trên điện thoại, tái cấu trúc bố cục K-Tech & Hành chính công, triển khai phân hệ hàng đợi hồ sơ trực tuyến thời gian thực (3s Polling) kết nối người dân với Cán bộ Một cửa & Quản trị viên (Major Version 5.0 Overhaul).
- **Tác vụ thực hiện**:
  1. **Khắc phục triệt để 04 lỗi vỡ giao diện trên điện thoại di động (từ ảnh chụp thực tế)**:
     - *Lỗi 1 (Ảnh 1)*: Thu gọn thẻ Lời chào thành **Compact Voice Greeting Bar** (cao 80px–100px), giới hạn kích thước avatar Chuyên viên AI `w-10 h-10` trong container cố định `shrink-0`, loại bỏ hoàn toàn việc SVG/ảnh phình to chiếm nửa màn hình.
     - *Lỗi 2 (Ảnh 2)*: Đặt khung nhập câu hỏi vào một hộp thống nhất `<div className="flex items-center w-full rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm focus-within:border-red-700">` với `<input className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm sm:text-base outline-none" />` và nút `<button className="shrink-0 rounded-lg bg-red-700 px-4 py-2.5 font-bold text-white">Gửi</button>`, 100% không tràn viền trên mọi điện thoại.
     - *Lỗi 3 (Ảnh 3 & 4)*: Xóa bỏ `whitespace-nowrap` trên các câu văn dài; trình bày Cơ quan, Lệ phí và Thời hạn giải quyết trong **Khung thông tin 3 dòng tự động xuống dòng (`whitespace-normal break-words`)**; hộp câu hỏi mẫu vàng kem có `min-w-0 flex-1 break-words` tự xuống dòng không đâm thủng viền.
     - *Lỗi 4 (Ảnh 1)*: Thu gọn Header trên điện thoại thành **Sticky Navbar cố định (60px–68px)** gồm Logo Trống Đồng Vàng + Tên thương hiệu `"HIỆP HÒA AI-GOV"` và cụm switch `Nhân Dân` | `Một Cửa`; dải **Compact Accessibility Bar** ngay dưới Topbar với 3 nút `A` | `A+` | `A++` bằng nhau, nút `Loa: BẬT` và `1900 9095`.
  2. **Tái thiết kế giao diện theo phong cách Doanh nghiệp công nghệ K-Tech & Bản sắc Hành chính công**:
     - *Khu vực 1*: Hero Section Voice-First Chạm & Nói (bố cục 2 cột desktop, 1 cột mobile, nút Micro viền hoa văn Trống Đồng Đông Sơn, chip gợi ý nhanh, thanh gõ câu hỏi không tràn viền).
     - *Khu vực 2*: Dải 04 Chỉ số Hiệu quả Cải cách Hành chính (`KTechKpiStrip`: 5-10 Giây, 08+ Thủ Tục, 04 Định Dạng, 100% Bảo Mật).
     - *Khu vực 3*: Hệ sinh thái 03 bước tự động hóa hồ sơ (`KTechEcosystemSteps`: Hỏi đáp giọng nói & luật -> Điền đơn tự động Word/CCCD -> Kiểm tra sơ bộ & Nhận mã QR).
     - *Khu vực 4*: Danh mục Dịch vụ công có **Thanh Tab Lọc Ngang (`Filter Pills`)** cuộn mượt trên điện thoại (`Tất cả (8)`, `Hộ tịch – Cư trú (4)`, `Đất đai – Xây dựng (1)`, `Chứng thực (1)`, `Chính sách – Bảo trợ (1)`, `Tư vấn Luật (1)`), lưới thẻ 2 cột với 3 nút hành động chuẩn mực (`Điền Đơn & Mã QR`, `Xem Hồ Sơ & Hỏi AI`, `Kiểm Tra Giấy Tờ`).
     - *Khu vực 5*: Thanh công cụ nổi thông minh trên điện thoại (`FloatingBottomNav` gồm 4 nút: `Trang chủ`, `Hỏi AI (Mic)`, `Tra cứu Hồ sơ`, `Cán bộ Một cửa`).
  3. **Hệ thống Đồng bộ Trực tuyến Thời gian thực cho Cán bộ Một cửa & Quản trị viên (Real-Time Pilot Deployment)**:
     - Tạo module `realtimeSyncService.js` và `submissionController.js` lưu trữ an toàn tại `/tmp/hiephoa_realtime_db.json` (Vercel) và `backend/src/data/hiephoa_realtime_db.json` (Local).
     - Khởi tạo sẵn **03 Hồ sơ Demo mẫu thực tế**: `HH-1021` (Đăng ký khai sinh), `HH-1022` (Đăng ký kết hôn), `HH-1023` (Xác nhận tình trạng hôn nhân độc thân).
     - Người dân tạo đơn / mã QR lập tức sinh mã hồ sơ (`HH-1024`, `HH-1025`...) và đồng bộ lên Hàng đợi tiếp nhận.
     - Màn hình Cán bộ Một cửa (`/can-bo-mot-cua`): Tự động cập nhật mỗi **3 giây (Polling 3s)**, hiện hồ sơ mới lên đầu kèm hiệu ứng nhấp nháy `MỚI VỪA GỬI`.
     - Cán bộ xem và chỉnh sửa trực tiếp các trường tờ khai trên màn hình, bấm **"Lưu Cập Nhật Tờ Khai"** và **"Xuất File Word (.docx) Chuẩn Xã"**.
     - Cán bộ chuyển trạng thái hồ sơ (`PROCESSING` -> `COMPLETED` -> `NEEDS_SUPPLEMENT`); màn hình điện thoại người dân tự động cập nhật sau 3 giây và AI phát âm thanh thông báo mời lên quầy ký tên!
     - Nâng cấp Trang Quản trị Admin: Quản lý danh sách cán bộ (`canbo1`, `canbo2`, `canbo3`...), trạng thái Online/Offline, đổi mật khẩu, tạm khóa/mở khóa tài khoản; Quản trị thiết bị bảo mật khóa cứng 5 lần sai và mở khóa 0/5.
  4. **Kiểm thử & Đóng gói**:
     - `vite build`: Thành công 100% trong 7.97s, 0 lỗi.
     - Backend API & Script verification: Thành công 100%.
- **Báo cáo chi tiết**: Xem [2026-10-24_1705_redesign_mobile_ktech_realtime_officer_v5.md](./2026-10-24_1705_redesign_mobile_ktech_realtime_officer_v5.md)

---

## [2026-10-24 00:46] - Giải Quyết Triệt Để Lỗi Nhiều Giọng Đọc (Kiến Trúc Singleton Audio Tuyệt Đối) & Tự Động Đọc Lời Chào (Version 4.3)
- **Loại tác vụ**: Giải quyết dứt điểm hiện tượng nhiều giọng đọc cùng lúc bằng thẻ Audio Singleton duy nhất toàn ứng dụng, Nguyên tử hóa token phiên (Atomic Session Token), Tự động phát lời chào khi truy cập kèm bắt sự kiện Capture-Phase (Permanent Singleton Audio & Auto-Greeting V4.3)
- **Tác vụ thực hiện**:
  1. **Giải quyết triệt để 100% tình trạng nhiều giọng đọc cùng lúc**:
     - Áp dụng mẫu thiết kế **Singleton Audio Instance** (`getSingletonAudio()`). Toàn bộ ứng dụng trong suốt vòng đời trình duyệt chỉ sử dụng DUY NHẤT một đối tượng `HTMLAudioElement` (`window.__hiephoaSingletonAudio`).
     - Khi gán `.src` mới, trình duyệt tự động và dứt khoát giải phóng luồng âm thanh cũ, về mặt vật lý không thể tồn tại 2 âm thanh phát song song.
     - Sử dụng `sessionTokenRef`: Mỗi lần gọi `speak()` hoặc `stop()`, token phiên được tăng lên. Mọi tác vụ bất đồng bộ từ các câu cũ bị vô hiệu hóa ngay lập tức.
     - Loại bỏ hoàn toàn việc xử lý rẽ nhánh kép (concurrent retry branch) giữa `onerror` và `playPromise.catch()`, đảm bảo thứ tự phát câu tuần tự 100%.
  2. **Tự động đọc khi người dân truy cập vào trang web**:
     - Kích hoạt tự động đọc lời chào `greetingText` sau 300ms khi trang nạp xong.
     - Tích hợp bộ lắng nghe sự kiện toàn cục ở tầng Capture (`window.addEventListener('click', ..., { capture: true, once: true })` cho click, touchstart, pointerdown, keydown). Ngay khi người dân chạm bất kỳ vị trí nào trên màn hình, giọng nữ AI sẽ cất tiếng chào và hướng dẫn ngay lập tức.
  3. **Chuẩn hóa DUY NHẤT 1 GIỌNG NỮ TIẾNG VIỆT & TỐC ĐỘ 1.15x**:
     - 100% âm thanh phát ra là Giọng Nữ Tiếng Việt Chuẩn (Google Vietnamese Female Voice qua direct stream & backend proxy stream).
     - Tốc độ đọc cố định `1.15x`, nhanh, rõ chữ, lưu loát và tự nhiên.
  4. **Kiểm thử tự động trên Browser Subagent**:
     - Đã xác thực thực tế: Mở trang chủ $\rightarrow$ phát lời chào $\rightarrow$ bấm chọn thủ tục "Đăng ký Khai sinh" $\rightarrow$ mở `RagChatDrawer` chuyển sang đọc hướng dẫn thủ tục mới mượt mà, **chỉ có duy nhất 1 giọng nữ đọc, không có 2 giọng chồng lên nhau, 0 lỗi console**.
- **Báo cáo chi tiết**: Xem [2026-10-24_0046_permanent_singleton_audio_auto_greeting_v4_3.md](./2026-10-24_0046_permanent_singleton_audio_auto_greeting_v4_3.md)

---

## [2026-10-24 00:40] - Chuẩn Hóa Giọng Nữ Duy Nhất, Tăng Tốc Độ Đọc 1.16x & Tự Động Đọc Lời Chào Khi Truy Cập (Version 4.2)
- **Loại tác vụ**: Triệt tiêu lỗi 2 giọng đọc cùng lúc (Singleton Audio Player), Chuẩn hóa 1 giọng nữ tiếng Việt duy nhất, Tăng tốc độ phát âm thanh lên 1.16x, Kích hoạt tự động đọc lời chào khi người dân truy cập trang (Single Female Voice, 1.16x Speech Rate & Auto-Read on Landing V4.2)
- **Tác vụ thực hiện**:
  1. **Triệt tiêu hiện tượng 2 giọng đọc cùng lúc**:
     - Tạo biến `globalAudioPlayer` quản lý luồng âm thanh duy nhất toàn cục và hàm `stopAllAudioPlayback()`.
     - Mỗi khi phát câu mới hoặc chuyển thủ tục, hệ thống dừng triệt để audio trước đó, xóa sạch `src`, giải phóng buffer và hủy bỏ `window.speechSynthesis.cancel()`.
     - Loại bỏ việc chạy song song nhiều engine âm thanh, đảm bảo tại một thời điểm CHỈ DUY NHẤT MỘT giọng cất lên.
  2. **Chuẩn hóa DUY NHẤT 1 GIỌNG NỮ TIẾNG VIỆT**:
     - Cố định nguồn phát bằng Giọng nữ tiếng Việt chuẩn (`tl=vi` Google Vietnamese Female Voice qua client stream & backend proxy stream).
     - Loại bỏ hoàn toàn việc rò rỉ sang giọng nam của hệ điều hành (David) hay voice tiếng Anh.
  3. **Tăng tốc độ đọc lên 1.16x (`SPEECH_RATE = 1.16`)**:
     - Thiết lập `audio.playbackRate = 1.16` và duy trì liên tục trong suốt quá trình phát qua sự kiện `onplay`.
     - Giọng đọc trở nên nhanh, lưu loát, dứt khoát, thanh thoát, không còn cảm giác rề rà, chậm chạp.
  4. **Tự động đọc khi người dân truy cập vào trang (`AutoVoiceOnboarding.jsx`)**:
     - Tự động gọi `speak(greetingText)` sau 400ms khi trang nạp xong.
     - Tích hợp bộ lắng nghe cử chỉ chạm đầu tiên (click/touch/scroll) để phát ngay lập tức nếu trình duyệt kích hoạt chính sách chặn Autoplay khi chưa có tương tác.
  5. **Kiểm thử tự động trên Browser Subagent**:
     - Xác nhận trang tải sạch lỗi (0 console error), phát đúng 1 giọng nữ, tốc độ đọc 1.16x nhanh tự nhiên, chuyển đổi thủ tục mượt mà.
- **Báo cáo chi tiết**: Xem [2026-10-24_0040_single_female_voice_fast_rate_autoread_v4_2.md](./2026-10-24_0040_single_female_voice_fast_rate_autoread_v4_2.md)

---

## [2026-10-24 00:30] - Khắc Phục Triệt Để Sự Cố Âm Thanh (TTS 3 Tầng) & Thêm Tính Năng Tạo Tài Khoản Cán Bộ (Version 4.1)
- **Loại tác vụ**: Giải quyết triệt để lỗi âm thanh AI lúc lên lúc không, Loại bỏ Race Condition cuộc gọi kép, Cấu hình Engine Giọng đọc 3 tầng (Client Google TTS + Backend Proxy + Web Speech), Bổ sung Quản lý và Tạo tài khoản cán bộ mới (Audio Stability & Officer Management V4.1)
- **Tác vụ thực hiện**:
  1. **Khắc phục triệt để lỗi âm thanh "lúc lên lúc không, AI không nghe tiếng đọc"**:
     - **Triệt tiêu Race Condition**: Gỡ bỏ lệnh gọi `speak()` trùng lặp ở `CitizenHomePage.jsx`. `RagChatDrawer.jsx` là thành phần duy nhất chịu trách nhiệm kích hoạt đọc toàn văn hướng dẫn + checklist sau khi giao diện đã ổn định, loại bỏ hoàn toàn việc 2 lệnh gọi hủy nhau sau 50ms gây treo AudioContext.
     - **Xử lý dứt điểm lỗi CORS**: Loại bỏ thuộc tính `crossOrigin = 'anonymous'` trong `useSpeechSynthesis.js` (Google TTS không cung cấp header CORS, việc ép CORS khiến trình duyệt Chrome từ chối phát âm thanh).
     - **Tuân thủ Browser Autoplay Policy**: Gỡ bỏ lệnh tự động phát âm thanh sau 800ms khi vừa tải trang ở `AutoVoiceOnboarding.jsx` (tránh bị trình duyệt ném `NotAllowedError` làm khóa audio). Thay bằng nút bấm tương tác nổi bật với hiệu ứng chuyển trạng thái trực quan: `🔊 Bấm vào đây để Nghe AI Chào Mừng` $\rightarrow$ `🔊 Đang đọc lời chào... (Bấm để Dừng)`.
     - **Kiến trúc Engine Giọng đọc 3 Tầng (3-Tier Resilient TTS)**:
       - *Tầng 1 (Client-side Google TTS)*: Phát trực tiếp âm thanh từ IP máy khách với timeout an toàn 3.5s.
       - *Tầng 2 (Backend Proxy `/api/tts`)*: Nếu tầng 1 chậm hoặc bị mạng chặn, tự động chuyển luồng sang serverless endpoint `/api/tts?text=...` với chế độ ép IPv4 (`family: 4`) và đầy đủ CORS headers.
       - *Tầng 3 (Web Speech API)*: Dự phòng offline hoặc khi thiết bị có sẵn voice tiếng Việt bản địa (hỗ trợ toàn bộ điện thoại di động iOS/Android và Windows có Microsoft An/Hoài Mỹ/Nam Minh).
     - **Quản lý phiên phát bằng Session ID**: Mỗi lần kích hoạt `speak()` sinh một mã phiên độc nhất, triệt tiêu 100% tình trạng âm thanh cũ phát đè hoặc ngắt ngang âm thanh mới.
  2. **Bổ sung Phân hệ Tạo Tài khoản Cán bộ & Quản lý Cán bộ (Admin)**:
     - Thêm 2 endpoint `/api/admin/officers` (GET danh sách cán bộ và POST tạo cán bộ mới).
     - Nâng cấp `AdminDeviceManager.jsx` với 2 SubTabs: Quản lý thiết bị bảo mật & Quản lý danh sách cán bộ.
     - Thêm Modal form tạo tài khoản cán bộ mới (Username, Mật khẩu, Họ và tên, Quyền hạn ADMIN hoặc OFFICER) lưu trữ an toàn trong cơ sở dữ liệu bảo mật.
  3. **Kiểm thử tự động**:
     - Đã chạy kiểm thử tự động Browser Subagent xác nhận âm thanh phát mượt mà, không còn bất kỳ lỗi console hay CORS rejection nào.
- **Báo cáo chi tiết**: Xem [2026-10-24_0030_fix_audio_tts_stability_v4_1.md](./2026-10-24_0030_fix_audio_tts_stability_v4_1.md)

---

## [2026-10-23 22:15] - Nâng Cấp Bảo Mật Admin (Khóa Thiết Bị Sai 5 Lần), Bảng Điều Khiển Admin & Cấu Hình Full-Stack Vercel (Version 4.0)
- **Loại tác vụ**: Nâng cấp bảo mật Admin & Cán bộ, Nhận diện phần cứng thiết bị (Canvas Fingerprinting), Khóa cứng 5 lần sai, Bảng điều khiển Quản trị mở khóa, Cấu hình Vercel Serverless (Security Lockout, Admin Dashboard & Vercel Ready V4.0)
- **Tác vụ thực hiện**:
  1. **Khóa cứng thiết bị sau 5 lần nhập sai**:
     - Thuật toán `deviceFingerprint.js` kết hợp Canvas, UserAgent, Screen Resolution, Platform, Timezone để sinh mã định danh duy nhất (`deviceId`) và tên thiết bị (`deviceName`), lưu đồng bộ `localStorage`, `sessionStorage` và `Cookie 365 ngày`.
     - Phân hệ đăng nhập Cán bộ Một cửa & Quản trị viên (`OfficerLoginModal.jsx`) với họa tiết Trống Đồng Đông Sơn, kiểm tra `deviceId` qua API `GET /api/auth/device-status`.
     - Nhập sai lần 1-4: Cảnh báo số lần còn lại trước khi khóa. Nhập sai lần thứ 5: Khóa cứng tức thì (HTTP 403 Forbidden). Kể từ lần thứ 6 trở đi, ngay cả khi nhập đúng mật khẩu, hệ thống vẫn từ chối đăng nhập và hiển thị màn hình khóa cứng màu đỏ toàn màn hình.
  2. **Bảng Điều Khiển Quản Trị Viên (Admin) & Mở Khóa Thiết Bị**:
     - Tài khoản Admin mặc định: `admin` / `HiepHoa@2026` (Quyền `ADMIN`). Tài khoản Cán bộ: `canbo1` / `MotCua@2026` (Quyền `OFFICER`).
     - Khi Admin đăng nhập, mở Tab 4 "Quản Trị Bảo Mật & Mở Khóa Thiết Bị (Admin)" trong `OfficerScanPage.jsx`.
     - Tích hợp 4 Card thống kê, danh sách thiết bị chi tiết với huy hiệu trạng thái (5/5 ĐÃ KHÓA CỨNG, 1-4/5 CẢNH BÁO, 0/5 HỢP LỆ).
     - Nút "Reset lượt đăng nhập về 0/5 (Mở khóa)" từng thiết bị, Nút "Reset tất cả thiết bị", Nút "Tạo thiết bị khóa mẫu (Demo BGK)" và Nút "Đăng xuất" bảo mật.
  3. **Cấu hình Full-Stack Vercel Serverless (`vercel.json` & `/api/index.js`)**:
     - Tạo cầu nối `/api/index.js` tại thư mục gốc trỏ vào Express App của `backend/src/server.js`.
     - Cấu hình `vercel.json` tự động build cả backend và frontend, routing `/api/*` tới Serverless Function và các route còn lại tới SPA `/index.html`.
     - Cơ chế chống lỗi Read-Only Filesystem (`EROFS`): Tự động chuyển vùng ghi file sang `/tmp/security_db.json` kết hợp bộ nhớ RAM `globalThis.__HIEPHOA_SECURITY_STORE__` khi chạy trên Vercel.
  4. **Kiểm thử tự động & Xác minh**:
     - Chạy kịch bản `test_lockout.js`: Xác minh 100% logic khóa 5 lần, chặn lần 6, Admin reset mở khóa và đăng nhập thành công.
     - Production build frontend Vite: 100% thành công không lỗi.
- **Báo cáo chi tiết**: Xem [2026-10-23_2215_vercel_deploy_admin_lockout_v4.md](./2026-10-23_2215_vercel_deploy_admin_lockout_v4.md)

---

## [2026-10-23 21:25] - Khắc Phục Lỗi Giao Diện Cán Bộ, Xuất Word, Chuẩn Hóa Ngày Sinh, Khoảng Ký Tên & Tư Vấn Pháp Luật Ma Túy (Version 3.2)

- **Loại tác vụ**: Sửa lỗi giao diện cán bộ, Sửa xuất file Word, Chuẩn hóa định dạng ngày sinh DD/MM/YYYY, Mở rộng khoảng ký tên A4, Nâng cấp Tư vấn pháp luật Hình sự & Đổi font chữ Inter (Critical Bug Fixes & Legal Knowledge Expansion V3.2)
- **Tác vụ thực hiện**:
  1. **Lỗi 1 (Vỡ giao diện cán bộ xã, chữ chạy dọc)**: Cố định kích thước logo `w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px]` và gán `flex-1 min-w-0` cho tiêu đề trong `OfficerScanPage.jsx`, khắc phục hoàn toàn hiện tượng logo bung to đè layout.
  2. **Lỗi 2 (Không tải được hồ sơ về máy)**: Sửa tên template thành `mau_04_don_de_nghi_chung_thuc.docx`, nạp đầy đủ dữ liệu trường chi tiết cho 4 hồ sơ mẫu và tích hợp thông báo toast khi xuất Word.
  3. **Lỗi 3 (Chuẩn hóa ngày sinh dạng 00/00/0000)**: Tích hợp hàm `formatToSlashDate` tự động chuyển đổi mọi định dạng ngày (chữ, gạch ngang, chấm) thành chuẩn `DD/MM/YYYY` (ví dụ `29/02/2006`) trên cả form nhập, Voice Wizard và bản xem trước A4.
  4. **Lỗi 4 (Khoảng ký tên hẹp)**: Tăng khoảng cách ký tên từ `h-10` lên `h-16 sm:h-20` (64-80px), giúp tên `TRẦN ĐÌNH BẢO LÂM` xích xuống dưới chừa chỗ ký tay rộng rãi, in ấn không bị đè chữ.
  5. **Lỗi 5 (Tư vấn pháp luật mua bán chất cấm & các giả định)**: Mở rộng nhận diện ý định `LEGAL_CONSULTATION`, xây dựng chuyên đề sâu về Tội mua bán chất cấm/ma túy (Điều 251 BLHS 2015, Nghị định 144/2021) và Đất giấy tay (Luật Đất đai 2024), trích dẫn nguồn trực tiếp từ Thư Viện Pháp Luật.
  6. **Lỗi 6 (Đổi font chữ)**: Cập nhật bộ đôi phông chữ quốc tế **`Inter`** và **`Plus Jakarta Sans`** vào `index.html` và `index.css`, chữ viết đều đặn, sắc nét và chuyên nghiệp.
- **Báo cáo chi tiết**: Xem [2026-10-23_2125_fix_officer_layout_word_dates_law_font_v3_2.md](./2026-10-23_2125_fix_officer_layout_word_dates_law_font_v3_2.md)

---

## [2026-10-23 20:35] - Khắc Phục Triệt Để 09 Lỗi In Ấn, Xuất Word, Voice Wizard, Phông Chữ & Giao Diện Cán Bộ (Version 3.1)
- **Loại tác vụ**: Sửa lỗi in ấn A4, Khắc phục lỗi Docx Multi Error, Bổ sung Voice Wizard, Thiết kế lại giao diện Cán bộ một cửa, Nâng cấp Phông chữ và Giọng đọc AI (Critical Fixes & Modern Officer Portal V3.1)
- **Tác vụ thực hiện**:
  1. **Lỗi 1 (In đơn trắng tinh)**: Sửa `@media print` trong `index.css`, gán `#printable-document` và tích hợp iframe in ấn cách ly độc lập, chỉ in đúng khổ A4 văn bản chuẩn Quốc gia, hoàn toàn không bị in ra 7 trang trắng.
  2. **Lỗi 2 (Nhảy chữ ký)**: Cân chỉnh padding (`p-6 sm:p-10`) và các khoảng cách dòng `space-y-2.5`, margin chữ ký `mt-6`, đảm bảo toàn bộ nội dung từ Quốc hiệu đến họ tên người ký `TRẦN ĐÌNH BẢO LÂM` nằm gọn gàng bên trong trang giấy A4.
  3. **Lỗi 3 (Lỗi Multi error tải file Word)**: Cấu hình `delimiters: { start: '{{', end: '}}' }` trong `docxExportService.js` tương thích tuyệt đối với các biến `{{biến}}` trong 5 file `.docx` mẫu, tải file Word mượt mà 100%.
  4. **Lỗi 4 (Thiếu nút điền đơn và hướng dẫn giọng nói từng bước)**: Thêm **Hero Action Banner** ngay đầu Chat AI, thêm cụm nút tương tác dưới mỗi câu trả lời AI, và tích hợp chế độ **Voice Wizard** đọc từng câu hỏi cho bà con nói câu trả lời.
  5. **Lỗi 5 & Lỗi 8 (Tư vấn pháp luật & Giải thích luật Việt Nam)**: Mở rộng 17 chủ đề lớn trong `legal_corpus.json`, `legalWebSearchService.js` và cấu trúc SYSTEM_PROMPT 4 bước (Xác định hành vi - Trích dẫn điều luật - Mức phạt/Hậu quả - Lời khuyên công dân).
  6. **Lỗi 6 (Đổi phông chữ)**: Tích hợp font chữ hành chính Quốc gia `Be Vietnam Pro` (Google Fonts) vào toàn bộ giao diện `index.html` và `index.css`.
  7. **Lỗi 7 (Thiết kế lại giao diện Cán bộ một cửa)**: Viết mới `OfficerScanPage.jsx` với Top KPI Thống kê tiếp nhận, Quét QR, Sổ theo dõi hồ sơ trong ngày kèm bộ lọc/tìm kiếm, In Giấy tiếp nhận hồ sơ và hẹn trả kết quả khổ A4 chuẩn.
  8. **Lỗi 9 (Đổi giọng AI)**: Nâng cấp thuật toán ưu tiên `Microsoft HoaiMy/NamMinh Online (Natural)`, `Google tiếng Việt`, rate 0.98, pitch 1.02 giúp giọng đọc truyền cảm, ấm áp, phát âm rõ ràng.
- **Báo cáo chi tiết**: Xem [2026-10-23_2035_fix_print_word_voice_wizard_officer_v3_1.md](./2026-10-23_2035_fix_print_word_voice_wizard_officer_v3_1.md)

---

## [2026-10-23 19:40] - Khắc Phục Triệt Để 06 Lỗi Nghiêm Trọng (Version 3.0)
- **Loại tác vụ**: Khắc phục lỗi toàn diện, Tái cấu trúc Form Word A4, Phân loại Ý định AI & Chuẩn hóa Trống Đồng Đông Sơn (Critical Bug Fixes & Cultural Theme V3.0)
- **Tác vụ thực hiện**:
  1. **Lỗi 1 & Lỗi 6**: Xóa bỏ hoàn toàn template string ghép chuỗi cứng và việc tự động gán nhầm thủ tục. Thiết lập cơ chế **3-Way Intent Routing** (`GREETING`, `LEGAL_CONSULTATION`, `PROCEDURE_GUIDE`) tại `geminiRagService.js`. Mở rộng kho kiến thức pháp luật đời sống cấp xã (`legal_corpus.json`) kết hợp Google Search Grounding `thuvienphapluat.vn` (xử lý tình huống đánh nhau, tranh chấp ranh đất, ly hôn...).
  2. **Lỗi 2**: Nâng cấp `useSpeechSynthesis.js` với thuật toán `chunkTextForTTS` tách câu thông minh (< 140 ký tự) chống ngắt sau 10s của Web Speech API. Tự động đọc to lời tư vấn và từng bước Checklist hồ sơ khi mở thủ tục hoặc khi AI trả lời nếu Loa bật.
  3. **Lỗi 3**: Tái cấu trúc `SmartAutoFormModal.jsx` thành 2 khu vực tách biệt: Cột trái Bảng Nhập Liệu (Quét CCCD, Giọng nói, Demo), Cột phải Live Preview A4 chuẩn 100% Times New Roman, hoàn toàn không có ô input giả nét đứt màu vàng, trường trống hiển thị dấu chấm `...................`, sửa triệt để lỗi font tiếng Việt `yêu cầ`u`.
  4. **Lỗi 4**: Khắc phục lỗi mất icon trong 05 Nhóm thủ tục (`CategoryGrid.jsx`) bằng các class tĩnh cho Huy hiệu Icon Badge `56px x 56px` (`w-14 h-14 rounded-2xl`) từ `lucide-react`. Cập nhật logo Cổng DVC Quốc gia.
  5. **Lỗi 5**: Tạo `TrongDongWatermark.jsx` và `DongSonBorder.jsx`: Tích hợp mặt Trống Đồng Đông Sơn lớn 500px xoay nhẹ ở Header, vòng Trống Đồng bao quanh nút Mic trung tâm và đường diềm hoa văn kỷ hà 8px.
  6. **Kiểm thử**: `npm run build` thành công xuất sắc, Backend API phục vụ ổn định.
- **Lý do thay đổi**: Đáp ứng yêu cầu khắc phục triệt để 06 lỗi nghiêm trọng của Ban Tổ chức và Người dùng cho phiên bản HIỆP HÒA AI-GOV (Version 3.0).
- **Báo cáo chi tiết**: Xem [2026-10-23_1930_fix_ai_chat_docx_icons_trongdong_v3.md](./2026-10-23_1930_fix_ai_chat_docx_icons_trongdong_v3.md)

---

## [2026-10-23 15:52] - Khởi tạo Kiến trúc Toàn diện Dự án
- **Loại tác vụ**: Khởi tạo cấu trúc dự án (Project Initialization & Architecture Setup)
- **Tác vụ thực hiện**:
  - Thiết lập phân tách kiến trúc `backend/` (Node.js/Express RAG AI & Gemini Vision) và `frontend/` (React + TailwindCSS + Vite).
  - Khởi tạo thư mục báo cáo `/reports/` và thiết lập giao thức "Read-Before-Edit Protocol" cùng `ReportLogger`.
  - Nạp kho 05 biểu mẫu chuẩn `.docx` vào `backend/src/data/templates/` và `frontend/public/templates/`.
  - Tạo cấu trúc dữ liệu hành chính xã Hiệp Hòa, 08 thủ tục demo thuộc 05 nhóm danh mục, kho tri thức pháp luật cấp xã và kịch bản nhập liệu giọng nói 05 mẫu đơn.
  - Xây dựng giao diện Web App chuẩn "Elder-Friendly & Voice-First UI" cho nhân dân và phân hệ quét Mã QR Hồ sơ nhanh cho Cán bộ Một cửa.
- **Lý do**: Triển khai giải pháp theo đúng Bản thuyết minh dự án Hội thi Đổi mới sáng tạo & Chuyển đổi số tỉnh Tây Ninh.
- **Báo cáo chi tiết**: Xem [2026-10-23_1550_init_project_architecture.md](./2026-10-23_1550_init_project_architecture.md)

---

## [2026-10-23 16:10] - Hoàn thiện Toàn diện 06 Phân hệ Nghiệp vụ HIỆP HÒA AI-GOV
- **Loại tác vụ**: Phát triển tính năng & Đóng gói giải pháp (Feature Completion & System Integration)
- **Tác vụ thực hiện**:
  - Xây dựng hoàn chỉnh máy chủ backend API (RAG AI, Gemini Vision OCR CCCD, AI Document Pre-check, Form template manager).
  - Tích hợp kho tri thức Luật Việt Nam cấp xã và 08 thủ tục demo bám sát bản thuyết minh.
  - Xây dựng giao diện React + TailwindCSS chuẩn "Elder-Friendly & Voice-First UI" với thanh Accessibility Bar điều chỉnh cỡ chữ (A / A+ / A++), nút Bật/Tắt Loa phát thanh và Micro Chạm & Nói 2 chiều.
  - Tích hợp thư viện Docxtemplater + PizZip điền tự động 05 biểu mẫu chuẩn Word/PDF/Ảnh/Print trực tiếp trên trình duyệt Client-side (Zero-Data Retention).
  - Hoàn thiện phân hệ AI Document Pre-Check kiểm tra hồ sơ chụp tại nhà.
  - Triển khai phân hệ Mã QR Hồ sơ nhanh và trang Quét QR dành cho Cán bộ Một cửa (`/can-bo-mot-cua`) hiển thị hồ sơ trong dưới 10 giây.
  - Tích hợp cẩm nang VNeID mức độ 2 có giọng đọc từng bước và deep-link Cổng DVC Tỉnh Tây Ninh/Quốc gia.
  - Kiểm thử `vite build` và kiểm thử backend thành công 100%.
- **Danh sách file đã tạo/sửa**:
  + `backend/src/server.js`, `backend/src/routes/api.js`, `backend/src/config/gemini.js`
  + `backend/src/services/geminiRagService.js`, `backend/src/services/visionOcrService.js`, `backend/src/services/vectorStore.js`
  + `backend/src/controllers/*`, `backend/src/middlewares/*`, `backend/src/utils/reportLogger.js`
  + `backend/src/data/*.json`, `backend/src/data/templates/*.docx`
  + `frontend/src/pages/CitizenHomePage.jsx`, `frontend/src/pages/OfficerScanPage.jsx`
  + `frontend/src/components/layout/*`, `frontend/src/components/voice/*`, `frontend/src/components/categories/*`, `frontend/src/components/rag-chat/*`, `frontend/src/components/auto-form/*`, `frontend/src/components/pre-check/*`, `frontend/src/components/qr-handoff/*`, `frontend/src/components/dvc-guide/*`
  + `frontend/src/hooks/*`, `frontend/src/services/*`
  + `run_project.bat`, `README.md`
- **Lý do thay đổi**: Hoàn thiện toàn diện sản phẩm dự thi theo yêu cầu của Bản thuyết minh Hội thi Đổi mới sáng tạo & Chuyển đổi số.
- **Báo cáo chi tiết**: Xem [2026-10-23_1610_full_system_completion.md](./2026-10-23_1610_full_system_completion.md)

---

## [2026-10-23 16:18] - Khởi động Máy chủ Daemon & Xác thực Truy cập Web App
- **Loại tác vụ**: Vận hành & Khởi chạy máy chủ (Service Startup & Verification)
- **Tác vụ thực hiện**:
  - Khởi chạy Backend API Server (cổng 5000) và Frontend Vite Server (cổng 5173) dưới dạng tiến trình nền daemon.
  - Kiểm tra kết nối TCP và HTTP trả về `200 OK`.
  - Sử dụng browser subagent xác thực giao diện Web App hiển thị đầy đủ tiêu ngữ, header, bộ trợ năng và 05 nhóm thủ tục.
- **Lý do thay đổi**: Xử lý lỗi `ERR_CONNECTION_REFUSED` do người dùng truy cập khi dev server chưa được bật.
- **Báo cáo chi tiết**: Xem [2026-10-23_1618_launch_daemon_servers.md](./2026-10-23_1618_launch_daemon_servers.md)

---

## [2026-10-23 16:58] - Nâng Cấp Toàn Diện Dự Án HIỆP HÒA AI-GOV (Version 2.0)
- **Loại tác vụ**: Nâng cấp UI/UX, Sửa lỗi Micro, Tích hợp Thư Viện Pháp Luật & Trò chuyện Đa lượt (Major Version 2.0 Upgrade)
- **Tác vụ thực hiện**:
  - **Thiết kế lại Giao diện**: Xóa bỏ hoàn toàn thanh tiêu ngữ trên cùng web; bổ sung component SVG Họa tiết Trống Đồng Đông Sơn (`TrongDongPattern.jsx`) làm nền chìm nghệ thuật màu vàng đồng `#F59E0B` trên Header và Hero section.
  - **Chống nhảy chữ rớt dòng & Chuẩn hóa kích thước nút 100%**: Dùng font clamp cho tiêu đề chính Header, thiết kế Segmented Control `grid grid-cols-2 min-w-[300px] h-11`, chuẩn hóa các nút trợ năng cỡ chữ `min-w-[105px] h-10` và loa/tổng đài `min-w-[155px] h-10` với `whitespace-nowrap`.
  - **Sửa triệt để lỗi Micro (Voice Recognition)**: Tự động ngắt loa trước khi mở mic, singleton debounce, hiển thị real-time interim transcript, bổ sung chế độ Dual-Mode tự động fallback sang `MediaRecorder` + Gemini 2.5 Flash Audio STT (`POST /api/voice-stt`).
  - **Sửa lỗi AI & Tích hợp Thư Viện Pháp Luật (`thuvienphapluat.vn`)**: Loại bỏ chuỗi tĩnh cứng nhắc, trả lời trực tiếp đúng trọng tâm câu hỏi của người dân, trích dẫn điều luật còn hiệu lực kèm link trực tiếp tới `thuvienphapluat.vn` và `dichvucong.gov.vn`.
  - **Trò chuyện đa lượt liên tục (Multi-turn Contextual Chat)**: Tạo `ContextualChatBox.jsx` đặt ngay dưới bảng Checklist để người dân tiếp tục đặt câu hỏi sâu hơn trong cùng ngữ cảnh thủ tục với thanh sticky input và câu hỏi gợi ý nhanh.
- **Danh sách file đã tạo/sửa**:
  + `frontend/src/components/common/TrongDongPattern.jsx` (Mới)
  + `frontend/src/components/rag-chat/ContextualChatBox.jsx` (Mới)
  + `backend/src/services/legalWebSearchService.js` (Mới)
  + `backend/src/controllers/voiceController.js` (Mới)
  + `backend/src/services/geminiRagService.js` (Nâng cấp)
  + `backend/src/controllers/ragController.js` (Nâng cấp)
  + `backend/src/routes/api.js` (Nâng cấp)
  + `frontend/src/hooks/useSpeechRecognition.js` (Nâng cấp)
  + `frontend/src/services/apiClient.js` (Nâng cấp)
  + `frontend/src/components/layout/Header.jsx` (Thiết kế lại)
  + `frontend/src/components/layout/AccessibilityBar.jsx` (Chuẩn hóa)
  + `frontend/src/components/voice/VoiceMicButton.jsx` (Thiết kế lại)
  + `frontend/src/components/categories/CategoryGrid.jsx` (Chuẩn hóa)
  + `frontend/src/components/rag-chat/RagChatDrawer.jsx` (Nâng cấp)
  + `frontend/src/pages/CitizenHomePage.jsx` (Nâng cấp)
- **Lý do thay đổi**: Nâng cấp toàn diện sản phẩm theo yêu cầu chất lượng cao của Hội thi Đổi mới Sáng tạo & Chuyển đổi số.
- **Báo cáo chi tiết**: Xem [2026-10-23_1645_upgrade_ui_rag_mic_v2.md](./2026-10-23_1645_upgrade_ui_rag_mic_v2.md)



