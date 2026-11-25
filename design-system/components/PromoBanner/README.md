# PromoBanner

Băng khuyến mãi nền `tint` (xám ấm): chữ nhỏ in hoa, tiêu đề Playfair, lời mời bấm; bên phải hai ảnh SP to, tràn mép phải (như mẫu). Ba băng một hàng (`tf-grid-3`) cuối trang chủ.

- Mọi con số trong tiêu đề tính từ dữ liệu: "Giảm đến 25%" là mức giảm sâu nhất đang có, "14 mẫu", "62 mẫu nồi chảo từ nhà máy Pháp". Đổi dữ liệu thì chữ tự đổi.
- Không viết khuyến mãi không có thật (quà tặng, trả góp 0%, miễn phí giao hàng).
- `solid` cho một băng duy nhất (nút nền `ink`); hai băng còn lại dùng chữ có mũi tên.
- Không có ảnh thì hiện ProductArt theo `art`.
- Mỗi băng có viền `line` và bóng `shadow-card` để rõ khối trên nền trang. Rê chuột vào một băng (hoặc focus bằng bàn phím): băng đó nhích lên 6px và phóng 2%, bóng đậm hơn; hai băng còn lại mờ xuống (độ mờ 45%, giảm màu). Chỉ bật trên thiết bị có chuột (`hover: hover`); 220ms; tắt chuyển động khi `prefers-reduced-motion`.

Người dùng cung cấp: `kicker`, `title`, `cta`, `href`, `images`, `art`, `solid`.
