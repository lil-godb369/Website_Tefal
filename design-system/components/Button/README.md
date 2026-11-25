# Button

Nút viền (`outline`) là mặc định; nút **chính** (`primary`, nền `accent`, chữ `on-accent`) dành cho việc trang đó tồn tại để làm: "Thêm vào giỏ", "Mua ngay", "Đặt hàng".

- Cao 44px, cỡ `sm` 36px (trong thẻ SP). Góc `radius-sm` (4px), không bo kiểu viên thuốc.
- Nhãn in hoa giãn chữ 0,06em bằng CSS; trong mã viết thường như câu: "Thêm vào giỏ", "Gọi tư vấn". Bắt đầu bằng động từ, không mũi tên, không biểu tượng cảm xúc.
- `dark`: nền `ink`, cho một nút nhấn trên mảng xám ấm `tint` (ví dụ băng khuyến mãi đầu tiên).
- `quiet`: chữ gạch chân mảnh, không in hoa, cho hành động phụ đặt cạnh nút chính.
- Hover: nút viền chuyển viền và chữ sang `accent`; nút chính sang `accent-hover`. Chuyển màu 160ms, không phóng to.
- Trong lưới thẻ SP, nút "Thêm vào giỏ" là nút chính cỡ nhỏ (34px, chữ 11px), đặc, căn trái, không kéo hết thẻ (như mẫu). Ngoài lưới, mỗi màn hình một nút chính.
- Trên điện thoại, đặt `block` trong thanh mua dính đáy.
- `GoogleButton`: nút "Tiếp tục với Google" theo hướng dẫn của Google (chữ G nhiều màu, nền `surface`, viền `line-strong`), chỉ trên trang tài khoản.
- Hết hàng: `disabled` và đổi nhãn thành "Hết hàng", kèm Badge `alert`. Đừng chỉ làm mờ nút.

Người dùng cung cấp: `children` (nhãn), `onClick` hoặc `href`, `variant`, `size`.
