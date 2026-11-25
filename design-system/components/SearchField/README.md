# SearchField

Ô tìm sản phẩm theo tên, loại hoặc mã model, đặt trong SiteHeader trên desktop và mở toàn màn hình từ nút kính lúp trên điện thoại.

- Nền `surface-raised`, viền `line`, đậm thành `line-strong` khi đang gõ; bo tròn hẳn (`radius-round`), cao 42px.
- Gợi ý mặc định: "Tìm tên hoặc mã model". Mã model (như "RK819868") in trên hộp và báo giá, nên tìm kiếm phải khớp cả mã model, không phân biệt dấu.
- Nhãn luôn có cho trình đọc màn hình (ẩn khỏi mắt). Không dùng placeholder thay nhãn.
- Không có kết quả: nói rõ đã tìm gì và gợi ý bước tiếp, kèm CategoryIndex.

Người dùng cung cấp: `onChange`, `defaultValue`, `id` khi có nhiều ô trên một trang.
