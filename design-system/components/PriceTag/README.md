# PriceTag

Giá bán, giá gốc gạch ngang và mức giảm, định dạng tiền Việt: "2.679.000 ₫".

- Truyền số nguyên VND vào `price` và `original`; thành phần tự định dạng (dấu chấm hàng nghìn, khoảng trắng không ngắt trước ₫) và tự tính mức giảm.
- Giá gốc chỉ hiện khi **lớn hơn** giá bán. Dữ liệu có vài SP giá niêm yết thấp hơn giá bán (lỗi dữ liệu); thành phần bỏ qua giá gốc thay vì hiện mức giảm âm.
- Giá bán `text` đậm 600, giá gốc `text-muted`, mức giảm `accent`. Không tô đỏ giá.
- Trên thẻ SP truyền `showOff={false}`: mức giảm đã nằm trên nhãn góc ảnh.
- `size="lg"` cho trang chi tiết: số 30px. Số dùng tabular để thẳng cột trong lưới.
- SP có giá 0: không render PriceTag; hiện "Gọi để báo giá".

Người dùng cung cấp: `price`, `original` (tùy chọn), `size`, `showOff`.
