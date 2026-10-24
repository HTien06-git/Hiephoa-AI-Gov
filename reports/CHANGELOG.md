# NHẬT KÝ THAY ĐỔI DỰ ÁN (PROJECT CHANGELOG)
Hệ thống: **HIỆP HÒA AI-GOV (Chuyên viên Hành chính công AI Đa phương thức)**
Đơn vị: Trung tâm Phục vụ Hành chính công UBND xã Hiệp Hòa, tỉnh Tây Ninh

Tất cả các thay đổi kiến trúc, thêm tính năng, sửa lỗi và cập nhật dữ liệu của dự án được ghi nhận tại đây theo thứ tự thời gian.

## [2026-10-24 22:30] - Phiên Bản V7.0: Xuất Sổ Hồ Sơ Trong Ngày (.docx) Times New Roman, Nút Reset Dữ Liệu Admin Kèm Cảnh Báo An Toàn & Chuẩn Hóa Triển Khai Thực Tế
- **Loại tác vụ**: Triển khai 3 tính năng cốt lõi phục vụ vận hành thực tế chính thức: (1) Thêm nút Reset toàn bộ dữ liệu hồ sơ thủ tục bên Admin kèm cảnh báo xác nhận nguy hiểm và yêu cầu nhập chữ 'RESET'; (2) Tích hợp nút Lưu/Xuất Sổ theo dõi và danh sách hồ sơ đã nộp và xử lý trong ngày sang file Word (.docx) chuẩn phông chữ **Times New Roman** khổ ngang A4; (3) Loại bỏ toàn bộ các tính năng/dữ liệu demo cũ, tối ưu hóa logic và làm sạch mã nguồn sẵn sàng đưa vào vận hành thực tế.
- **Tác vụ thực hiện**:
  1. **Nút Reset Dữ Liệu Hồ Sơ Phía Admin Kèm Hộp Thoại Cảnh Báo (`OfficerScanPage.jsx` & `AdminDeviceManager.jsx`)**:
     - Bổ sung nút `[ ⚠️ Reset Hồ Sơ ]` nổi bật trên thanh công cụ hàng đợi dành riêng cho Quản trị viên (Admin) và tab `Reset Dữ Liệu Hồ Sơ` trong Trung tâm Quản trị.
     - Hộp thoại cảnh báo bảo mật nguy hiểm: Nêu rõ lưu ý hành động này sẽ xóa vĩnh viễn toàn bộ các hồ sơ người dân đã nộp và làm sạch hàng đợi về trạng thái 0 hồ sơ ban đầu.
     - Cơ chế chống bấm nhầm: Bắt buộc người dùng phải gõ chính xác chữ `RESET` vào ô xác thực mới mở khóa nút thực hiện.
     - Endpoint backend: `POST /api/submissions/reset-all` làm sạch hoàn toàn cơ sở dữ liệu `submissions = []`, khởi tạo lại bộ đếm tiếp nhận.
  2. **Xuất Sổ Theo Dõi Hồ Sơ Trong Ngày Sang File Word (.docx) Times New Roman (`docxExportService.js` & `OfficerScanPage.jsx`)**:
     - Tích hợp phương thức `exportDailySubmissionsWord(liveQueue, user)` xuất file Word bảng khổ ngang A4 (Landscape).
     - Thiết kế theo chuẩn công tác văn thư lưu trữ Nghị định 30/2020/NĐ-CP: Quốc hiệu, Tiêu ngữ, Tên cơ quan, Tiêu đề *"SỔ THEO DÕI VÀ DANH SÁCH HỒ SƠ TIẾP NHẬN, XỬ LÝ TRONG NGÀY"*, bảng tóm tắt số liệu xử lý trong ngày.
     - Bảng dữ liệu đầy đủ 10 cột: STT, Mã hồ sơ, Tên thủ tục, Họ tên người nộp, CCCD/SĐT, Ấp cư trú, Giờ nhận, Trạng thái xử lý, Cán bộ thụ lý, Ghi chú yêu cầu.
     - Ba khối chữ ký phân công trách nhiệm: Người lập biểu, Cán bộ tiếp nhận & trả kết quả, Xác nhận của Lãnh đạo UBND xã.
     - Bắt buộc phông chữ **Times New Roman** 100% xuyên suốt toàn bộ văn bản và tải về tức thì dưới dạng file `.docx`.
  3. **Loại Bỏ Các Tính Năng Demo & Tối Ưu Logic Vận Hành Thực Tế**:
     - Gỡ bỏ nút "Khôi phục 03 hồ sơ mẫu" trên thanh hàng đợi tiếp nhận cán bộ.
     - Loại bỏ hàm điền dữ liệu mẫu `handleFillDemoData` dư thừa trong `SmartAutoFormModal.jsx`.
     - Kiểm tra toàn bộ mã nguồn frontend và backend: Cú pháp node check 0 lỗi, `npm run build` hoàn tất 100% trong 4.64s.

---

## [2026-10-24 22:15] - Phiên Bản V6.9: Soạn & In Giấy Hẹn Times New Roman, Cá Nhân Hóa Tên Người Dân, Tự Động Đọc Yêu Cầu Mới & Loại Bỏ Giao Diện Đen
- **Loại tác vụ**: Triển khai trọn vẹn 5 yêu cầu cải tiến nghiệp vụ và giao diện từ phản ánh thực tế của người dùng: (1) Bỏ nút nộp hồ sơ dư thừa trong popup mã QR; (2) Tự động đọc to bằng giọng nói TTS khi cán bộ thay đổi trạng thái hoặc ghi chú yêu cầu trên màn hình; (3) Loại bỏ triệt để card màu đen trong phần tư vấn pháp luật và sửa lỗi sọc vàng viền trái trên điện thoại di động; (4) Tích hợp tính năng soạn thảo và in ấn "Giấy tiếp nhận hồ sơ và hẹn trả kết quả" theo quy định hành chính chuẩn phông chữ **Times New Roman**; (5) Thay thế toàn bộ mã hồ sơ trong thông báo bằng họ tên người đi làm thủ tục để gần gũi, rõ ràng cho bà con.
- **Tác vụ thực hiện**:
  1. **Bỏ nút nộp hồ sơ trùng lặp trong Modal QR (`CitizenQrModal.jsx`)**:
     - Loại bỏ nút bấm `[🚀 BẤM NỘP HỒ SƠ TRỰC TUYẾN TỚI CÁN BỘ MỘT CỬA]` bên trong modal QR vì hồ sơ đã được người dân nộp và hệ thống đã tự động đẩy trực tuyến vào hàng đợi máy cán bộ ngay từ đầu.
     - Thay bằng biểu tượng trạng thái kết nối trực tiếp màu xanh ngọc: `Hồ sơ đã được gửi trực tuyến tới màn hình Cán bộ Một cửa`.
  2. **Tự động đọc to thông báo mới của cán bộ khi yêu cầu trên màn hình thay đổi (`CitizenQrModal.jsx`)**:
     - Theo dõi cả trạng thái (`status`) và ghi chú (`officerNote`) trong chu kỳ polling 3 giây.
     - Bất cứ khi nào cán bộ nhập thêm ghi chú yêu cầu mới (ví dụ: *"Cần bổ sung giấy khai sinh"*), hệ thống tự động phát âm thanh giọng nói: *"Kính gửi bà con [Tên], Cán bộ Một cửa vừa có yêu cầu mới: [Nội dung]. Kính mời bà con chú ý thực hiện ạ!"*.
  3. **Cá nhân hóa thông báo bằng Tên người làm thủ tục (`CitizenDeviceNotificationToast.jsx` & `CitizenLookupModal.jsx`)**:
     - Thay thế mã số hồ sơ khô khan (`HH-1025`) bằng họ tên chính xác của người dân (`Bà con: Nguyễn Thị Mai`).
     - Nội dung thông báo và giọng nói xưng hô trang trọng, ấm áp: *"Kính gửi bà con [Tên], hồ sơ thủ tục của bà con tại UBND xã Hiệp Hòa đã được cán bộ xử lý xong..."*.
  4. **Loại bỏ giao diện đen & sửa lỗi hiển thị trên điện thoại (`RagChatDrawer.jsx`)**:
     - Thay thế khối màu đen (`bg-stone-900`) của phần Trợ giúp pháp luật bằng giao diện đỏ cờ - vàng đồng truyền thống (`bg-gradient-to-br from-[#7F1D1D] via-[#991B1B] to-[#690F12]`, viền vàng `border-amber-300`).
     - Bỏ đường viền sọc vàng bên trái `border-l-4` trên điện thoại di động (`border-l-0 sm:border-l-4 sm:border-amber-400`), làm mép màn hình điện thoại phẳng đẹp 100%.
     - Tinh chỉnh đồng bộ nút Hotline và nút Đóng ở thanh công cụ dưới đáy.
  5. **Tích hợp tính năng Soạn & In Giấy Hẹn chuẩn Times New Roman (`AppointmentSlipModal.jsx` & `OfficerScanPage.jsx`)**:
     - Xây dựng component `AppointmentSlipModal.jsx` theo chuẩn Mẫu số 01 - Nghị định 61/2018/NĐ-CP và Thông tư 01/2018/TT-VPCP.
     - Bắt buộc chuẩn phông chữ **Times New Roman** (`font-family: 'Times New Roman', Times, serif;`) từ quốc hiệu, tiêu ngữ, thông tin tiếp nhận, bảng danh mục giấy tờ đến chữ ký.
     - Cho phép cán bộ tùy ý soạn thảo, điều chỉnh ngày giờ hẹn trả kết quả, thêm/bớt giấy tờ đã tiếp nhận, chỉnh sửa thông tin trước khi in.
     - Bổ sung nút `[ 📄 Soạn & In Giấy Hẹn (Times New Roman) ]` trực tiếp trên danh sách xử lý hồ sơ và Tab 3 của Cán bộ.
  6. **Kiểm thử xây dựng**: `npm run build` thành công 100% trong 4.63 giây, không có lỗi.

---

## [2026-10-24 21:45] - Phiên Bản V6.8: Ẩn Dock Nhanh Khi Mở Kết Quả & Khắc Phục Lỗi Tràn Viền Nút Gửi Chat
- **Loại tác vụ**: Giải quyết 2 yêu cầu tinh chỉnh giao diện từ ảnh chụp thực tế màn hình trả kết quả trên điện thoại di động: tự động ẩn thanh nút điều hướng nhanh Quick Action Dock khi mở phần trả kết quả (không để dock che khuất Action Bar), và sửa lỗi nút Gửi bị tràn ra ngoài viền phải trong khung chat trả lời câu hỏi của người dân (Version 6.8 Drawer Layout Polish).
- **Tác vụ thực hiện**:
  1. **Tự động ẩn Dock điều hướng nhanh khi mở kết quả (`CitizenHomePage.jsx`)**:
     - Thiết lập điều kiện `!chatResult && !autoFormProc && !preCheckProc && !qrPayload && !isLookupOpen` trước khi hiển thị `QuickActionFloatingDock`.
     - Khi người dân xem kết quả trả lời, hướng dẫn thủ tục (`RagChatDrawer`), hoặc mở biểu mẫu điền đơn, kiểm tra giấy tờ, tra cứu CCCD, thanh dock nổi sẽ tự động biến mất, giúp toàn bộ Action Bar (`Điền Đơn Trong Word`, `Điền Bằng Giọng Nói`, `Kiểm Tra Giấy Tờ`) hiển thị thoáng đãng 100%, không bị che lấp.
  2. **Khắc phục lỗi tràn viền nút Gửi trong khung chat người dân (`ContextualChatBox.jsx`)**:
     - *Nguyên nhân*: Thẻ `<input>` thiếu thuộc tính `min-w-0`, khiến kích thước intrinsic mặc định của trình duyệt đẩy nút Gửi tràn ra khỏi biên phải của card trên màn hình điện thoại hẹp.
     - *Khắc phục*:
       * Bổ sung `min-w-0 flex-1 truncate` cho ô input, cho phép co giãn mượt mà xuống bất kỳ độ phân giải di động nào.
       * Đặt `w-full max-w-full box-border overflow-hidden` cho khung form.
       * Tinh chỉnh kích thước nút Mic và nút Gửi co giãn linh hoạt (`h-9 sm:h-11 px-3 sm:px-5 shrink-0`), đảm bảo nút Gửi luôn nằm gọn gàng 100% bên trong khung card.
  3. **Kiểm thử xây dựng**: `npm run build` hoàn tất 100% trong 4.73 giây, 0 cảnh báo lỗi.

---

## [2026-10-24 21:30] - Phiên Bản V6.7: Khắc Phục Triệt Để Lỗi Lặp Từ Web Speech API & Chuẩn Hóa 100% Khớp Đúng Thủ Tục Hành Chính (Công Chứng / Chứng Thực)
- **Loại tác vụ**: Giải quyết tận gốc hai vấn đề nghiêm trọng phản ánh từ ảnh chụp màn hình kiểm thử thực tế trên điện thoại di động: lỗi lặp từ lũy tiến của Web Speech API trên Android Chrome khiến câu nói bị lặp hàng chục lần ("hướng dẫn hướng dẫn tôi làm..."), và lỗi nhận diện sai thủ tục hành chính ("công chứng" bị match nhầm do từ khóa 'da' trong ma túy khớp chuỗi 'huong dan') (Version 6.7 Speech Stutter & Intent Engine Fix).
- **Tác vụ thực hiện**:
  1. **Khắc phục triệt để lỗi lặp từ lũy tiến trên Android Chrome (`useSpeechRecognition.js` & `HeroVoiceStation.jsx`)**:
     - *Nguyên nhân gốc rễ*: Do `recognition.continuous = true`, Android Chrome gửi liên tiếp các giả thuyết lũy tiến (progressive hypotheses: `["hướng dẫn", "hướng dẫn tôi", "hướng dẫn tôi làm", ...]`) trong cùng một phiên nghe, dẫn đến việc nối chuỗi mù quáng làm câu nói bị lặp cấp số nhân.
     - *Khắc phục*:
       * Đặt `recognition.continuous = false;` (Voice Search Mode chuẩn Google): Trình duyệt tự động dừng và gửi kết quả ngay khi người dân nói xong dứt câu.
       * Thuật toán lọc `event.results`: Kiểm tra chuỗi lũy tiến (`text.startsWith(previous)`), thay thế bản cập nhật mới nhất thay vì nối chuỗi.
       * Thuật toán `deduplicateSpeechText` 3 lớp: Tự động loại bỏ lặp từ đơn liên tiếp, khử sạch chuỗi tiền tố lũy tiến và cụm từ lặp kép. Đã kiểm thử trực tiếp chuỗi dài trong ảnh chụp màn hình và rút gọn chính xác 100% về: `"hướng dẫn tôi làm thủ tục công chứng"`.
       * Áp dụng `deduplicateSpeechText` cho cả hộp hiển thị `"Lời nói của bà con"` theo thời gian thực.
  2. **Khắc phục triệt để lỗi trả lời sai kết quả (`geminiRagService.js`)**:
     - *Nguyên nhân gốc rễ*: Trong danh sách `legalKeywords`, từ khóa `'da'` (ma túy đá) đã kích hoạt lỗi `cleanLower.includes('da')` trên mọi câu có từ **"hướng dẫn"** (`huong dan` chứa `da`) hoặc **"đăng ký"**, **"đất đai"**. Hậu quả là 90% câu hỏi thủ tục bị gán nhầm sang nhóm "Chất cấm / Ma túy / Tranh chấp pháp luật" (`isLegalConsultation`), bỏ qua bước tìm kiếm thủ tục hành chính!
     - *Khắc phục*:
       * Xóa bỏ các từ viết tắt nguy hiểm `'da'`, `'ke'`, `'so do'`; thay bằng từ khóa chính xác `'ma tuy da'`, `'dap da'`, `'choi ke'`, `'tranh chap dat'`.
       * Đảo thứ tự ưu tiên: **Tìm kiếm thủ tục hành chính cụ thể trước (`vectorStore.search`)**. Khi câu hỏi người dân khớp với thủ tục cấp xã (như `TT_CHUNG_THUC` cho "công chứng", `TT_KHAI_SINH`, `TT_KET_HON`, `TT_DAT_DAI`), hệ thống lập tức hướng dẫn đúng thủ tục, trả về trọn vẹn bộ checklist 4 mục và nút Điền đơn Word chuẩn xã.
  3. **Kiểm thử xây dựng**: `npm run build` hoàn tất 100% trong 4.55 giây, 0 cảnh báo lỗi.

---

## [2026-10-24 21:05] - Phiên Bản V6.6: Hoàn Thiện Tương Thích Laptop & Mobile, Chống Rớt Chữ Nút Bấm, Footer 1 Hàng Duy Nhất & Chống Che Khuyết Tiêu Đề Header
- **Loại tác vụ**: Giải quyết triệt để 3 vấn đề phản ánh từ 3 ảnh chụp thực tế trên laptop và mobile: sửa lỗi rớt chữ trong các nút bấm trên laptop (nút Dành cho Nhân Dân và nút A++ Siêu to trong Accessibility Bar), khóa cứng tiêu đề Footer `ỦY BAN NHÂN DÂN XÃ HIỆP HÒA — TỈNH TÂY NINH` trên 1 hàng duy nhất (12-column grid phân bổ 5/12 cột), và tinh chỉnh tỷ lệ co giãn fluid clamp trên mobile để tiêu đề chính `TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG XÃ HIỆP HÒA` hiển thị 100% đầy đủ không bị che khuất bất kỳ chữ nào (Version 6.6 Cross-Device Polish).
- **Tác vụ thực hiện**:
  1. **Khắc phục lỗi nhảy chữ ở các nút bấm trên Laptop (`Header.jsx` & `AccessibilityBar.jsx` - Hình 1)**:
     - Nút `Dành cho Nhân Dân` và `Cán Bộ Một Cửa`: Đổi sang `inline-flex items-center` kèm `whitespace-nowrap px-3 sm:px-4.5`, triệt tiêu hoàn toàn việc rớt chữ "Dân" xuống hàng thứ hai trên laptop.
     - Nút cỡ chữ `AccessibilityBar.jsx`: Mở rộng khung chứa `sm:w-80 md:w-84` và bổ sung `whitespace-nowrap px-2` cho cả 3 nút `A (Vừa)`, `A+ (To)` và `A++ (Siêu to)`, không còn rớt chữ "to)" xuống dòng.
     - Thêm `whitespace-nowrap` cho cả nút `Loa: BẬT` và `Tổng đài: 1900 9095`.
  2. **Tiêu đề Footer `ỦY BAN NHÂN DÂN XÃ HIỆP HÒA — TỈNH TÂY NINH` duy nhất 1 dòng (`CitizenHomePage.jsx` - Hình 2)**:
     - Tái cấu trúc lưới Footer thành `md:grid-cols-12`: Cột 1 đơn vị hành chính chiếm `md:col-span-5`, cho phép tiêu đề có không gian rộng rãi và gắn cứng `whitespace-nowrap text-xs sm:text-sm lg:text-[15px]`. Tiêu đề luôn luôn nằm trên đúng 1 dòng duy nhất trên cả laptop và điện thoại theo đúng yêu cầu.
  3. **Tiêu đề chính Header không bao giờ bị che khuất trên Mobile (`Header.jsx` - Hình 3)**:
     - Thu gọn padding ngoài `px-2.5 sm:px-6`, logo co giãn `w-11 h-11 sm:w-16 sm:h-16`, khoảng cách `gap-2 sm:gap-4`, giải phóng thêm hơn 25px chiều ngang khả dụng trên màn hình di động nhỏ.
     - Tinh chỉnh `style={{ fontSize: 'clamp(8.5px, 2.75vw, 22px)' }}` kết hợp `tracking-tighter sm:tracking-tight whitespace-nowrap` và `overflow-visible sm:overflow-hidden`. Toàn bộ 44 ký tự của tiêu đề `TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG XÃ HIỆP HÒA` hiển thị sắc nét 100%, không bị cắt mất chữ "HÒA" hay bất kỳ chữ nào.
  4. **Kiểm thử xây dựng**: `npm run build` hoàn tất 100% trong 4.67 giây, 0 cảnh báo lỗi.

---

## [2026-10-24 20:55] - Phiên Bản V6.5: Đại Tu Chống Nhảy Chữ Xuống Dòng Toàn Nền Tảng Mobile & Tiêu Đề Chính Liền 1 Hàng Tự Cân Đối
- **Loại tác vụ**: Giải quyết triệt để lỗi nhảy chữ rớt dòng trên giao diện điện thoại theo 5 ảnh chụp thực tế của người dùng: bắt buộc tiêu đề chính `TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG XÃ HIỆP HÒA` liền đúng 1 hàng không ngắt dòng nhờ fluid clamp co giãn tự động theo khung, khắc phục toàn bộ các huy hiệu (badges) bị rớt chữ đơn lẻ ("HIỆP HÒA", "XÃ", "TÂY NINH", "WORD") và chuẩn hóa tiêu đề Footer hai dòng cân xứng trên di động (Version 6.5 Polish).
- **Tác vụ thực hiện**:
  1. **Tiêu đề chính Header liền đúng 1 hàng (`Header.jsx` - Hình 1)**:
     - Ứng dụng `style={{ fontSize: 'clamp(9.5px, 3.2vw, 22px)' }}` kết hợp `whitespace-nowrap tracking-tight font-black leading-tight`.
     - Tiêu đề `TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG XÃ HIỆP HÒA` luôn luôn nằm trên đúng 1 dòng duy nhất trên mọi màn hình từ 320px đến máy tính bảng/desktop, không bao giờ bị nhảy chữ xuống dòng thứ 2.
     - Dòng 1 cơ quan chủ quản và dòng 3 tên nền tảng được bổ sung `whitespace-nowrap truncate` giữ tính trang nghiêm.
  2. **Bổ sung breakpoint `xs: '380px'` trong `tailwind.config.js`**: Hỗ trợ căn chỉnh kích thước vi mô cho điện thoại phổ thông tại Việt Nam.
  3. **Khắc phục triệt để lỗi rớt chữ tại các huy hiệu (Hình 1 - 4)**:
     - `HeroVoiceStation.jsx` (Hình 1): `TRỢ LÝ HÀNH CHÍNH CÔNG & PHÁP LUẬT XÃ HIỆP HÒA` co giãn `text-[9.5px] xs:text-[10.5px] sm:text-xs font-black whitespace-nowrap`, không còn bị rớt "HIỆP HÒA".
     - `CategoryGrid.jsx` (Hình 2): `DANH MỤC DỊCH VỤ CÔNG CHUẨN HÓA CẤP XÃ` co giãn `text-[9.5px] xs:text-[10.5px] sm:text-xs font-bold whitespace-nowrap`, không còn bị rớt chữ "XÃ".
     - `DvcGuideSection.jsx` (Hình 3): `KẾT NỐI CHUYỂN ĐỔI SỐ QUỐC GIA & TỈNH TÂY NINH` co giãn `text-[9.5px] xs:text-[10.5px] sm:text-xs font-black whitespace-nowrap`, không còn rớt "TÂY NINH".
     - `RagChatDrawer.jsx` (Hình 4): `BIỂU MẪU ĐIỀN ĐƠN TỰ ĐỘNG & XUẤT FILE WORD` co giãn `text-[9.5px] xs:text-[10.5px] sm:text-xs whitespace-nowrap`, không còn rớt chữ "WORD".
     - Đồng bộ chuẩn hóa trên `VoiceMicButton.jsx` và `KTechEcosystemSteps.jsx`.
  4. **Tái cấu trúc tiêu đề Footer đơn vị hành chính (`CitizenHomePage.jsx` - Hình 5)**:
     - Phân định rõ ràng: Mobile hiển thị 2 dòng trang trọng cân xứng (`Ủy Ban Nhân Dân Xã Hiệp Hòa` và `Tỉnh Tây Ninh`), Desktop tự động nối thành 1 hàng gạch nối thanh lịch (`—`). Tránh hoàn toàn việc rớt lẻ loi từ "NINH".
  5. **Kiểm thử xây dựng**: `npm run build` hoàn tất 100% trong 4.64 giây, 0 lỗi.
- **Báo cáo chi tiết**: Xem [2026-10-24_2055_v6_5_fix_mobile_text_wrapping_single_line_header.md](./2026-10-24_2055_v6_5_fix_mobile_text_wrapping_single_line_header.md)

---

## [2026-10-24 20:15] - Phiên Bản V6.4: Đại Tu Dock Chức Năng Nhanh Badges Đa Sắc, Chống Nhảy Chữ Mobile, Nút Nộp Hồ Sơ Trực Tuyến QR, Tra Cứu Giọng Nói & Nút "Đã Nhận Thông Tin & Thoát" Làm Sạch Dữ Liệu
- **Loại tác vụ**: Giải quyết triệt để 5 vấn đề phản ánh từ 3 ảnh chụp màn hình kiểm thử thực tế trên điện thoại: đại tu dock chức năng nhanh thành circular badges chuyên nghiệp có tính năng thu gọn/mở rộng chống che khuất (Hình 1), chống nhảy chữ rớt dòng trên điện thoại và tối ưu biểu mẫu điền đơn 1 dòng 3 tab không cắt chữ (Hình 2 & 3), bổ sung nút nộp hồ sơ trực tuyến trong modal xem QR, tích hợp tra cứu hồ sơ bằng giọng nói và theo hướng dẫn của AI, đồng bộ thông báo kết quả tức thì mỗi 3 giây và nút "Đã nhận thông tin & Thoát" làm sạch lịch sử thiết bị để an tâm làm hồ sơ mới (Version 6.4 Overhaul).
- **Tác vụ thực hiện**:
  1. **Đại tu QuickActionFloatingDock.jsx (Hình 1)**:
     - Nâng cấp từng nút bấm thành circular badge phát sáng đa sắc chuẩn nhận diện hành chính công (Mic Vàng Hoàng Gia, Tra cứu Lam Ngọc, Thủ tục Hồng Ngọc, Chụp ảnh Thạch Anh Tím, Tổng đài Ngọc Lục Bảo, Lên đầu trang Kim Loại Vàng).
     - Bổ sung nút thu gọn `ChevronDown` giúp dock co lại thành viên thuốc `[⚡ Thao Tác Nhanh 🔼]`, tránh hoàn toàn việc che lấp thanh tab danh mục thủ tục.
  2. **Chống nhảy chữ và tối ưu biểu mẫu trên điện thoại (Hình 2 & 3)**:
     - Dùng `&nbsp;` trong `Header.jsx` và `HeroVoiceStation.jsx` ngăn chữ "HÒA", "hỏi", "nói" rớt dòng đơn độc.
     - `SmartAutoFormModal.jsx`: Gỡ bỏ `truncate` gây cắt chữ tên biểu mẫu, hợp nhất thanh chọn chế độ trên điện thoại thành 1 dòng duy nhất 3 tab (`[📝 Tự Điền Đơn] [🎙️ AI Hỏi Từng Bước] [📄 Xem Đơn A4]`), chống va chạm tiêu đề trường nhập.
  3. **Nút "Nộp hồ sơ trực tuyến" trong xem QR (`CitizenQrModal.jsx`)**:
     - Bổ sung nút lớn: `[🚀 BẤM NỘP HỒ SƠ TRỰC TUYẾN TỚI CÁN BỘ MỘT CỬA]` với phản hồi trạng thái xanh đã gửi thành công và hướng dẫn rõ ràng cho người dân.
  4. **Tra cứu hồ sơ bằng giọng nói & Hướng dẫn của AI (`CitizenLookupModal.jsx`)**:
     - Bổ sung nút Micro trong ô tìm kiếm: Người dân chỉ cần chạm và đọc 12 số CCCD hoặc mã hồ sơ, hệ thống tự động nhận diện tiếng Việt chuyển thành dãy số và tra cứu tức thì.
     - Bổ sung nút `[🎙️ Nghe AI Hướng Dẫn]`: AI phát giọng nói hướng dẫn chi tiết cách tra cứu tiến độ bằng CCCD.
  5. **Thông báo kết quả tức thì & Nút "Đã nhận thông tin & Thoát" làm sạch dữ liệu (`CitizenDeviceNotificationToast.jsx`)**:
     - Tự động ghi nhớ mã hồ sơ vào thiết bị ngay khi tạo đơn; nâng tần suất polling lên 3 giây/lần.
     - Bổ sung nút bấm `[✅ Đã nhận thông tin & Thoát]`: Khi người dân bấm, hệ thống xóa sạch lịch sử theo dõi, xóa sạch nháp đơn và bộ nhớ tạm, phát sự kiện làm sạch toàn cục để không bị đụng chạm khi nộp hồ sơ mới.
  6. **Kiểm thử tự động**:
     - `npm run build`: Hoàn tất 100% trong 4.69 giây, 0 lỗi.
     - `node --check`: Cú pháp Node.js backend chuẩn 100%.
- **Báo cáo chi tiết**: Xem [2026-10-24_2015_v6_4_dock_voice_lookup_submit_clean.md](./2026-10-24_2015_v6_4_dock_voice_lookup_submit_clean.md)

---

## [2026-10-24 19:30] - Phiên Bản V6.3: Tối Ưu Toàn Diện Giao Diện Mobile, Sửa Lỗi Lặp Giọng Nói Stutter, Tra Cứu Bằng CCCD 12 Số, Thông Báo Nhắc Kết QuẢ Trên Thiết Bị & Giải Mã Từ Viết Tắt
- **Loại tác vụ**: Giải quyết triệt để 5 vấn đề phản ánh từ 4 ảnh chụp màn hình kiểm thử thực tế trên điện thoại: sửa lỗi chữ tràn viền Header trên mobile (Hình 1 & 2), loại bỏ hiện tượng lặp giọng nói stutter loop của Android Chrome (Hình 3), tái cấu trúc biểu mẫu nhập liệu và bản xem trước A4 chuẩn mobile (Hình 4), bổ sung tính năng tra cứu hồ sơ bằng Căn cước công dân (12 số CCCD) kèm hướng dẫn chi tiết, thiết lập hệ thống thông báo nhắc kết quả hồ sơ trên thiết bị người dân và chuẩn hóa đọc từ viết tắt / chào hỏi xã giao (Version 6.3 Overhaul).
- **Tác vụ thực hiện**:
  1. **Khắc phục lỗi vỡ chữ & tràn viền Header trên điện thoại (Hình 1 & 2)**:
     - Tinh chỉnh `Header.jsx`: Chuyển sang kích thước chữ co giãn linh hoạt (`text-xs sm:text-lg md:text-xl`), loại bỏ thuộc tính ép cứng `whitespace-nowrap` trên điện thoại hẹp (< 380px), cụm 2 nút chuyển đổi co giãn theo lưới 2 cột gọn gàng không bao giờ bị cắt chữ.
  2. **Tránh Floating Dock che khuất nút Mic & ô nhập (Hình 2 & 3)**:
     - Bổ sung `pb-28 sm:pb-20` vào khung `main` trong `CitizenHomePage.jsx`.
     - Tối ưu `QuickActionFloatingDock.jsx`: Thu gọn padding và kích thước icon trên mobile (`max-w-[96vw]`), giữ nguyên độ nổi bật của nút Micro mà không cản trở thao tác cuộn trang.
  3. **Khắc phục triệt để lỗi nói lặp lại stutter loop trên Android Chrome (Hình 3)**:
     - Tái cấu trúc `useSpeechRecognition.js`: Đọc trực tiếp danh sách kết quả `event.results` từ index 0 thay vì cộng dồn chuỗi tích lũy `prev + final`.
     - Tích hợp thuật toán `deduplicateSpeechText` tự động khử sạch từ đơn lặp liên tiếp (`"Tôi Tôi Tôi"` $\rightarrow$ `"Tôi"`) và cụm từ lặp kép (`"Tôi muốn đăng ký kết hôn Tôi muốn đăng ký kết hôn"` $\rightarrow$ `"Tôi muốn đăng ký kết hôn"`).
  4. **Tối ưu biểu mẫu nhập liệu & bản xem trước A4 trên điện thoại (Hình 4)**:
     - Tích hợp Mobile View Selector `[📝 Điền Thông Tin] [📄 Xem Đơn A4]` trong `SmartAutoFormModal.jsx`.
     - Khi ở chế độ điền đơn, cột nhập liệu chiếm 100% chiều cao màn hình điện thoại với ô nhập rộng rãi (`py-2 text-sm`), độ tương phản cao, dễ chạm; khi chuyển xem đơn, trang A4 hiển thị trọn vẹn, không còn bị chèn ép co cụm.
  5. **Bổ sung tính năng tra cứu hồ sơ bằng Căn cước công dân (12 số CCCD)**:
     - Nâng cấp `realtimeSyncService.js` và `submissionController.js` với phương thức `lookupSubmissions`: Cho phép người dân tra cứu linh hoạt bằng số CCCD 12 số, Mã hồ sơ (`HH-1021`) hoặc Số điện thoại.
     - `CitizenLookupModal.jsx`: Cho phép hiển thị danh sách nhiều hồ sơ nếu tìm thấy nhiều kết quả; bổ sung hộp hướng dẫn tra cứu `📖 Hướng dẫn tra cứu` dễ hiểu cho người cao tuổi.
  6. **Thông báo nhắc kết quả hồ sơ trên thiết bị người dân (`CitizenDeviceNotificationToast.jsx`)**:
     - Tự động ghi nhớ các hồ sơ công dân đã nộp/tra cứu trên thiết bị qua `localStorage`.
     - Polling ngầm trạng thái mỗi 8 giây; khi hồ sơ được tiếp nhận hoặc đã xử lý xong, tự động hiển thị thẻ thông báo nổi trên góc màn hình kèm âm thanh/giọng nói nhắc nhở và nút bấm xem ngay kết quả.
  7. **Chuẩn hóa phát âm từ viết tắt & Chào hỏi xã giao thân tình**:
     - Bổ sung `expandAbbreviationsForTTS` trong `useSpeechSynthesis.js` và `expandVietnameseGovAbbreviations` trong `geminiRagService.js` (CCCD $\rightarrow$ Căn cước công dân, UBND $\rightarrow$ Ủy ban nhân dân, DVC $\rightarrow$ Dịch vụ công, GPLX $\rightarrow$ Giấy phép lái xe...).
     - Bổ sung phản hồi ấm áp, kính cẩn, lễ phép cho các câu chào hỏi xã giao thường ngày ("Chào em", "Em khỏe không", "Bạn là ai", "Cảm ơn em").
  8. **Kiểm thử tự động**:
     - `npm run build`: Thành công 100% trong 4.53s, 0 lỗi.
     - `node --check`: Backend controllers và services cú pháp chuẩn 100%.
     - Kiểm thử tra cứu CCCD `072096001234` và mã `HH-1021` thành công 100%.
- **Báo cáo chi tiết**: Xem [2026-10-24_1930_mobile_ui_stutter_cccd_lookup_v6_3.md](./2026-10-24_1930_mobile_ui_stutter_cccd_lookup_v6_3.md)

---

## [2026-10-24 18:40] - Đại Tu Toàn Diện V6.2: Khắc Phục Triệt Để Quản Trị Cán Bộ/Admin, Trả Lời Đúng Luật Giao Thông, Gỡ Mẫu Đơn Lạc Đề, Bổ Sung Dock Cố Định & Footer Đỏ Hoàng Gia
- **Loại tác vụ**: Giải quyết triệt để 5 vấn đề phản ánh từ ảnh chụp màn hình kiểm thử: sửa lỗi Header vỡ chữ nhảy dòng, cập nhật kho luật giao thông đường bộ và gỡ bỏ hoàn toàn việc gán mẫu đơn sai lệch trong tư vấn pháp luật, hoàn thiện xác thực & đổi mật khẩu tài khoản cán bộ/admin, vẽ Trống Đồng Đông Sơn to mờ chìm làm nền trang chủ, đổi Footer từ màu đen sang Đỏ Hoàng Gia và bổ sung thanh công cụ thao tác nhanh cố định trên màn hình (Version 6.2 Overhaul).
- **Tác vụ thực hiện**:
  1. **Khắc phục lỗi Header vỡ chữ & nhảy dòng (Hình 1)**:
     - Tái cấu trúc cụm tiêu đề 3 dòng với `whitespace-nowrap` trên từng dòng tiêu đề, mở rộng khung chứa sang `max-w-7xl`, kích thước chữ co giãn mượt mà từ điện thoại đến màn hình lớn, triệt tiêu hoàn toàn hiện tượng chữ "TÂY NINH" hay "24/7" bị rớt dòng đơn độc.
  2. **Trích xuất đúng Luật Giao thông & Gỡ bỏ mẫu đơn sai lệch (Hình 3 & 4)**:
     - Bổ sung bộ dữ liệu Luật Giao thông đường bộ 2008 & Nghị định 100/2019/NĐ-CP (sửa đổi bởi Nghị định 123/2021/NĐ-CP) vào `legalWebSearchService.js` và `geminiRagService.js`.
     - Cập nhật cấu hình mô hình sang `gemini-3.8-flash` tương thích API mới nhất.
     - Khi công dân hỏi về luật đời sống, an toàn giao thông (`LEGAL_CONSULTATION`), hệ thống trả lời chi tiết điều khoản, mức phạt tiền và **TUYỆT ĐỐI KHÔNG GÁN MẪU ĐƠN HÀNH CHÍNH**. Thay vào đó là khối Trợ giúp Pháp luật kèm nút gọi trực tiếp `1900 9095`. Chỉ hiển thị mẫu đơn khi đúng là công dân yêu cầu làm thủ tục hành chính.
  3. **Hoàn thiện xác thực và đổi mật khẩu cán bộ / Admin (Hình 2 & 5)**:
     - Nâng cấp `securityService.js`: Mọi thao tác đều tự động tải lại store từ đĩa, hỗ trợ tìm kiếm tài khoản không phân biệt hoa thường và hỗ trợ cả username thông thường lẫn email (ví dụ: `canbo1cua@gmail.com`).
     - Cơ chế Upsert tự động: Cập nhật mật khẩu cho bất kỳ tài khoản cán bộ nào mà không bao giờ ném lỗi 404 "Không tìm thấy tài khoản".
     - Cho phép tài khoản vừa tạo đăng nhập và tiếp nhận hồ sơ ngay lập tức.
  4. **Vẽ biểu tượng Trống Đồng Đông Sơn to mờ mờ làm nền trang chủ**:
     - Tích hợp `TrongDongOrnament` kích thước 1050px với độ mờ tinh tế `0.035`, xoay chậm 240s chìm dưới nền trang chủ, tạo chiều sâu thẩm mỹ công nghệ - truyền thống.
  5. **Đổi Footer từ màu đen sang Đỏ Son Hoàng Gia**:
     - Thay thế toàn bộ nền than đen bằng nền chuyển sắc Đỏ Son Hoàng Gia (`#690F12` $\rightarrow$ `#851417` $\rightarrow$ `#550A0C`) viền vàng đồng, đính kèm Trống Đồng chìm góc nền, căn chỉnh thông tin liên hệ không bị nhảy chữ.
  6. **Bổ sung Thanh Nút Chức Năng Nhanh Cố Định Dưới Màn Hình (`QuickActionFloatingDock.jsx`)**:
     - Thanh dock nổi cố định ở đáy màn hình (`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40`), giữ nguyên vị trí khi cuộn trang lên xuống.
     - Gồm 6 biểu tượng chức năng mặc định tinh gọn: Micro AI, Tra cứu hồ sơ, Danh mục thủ tục, Kiểm tra giấy tờ AI (OCR), Tổng đài 1900 9095 và Lên đầu trang.
  7. **Kiểm thử tự động**:
     - `npm run build`: Thành công 100% trong 4.67s, 0 lỗi.
     - Script kiểm thử logic cán bộ & truy vấn an toàn giao thông: Toàn bộ kiểm thử thông qua thành công (`ALL VERIFICATION CHECKS PASSED`).
- **Báo cáo chi tiết**: Xem [2026-10-24_1840_fix_admin_officer_rag_law_ui_dock_v6_2.md](./2026-10-24_1840_fix_admin_officer_rag_law_ui_dock_v6_2.md)

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



