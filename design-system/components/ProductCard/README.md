# ProductCard

Thẻ sản phẩm kiểu cửa hàng: hộp trắng `surface`, viền `line`, bo `radius-md` (8px), bóng nhẹ `shadow-card`. Từ trên xuống: khay ảnh vuông có nhãn giảm giá góc trái, tên SP, mã model, chip con số, giá, nút "Thêm vào giỏ".

- Tên SP bỏ chữ "Tefal" (cả trang đã là Tefal), tối đa hai dòng. `<title>` và dữ liệu SEO giữ đủ tên.
- `meta` = "Model RK819868".
- Nhãn góc ảnh: mức giảm "−19%" khi giá gốc lớn hơn giá bán; nếu không có thì `tag`.
- Một đường kẻ `line` ngăn khay ảnh (trên) với nội dung (dưới), ở mọi thẻ SP.
- `figure` hiện dạng chip xám nhạt (SpecFigure `chip`): con số quyết định của SP.
- Tên SP tối đa 2 dòng, giữ chỗ đủ 2 dòng để giá và nút thẳng hàng trong lưới. Web không truyền `meta` vì tên đã có mã model.
- Nút dưới thẻ: nút đỏ đặc, nhỏ, căn trái (như mẫu).
- `onAdd` thêm nút nhỏ dưới thẻ: "Thêm vào giỏ" khi có giá, "Gọi báo giá" (viền) khi giá 0. Giá 0 thì chỗ giá ghi "Gọi để báo giá".
- `onQuickView`: bấm thẻ mở QuickView (modal xem nhanh) thay vì sang trang chi tiết; Ctrl/Cmd hoặc chuột giữa vẫn mở trang. Web chạy thử bật cho mọi thẻ.
- Hover: bóng đậm lên (`shadow-card-hover`), tên chuyển `accent`, ảnh phóng 4%. Không nhấc thẻ lên.
- Lưới: `tf-grid-6` (6 cột) trên trang chủ, `tf-grid-products` (tự chia, tối thiểu 200px) trên trang danh mục; điện thoại 2 cột.
- `badges` vẫn hỗ trợ nhưng thẻ trong lưới không dùng; đặt Badge trên trang chi tiết.

Người dùng cung cấp: `name`, `meta`, `href`, `price`, `original`, `image` hoặc `art`, `figure`, `onAdd`.
