# Icon

Bộ biểu tượng nét vẽ tay theo kiểu Lucide: khung 24, nét 1,6, đầu nét tròn, màu `currentColor`. Gồm biểu tượng giao diện (search, bag, menu, arrow, chevron, phone, user, eye, eyeOff, logout), cam kết (shield, award, tag, store) và danh mục (pot, cooker, fryer, blender, knife, kettle, drop, home).

- Luôn có `aria-hidden`; nút chỉ có biểu tượng phải mang `aria-label` ("Giỏ hàng, 2 sản phẩm").
- Cỡ 16px trong dải trên cùng, 18–22px trong đầu trang và nút, 24–26px trong TrustBar.
- Màu `accent` cho biểu tượng cam kết và vòng danh mục; còn lại theo màu chữ.
- Khi dựng web thật, thay bằng thư viện Lucide (`lucide-react`) cùng tên tương đương. Không dùng emoji làm biểu tượng.

Người dùng cung cấp: `name`, `size`, `stroke`.
