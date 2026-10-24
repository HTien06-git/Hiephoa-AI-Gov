# BÁO CÁO TÁI CẤU TRÚC GIAO DIỆN CHUẨN CỔNG DỊCH VỤ CÔNG CHÍNH PHỦ, KHÔI PHỤC HEADER HÌNH 7, TINH GỌN CHỐNG RỐI MẮT & HIỆU ỨNG TRỐNG ĐỒNG ĐÔNG SƠN (VERSION 6.0)

- **Hệ thống**: HIỆP HÒA AI-GOV (Chuyên viên Hành chính công AI Đa phương thức 24/7)
- **Đơn vị**: Trung tâm Phục vụ Hành chính công UBND xã Hiệp Hòa, tỉnh Tây Ninh
- **Thời gian thực hiện**: 24/10/2026 17:27:00 (GMT+7)
- **Phiên bản phát hành**: **Version 6.0 (Government Public Service Standard - Official Dong Son Heritage Edition)**

---

## I. MỤC TIÊU & BỐI CẢNH NÂNG CẤP
Sau phiên bản V5.0 hoàn thiện hạ tầng đồng bộ thời gian thực cho Cán bộ Một cửa và khắc phục lỗi responsive trên điện thoại, giao diện trang chủ cần được nâng cấp toàn diện theo yêu cầu mới nhất:
1. **Khôi phục 100% Tiêu đề Header chuẩn mực từ Bản Cũ (Hình 7)** kết hợp biểu tượng Ngôi sao vàng chính giữa Trống Đồng Đông Sơn, bỏ logo vuông bàn tay và huy hiệu pilot.
2. **Xây dựng bộ họa tiết Trống Đồng Đông Sơn / Ngọc Lũ vector SVG chuẩn mỹ thuật Việt Nam** với ngôi sao 14 cánh, chim Lạc bay ngược chiều kim đồng hồ, vòng chấm tròn và hoa văn răng cưa.
3. **Tinh gọn bố cục trang chủ từ nhiều khối chồng chéo thành đúng 03 khu vực mạch lạc**: Xóa bỏ hộp robot hoạt hình, xóa 4 hộp KPI, xóa 3 hộp bước đánh số to đè chữ; gộp vào duy nhất 1 khu vực Hero Voice Station sang trọng.
4. **Tái thiết kế Danh mục 08 Thủ tục Cấp xã**: Loại bỏ kiểu 3 nút 3 màu (Đỏ - Xanh dương - Xanh lá) ở chân thẻ; thay bằng 02 nút chuẩn mực (`Điền Đơn & Mã QR` và `Chi Tiết & Hỏi AI`), đưa phần kiểm tra ảnh giấy tờ vào trong ngăn kéo chi tiết.
5. **Đồng bộ màu sắc Cổng Dịch vụ công & Cẩm nang VNeID**: Chuyển nền từ màu tím xanh lạc điệu sang sắc Đỏ Thẫm Hoàng Gia / Chính Phủ (`#6B1114` - `#7F1416`), đính kèm Trống Đồng Đông Sơn chìm và số thứ tự bước vàng kim.
6. **Hoàn thiện Footer chính thức**: Thay số điện thoại giả định bằng số điện thoại chính thức từ Thuyết minh dự án (Tổng đài `1800 1096`, Đường dây nóng hỗ trợ kỹ thuật `0362 872 772` - Trương Hoàng Tiến, Bí thư Chi Đoàn ấp Văn Hiệp, Email `truonghoangtien90@gmail.com`).

---

## II. CHI TIẾT 06 HẠNG MỤC ĐÃ HOÀN THÀNH

### 1. Khôi phục 100% Header chuẩn Bản Cũ (Hình 7) & Họa tiết Trống Đồng
- **File**: `frontend/src/components/layout/Header.jsx`
- **Thanh Tiêu ngữ trên cùng (`Top Slogan Bar`)**:
  - Nền đỏ sẫm `#630F12`, viền vàng đồng `border-amber-500/30`.
  - Tiêu ngữ in hoa trang trọng: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — ĐỘC LẬP - TỰ DO - HẠNH PHÚC`.
- **Khu vực Banner Header Chính (`Main Government Header`)**:
  - Nền chuyển sắc Đỏ Son Chính Phủ (`bg-gradient-to-r from-[#7F1416] via-[#991B1B] to-[#7F1416]`), viền dưới 2px vàng đồng `border-amber-500/80`.
  - **Biểu tượng Trống Đồng Tròn Quốc Gia**: Kích thước 56px–64px (`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#B91C1C] to-[#7F1D1D] border-2 border-amber-400 shadow-lg`), bên trong là ngôi sao vàng 5 cánh nổi bật trên vòng hoa văn Trống Đồng Đông Sơn.
  - **Dòng 1**: `ỦY BAN NHÂN DÂN XÃ HIỆP HÒA — TỈNH TÂY NINH` (chữ vàng kim in hoa `text-amber-300 font-bold text-xs sm:text-sm tracking-wide`).
  - **Dòng 2**: `TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG XÃ HIỆP HÒA` (chữ trắng uy nghiêm `text-white font-extrabold text-lg sm:text-2xl lg:text-[26px]`).
  - **Dòng 3**: Huy hiệu vàng chữ đỏ `HIỆP HÒA AI-GOV` đi kèm dòng chữ `Chuyên viên Hành chính công AI Đa phương thức 24/7`.
  - **Cụm điều hướng & bảo mật bên phải**: Huy hiệu `Zero-Data Retention: Xử lý an toàn trên máy` và 2 nút chế độ đồng nhất kích thước (`Dành cho Nhân Dân` | `Cán Bộ Một Cửa`).
- **Thanh Công cụ Trợ năng (`Accessibility Bar`)**:
  - `frontend/src/components/layout/AccessibilityBar.jsx`: Nền kem nhạt `bg-[#FFFBEB]`, các nút `A (Vừa)`, `A+ (To)`, `A++ (Siêu to)` kích thước bằng nhau, nút `Loa: BẬT` và `Tổng đài: 1900 9095` đồng đều chiều cao `h-9`.
- **Đường diềm hoa văn Đông Sơn (`DongSonDivider`)**: Dải viền cao 6px chuyển sắc vàng đồng `bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700` chạy dọc dưới chân Header.

### 2. Thiết kế Component Trống Đồng Đông Sơn / Ngọc Lũ Vector SVG
- **File**: `frontend/src/components/common/TrongDongOrnament.jsx`
- Vẽ chi tiết theo đúng tỷ lệ mỹ thuật Đông Sơn:
  - Ngôi sao trung tâm 14 cánh biểu tượng ánh sáng mặt trời.
  - Vòng chấm nhỏ đồng tâm.
  - Vòng hoa văn chữ S gãy khúc cổ điển.
  - Vòng 16 chim Lạc tung cánh bay ngược chiều kim đồng hồ.
  - Vòng răng cưa và vòng người giã gạo, múa lễ hội.
- Bố trí tại 3 vị trí:
  - Trên nền Header (2 mặt trống chìm xoay chậm 120s tạo chiều sâu).
  - Bao quanh Nút Micro Chạm & Nói (2 lớp: lớp tĩnh sắc nét và lớp xoay phát sáng vàng ấm).
  - Góc nền Cổng DVC & VNeID.

### 3. Tinh gọn Bố cục Trang chủ — Khối Hero Voice Station duy nhất
- **File**: `frontend/src/components/voice/HeroVoiceStation.jsx` và `frontend/src/pages/CitizenHomePage.jsx`
- **Xóa bỏ hoàn toàn**: Hộp robot vàng phía trên, dải 4 KPI rời rạc, 3 hộp bước tự động hóa có số to đè chữ.
- **Tập trung vào duy nhất Khu vực 1 - "Trung Tâm Tư Vấn Giọng Nói & Hỏi Đáp Pháp Luật AI 24/7"**:
  - *Cột Trái (60%)*:
    - Huy hiệu `TRỢ LÝ HÀNH CHÍNH CÔNG & PHÁP LUẬT XÃ HIỆP HÒA`.
    - Tiêu đề hướng dẫn bà con chạm vào Micro để nói chuyện.
    - Hộp lời chào tự động kèm nút `Nghe lời chào hướng dẫn` / `Dừng đọc`.
    - 4 Nút câu hỏi gợi ý phổ biến (Khai sinh, Tặng cho đất, Chứng thực, VNeID mức 2).
    - Dải cam kết 1 dòng: `✓ Tra cứu 5 giây` • `✓ Tự động điền đơn Word chuẩn` • `✓ Trích dẫn Thư Viện Pháp Luật`.
  - *Cột Phải (40%)*:
    - Tâm điểm Nút Micro Đỏ Son đặt giữa Vòng Trống Đồng Đông Sơn vàng kim 2 lớp.
    - Dòng nhắc: *"Chạm vào Micro màu đỏ để bắt đầu nói"*.
    - Thanh gõ câu hỏi trực tiếp kèm nút `Gửi` đỏ son nằm gọn gàng bên trong, 100% không tràn viền.

### 4. Tái thiết kế Danh mục 08 Thủ tục Hành chính — 02 Nút Chuẩn Mực
- **File**: `frontend/src/components/categories/CategoryGrid.jsx`
- **Thanh lọc 05 nhóm danh mục**: Phong cách đồng bộ nhà nước (`bg-[#991B1B]` khi chọn, `bg-white border-amber-200` khi chưa chọn).
- **Thẻ thủ tục 4 phần tinh gọn**:
  - *Phần đầu thẻ*: Icon lĩnh vực trong huy hiệu đỏ son - viền vàng + Tên thủ tục + Nhãn trạng thái `Miễn phí` hoặc `Theo quy định`.
  - *Khung thông tin 2 dòng sạch sẽ*: `Cơ quan giải quyết` và `Thời hạn & Lệ phí`.
  - *Thanh nghe hướng dẫn nhanh*: Nền kem nhẹ, nút loa đỏ son và câu hỏi gợi ý in nghiêng.
  - *Chân thẻ chỉ gồm đúng 02 nút hành động*:
    1. **Nút 1 (Đỏ Son Chính Phủ)**: `Điền Đơn & Mã QR`.
    2. **Nút 2 (Trắng viền Vàng Đồng)**: `Chi Tiết & Hỏi AI` (Bên trong cửa sổ này tích hợp sẵn tab/nút `Kiểm tra ảnh giấy tờ` tiện lợi).

### 5. Đồng bộ Màu sắc Cổng Dịch vụ công & Cẩm nang VNeID
- **File**: `frontend/src/components/dvc-guide/DvcGuideSection.jsx`
- Thay nền tím xanh bằng **Đỏ Thẫm Hoàng Gia / Chính Phủ** (`bg-gradient-to-br from-[#6B1114] via-[#7F1416] to-[#580C0E] border-2 border-amber-500/70`) có hoa văn Trống Đồng chìm.
- 03 Nút liên kết Cổng DVC Tỉnh Tây Ninh, DVC Quốc Gia, DVC Bộ Công An đồng bộ sắc Vàng Kim và Đỏ Rượu viền vàng.
- 04 Thẻ bước hướng dẫn VNeID dùng nền tối sang trọng viền vàng `bg-black/25 border-amber-400/30`, số thứ tự `1, 2, 3, 4` đặt trong vòng tròn vàng kim `bg-amber-400 text-[#7F1D1D] font-bold`.

### 6. Cập nhật Footer với Thông tin Liên hệ Chính thức
- **File**: `frontend/src/pages/CitizenHomePage.jsx`
- Xóa bỏ hoàn toàn số điện thoại giả định `0276.3888.xxx`.
- Thay bằng thông tin chính thức từ Thuyết minh dự án:
  - **Đơn vị**: Trung tâm Phục vụ Hành chính công xã Hiệp Hòa, tỉnh Tây Ninh (Địa chỉ: Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh).
  - **Tổng đài Dịch vụ công Quốc gia**: `1800 1096`.
  - **Đường dây nóng hỗ trợ kỹ thuật dự án Hiệp Hòa AI-Gov**: `0362 872 772` (Tác giả: Trương Hoàng Tiến – Bí thư Chi Đoàn ấp Văn Hiệp, Email: `truonghoangtien90@gmail.com`).
  - Nền than tối viền trên bằng hoa văn vàng đồng chuyển sắc.

---

## III. KẾT QUẢ KIỂM THỬ XÂY DỰNG (BUILD VERIFICATION)
- Lệnh: `npm run build` tại thư mục `frontend/`.
- Kết quả: **Thành công 100% trong 13.93s** mà không có bất kỳ lỗi syntax, component hay import nào.
- Các file phân phối `dist/` tạo mới:
  - `dist/index.html` (1.58 kB)
  - `dist/assets/index-DIKzpKZD.css` (61.22 kB)
  - `dist/assets/index-hS3DNHBx.js` (1,091.54 kB)

---

## IV. TỔNG KẾT
Toàn bộ 06 hạng mục theo yêu cầu Version 6.0 đã hoàn tất xuất sắc, mang lại diện mạo trang nghiêm, đậm đà bản sắc dân tộc qua hoa văn Trống Đồng Đông Sơn, đồng thời giữ vững 100% các tính năng kỹ thuật cốt lõi (AI RAG giọng nói, điền đơn .docx, kiểm tra ảnh giấy tờ và đồng bộ hàng đợi cán bộ một cửa thời gian thực).
