# Badge

Một đến bốn chữ về trạng thái hoặc sự thật của sản phẩm, đặt trên trang chi tiết cạnh giá, hoặc dưới thẻ SP khi cần.

- `ok` + `dot`: "Còn hàng". `alert` + `dot`: "Hết hàng". Màu luôn đi kèm chữ; không bao giờ chỉ có chấm màu.
- `neutral` (mặc định): xuất xứ, bảo hành, "Dùng được bếp từ". Lấy từ dữ liệu thật (`origin`, `warrantyMonths`), không viết theo cảm tính.
- `accent` (nền `accent-soft`, chữ `accent`): chỉ cho mức giảm giá. Tối đa một Badge accent trên mỗi SP. Tên cũ `brass` vẫn chạy, để tương thích.
- Tối đa ba Badge một chỗ. Nhiều hơn thì đưa vào bảng thông số.
- Góc `radius-sm` (4px), cao 24px, chữ 12px viết thường. Không dấu chấm than, không "SỐC", "HOT".

Người dùng cung cấp: `children`, `tone`, `dot`.
