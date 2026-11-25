# SpecFigure

Con số thông số quan trọng nhất của một sản phẩm. Hai dạng: số lớn Be Vietnam Pro đậm màu chữ (đơn vị nhỏ màu phụ) trên trang chi tiết, và chip xám nhạt (`chip`) trên thẻ SP.

- Mỗi SP chọn **một** con số quyết định theo loại: nồi cơm và nồi chiên → dung tích; máy xay → công suất; dao → góc cắt; bộ nồi chảo → số món hoặc cỡ. Quy tắc nằm trong `tools/build_data.py`, không chọn tay từng SP.
- `value` viết theo cách người Việt đọc: dấu phẩy thập phân ("1,8"), dấu chấm hàng nghìn ("2.000"). `unit` tách riêng, thu nhỏ còn nửa cỡ.
- `label` nói con số đo cái gì. `note` là một dòng bối cảnh lấy từ dữ liệu thật; không tự đặt so sánh nếu chưa tính được.
- Cỡ 40px; 34px trong hàng ba con số (`tf-figure-row`) trên trang chi tiết, 26px trên điện thoại. Chip: chữ 12–13px trên nền `accent-soft`.
- Thiếu dữ liệu thì không render. Không bao giờ hiện "0" hay "—" ở cỡ lớn.

Người dùng cung cấp: `value`, `unit`, `label`, `note`, `chip`.
