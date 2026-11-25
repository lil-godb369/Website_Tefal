# CategoryTile

Ô danh mục trên trang chủ: khay ảnh 4:3, ô vuông nhỏ màu `accent` (bo `radius-sm`, viền trắng) chứa biểu tượng trắng đè mép dưới ảnh, ở chính giữa; tên danh mục in hoa căn giữa; dòng "104 mẫu →" căn phải ở đáy ô.

- Sáu ô một hàng (`tf-grid-6`), 3 cột tablet, 2 cột điện thoại.
- Ảnh đại diện chọn một mẫu nhìn ra ngay là loại gì (nồi cơm thấy rõ thân nồi, dao thấy rõ lưỡi); không có ảnh thì hiện ProductArt theo `art`.
- Số mẫu đếm từ dữ liệu. Không có số thì hiện "Xem ngay".
- Hover: bóng đậm lên, tên và số chuyển `accent`, ảnh phóng 4%.

Người dùng cung cấp: `name`, `count`, `href`, `image`, `art`, `icon`.
