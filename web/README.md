# Tefal Web — bản chạy thử bố cục

Bản web tĩnh để duyệt bố cục trên máy. Không cần cài gì.

## Mở xem

**Cách 1 — nhanh nhất:** bấm đúp `index.html` (mở bằng Chrome hoặc Edge).

**Cách 2 — giống web thật hơn:** mở terminal tại thư mục `web`, chạy

```
python -m http.server 8000
```

rồi vào http://localhost:8000

Cần có mạng để tải font (Google Fonts) và ảnh sản phẩm. Mất mạng thì trang vẫn chạy, ảnh thay bằng hình vẽ nét.

Xem bố cục điện thoại: nhấn F12, bấm biểu tượng điện thoại (Toggle device toolbar), chọn iPhone 12 Pro hoặc kéo khung hẹp dưới 768px.

## Có gì

| Trang | File | Ghi chú |
|---|---|---|
| Trang chủ | `index.html` | Hero, 3 mẫu giảm sâu nhất, nồi cơm xếp theo dung tích, mục lục danh mục |
| Danh mục | `danh-muc.html?nhom=noi-com-dien` | Lọc theo giá, Sản xuất tại Pháp, Đang giảm giá; sắp xếp; xem thêm 24 mẫu mỗi lần |
| Tìm kiếm | `danh-muc.html?q=RK81` | Tìm theo tên hoặc mã model, gõ không dấu cũng được |
| Chi tiết SP | `san-pham.html?id=DK-061` | Ảnh, giá, con số quyết định, thông số, mô tả, SP cùng nhóm giá gần nhất |
| Giỏ hàng | `gio-hang.html` | Đổi số lượng, bỏ khỏi giỏ, tạm tính |
| Thanh toán | `thanh-toan.html` | Người nhận, cách nhận (giao / showroom), địa chỉ, COD hoặc chuyển khoản, trang xác nhận đơn. Phải đăng nhập |
| Tài khoản | `tai-khoan.html` (`?che-do=dang-ky`, `?tiep=gio-hang.html`) | Đăng nhập, đăng ký, trang tài khoản, đăng xuất. Bản chạy thử: chỉ lưu trong trình duyệt, không lưu mật khẩu, chưa kiểm tra mật khẩu |

Mã nhóm: `noi-chao`, `noi-com-dien`, `noi-chien`, `noi-ap-suat`, `may-xay-ep`, `dao-dung-cu`, `am-dun`, `may-loc-nuoc`, `khac`, `ngoai-bep`.

## Giới hạn của bản chạy thử

- Dữ liệu là ảnh chụp ngày 12/10/2026 (232 SP), nằm trong `assets/js/data.js`. Giá và tồn kho không tự cập nhật.
- Ảnh đang lấy tạm từ bucket Supabase cũ. Khi có Supabase riêng của Tefal Web, đổi `IMG_BASE` trong `tools/build_data.py` rồi sinh lại `data.js`.
- Giỏ hàng chỉ lưu trong trình duyệt đang dùng. Nút "Đặt hàng" chưa gửi đơn.
- Tài khoản là bản giả lập để duyệt giao diện (`tefal-web-accounts`, `tefal-web-user` trong localStorage). Khi có Supabase riêng thay bằng Supabase Auth; chỗ cần thay có ghi chú trong `app.js`.
- Logo đang là chữ "Tefal" giữ chỗ. Thông tin showroom ở chân trang để trống.

## Cấu trúc

```
web/
  index.html, danh-muc.html, san-pham.html, gio-hang.html   (cùng một khung, khác data-page)
  assets/css/tokens.css   token màu, chữ, khoảng cách (sinh từ design-system/tokens.json)
  assets/css/tf.css       thành phần chung (bản sao design-system/components/bundle.css)
  assets/css/site.css     phần riêng của trang: giỏ hàng, lớp phủ, bảng xếp theo con số
  assets/js/tf.js         thành phần React (bản sao design-system/components/bundle.js)
  assets/js/data.js       dữ liệu SP, sinh bởi tools/build_data.py
  assets/js/app.js        logic trang: định tuyến theo data-page, lọc, giỏ hàng
  assets/js/vendor/       React 18.3.1
```

## Sinh lại dữ liệu

```
python tools/build_data.py data web/assets/js/data.js
```

`data/chunk*.jsonl` là bản xuất thô từ Supabase (mỗi dòng một SP). Quy tắc làm sạch nằm trong `memory/du-lieu-san-pham.md`.

## Quy tắc mua hàng

Khách chưa đăng nhập chỉ xem được. Bấm "Thêm vào giỏ", mở giỏ hàng hay thanh toán đều chuyển sang đăng nhập; đăng nhập xong tự thêm món vừa chọn và quay lại trang cũ. Mỗi tài khoản một giỏ (`tefal-web-cart:<email>`), đơn lưu ở `tefal-web-orders`.
