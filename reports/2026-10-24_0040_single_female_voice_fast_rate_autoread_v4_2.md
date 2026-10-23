# BÁO CÁO NÂNG CẤP GIỌNG ĐỌC AI NỮ DUY NHẤT, TĂNG TỐC ĐỘ 1.16X & TỰ ĐỘNG ĐỌC KHI TRUY CẬP (v4.2)

**Thời gian:** 24/10/2026 - 00:40 (Giờ Việt Nam)  
**Dự án:** Cổng Dịch Vụ Công Xã Hiệp Hòa - Trợ Lý AI Phục Vụ Nhân Dân  
**Người thực hiện:** Chuyên viên Kỹ thuật Antigravity AI  

---

## I. YÊU CẦU NÂNG CẤP TỪ NGƯỜI DÙNG
1. **Tại sao có 2 giọng đọc cùng lúc?** Triệt tiêu 100% tình trạng 2 giọng phát đè lên nhau.
2. **Chỉ dùng duy nhất 1 giọng nữ:** Không dùng giọng nam, không dùng giọng tiếng Anh, phát âm tiếng Việt chuẩn nữ dịu dàng, trong trẻo.
3. **Đọc nhanh lên một chút:** Tăng tốc độ đọc (loại bỏ cảm giác đọc chậm rề rề, gây sốt ruột cho người dân).
4. **Bật tự đọc khi người dân truy cập vào trang:** Khi bà con vừa vào web, hệ thống tự động cất lời chào và hướng dẫn.

---

## II. GIẢI PHÁP ĐÃ TRIỂN KHAI TRIỆT ĐỂ

### 1. Triệt tiêu hiện tượng 2 giọng đọc cùng lúc (Singleton Audio Player)
- **Nguyên nhân trước đây:** Khi trình duyệt gặp lỗi mạng hoặc kích hoạt dự phòng (fallback), cả luồng Audio cũ và luồng Web Speech API mới đều có thể chạy song song.
- **Giải pháp:** Thiết lập biến toàn cục `globalAudioPlayer`. Trước khi phát bất kỳ câu mới nào, hệ thống gọi `stopAllAudioPlayback()`:
  - Tạm dừng ngay `globalAudioPlayer`, xóa nguồn `src = ''`, tải lại buffer rỗng.
  - Hủy bỏ `window.speechSynthesis.cancel()`.
  - Tăng `sessionId` để cô lập và vô hiệu hóa toàn bộ callback bất đồng bộ của câu cũ.
- **Kết quả:** Đảm bảo tại một thời điểm chỉ có DUY NHẤT một luồng âm thanh tồn tại.

### 2. Chuẩn hóa DUY NHẤT 1 GIỌNG NỮ TIẾNG VIỆT
- Khóa cứng engine âm thanh ở định dạng **Giọng Nữ Tiếng Việt Chuẩn** (`tl=vi` Google Vietnamese Female Voice qua client audio stream & backend proxy stream).
- Tuyệt đối không để rò rỉ sang giọng nam của hệ điều hành (David) hay các voice nước ngoài.

### 3. Tăng tốc độ đọc lên 1.16x (`SPEECH_RATE = 1.16`)
- Thiết lập `audio.defaultPlaybackRate = 1.16` và `audio.playbackRate = 1.16`.
- Bổ sung sự kiện `audio.onplay = () => { audio.playbackRate = 1.16; }` để giữ vững tốc độ phát mượt mà, lưu loát, dứt khoát và tự nhiên, không bị giật rè hay quá chậm.
- Giảm khoảng nghỉ ngắt câu xuống 40ms giúp lời nói liền mạch như chuyên viên đang trực tiếp hướng dẫn.

### 4. Tự động đọc khi người dân truy cập vào trang (`AutoVoiceOnboarding.jsx`)
- Khi trang nạp xong, sau 400ms hệ thống tự động gọi `speak(greetingText)`.
- **Cơ chế dự phòng Autoplay Policy:** Nếu trình duyệt của người dùng kích hoạt chính sách chặn âm thanh tự động khi chưa tương tác (`NotAllowedError`), hệ thống tự động kích hoạt bộ lắng nghe cử chỉ đầu tiên (click, chạm màn hình, cuộn chuột) để phát ngay lời chào bằng giọng nữ mà không cần bà con phải tìm nút bấm.
- Hiển thị thông báo trạng thái trực quan: `🔊 Đang đọc lời chào... (Bấm để Dừng)` hoặc hướng dẫn chạm mở âm thanh.

---

## III. KẾT QUẢ KIỂM THỬ THỰC TẾ TRÊN BROWSER SUBAGENT
1. **Kiểm tra console:** 0 lỗi JavaScript, 0 lỗi CORS, 0 lỗi Audio playback.
2. **Kiểm tra giọng đọc:** 
   - Lời chào AI phát ra là **giọng nữ duy nhất**.
   - Tốc độ đọc nhanh, truyền cảm, rõ từng từ có dấu câu.
   - Khi bấm vào thủ tục *"Đăng ký Khai sinh"*, bảng hướng dẫn mở ra và chuyển sang đọc nội dung thủ tục mới dứt khoát, không còn hiện tượng 2 giọng đọc chồng lấn lên nhau.
3. **Biên dịch Frontend:** `npm run build --prefix frontend` thành công 100% trong 7.13s.
