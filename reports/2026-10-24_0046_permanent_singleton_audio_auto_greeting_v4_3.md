# BÁO CÁO GIẢI QUYẾT TRIỆT ĐỂ SỰ CỐ NHIỀU GIỌNG ĐỌC & TỰ ĐỘNG PHÁT LỜI CHÀO KHI TRUY CẬP (v4.3)

**Thời gian:** 24/10/2026 - 00:46 (Giờ Việt Nam)  
**Dự án:** Cổng Dịch Vụ Công Xã Hiệp Hòa - Trợ Lý AI Phục Vụ Nhân Dân  
**Người thực hiện:** Chuyên viên Kỹ thuật Antigravity AI  

---

## I. NGUYÊN NHÂN CHÍNH XÁC VÌ SAO TRƯỚC ĐÓ CÓ NHIỀU GIỌNG ĐỌC CÙNG LÚC
1. **Lỗi Xử lý Retry Đồng thời (Concurrent Error Retry):**
   - Trong phiên bản trước, khi một câu phát sinh lỗi mạng từ đường dẫn trực tiếp, cả sự kiện `audio.onerror` và lời hứa `playPromise.catch()` đều kích hoạt song song.
   - Một nhánh gọi nạp lại luồng âm thanh qua proxy server, trong khi nhánh kia gọi hàm `advanceNext()` để phát ngay câu tiếp theo $\rightarrow$ Sinh ra 2 thẻ `Audio` riêng biệt trong bộ nhớ chạy cùng một lúc!
2. **Khởi tạo nhiều đối tượng `new Audio()` độc lập:**
   - Việc gọi `new Audio()` ở từng câu khiến các đối tượng audio cũ không bị hệ điều hành tiêu hủy ngay, tạo ra nhiều kênh phát song song.

---

## II. GIẢI PHÁP ĐÃ ĐƯỢC XỬ LÝ TRIỆT ĐỂ & DUY NHẤT 1 LẦN
1. **Kiến trúc SINGLETON AUDIO DUY NHẤT (`getSingletonAudio()`):**
   - Toàn bộ tab trình duyệt của người dân chỉ tồn tại **ĐÚNG 1 ĐỐI TƯỢNG `<audio>` DUY NHẤT** (`window.__hiephoaSingletonAudio`).
   - Bất kể người dân bấm mục nào, việc gán `.src` mới trên cùng một thẻ `<audio>` sẽ **tự động và dứt khoát hủy bỏ luồng âm thanh cũ của trình duyệt**. Về mặt kỹ thuật, một thẻ `<audio>` vật lý không thể phát 2 âm thanh cùng lúc!
2. **Quản lý Phiên bằng Token Nguyên tử (`sessionTokenRef`):**
   - Mỗi lần gọi `speak()` hoặc `stop()`, hệ thống tăng `sessionTokenRef.current += 1`.
   - Mọi callback (`onended`, `onerror`, `setTimeout`) đều kiểm tra: nếu token không khớp, lập tức ngừng mọi hoạt động, triệt tiêu 100% tình trạng âm thanh "ma" phát đè.
3. **Cơ chế Chuyển câu Tuần tự Đơn quyền (Single Advancement):**
   - Đảm bảo câu tiếp theo CHỈ được phát sau khi câu hiện tại đã hoàn tất (`onended`) hoặc sau khi proxy đã thử xong. Không có bất kỳ nhánh xử lý kép nào.
4. **Tự động đọc lời chào khi người dân truy cập vào trang:**
   - Ngay sau 300ms khi trang nạp xong, hệ thống tự động gọi phát lời chào `greetingText`.
   - **Xử lý hoàn hảo chính sách Autoplay:** Tích hợp bộ bắt sự kiện toàn cục ở tầng Capture (`window.addEventListener('click', ..., { capture: true, once: true })`). Ngay khi người dân chạm bất kỳ điểm nào trên màn hình, giọng nữ AI sẽ cất tiếng chào và hướng dẫn ngay lập tức.
5. **Cố định DUY NHẤT 1 GIỌNG NỮ & TỐC ĐỘ 1.15x:**
   - 100% âm thanh phát ra là Giọng Nữ Tiếng Việt Chuẩn (Google Vietnamese Female Voice qua direct/proxy stream).
   - Tốc độ đọc cố định ở mức `1.15x`, dứt khoát, lưu loát và tự nhiên.

---

## III. XÁC NHẬN KIỂM THỬ THỰC TẾ TRÊN BROWSER SUBAGENT
- **Kịch bản kiểm thử:**
  1. Mở trang chủ: Kiểm tra console 0 lỗi, singleton audio đã sẵn sàng.
  2. Bấm vào màn hình / nút lời chào: Giọng nữ AI cất tiếng đọc chào mừng mượt mà, xác nhận chỉ có DUY NHẤT 1 luồng âm thanh phát.
  3. Bấm vào thẻ *"Đăng ký Khai sinh"*: Mở bảng hướng dẫn `RagChatDrawer`, hệ thống tự động ngắt lời chào cũ và chuyển sang đọc nội dung thủ tục mới, **tuyệt đối không bị nói đè, không có 2 giọng đọc**.
- **Biên dịch Frontend:** `vite build` thành công trong 7.14s.
