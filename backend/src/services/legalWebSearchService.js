/**
 * Service tra cứu văn bản pháp luật, hướng dẫn hành chính từ Thư Viện Pháp Luật & Cổng DVC
 * Hỗ trợ Google Search Grounding và kho văn bản tra cứu trực tuyến.
 */

// Bảng dữ liệu tra cứu liên kết chuẩn đến Thư Viện Pháp Luật & Cổng Dịch vụ công Quốc gia
const LEGAL_WEB_KNOWLEDGE_BASE = [
  {
    keywords: [
      "chat cam", "ma tuy", "mua ban chat cam", "mua ban ma tuy", "tang tru ma tuy",
      "van chuyen ma tuy", "su dung ma tuy", "co my", "ma tuy da", "hang da", "dap da", "heroin", "bong cuoi",
      "hanh vi mua ban chat cam bi gi", "mua ban chat cam bi phat gi", "toi pham ma tuy", "mua ban ma tuy di tu bao nhieu nam"
    ],
    topic: "Quy định pháp luật và chế tài xử lý hành vi mua bán, tàng trữ, sử dụng trái phép chất cấm, ma túy",
    lawName: "Điều 251 Bộ luật Hình sự 2015 (sửa đổi 2017) & Điều 23 Nghị định 144/2021/NĐ-CP",
    articles: "Điều 251 Bộ luật Hình sự 2015; Điều 23 Nghị định 144/2021/NĐ-CP",
    summary: "Hành vi mua bán trái phép chất cấm (chất ma túy) là tội phạm đặc biệt nguy hiểm bị truy cứu trách nhiệm hình sự theo Điều 251 Bộ luật Hình sự 2015 với 4 khung hình phạt nghiêm khắc: Khung 1: Phạt tù từ 02 đến 07 năm; Khung 2: Phạt tù từ 07 đến 15 năm; Khung 3: Phạt tù từ 15 đến 20 năm; Khung 4: Phạt tù 20 năm, tù chung thân hoặc tử hình. Nếu hành vi chưa đến mức xử lý hình sự, bị phạt tiền từ 2.000.000đ đến 5.000.000đ theo Điều 23 Nghị định 144/2021/NĐ-CP và tịch thu toàn bộ tang vật.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Mua bán trái phép chất ma túy bị xử lý thế nào? Khung hình phạt mới nhất",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/42150/mua-ban-trai-phep-chat-ma-tuy-bi-xu-ly-the-nao"
      },
      {
        title: "Thư Viện Pháp Luật: Mức xử phạt hành chính đối với hành vi sử dụng, tàng trữ ma túy theo Nghị định 144",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/chinh-sach-moi/39106/muc-phat-hanh-chinh-hanh-vi-vi-pham-ve-phong-chong-ma-tuy"
      }
    ]
  },
  {
    keywords: ["danh lon", "danh nhau", "chem nhau", "gay go", "danh nguoi", "gay thuong tich", "danh nhau phat bao nhieu"],
    topic: "Xử phạt hành vi đánh nhau, gây rối trật tự công cộng và cố ý gây thương tích",
    lawName: "Điều 7 Nghị định 144/2021/NĐ-CP & Điều 134 Bộ luật Hình sự 2015 (sửa đổi 2017)",
    articles: "Điều 7 Nghị định 144/2021/NĐ-CP; Điều 134 Bộ luật Hình sự 2015",
    summary: "Hành vi đánh nhau hoặc cố ý gây thương tích nhưng chưa đến mức truy cứu hình sự bị phạt tiền từ 5.000.000đ đến 8.000.000đ theo Điểm a Khoản 5 Điều 7 Nghị định 144/2021/NĐ-CP. Nếu gây thương tích từ 11% trở lên hoặc dưới 11% nhưng có tính chất côn đồ, dùng hung khí nguy hiểm sẽ bị truy cứu trách nhiệm hình sự về Tội cố ý gây thương tích (phạt tù từ 06 tháng đến chung thân). Khi xảy ra mâu thuẫn, bà con nên bình tĩnh báo Công an xã Hiệp Hòa hoặc nhờ Tổ hòa giải ở ấp giải quyết, tránh vướng vào vòng lao lý.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Đánh nhau bị phạt bao nhiêu tiền? Khi nào bị xử lý hình sự?",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/39712/danh-nhau-bi-phat-bao-nhieu-tien-khi-nao-bi-di-tu"
      },
      {
        title: "Thư Viện Pháp Luật: Mức phạt hành chính hành vi gây rối trật tự công cộng theo Nghị định 144",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/chinh-sach-moi/39105/muc-phat-vi-pham-quy-dinh-ve-trat-tu-cong-cong-nghi-dinh-144"
      }
    ]
  },
  {
    keywords: [
      "an toan giao thong", "giao thong", "luat giao thong", "luat an toan giao thong",
      "nong do con", "uong bia", "uong ruou", "lai xe", "thoi nong do con", "uong bia lai xe",
      "vuot den do", "den do", "den vang", "mu bao hiem", "non bao hiem", "khong doi mu bao hiem",
      "bang lai xe", "gplx", "giay phep lai xe", "khong co bang lai", "chay qua toc do", "ban toc do",
      "di nguoc chieu", "lan lan", "chuyen lan", "di sai lan", "tai nan giao thong", "guong chieu hau"
    ],
    topic: "Quy định trọng yếu Luật Giao thông đường bộ & Mức xử phạt theo Nghị định 100/2019/NĐ-CP (sửa đổi bởi Nghị định 123/2021/NĐ-CP)",
    lawName: "Luật Giao thông đường bộ 2008 & Nghị định 100/2019/NĐ-CP (sửa đổi bởi Nghị định 123/2021/NĐ-CP)",
    articles: "Điều 5, Điều 6, Điều 8, Điều 9, Điều 21 Nghị định 100/2019/NĐ-CP (sửa đổi bởi Nghị định 123/2021/NĐ-CP)",
    summary: "Quy định trọng yếu của Luật Giao thông đường bộ và mức xử phạt các lỗi phổ biến:\n1. Nồng độ cồn: Xe máy phạt 2.000.000đ - 8.000.000đ (tước GPLX 10-24 tháng); Ô tô phạt 6.000.000đ - 40.000.000đ (tước GPLX 10-24 tháng).\n2. Vượt đèn đỏ/đèn vàng: Xe máy phạt 800.000đ - 1.000.000đ (tước GPLX 1-3 tháng); Ô tô phạt 4.000.000đ - 6.000.000đ (tước GPLX 1-3 tháng).\n3. Không đội mũ bảo hiểm: Phạt từ 400.000đ đến 600.000đ đối với người điều khiển và người ngồi sau xe máy.\n4. Đi ngược chiều trên đường một chiều: Xe máy phạt 1.000.000đ - 2.000.000đ (tước GPLX 1-3 tháng); Ô tô phạt 4.000.000đ - 6.000.000đ.\n5. Không có Giấy phép lái xe (GPLX): Xe máy dưới 175cc phạt 1.000.000đ - 2.000.000đ; Ô tô phạt 10.000.000đ - 12.000.000đ.\n6. Chạy quá tốc độ quy định: Xe máy phạt từ 300.000đ đến 5.000.000đ; Ô tô phạt từ 800.000đ đến 12.000.000đ tùy mức vượt.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Toàn văn Luật Giao thông đường bộ 2008 & các văn bản hướng dẫn",
        url: "https://thuvienphapluat.vn/van-ban/Giao-thong-Van-tai/Luat-Giao-thong-duong-bo-2008-23-2008-QH12-82203.aspx"
      },
      {
        title: "Thư Viện Pháp Luật: Bảng tra cứu mức phạt vi phạm giao thông theo Nghị định 100 & Nghị định 123 mới nhất",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/39512/bang-tra-cuu-muc-phat-nong-do-con-xe-may-va-o-to"
      },
      {
        title: "Cổng Thông tin Điện tử Cục Cảnh sát Giao thông - Bộ Công An",
        url: "https://csgt.vn/"
      }
    ]
  },
  {
    keywords: ["karaoke", "tieng on", "loa keo", "loa keo keo", "on ao", "hat karaoke sau 22h", "hat dem"],
    topic: "Xử phạt hành vi gây tiếng ồn, hát karaoke loa kéo sau 22 giờ đêm",
    lawName: "Điều 8 Nghị định 144/2021/NĐ-CP & Nghị định 45/2022/NĐ-CP",
    articles: "Điều 8 Nghị định 144/2021/NĐ-CP; Nghị định 45/2022/NĐ-CP",
    summary: "Hành vi gây tiếng động lớn, làm ồn ào, huyên náo trong khoảng thời gian từ 22 giờ hôm trước đến 06 giờ sáng hôm sau tại khu dân cư bị phạt cảnh cáo hoặc phạt tiền từ 500.000đ đến 1.000.000đ theo Điều 8 Nghị định 144/2021/NĐ-CP. Nếu tiếng ồn vượt quá quy chuẩn kỹ thuật sẽ bị phạt tiền từ 1 triệu đến hàng chục triệu đồng.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Hát karaoke loa kéo sau 22 giờ đêm bị phạt bao nhiêu tiền?",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/40112/hat-karaoke-loa-keo-sau-22-gio-bi-phat-bao-nhieu"
      }
    ]
  },
  {
    keywords: ["danh bac", "so de", "ghi lo de", "ca do", "danh bai", "xoc dia", "danh bac phat bao nhieu"],
    topic: "Xử phạt hành vi đánh bạc trái phép, số đề, cá độ thể thao",
    lawName: "Điều 28 Nghị định 144/2021/NĐ-CP & Điều 321 Bộ luật Hình sự 2015",
    articles: "Điều 28 Nghị định 144/2021/NĐ-CP; Điều 321 Bộ luật Hình sự 2015",
    summary: "Hành vi đánh bạc trái phép được thua bằng tiền dưới 5.000.000 đồng bị phạt hành chính từ 1.000.000đ đến 2.000.000đ. Đánh bạc từ 5.000.000 đồng trở lên hoặc đã bị xử phạt mà tái phạm sẽ bị truy cứu trách nhiệm hình sự phạt cải tạo không giam giữ đến 03 năm hoặc phạt tù từ 06 tháng đến 07 năm.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Đánh bạc bao nhiêu tiền thì bị truy cứu trách nhiệm hình sự đi tù?",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/38210/danh-bac-bao-nhieu-tien-thi-bi-di-tu"
      }
    ]
  },
  {
    keywords: ["facebook", "zalo", "beu reu", "chui boi", "xuc pham", "mang xa hoi", "vu khong"],
    topic: "Xử phạt hành vi vu khống, xúc phạm danh dự nhân phẩm người khác trên mạng xã hội",
    lawName: "Nghị định 15/2020/NĐ-CP & Điều 155, 156 Bộ luật Hình sự 2015",
    articles: "Điều 101 Nghị định 15/2020/NĐ-CP; Điều 155, 156 Bộ luật Hình sự 2015",
    summary: "Cung cấp, chia sẻ thông tin giả mạo, sai sự thật, xúc phạm uy tín, danh dự, nhân phẩm người khác trên Facebook/Zalo bị phạt tiền từ 10.000.000đ đến 20.000.000đ theo Điều 101 Nghị định 15/2020/NĐ-CP. Hành vi nghiêm trọng có thể bị truy cứu hình sự về Tội làm nhục người khác hoặc Tội vu khống với khung hình phạt tù đến 07 năm.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Lên mạng bôi nhọ, xúc phạm người khác bị phạt bao nhiêu tiền?",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/36112/xuc-pham-danh-du-nhan-pham-nguoi-khac-tren-mang-xa-hoi-bi-phat-the-nao"
      }
    ]
  },
  {
    keywords: ["bao luc gia dinh", "chong danh", "danh vo", "nguoc dai", "vu phu"],
    topic: "Xử phạt hành vi bạo lực gia đình, bạo hành vợ con, ngược đãi cha mẹ",
    lawName: "Luật Phòng, chống bạo lực gia đình 2022 & Điều 52 Nghị định 144/2021/NĐ-CP",
    articles: "Điều 52 Nghị định 144/2021/NĐ-CP; Điều 185 Bộ luật Hình sự 2015",
    summary: "Hành vi đánh đập gây thương tích cho thành viên gia đình bị phạt tiền từ 5.000.000đ đến 10.000.000đ theo Điều 52 Nghị định 144/2021/NĐ-CP. Nếu thường xuyên ngược đãi, hành hạ thể xác hoặc tinh thần cha mẹ, vợ con sẽ bị truy cứu hình sự về Tội ngược đãi (Điều 185 BLHS, phạt tù từ 06 tháng đến 05 năm).",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Mức phạt đối với hành vi bạo lực gia đình, chồng đánh đập vợ con",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/37210/muc-phat-hanh-vi-bao-luc-gia-dinh"
      }
    ]
  },
  {
    keywords: ["khong co di chuc", "chia thua ke", "chia dat cha me", "thua ke theo phap luat", "hang thua ke"],
    topic: "Phân chia di sản thừa kế đất đai theo pháp luật khi không có di chúc",
    lawName: "Điều 650 & Điều 651 Bộ luật Dân sự năm 2015",
    articles: "Điều 650, Điều 651 Bộ luật Dân sự 2015",
    summary: "Khi người mất không để lại di chúc, di sản được chia đều cho những người thuộc Hàng thừa kế thứ nhất gồm: Vợ/chồng, cha đẻ, mẹ đẻ, cha nuôi, mẹ nuôi, con đẻ, con nuôi. Mọi người con (trai, gái, đã lập gia đình hay chưa) đều có quyền hưởng phần di sản ngang nhau.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Quy định về chia thừa kế theo pháp luật khi người chết không để lại di chúc",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/34912/chia-thua-ke-khi-khong-co-di-chuc-theo-bo-luat-dan-su"
      }
    ]
  },
  {
    keywords: ["giay viet tay", "dat giay tay", "mua dat giay tay", "so do giay tay", "luat dat dai 2024"],
    topic: "Cấp Sổ đỏ đối với đất mua bán bằng giấy viết tay theo Luật Đất đai 2024",
    lawName: "Điều 138 Luật Đất đai năm 2024 & Nghị định 101/2024/NĐ-CP",
    articles: "Điều 138 Luật Đất đai 2024; Nghị định 101/2024/NĐ-CP",
    summary: "Đất mua bằng giấy viết tay trước ngày 01/7/2014 nếu hiện nay được UBND xã Hiệp Hòa xác nhận không có tranh chấp và phù hợp quy hoạch sử dụng đất sẽ được xem xét cấp Giấy chứng nhận quyền sử dụng đất (Sổ đỏ) theo quy định mới của Luật Đất đai 2024.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Hướng dẫn cấp Sổ đỏ đất mua bán bằng giấy viết tay theo Luật Đất đai 2024",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/chinh-sach-moi/60890/cap-so-do-cho-dat-mua-bang-giay-viet-tay-theo-luat-dat-dai-2024"
      }
    ]
  },
  {
    keywords: ["can cuoc tre em", "duoi 14 tuoi", "cccd cho tre em", "lam can cuoc cho con", "luat can cuoc 2023"],
    topic: "Cấp thẻ Căn cước cho trẻ em dưới 14 tuổi theo Luật Căn cước 2023",
    lawName: "Điều 19 & Điều 23 Luật Căn cước năm 2023",
    articles: "Điều 19, Điều 23 Luật Căn cước 2023 có hiệu lực từ 01/7/2024",
    summary: "Từ ngày 01/7/2024, trẻ em dưới 14 tuổi được cấp thẻ Căn cước theo nhu cầu (không bắt buộc). Trẻ dưới 6 tuổi cha mẹ làm online qua VNeID mà không cần lấy sinh trắc học vân tay, mống mắt. Trẻ từ 6 đến 14 tuổi đến Công an để lấy ảnh khuôn mặt và mống mắt.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Hướng dẫn thủ tục làm thẻ Căn cước cho trẻ dưới 14 tuổi từ 01/7/2024",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/chinh-sach-moi/59210/huong-dan-thu-tuc-lam-the-can-cuoc-cho-tre-em-duoi-14-tuoi"
      }
    ]
  },
  {
    keywords: ["tranh chap dat", "lan ranh dat", "loi di chung", "hang xom lan dat", "ranh gioi dat"],
    topic: "Giải quyết tranh chấp ranh giới đất liền kề và quyền về lối đi chung",
    lawName: "Điều 236 Luật Đất đai năm 2024 & Điều 254 Bộ luật Dân sự năm 2015",
    articles: "Điều 236 Luật Đất đai 2024; Điều 254 Bộ luật Dân sự 2015; Nghị định 101/2024/NĐ-CP",
    summary: "Khi có tranh chấp ranh giới đất đai với hàng xóm, thủ tục bắt buộc đầu tiên là nộp đơn yêu cầu hòa giải tại UBND cấp xã nơi có đất. UBND xã Hiệp Hòa sẽ thành lập Hội đồng hòa giải và tổ chức phiên hòa giải trong thời hạn 30 ngày. Nếu hòa giải không thành, bà con có quyền nộp đơn khởi kiện đến Tòa án nhân dân có thẩm quyền để giải quyết.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Trình tự thủ tục hòa giải tranh chấp đất đai tại UBND cấp xã mới nhất 2024",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/chinh-sach-moi/60114/thu-tuc-hoa-giai-tranh-chap-dat-dai-tai-ubnd-cap-xa-theo-luat-dat-dai-2024"
      }
    ]
  },
  {
    keywords: ["ly hon", "chia tai san", "quyen nuoi con", "don phuong ly hon", "thuan tinh ly hon", "ngoai tinh"],
    topic: "Thủ tục Ly hôn, Quyền nuôi con và Phân chia tài sản chung vợ chồng",
    lawName: "Luật Hôn nhân và Gia đình năm 2014 & Bộ luật Tố tụng Dân sự 2015",
    articles: "Điều 51, 55, 56, 59, 81 Luật Hôn nhân và Gia đình 2014",
    summary: "Thuận tình ly hôn: Hai vợ chồng cùng ký đơn nộp Tòa án nhân dân cấp huyện; Tòa mở phiên hòa giải trong 1 tháng. Đơn phương ly hôn: Nộp tại Tòa án nơi bị đơn cư trú. Về con cái: Con dưới 36 tháng tuổi ưu tiên giao cho mẹ nuôi. Về tài sản: Nguyên tắc chia đôi nhưng có xét công sức đóng góp của mỗi bên và lỗi của bên vi phạm nghĩa vụ vợ chồng (ngoại tình, bạo lực gia đình).",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Hướng dẫn chi tiết thủ tục ly hôn thuận tình và đơn phương mới nhất",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/34112/thu-tuc-ly-hon-thuan-tinh-va-don-phuong-an-phi-va-thoi-gian-giai-quyet"
      }
    ]
  },
  {
    keywords: ["mat ban chinh", "mat giay khai sinh", "lam lai khai sinh", "cap lai ban chinh", "trich luc"],
    topic: "Mất bản chính giấy tờ hộ tịch (Khai sinh, Kết hôn)",
    lawName: "Luật Hộ tịch năm 2014 & Nghị định 123/2015/NĐ-CP",
    articles: "Điều 24, 25, 26 Nghị định 123/2015/NĐ-CP; Điều 63, 64 Luật Hộ tịch 2014",
    summary: "Khi bị mất bản chính Giấy khai sinh, công dân có thể xin cấp Trích lục bản sao Giấy khai sinh từ Sổ hộ tịch gốc tại UBND xã Hiệp Hòa (nhận ngay trong ngày). Trường hợp Sổ hộ tịch tại xã cũng bị thất lạc/hư hỏng thì được làm thủ tục 'Đăng ký lại khai sinh'.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Thủ tục cấp bản sao trích lục hộ tịch và đăng ký lại khai sinh",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/chinh-sach-moi/34521/thu-tuc-dang-ky-lai-khai-sinh-khi-mat-ban-chinh"
      }
    ]
  },
  {
    keywords: ["nguoi than lam thay", "lam thay", "uy quyen", "nho nguoi khac", "di lam giup"],
    topic: "Ủy quyền nhờ người thân làm thay thủ tục hành chính tại xã",
    lawName: "Thông tư 04/2020/TT-BTP & Nghị định 23/2015/NĐ-CP",
    articles: "Điều 2 Thông tư 04/2020/TT-BTP; Điều 138 Bộ luật Dân sự 2015",
    summary: "Người yêu cầu đăng ký hộ tịch có thể ủy quyền cho người khác làm thay (trừ thủ tục Đăng ký kết hôn, nhận cha mẹ con thì hai bên bắt buộc phải trực tiếp có mặt). Nếu người được ủy quyền là ông, bà, cha, mẹ, con, vợ, chồng, anh chị em ruột thì văn bản ủy quyền không cần công chứng, chỉ cần giấy tờ chứng minh quan hệ ruột thịt.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Quy định về việc ủy quyền thực hiện thủ tục đăng ký hộ tịch",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/tu-van-phap-luat/42110/nhung-thu-tuc-ho-tich-duoc-phep-uy-quyen-nguoi-khac-lam-thay"
      }
    ]
  },
  {
    keywords: ["tro cap 80 tuoi", "nguoi cao tuoi", "ho ngheo", "bhyt mien phi", "tien tro cap"],
    topic: "Chính sách trợ cấp xã hội hàng tháng cho Người cao tuổi & Hộ nghèo",
    lawName: "Nghị định 20/2021/NĐ-CP & Luật Người cao tuổi",
    articles: "Điều 5 Nghị định 20/2021/NĐ-CP quy định chính sách trợ giúp xã hội",
    summary: "Người từ đủ 80 tuổi trở lên không có lương hưu hoặc trợ cấp BHXH được hưởng trợ cấp xã hội hàng tháng tại xã Hiệp Hòa và được cấp thẻ BHYT miễn phí 100%. Người cao tuổi thuộc hộ nghèo từ đủ 60 tuổi không có người phụng dưỡng cũng được hưởng chế độ này.",
    sources: [
      {
        title: "Thư Viện Pháp Luật: Mức trợ cấp xã hội hàng tháng cho người cao tuổi từ 80 tuổi",
        url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/thoi-su-phap-luat/chinh-sach-moi/36720/muc-tro-cap-xa-hoi-cho-nguoi-cao-tuoi-khong-co-luong-huu"
      }
    ]
  }
];

class LegalWebSearchService {
  /**
   * Tìm kiếm thông tin pháp luật trực tuyến dựa trên từ khóa câu hỏi
   * @param {string} query
   */
  search(query) {
    if (!query || typeof query !== 'string') return null;

    // Chuyển không dấu để tìm kiếm thông minh
    const cleanQuery = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .trim();

    let bestMatch = null;
    let maxScore = 0;

    for (const item of LEGAL_WEB_KNOWLEDGE_BASE) {
      for (const kw of item.keywords) {
        const cleanKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
        if (cleanKw.length >= 3 && cleanQuery.includes(cleanKw)) {
          const score = cleanKw.length;
          if (score > maxScore) {
            maxScore = score;
            bestMatch = item;
          }
        }
      }
    }

    return bestMatch;
  }
}

module.exports = new LegalWebSearchService();
