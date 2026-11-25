# SpecTable

Bảng thông số hai cột: nhãn `text-muted` bên trái, giá trị `text` bên phải, đường `line` giữa các hàng, hàng lẻ nền `bg` để mắt dò ngang dễ.

- Thứ tự hàng theo ngành, cố định cho mọi SP cùng ngành, để khách so hai trang mà không phải dò.
- Giá trị có đơn vị viết đầy đủ: "1,8 lít", "1.400 W", "24 tháng".
- Thiếu giá trị: bỏ hàng đó, không ghi "Đang cập nhật". Thiếu nhiều trường lõi thì hiện một dòng dưới bảng: "Thông số chưa đầy đủ, gọi để được tư vấn."
- `caption` là tên bảng, Playfair 20px.

Người dùng cung cấp: `rows` dạng `[nhãn, giá trị]`, `caption`.
