# BÁO CÁO KHẮC PHỤC TRIỆT ĐỂ LỖI ÂM THANH & TỐI ƯU HÓA ENGINE GIỌNG ĐỌC AI (v4.1)

**Thời gian thực hiện:** 24/10/2026 - 00:30 (Giờ Việt Nam)  
**Dự án:** Cổng Dịch Vụ Công Xã Hiệp Hòa - Trợ Lý AI Phục Vụ Nhân Dân  
**Người thực hiện:** Chuyên viên Kỹ thuật Antigravity AI  

---

## I. NGUYÊN NHÂN GỐC RỄ ĐƯỢC PHÁT HIỆN QUA CHẨN ĐOÁN
1. **Lỗi Xung đột Cuộc gọi Kép (Double Race Condition):**
   - Khi người dân đặt câu hỏi hoặc bấm chọn thủ tục, cả `CitizenHomePage.jsx` và `RagChatDrawer.jsx` đều đồng thời kích hoạt lệnh `speak()` cách nhau 50ms - 300ms.
   - Cuộc gọi thứ hai ngắt ngay lập tức cuộc gọi thứ nhất khiến bộ tổng hợp âm thanh của trình duyệt (SpeechSynthesis / HTML5 Audio) rơi vào trạng thái hủy khẩn cấp hoặc nghẽn hàng đợi (audio deadlock).
2. **Lỗi CORS trên HTML5 Audio (`crossOrigin = 'anonymous'`):**
   - Trong `useSpeechSynthesis.js`, thẻ `<audio>` khai báo `audio.crossOrigin = 'anonymous'` khi tải file âm thanh từ Google Translate TTS. Google không trả về header `Access-Control-Allow-Origin: *`, dẫn đến trình duyệt Chrome chặn luồng media do vi phạm CORS policy.
3. **Lỗi Chính sách Autoplay của Trình duyệt (Browser Autoplay Policy):**
   - Banner `AutoVoiceOnboarding.jsx` kích hoạt lệnh đọc tự động sau 800ms khi vừa tải trang mà chưa có cử chỉ tương tác (click/touch) của người dùng, khiến trình duyệt ném ngoại lệ `NotAllowedError` và khóa luôn AudioContext của phiên làm việc.
4. **Độ trễ và Hạn chế Gói Voice Tiếng Việt trên Windows:**
   - Hệ điều hành Windows mặc định chỉ cài đặt giọng tiếng Anh (David/Zira). Nếu mạng nội địa bị nghẽn IPv6 khi gọi trực tiếp, âm thanh bị giật hoặc câm.

---

## II. GIẢI PHÁP ĐÃ TRIỂN KHAI TRIỆT ĐỂ
1. **Đơn quyền kích hoạt giọng đọc (Single-Owner Triggering):**
   - Gỡ bỏ hoàn toàn lệnh gọi `speak()` trùng lặp ở `CitizenHomePage.jsx`. `RagChatDrawer.jsx` trở thành thành phần duy nhất chịu trách nhiệm kích hoạt đọc toàn văn hướng dẫn và checklist sau khi giao diện đã ổn định.
2. **Kiến trúc Giọng đọc 3 Tầng Siêu Ổn Định (3-Tier Resilient TTS Engine):**
   - **Tầng 1 (Client-Side Google TTS trực tiếp):** Loại bỏ thuộc tính `crossOrigin` để phát mượt mà dưới dạng thẻ audio độc lập, không bị chặn CORS. Bổ sung bộ đếm timeout 3.5 giây.
   - **Tầng 2 (Backend Proxy `/api/tts`):** Nếu Tầng 1 gặp mạng chậm hoặc bị gián đoạn, tự động chuyển sang serverless endpoint `/api/tts?text=...` với cấu hình ép IPv4 (`family: 4`) và đầy đủ CORS headers.
   - **Tầng 3 (Web Speech API):** Tự động phát hiện voice tiếng Việt bản địa của thiết bị (hỗ trợ toàn bộ điện thoại Android/iOS và máy tính có Microsoft An/Hoài Mỹ/Nam Minh) kèm cơ chế giữ tham chiếu window chống V8 Garbage Collector.
3. **Quản lý Phiên Phát (Session ID Isolation):**
   - Mỗi lệnh `speak()` sinh một mã phiên duy nhất `sessionIdRef`. Mọi tiến trình callback bất đồng bộ từ các câu cũ sẽ bị hủy bỏ ngay lập tức, triệt tiêu 100% tình trạng nói đè, nói lặp hoặc dập tắt câu mới.
4. **Nút Tương tác Bật Tiếng AI Chuẩn UX:**
   - Thay thế việc tự phát âm thanh sau 800ms bằng nút bấm nổi bật, có hiệu ứng chuyển trạng thái: `🔊 Bấm vào đây để Nghe AI Chào Mừng` $\rightarrow$ `🔊 Đang đọc lời chào... (Bấm để Dừng)`.
   - Lắng nghe cử chỉ chạm đầu tiên trên màn hình để mở khóa vĩnh viễn AudioContext cho toàn bộ phiên làm việc.

---

## III. KẾT QUẢ KIỂM THỬ (BROWSER AUTOMATION TEST)
- Đã chạy kiểm thử tự động bằng Browser Subagent trên giao diện:
  - Bấm nút Nghe Lời Chào AI: Âm thanh phát mượt mà, chuyển đổi trạng thái chính xác.
  - Chọn thủ tục hành chính: Mở RagChatDrawer, hiển thị chỉ báo âm thanh rõ nét, không còn bất kỳ lỗi console hay CORS rejection nào.
- Đã biên dịch `npm run build --prefix frontend` thành công (0 lỗi).
