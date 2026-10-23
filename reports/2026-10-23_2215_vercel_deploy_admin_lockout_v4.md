# BÁO CÁO KỸ THUẬT NÂNG CẤP BẢO MẬT ADMIN (KHÓA THIẾT BỊ 5 LẦN) & KIẾN TRÚC VERCEL SERVERLESS V4
**Dự án**: HIỆP HÒA AI-GOV – Chuyên viên Hành chính công AI Đa phương thức  
**Đơn vị thực hiện**: UBND Xã Hiệp Hòa, Tỉnh Tây Ninh  
**Thời gian**: 22:15, Ngày 23 Tháng 10 Năm 2026  
**Phiên bản**: v4.0.0 (Production & Vercel Ready)

---

## I. MỤC TIÊU VÀ BỐI CẢNH NÂNG CẤP
Nhằm đáp ứng tiêu chuẩn an toàn thông tin cấp độ 3 và bảo vệ nghiêm ngặt phân hệ nội bộ của Cán bộ Một cửa & Quản trị viên (Admin) trước các cuộc tấn công dò mật khẩu (Brute-force attack), hệ thống đã được nâng cấp toàn diện cơ chế nhận diện thiết bị duy nhất, khóa cứng vật lý sau 5 lần nhập sai, bổ sung Bảng điều khiển Quản trị Admin và tối ưu kiến trúc Serverless tương thích 100% với Vercel.

---

## II. CHI TIẾT 04 HẠNG MỤC ĐÃ HOÀN TẤT

### 1. Hạng mục 1: Trang Đăng Nhập Cán bộ Một cửa & Khóa Cứng Thiết Bị Sau 5 Lần Sai
- **Giao diện chuẩn hành chính (`OfficerLoginModal.jsx`)**:
  - Tích hợp họa tiết mờ chìm Trống Đồng Đông Sơn (`TrongDongWatermark`) và dải hoa văn đường diềm (`DongSonBorder`).
  - Gợi ý tài khoản demo phục vụ Ban Giám khảo:
    + Cán bộ Một cửa: `canbo1` / `MotCua@2026`
    + Quản trị viên (Admin): `admin` / `HiepHoa@2026`
- **Thuật toán Dấu vân tay Thiết bị (`deviceFingerprint.js`)**:
  - Kết hợp Canvas Rendering Fingerprint + Screen Resolution + UserAgent + Platform + Timezone + Hardware Concurrency.
  - Sinh mã `deviceId` định danh duy nhất (ví dụ: `DEV-8A1C...`) và tên thiết bị thân thiện (`deviceName`: *iPhone (Safari iOS)*, *Máy tính Windows (Google Chrome)*,...).
  - Đồng bộ đa kho lưu trữ (`localStorage`, `sessionStorage`, `Cookie 365 ngày`).
- **Cơ chế Khóa Cứng 5 Lần (`securityService.js` & `authController.js`)**:
  - Nhập sai từ lần 1 đến 4: Trả mã `401 Unauthorized`, cảnh báo rõ số lần đã sai và số lần còn lại trước khi khóa.
  - Nhập sai lần thứ 5: Trả mã `403 Forbidden`, kích hoạt cờ `isLocked = true` và khóa cứng thiết bị.
  - **Khóa cứng tuyệt đối**: Kể từ lần thứ 6 trở đi, ngay cả khi nhập đúng mật khẩu, hệ thống vẫn từ chối đăng nhập (HTTP 403) và hiển thị màn hình khóa màu đỏ toàn màn hình kèm mã `deviceId` yêu cầu liên hệ Admin.
  - API `GET /api/auth/device-status?deviceId=...` giúp kiểm tra trạng thái khóa ngay lập tức khi mở modal hoặc bấm F5 tải lại trang.

### 2. Hạng mục 2: Bảng Điều Khiển Admin & Nút "Reset Lượt Đăng Nhập Lại Từ Đầu"
- **Tab Quản trị Bảo mật & Mở Khóa Thiết Bị (`AdminDeviceManager.jsx`)**:
  - Chỉ hiển thị khi đăng nhập bằng tài khoản `admin` (Role `ADMIN`).
  - Hiển thị 4 thẻ thống kê: Tổng thiết bị, Số thiết bị bị khóa cứng (5/5 màu đỏ), Số thiết bị cảnh báo (1-4/5 màu vàng), Số thiết bị hợp lệ (xanh).
  - Bảng danh sách thiết bị chi tiết: Device ID, Tên thiết bị, IP, User Agent, Tài khoản thử gần nhất, Số lần sai, Trạng thái khóa, Thời gian.
  - Nút **"Reset 0/5 (Mở khóa)"** trên từng thiết bị (`POST /api/admin/devices/:deviceId/reset`): Đặt lại `failedCount = 0`, `isLocked = false`.
  - Nút **"Reset tất cả thiết bị"** (`POST /api/admin/devices/reset-all`).
  - Nút **"Tạo thiết bị khóa mẫu (Demo BGK)"** (`POST /api/admin/devices/demo-lock`): Tạo nhanh 1 thiết bị mẫu đang bị khóa cứng 5/5 để biểu diễn trước Ban Giám khảo.
  - Nút **"Đăng xuất"** bảo mật trên Header phân hệ Cán bộ.

### 3. Hạng mục 3: Cấu Hình Kiến Trúc Tương Thích 100% Vercel Serverless
- **Chống lỗi Read-Only Filesystem (`EROFS`)**:
  - Kiểm tra `isVercel = Boolean(process.env.VERCEL)`.
  - Môi trường Local: Lưu tệp tại `backend/src/data/security_db.json`.
  - Môi trường Vercel: Tự động ghi vào `/tmp/security_db.json` kết hợp bộ nhớ RAM `globalThis.__HIEPHOA_SECURITY_STORE__`.
- **Cầu nối Serverless `/api/index.js` tại thư mục gốc (`root`)**:
  - Nạp Express App từ `backend/src/server.js` và xuất hàm Serverless cho Vercel.
- **Tệp cấu hình `vercel.json` ở root**:
  - Build command: `cd backend && npm install && cd ../frontend && npm install && npm run build`
  - Output directory: `frontend/dist`
  - Routing: Toàn bộ `/api/*` điều hướng về `/api/index.js`, các route còn lại điều hướng về Single Page Application `/index.html`.

### 4. Hạng mục 4: Kiểm Thử Nghiệp Vụ & Xác Minh Chất Lượng
- Script tự động `test_lockout.js` chạy qua 8 kịch bản thực tế:
  + Lần 1-4 sai: HTTP 401, failedCount 1..4 (Đạt ✅)
  + Lần 5 sai: HTTP 403, isLocked: true (Đạt ✅)
  + Lần 6 nhập đúng mật khẩu: Vẫn bị từ chối HTTP 403 (Đạt ✅)
  + Admin đăng nhập, cấp JWT Token quyền ADMIN (Đạt ✅)
  + Admin gọi Reset thiết bị về 0/5 (Đạt ✅)
  + Thiết bị đăng nhập lại đúng mật khẩu: HTTP 200, thành công (Đạt ✅)
- Frontend build production `vite build`: Hoàn thành trong 5.04s không có lỗi.

---

## III. TÀI KHOẢN HỆ THỐNG MẶC ĐỊNH

| Tài khoản | Mật khẩu | Phân quyền (Role) | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **admin** | `HiepHoa@2026` | `ADMIN` | Quét QR + Giám sát an ninh + Reset mở khóa thiết bị 5 lần |
| **canbo1** | `MotCua@2026` | `OFFICER` | Tiếp nhận hồ sơ điện tử + Quét mã QR + In biên nhận & tờ khai |

---

*Báo cáo được lập tự động bởi Hệ thống Quản trị Tiếp nhận Một cửa Xã Hiệp Hòa, Tỉnh Tây Ninh.*
