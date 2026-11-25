# QuickView

Modal xem nhanh mở khi bấm một thẻ SP (ProductCard có `onQuickView`): bên trái ảnh lớn trên khay `plate` (có nhãn giảm giá, ảnh nhỏ để đổi khi SP có nhiều ảnh), bên phải nhóm, tên SP, model và xuất xứ, giá, Badge, tối đa ba con số, bốn dòng thông số đầu, nút "Thêm vào giỏ" (chính) và "Xem chi tiết" (viền). SP chưa có giá: nút chính đổi thành "Gọi để báo giá".

- Bấm thường mở modal; Ctrl/Cmd/Shift hoặc chuột giữa vẫn mở trang chi tiết (thẻ vẫn là liên kết thật, tốt cho SEO và mở tab mới).
- `role="dialog"`, `aria-modal`, tiêu đề là tên SP. Mở ra con trỏ đặt ở tên SP; Tab chỉ đi vòng trong modal; Esc, nút đóng (44px, góc phải) hoặc bấm ra ngoài để đóng; đóng xong con trỏ quay về thẻ vừa bấm. Trang phía sau khóa cuộn.
- Bấm "Thêm vào giỏ" thì đóng modal rồi thêm, để khách thấy số trên giỏ đổi và thông báo nhỏ.
- Desktop: hai cột bằng nhau, rộng tối đa 980px, bo `radius-lg`, bóng `shadow-overlay`, nền mờ tối phía sau. Điện thoại: tấm trượt lên từ đáy, ảnh trên (4:3), thông tin dưới, hai nút dính đáy tấm.
- Mở dần 160–200ms, tắt khi `prefers-reduced-motion`.
- Không thay trang chi tiết: mô tả dài, bảng thông số đủ và SP cùng nhóm vẫn ở trang chi tiết.

Người dùng cung cấp: `product` (`name`, `kicker`, `meta`, `href`, `images`, `art`, `price`, `original`, `badges`, `figures`, `specs`), `onClose`, `onAdd`, `addLabel`, `callHref`, `note`, `returnFocus`. `product` rỗng thì không hiện gì.
