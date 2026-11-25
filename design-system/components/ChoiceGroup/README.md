# ChoiceGroup

Nhóm nút chọn một (radio) vẽ thành thẻ: mỗi lựa chọn có tiêu đề đậm và một dòng giải thích, tùy chọn biểu tượng. Dùng cho cách nhận hàng và cách thanh toán.

- Vẫn là `<input type="radio">` thật trong `<fieldset>` có `legend` (ẩn khỏi mắt): bàn phím dùng phím mũi tên, trình đọc màn hình đọc đủ nhóm.
- Thẻ đang chọn: viền `accent`, nền `accent-soft`. Thẻ khóa (`disabled`): mờ 60% và câu giải thích nói vì sao ("Chưa mở: cần đăng ký cổng thanh toán.").
- Dòng giải thích chỉ ghi điều có thật: không hứa "miễn phí giao hàng" khi phí còn tùy đơn; "Nhận tại showroom" mới ghi "không mất phí giao".
- Tối đa 4 lựa chọn; lựa chọn mặc định là cách phổ biến nhất (giao tận nơi, trả tiền khi nhận).

Người dùng cung cấp: `legend`, `name`, `items` (`key`, `title`, `text`, `icon`, `disabled`), `value`, `onChange`.
