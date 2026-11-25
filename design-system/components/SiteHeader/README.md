# SiteHeader

Đầu trang hai tầng: dải cam kết nền `ink` (biểu tượng đỏ sáng `accent-on-ink` + chữ), rồi hàng trắng gồm logo chữ, danh mục, ô tìm kiếm, nút tài khoản và giỏ hàng.

- Logo: "Tefal" set bằng Be Vietnam Pro đậm 700 màu `brand` (đỏ logo), dòng chữ nhỏ "Thương hiệu danh tiếng từ Pháp" bên dưới (viết thường, 11px, `text-muted`; Tefal ra đời ở Pháp năm 1956, nay thuộc Groupe SEB). Chỉ là chỗ giữ: thay bằng file logo chính thức trong bộ nhận diện Tefal cấp kèm ủy quyền; không tự vẽ lại.
- Dải trên (`top`): tối đa ba cam kết có trong dữ liệu ("Hàng chính hãng Tefal", "Bảo hành đến 36 tháng", "Xem và nấu thử tại showroom"); đầu phải là `contact` rồi `account`. Không tự đặt miễn phí giao hàng, đổi trả hay số điện thoại.
- Tài khoản (`account`): chưa đăng nhập thì dải trên ghi "Đăng nhập / Đăng ký", nút hình người cạnh giỏ có nhãn "Đăng nhập hoặc đăng ký". Đã đăng nhập (`signedIn`) thì ghi "Chào, Lan" và nút có chấm `accent` nhỏ; nhãn trợ năng đọc "Tài khoản của …". Trên điện thoại chỉ còn nút hình người.
- Danh mục chính: tối đa 5 mục, chữ in hoa 12px; mục đang xem có gạch dưới `accent` và `aria-current="page"`.
- Web chạy thử cho đầu trang dính khi cuộn, dải tối trượt khuất (`top: -38px`).
- `compact` cho điện thoại: dải trên còn một cam kết; hàng dưới còn nút menu, logo, kính lúp, tài khoản, giỏ. Danh mục chuyển vào menu toàn màn hình.
- Số trong giỏ là chấm tròn `accent`; nhãn trợ năng đọc đủ "Giỏ hàng, 2 sản phẩm".

Người dùng cung cấp: `items`, `active`, `top`, `contact`, `account` (`href`, `text`, `label`, `signedIn`), `cartCount`, `cartHref`, `compact`, `onSearch`, `onMenu`.
