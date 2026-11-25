# Design System Master File — Tefal Web

> **LOGIC:** Khi dựng một trang, đọc file này trước. Nếu có `design-system/tefal-web/pages/<tên-trang>.md` thì file đó ghi đè file này.
> File này viết tay từ quyết định ngày 15/10/2026 (phong cách cửa hàng sáng), KHÔNG sinh lại bằng `search.py --design-system --persist --force` (sẽ ghi đè các quyết định đã chốt).

**Project:** Tefal Web — web bán đồ bếp Tefal, tiếng Việt
**Nguồn sự thật:** `design-system/tokens.json` v2 (giá trị), `design-system/README.md` (quy tắc), `design-system/bo-cuc-trang.md` (khung trang), `web/` (bản chạy thử)
**Mẫu tham chiếu:** `reference/mau-kitchen-store.webp`

---

## Pattern

- **Product type:** E-commerce, đồ gia dụng nhà bếp, một thương hiệu (chỉ Tefal)
- **Trang chủ:** dải cam kết tối > đầu trang trắng > hero xám ấm (chữ trái, ảnh SP phải) > dải 4 cam kết > 6 ô danh mục > 6 thẻ ưu đãi có nút "Thêm vào giỏ" > 3 băng khuyến mãi > chân trang tối có ô nhận tin
- **Giữ từ bản đầu:** mỗi SP có một con số quyết định (dung tích, công suất, số món): chip xám nhạt trên thẻ, số lớn đậm màu chữ trên trang chi tiết
- **Tài khoản và thanh toán:** nút người dùng cạnh giỏ và "Đăng nhập / Đăng ký" cuối dải tối; trang đăng nhập/đăng ký một thẻ có nút gạt và nút Google; thanh toán 3 bước đánh số + đơn hàng dính bên phải; giỏ và thanh toán cần đăng nhập (LoginGate)
- **CTA:** "Thêm vào giỏ" / "Mua ngay" / "Đặt hàng" (nền accent); "Gọi tư vấn", "Xem danh mục" (viền); một băng khuyến mãi nút tối (`ink`)

## Style

- **Name:** cửa hàng sáng (Kitchen Store): sạch, ấm, thương mại
- **Keywords:** nền trắng ngà, mảng xám ấm, một màu nhấn đỏ Tefal, dải tối trên cùng và chân trang, thẻ trắng bo 8px viền mảnh bóng nhẹ, tiêu đề khu vực in hoa căn giữa có nét nhấn
- **Không dùng:** gradient, glassmorphism, thẻ bo tròn lớn kiểu viên thuốc, emoji làm icon, sao đánh giá (chưa có dữ liệu), logo hãng khác, chữ "SỐC/HOT", dấu chấm than
- **Không viết:** miễn phí giao hàng, đổi trả, số điện thoại, quà tặng khi chưa có chính sách thật

## Colors (theme `sang`, mặc định; `giay` cho in, `dem` là bản đầu)

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Background | `#faf8f4` | `--bg` |
| Surface (thẻ, dải cam kết) | `#ffffff` | `--surface` |
| Surface raised (ô nhập, hover) | `#f2eee6` | `--surface-raised` |
| Tint (hero, băng khuyến mãi; xám ấm) | `#f4f1ed` | `--tint` |
| Text | `#1d1c19` | `--text` |
| Text muted | `#5f5a50` | `--text-muted` |
| Brand (chỉ logo chữ, đỏ logo Tefal) | `#e30613` | `--brand` |
| Accent / CTA (đỏ Tefal) | `#d10a11` | `--accent` |
| Accent hover | `#a8000e` | `--accent-hover` |
| Accent soft (chip, nhãn, lựa chọn đang chọn) | `#fdecea` | `--accent-soft` |
| On accent | `#ffffff` | `--on-accent` |
| Ink (dải trên, chân trang) | `#1f1e1b` | `--ink` |
| On ink / muted / accent | `#f3efe7` / `#b3ab9c` / `#ff8577` | `--on-ink` / `--on-ink-muted` / `--accent-on-ink` |
| Line / Line strong | `#e6e0d4` / `#877d69` | `--line` / `--line-strong` |
| Plate (khay ảnh) | `#ffffff` | `--plate` |
| OK (còn hàng) | `#2f5f73` | `--ok` |
| Alert (hết hàng, lỗi ô nhập; đỏ nâu, tối hơn accent) | `#9b2c1f` | `--alert` |
| Focus ring | `#d10a11` | `--focus-ring` |

Token `brass` / `on-brass` cũ đã đổi tên thành `accent` / `on-accent`. Badge `tone="brass"` vẫn chạy như `accent`.

## Typography

- **Tiêu đề hero, chữ thường, nút, logo chữ:** Be Vietnam Pro (300–700)
- **Tiêu đề khu vực (in hoa, căn giữa, hoa văn gạch–chấm), dòng nhấn hero, tiêu đề băng khuyến mãi, tên danh mục, tên SP trang chi tiết:** Playfair Display, luôn `lining-nums` (như mẫu)
- **Con số thông số, tên SP trên thẻ, chữ thường, nút:** Be Vietnam Pro
- **Theo mẫu:** hero tràn hết chiều ngang; nút "Thêm vào giỏ" trên thẻ đặc, nhỏ, căn trái; ô danh mục có ô vuông biểu tượng màu nhấn
- **Google Fonts:** `https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap`
- Cỡ: hero 54px (điện thoại 34px), tiêu đề khu vực 26px in hoa (20px), tên danh mục 44px, con số 40px, chữ thường 15px, nhãn in hoa 12px
- Tiêu đề lớn tiếng Việt: line-height ≥ 1,15. Giá và bảng số: `tabular-nums`.

## Spacing / layout

- Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px (`--space-1` … `--space-32`); khu vực cách nhau 64px
- Container 1280px; lề 48px desktop, 24px tablet, 16px điện thoại
- Radius: 4px (nút, ô nhập, badge), 8px (thẻ, ô danh mục, băng khuyến mãi), 12px (hero, đầu trang danh mục), 999px (ô tìm kiếm, chip lọc, chấm giỏ, vòng icon)
- Bóng: `--shadow-card`, `--shadow-card-hover`, `--shadow-overlay`
- Lưới: `tf-grid-6`, `tf-grid-products` (tối thiểu 200px), `tf-grid-3`; điện thoại 2 cột

## Motion

- 160–300ms ease-out; hover thẻ: bóng đậm, tên đổi màu, ảnh phóng 4%; không fade-up khi cuộn; tôn trọng `prefers-reduced-motion`

## Ảnh

- Ảnh SP trên khay trắng, `mix-blend-mode: multiply`
- Ảnh tạm (bucket cũ) in logo cửa hàng cũ: đặt `TF.photoCrop = { x: 0.02, y: 0.13, w: 0.6, h: 0.8 }` cho tới khi có ảnh chính thức Tefal; không đưa lên mạng với ảnh cũ
- Logo: file chính thức Tefal, chưa có; tạm set chữ "Tefal" Be Vietnam Pro 700 màu `--brand`

## Components (window.TF, class `tf-*`)

Button, Badge, SearchField, PriceTag, SpecFigure, SpecTable, ProductArt, Plate, Photo, ProductCard, CategoryIndex, CategoryTile, SectionTitle, TrustBar, PromoBanner, SiteHeader, Icon, Field, PasswordField, SelectField, ChoiceGroup, GoogleButton, LoginGate, QuickView — xem `design-system/components/<Tên>/README.md` và `components/index.d.ts`.

## Pre-Delivery Checklist

- [ ] Không emoji làm icon (dùng Lucide hoặc `TF.Icon`)
- [ ] `cursor: pointer` cho mọi phần tử bấm được
- [ ] Hover 150–300ms, không nhấc hay phóng to thẻ
- [ ] Tương phản chữ ≥ 4.5:1 trên `bg`, `surface`, `tint` và `ink` (chữ `accent` trên `tint` chỉ 4,96:1: dùng cho chữ đậm hoặc cỡ lớn)
- [ ] Biểu mẫu: nhãn luôn hiện, lỗi nói cách sửa, con trỏ tới ô lỗi đầu tiên, đúng `autoComplete`
- [ ] Focus thấy rõ khi dùng bàn phím (cả trên nền tối)
- [ ] `prefers-reduced-motion`
- [ ] Responsive 375, 768, 1024, 1440px; điện thoại có bố cục riêng
- [ ] Không chữ nào khẳng định chính sách hay con số không có trong dữ liệu
- [ ] Ảnh không lộ logo cửa hàng cũ
- [ ] Tải < 2 giây, HTML ngữ nghĩa, meta tag thật cho từng SP
