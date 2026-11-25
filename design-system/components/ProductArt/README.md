# ProductArt

Hình vẽ nét mảnh (chảo, bộ nồi, nồi cơm, nồi chiên, máy xay, dao) thay ảnh khi SP chưa có ảnh hoặc ảnh không tải được. Đi cùng hai thành phần ảnh:

- `Plate`: khay ảnh nền `plate` (trắng). Có `image` thì hiện ảnh, lỗi, thiếu ảnh, hoặc nằm trong màn hình 8 giây vẫn chưa tải xong thì tự đổi sang ProductArt theo `art`. Thẻ SP, thẻ danh mục và thư viện ảnh trang chi tiết đều dùng Plate.
- `Photo`: một ảnh SP. Khi `TF.photoCrop` khác `null`, Photo chỉ hiện vùng `{x, y, w, h}` (tỉ lệ so với ảnh gốc). Ảnh tạm hiện nay in logo và khuyến mãi của cửa hàng cũ, nên web chạy thử đặt `TF.photoCrop = { x: 0.02, y: 0.13, w: 0.6, h: 0.8 }`. Có ảnh chính thức Tefal thì đặt lại `null`.
- Nét vẽ màu `plate-ink`, dày 1,25px. Ảnh đặt `mix-blend-mode: multiply` để nền trắng của ảnh tan vào khay.
- Không vẽ logo, nhãn hay chi tiết nhận diện của Tefal.

Người dùng cung cấp: `kind` (ProductArt); `image`, `alt`, `art`, `tag` (Plate); `src`, `alt` (Photo).
