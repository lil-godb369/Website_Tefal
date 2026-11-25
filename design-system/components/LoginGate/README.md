# LoginGate

Khối mời đăng nhập, đặt thay cho nội dung trang cần tài khoản (giỏ hàng, thanh toán) khi khách chưa đăng nhập. Thẻ trắng căn giữa: vòng biểu tượng người dùng, tiêu đề Playfair, một câu lý do, hai nút "Đăng nhập" (chính) và "Đăng ký", một liên kết quay lại xem hàng.

- Tiêu đề nói việc khách đang muốn làm: "Đăng nhập để xem giỏ hàng", "Đăng nhập để đặt hàng".
- Hai nút dẫn tới trang tài khoản kèm trang cần quay lại (`tiep=`), để đăng nhập xong khách về đúng chỗ. Nếu khách vừa bấm "Thêm vào giỏ", sản phẩm đó được thêm sau khi đăng nhập.
- Không chặn xem sản phẩm, danh mục, tìm kiếm: chỉ chặn bước cần lưu thông tin của khách.

Người dùng cung cấp: `title`, `text`, `signInHref`, `signUpHref`, `browseHref`, `browseLabel`.
