# Field

Ô nhập có nhãn ở trên, gợi ý và lỗi ở dưới. Ba dạng: `Field` (chữ, email, số điện thoại), `PasswordField` (thêm nút hiện mật khẩu hình con mắt), `SelectField` (ô chọn, ví dụ tỉnh thành).

- Nhãn luôn hiện, không dùng placeholder thay nhãn. Ô không bắt buộc ghi thêm "(không bắt buộc)" sau nhãn; mặc định là bắt buộc.
- Cao 46px, viền `line-strong`, góc `radius-sm`. Đang gõ: vòng `focus-ring` và viền `accent`.
- Lỗi: viền `alert`, câu lỗi `alert` 13px ngay dưới ô, nối bằng `aria-describedby`, `aria-invalid="true"`. Câu lỗi nói cách sửa: "Nhập email đúng dạng, ví dụ ten@gmail.com.", không viết "Không hợp lệ".
- Kiểm khi bấm gửi, rồi đưa con trỏ tới ô lỗi đầu tiên. Không báo lỗi khi khách đang gõ.
- Gợi ý (`hint`) một dòng `text-muted` 12px: định dạng hoặc lý do cần ("Để gọi xác nhận đơn.").
- Đặt đúng `autoComplete` và `inputMode` (`email`, `tel`, `name`, `address-level1`…) để điện thoại mở đúng bàn phím và tự điền.
- Ô đánh dấu dùng lớp `tf-check`; ô ghi chú dài dùng `textarea` trong `tf-field`.
- Hai ô một hàng bằng `tf-form-grid`, ô kéo hết hàng bằng `tf-form-wide`; điện thoại một cột.

Người dùng cung cấp: `id`, `label`, `value`, `onChange`, `type`, `error`, `hint`, `optional`, `autoComplete`, `inputMode`; `options`, `placeholder` cho SelectField.
