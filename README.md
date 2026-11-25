# Tefal Web

Web bán đồ bếp Tefal: nồi chảo, nồi cơm điện, nồi chiên không dầu, nồi áp suất, máy xay ép, ấm đun, máy lọc nước. Danh mục hiện có 232 sản phẩm.

Đang phát triển. Bản Next.js chạy được trên máy, chưa nối cơ sở dữ liệu thật và chưa đưa lên mạng.

## Tính năng

- Trang chủ, danh mục, tìm kiếm (gõ không dấu, tìm theo mã model), chi tiết sản phẩm.
- Lọc theo giá, nơi sản xuất, đang giảm giá. Sắp xếp và phân trang.
- Giỏ hàng, yêu thích, so sánh sản phẩm. Khách không cần đăng nhập để dùng.
- Thanh toán: giao tận nơi hoặc nhận tại showroom, COD hoặc chuyển khoản. Chỉ bước đặt hàng mới cần đăng nhập.
- Tài khoản bằng email và mật khẩu hoặc Google (Supabase Auth).
- Mỗi sản phẩm có một con số quyết định (dung tích, công suất, số chế độ), hiện trên thẻ và trên trang chi tiết.
- Có bố cục cho điện thoại.

## Thư mục

| Thư mục | Nội dung |
|---|---|
| [`frontend/`](frontend/) | Web thật: Next.js 16, React 19, TypeScript, Tailwind 4, Zustand, Supabase, Vitest, Playwright |
| [`web/`](web/) | Bản tĩnh để duyệt bố cục. Bấm đúp `web/index.html` là xem được, không cần cài gì |
| [`design-system/`](design-system/) | Bộ khung giao diện: token màu, chữ, thành phần, khung trang |
| [`video/`](video/) | Video giới thiệu sản phẩm dựng bằng Remotion |
| `tools/` | Script Python sinh dữ liệu và token CSS |
| `reference/design-md/` | Tài liệu phong cách tham khảo |

## Chạy web

Cần Node.js 20 trở lên.

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

Chưa có `.env.local` thì web vẫn chạy: xem hàng, lọc, giỏ, yêu thích, so sánh đều dùng được. Chỉ đăng nhập và đặt hàng bị tắt. Muốn bật thì chép `.env.example` thành `.env.local` và điền khóa Supabase.

Lệnh khác (`build`, `test`, `test:e2e`, `lint`) và cấu trúc mã: xem [`frontend/README.md`](frontend/README.md).

## Cơ sở dữ liệu

Supabase (PostgreSQL). Bảng, RLS và hàm đặt hàng `place_order` nằm trong `frontend/supabase/migrations/`, dữ liệu mẫu trong `frontend/supabase/seed.sql`. Giá được tra lại trong cơ sở dữ liệu khi đặt hàng, không tin giá gửi từ trình duyệt.

## Giao diện

- Nền đen, trắng, xám nhạt; nút viên thuốc đen; thẻ sản phẩm phẳng, ảnh trên nền xám.
- Đỏ Tefal chỉ dùng cho logo và giá giảm.
- Font Be Vietnam Pro.
- Chữ trên trang chỉ ghi điều có trong dữ liệu sản phẩm. Không tự đặt chính sách giao hàng hay đổi trả.

Chi tiết: [`design-system/README.md`](design-system/README.md).

## Lưu ý

- Ảnh sản phẩm hiện là ảnh tạm. Trước khi đưa web lên mạng phải thay bằng ảnh chính thức của Tefal.
- Dự án chưa có logo. Logo phải lấy từ bộ nhận diện chính thức của Tefal, không tự vẽ lại.
