Hệ thống giao diện cho web bán hàng Tefal. Đây là một dự án độc lập: không dùng chung tên, nhận diện, mã nguồn hay cơ sở dữ liệu với bất kỳ cửa hàng nào khác.

Phong cách, từ 15/10/2026: **cửa hàng đồ bếp sáng**, theo mẫu người dùng chọn (`reference/mau-kitchen-store.webp`). Nền trắng ngà, mảng xám ấm cho hero và băng khuyến mãi, một màu nhấn đỏ Tefal (theo màu logo, từ 15/10/2026 thay xanh ô liu của mẫu), dải trên cùng và chân trang tối, thẻ trắng bo 8px viền mảnh bóng nhẹ, tiêu đề khu vực in hoa căn giữa. Bản đầu (dark luxury, nhấn đồng) để lại trong theme `dem` chỉ để tham khảo.

Điều giữ lại từ bản đầu: **mỗi sản phẩm có một con số quyết định** (dung tích, công suất, số món). Trên thẻ SP con số là chip xám nhạt; trên trang chi tiết là số lớn đậm màu chữ.

## Giọng văn

- Viết như người bán hàng hiểu sản phẩm: câu ngắn, chủ động, con số trước, tính từ sau. "Dung tích 1,8 lít, cho gia đình 4–6 người", không viết "siêu phẩm đẳng cấp".
- Xưng "chúng tôi", gọi khách là "bạn".
- Trong mã, mọi tiêu đề và nút viết thường như câu: "Thêm vào giỏ", "Ưu đãi nổi bật". Chữ in hoa (nút, tiêu đề khu vực, danh mục chính) chỉ bật bằng CSS `text-transform`.
- Không dấu chấm than, không biểu tượng cảm xúc, không "SỐC", "HOT", "giá hủy diệt".
- Số theo kiểu Việt: dấu phẩy thập phân ("1,8 L"), dấu chấm hàng nghìn ("2.679.000 ₫").
- Mọi con số lấy từ dữ liệu sản phẩm: "Giảm đến 25%" là mức giảm sâu nhất đang có, "Bảo hành đến 36 tháng" là số tháng lớn nhất trong dữ liệu. Không có dữ liệu thì không viết.
- Không tự đặt chính sách: không "miễn phí giao hàng", "đổi trả 30 ngày", số điện thoại, quà tặng, trả góp, cho tới khi cửa hàng có chính sách thật. Không đặt logo hãng khác: web chỉ bán Tefal.
- Tên SP trên thẻ bỏ chữ "Tefal" (cả trang đã là Tefal); `<title>` và dữ liệu SEO giữ đủ tên.
- Khi dữ liệu mâu thuẫn (mô tả nói "sản xuất tại Pháp" nhưng `origin` ghi Trung Quốc), tin trường có cấu trúc, đừng chép câu trong mô tả.

## Màu

Ba theme. **Sáng** (`sang`) là giao diện web, mặc định. **Giấy** (`giay`) cho bản in và báo giá PDF. **Đêm** (`dem`) là bản đầu, không dùng trên web nữa.

- Nền trang `bg` (trắng ngà `#faf8f4`). Thẻ SP, thẻ danh mục, dải cam kết, thanh mua dính đáy: `surface` (trắng). Ô nhập, vùng hover: `surface-raised`.
- Mảng màu lớn `tint` (xám ấm `#f4f1ed`): hero, đầu trang danh mục, ba băng khuyến mãi. Chữ `text` 15:1, `text-muted` 6,1:1 trên tint; chữ `accent` 4,96:1 nên trên tint chỉ dùng accent cho chữ từ 14px đậm hoặc cỡ lớn.
- `accent` (đỏ `#d10a11`, sẫm hơn đỏ logo một chút để chữ trắng trên nút đạt 5,6:1) là màu nhấn **duy nhất**: nút chính (Mua ngay, Thêm vào giỏ, Đặt hàng), nút nhỏ trên thẻ SP (đặc, căn trái, như mẫu), nhãn giảm giá trên ảnh, mức giảm %, liên kết, biểu tượng cam kết, ô vuông biểu tượng danh mục, chấm đỏ trong hoa văn dưới tiêu đề khu vực. Con số thông số và chip không dùng đỏ. Hover nút: `accent-hover`. Chữ trên nền accent: `on-accent`.
- `brand` (`#e30613`, đúng đỏ logo Tefal) chỉ dùng cho logo chữ "Tefal". Không dùng cho chữ nhỏ hay nút (trên nền trắng chỉ 4,9:1).
- Mảng tối `ink`: dải trên cùng và chân trang. Chữ trên ink: `on-ink`, chữ phụ `on-ink-muted`, biểu tượng và liên kết nhấn `accent-on-ink`, đường chia `line-ink`.
- Chữ chính `text` (≥15:1), chữ phụ `text-muted` (≥6:1). Trên nền `ink`: `on-ink-muted` 7,3:1, `accent-on-ink` (đỏ sáng `#ff8577`) 7:1.
- Ảnh SP nằm trên khay `plate` trắng; nét vẽ thay ảnh `plate-ink`.
- Trạng thái: `ok` (còn hàng) lệch xanh dương, `alert` (hết hàng, lỗi ô nhập) đỏ nâu `#9b2c1f`, tối hơn hẳn `accent` để không lẫn với nút và nhãn giảm giá. Luôn kèm chữ, không chỉ đổi màu. `alert` không dùng cho giảm giá.
- Đường kẻ: `line` cho viền thẻ và chia khu vực; `line-strong` cho viền điều khiển (nút viền, chip lọc), ≥3:1.
- Bóng: `shadow-card` dưới thẻ, `shadow-card-hover` khi rê chuột, `shadow-overlay` cho lớp phủ (thanh mua, menu). Theme `giay` và `dem` không có bóng thẻ.
- Không gradient.

## Chữ

- **Be Vietnam Pro** (family `sans`): chữ thường, nút, nhãn, logo chữ, tiêu đề hero dòng đầu, tên SP trên thẻ, con số thông số (đậm 600, `tabular-nums`). Thiết kế riêng cho dấu tiếng Việt.
- **Độ đậm (chốt 22/10/2026):** mọi tiêu đề, tên SP, nhãn khối dùng 500; chỉ chữ trưng bày đậm (hero 900, Giờ vàng, băng khuyến mãi 800, khu trưng bày 700, logo chữ 700). Khối "Độ đậm tiêu đề" ở cuối `components/bundle.css`.
- **Playfair Display** (family `display`), như mẫu: tiêu đề khu vực in hoa căn giữa (dưới có hoa văn gạch mảnh và chấm đỏ), dòng nhấn đỏ cuối tiêu đề hero, tiêu đề băng khuyến mãi, tên danh mục, tên SP trang chi tiết. Luôn `lining-nums`.
- Cả hai có đủ dấu tiếng Việt trên Google Fonts. Không thay bằng Inter, Roboto hay font thiếu dấu.
- Tiêu đề lớn tiếng Việt: dòng cao tối thiểu 1,15, để dấu chồng ("ồ", "ế", "ằ") không chạm dòng trên.
- Chữ in hoa giãn (`label`, 12px, 0,06–0,14em): nút, danh mục chính, tiêu đề khu vực, dòng chữ nhỏ trên hero và băng khuyến mãi, tiêu đề cột chân trang.
- Đoạn văn tối đa `measure` (68 ký tự). Giá và bảng số dùng `tabular-nums`.

## Bố cục

Trang chủ, từ trên xuống (chi tiết trong mục Bố cục trang):

1. Dải cam kết tối (`ink`) có "Đăng nhập / Đăng ký" ở cuối, rồi đầu trang trắng: logo chữ, 5 danh mục, ô tìm kiếm, nút tài khoản, giỏ.
2. Hero tràn hết chiều ngang, nền ảnh bếp: chữ và hai nút bên trái. Không đặt thẻ sản phẩm nổi trên ảnh.
3. Dải 4 cam kết (hộp trắng) đè mép dưới hero.
4. "Mua theo danh mục": 6 ô danh mục.
5. "Ưu đãi nổi bật": 10 thẻ SP, 2 dòng × 5 (`tf-grid-5`), có nút "Thêm vào giỏ".
6. 3 băng khuyến mãi xám ấm.
7. "Được mua nhiều nhất" (đếm từ đơn đã đặt, chỉ hiện khi có đơn), "Giảm nhiều nhất" (theo mức giảm, không lặp mẫu ở Ưu đãi), "Bạn đã xem gần đây" (theo tài khoản, chỉ hiện khi đã đăng nhập và đã xem). Mỗi khu một dòng 5 thẻ. Không gọi là "bán chạy" khi chưa có số liệu bán thật.
8. Chân trang tối: 4 cam kết, cột thông tin, danh mục, mua hàng, ô nhận tin.

- `container-max` 1280px, lề `space-12` desktop, `space-6` tablet, `space-4` điện thoại. Khu vực cách nhau `space-16`.
- Góc: `radius-sm` (4px) nút, ô nhập, Badge, chip con số; `radius-md` (8px) thẻ, ô danh mục, băng khuyến mãi, khung mua; `radius-lg` (12px) hero và đầu trang danh mục; `radius-round` ô tìm kiếm, chip lọc, chấm số giỏ, vòng biểu tượng.
- Lưới: `tf-grid-6` (trang chủ: danh mục, ưu đãi), `tf-grid-products` (danh mục, SP liên quan: tự chia, tối thiểu 200px), `tf-grid-3` (băng khuyến mãi). Tablet 3 cột, điện thoại 2 cột.
- Trang tài khoản: một thẻ đăng nhập / đăng ký có nút gạt, nút Google, dòng "hoặc dùng email", bên phải lý do nên có tài khoản. Trang thanh toán: ba bước đánh số (Người nhận, Cách nhận hàng, Thanh toán) bên trái, đơn hàng dính bên phải. Giỏ hàng và thanh toán cần đăng nhập: khách chưa đăng nhập thấy LoginGate.
- Bấm một thẻ SP ở bất kỳ lưới nào mở QuickView: modal ảnh trái, thông tin và nút phải (điện thoại: tấm trượt từ đáy). "Xem chi tiết" sang trang SP đầy đủ.
- Điện thoại có bố cục riêng (`@media (max-width: 767px)`; khung xem thử đặt lớp `tf-phone` lên khung): đầu trang thu gọn với nút menu, ảnh SP vuốt ngang, ba con số một hàng, thanh mua dính đáy. Không thu nhỏ bản desktop.

## Hình ảnh

- Ảnh SP lấy từ trường `thumbnail` / `images`, đặt trên khay trắng `plate` với `mix-blend-mode: multiply`.
- Hero tràn hết chiều ngang màn hình như mẫu (không bo góc, không thụt lề); nền là ảnh bếp sáng (`assets/Hero/hero-bep.jpg`, web: `web/assets/img/hero-bep.jpg`) đặt qua biến CSS `--hero-bg` với lớp `tf-hero-photo`: lớp phủ sáng bên trái cho chữ, ảnh lệch phải; trên điện thoại ảnh thành dải dưới đáy hero. Không có ảnh thì nền xám ấm và ghép 2–3 ảnh SP bên phải; có ảnh thì đặt vào biến CSS `--hero-bg` (ví dụ `url(...) center/cover`). Băng khuyến mãi ghép ảnh SP to, tràn mép phải; không dùng ảnh minh họa mạng, không ảnh người mẫu.
- Ảnh tạm hiện nay (bucket cũ) in logo và khuyến mãi của cửa hàng cũ. Cho tới khi có ảnh chính thức Tefal, đặt `TF.photoCrop = { x: 0.02, y: 0.13, w: 0.6, h: 0.8 }` để thành phần `Photo` chỉ hiện vùng SP. Có ảnh sạch thì đặt lại `null`. Không đưa web lên mạng với ảnh cũ.
- Khi chưa có ảnh, ảnh lỗi, hoặc ảnh nằm trong màn hình 8 giây vẫn chưa tải xong (máy chủ ảnh bị chặn hay treo): `Plate` hiện `ProductArt` (hình vẽ nét), không để ô trắng. Bản xem trên claude.ai luôn hiện hình vẽ nét.
- Logo: dùng đúng file logo chính thức trong bộ nhận diện Tefal (cấp kèm ủy quyền bán hàng). Chưa có file: "Tefal" set bằng Be Vietnam Pro đậm màu `brand` để giữ chỗ. Không tự vẽ lại logo.
- Nếu bộ nhận diện chính thức quy định màu và font cho web đại lý, màu đó thay `accent` và font đó thay Playfair; bố cục giữ nguyên.

## Biểu tượng

Thành phần `Icon`: nét 1,6 theo kiểu Lucide, khung 24, màu `currentColor`. Cam kết (khiên, huy chương, nhãn giá, cửa hàng) màu `accent`; danh mục (nồi, nồi cơm, nồi chiên, máy xay, dao, ấm) màu trắng trong ô vuông đỏ nhỏ đè mép dưới ảnh ô danh mục, như mẫu. Khi dựng web thật, dùng thư viện Lucide. Không dùng emoji.

## Biểu mẫu

- Ô nhập (`Field`, `PasswordField`, `SelectField`): nhãn luôn hiện phía trên, gợi ý và lỗi phía dưới. Ô không bắt buộc ghi "(không bắt buộc)".
- Kiểm khi bấm gửi, rồi đưa con trỏ tới ô lỗi đầu tiên. Câu lỗi nói cách sửa ("Số điện thoại gồm 10 số, bắt đầu bằng 0.").
- Lựa chọn một trong vài cách (nhận hàng, thanh toán): `ChoiceGroup` dạng thẻ, không dùng danh sách thả xuống.
- Nút Google theo hướng dẫn của Google (chữ G nhiều màu, nền trắng, viền), đặt trên dòng "hoặc dùng email".
- Bản chạy thử chỉ lưu tài khoản và đơn trong trình duyệt, không lưu mật khẩu; mỗi biểu mẫu ghi rõ điều này. Khi nối Supabase Auth thật mới bỏ dòng ghi chú.

## Chuyển động

- Hover thẻ: bóng đậm lên, tên chuyển `accent`, ảnh phóng 4%. Không nhấc thẻ, không xoay.
- 160–300ms, `ease-out`. Không fade-up từng khu vực khi cuộn trang.
- Tôn trọng `prefers-reduced-motion`: tắt hết.

## Trạng thái và trợ năng

- Vòng focus: viền liền 2px `focus-ring`, cách 2px; trên nền tối dùng `accent-on-ink`. Không bao giờ bỏ outline.
- Vùng chạm tối thiểu `touch-min` (44px) cho nút và biểu tượng; nút nhỏ trong thẻ SP 36px.
- Mọi biểu tượng không chữ có `aria-label` ("Giỏ hàng, 2 sản phẩm"). Ô tìm kiếm và ô nhận tin có nhãn ẩn; không dùng placeholder thay nhãn.
- Có liên kết "Bỏ qua, tới nội dung" đầu trang.
- Đích: tải dưới 2 giây, HTML ngữ nghĩa, thẻ meta thật cho từng SP, tương phản WCAG AA ở mọi theme.

## Dùng hệ thống này

Token trong `tokens.json` (v2), sinh `tokens.css` bằng `tools/compile_tokens.py`. Thành phần trong `components/bundle.js` dưới tên `window.TF` (cần React 18), kiểu dáng trong `components/bundle.css`, tiền tố lớp `tf-`. Thành phần: Button, Badge, SearchField, PriceTag, SpecFigure, SpecTable, ProductArt, Plate, Photo, ProductCard, CategoryIndex, CategoryTile, SectionTitle, TrustBar, PromoBanner, SiteHeader, Icon, Field, PasswordField, SelectField, ChoiceGroup, GoogleButton, LoginGate, QuickView. `bundle.css` có sẵn các lớp bố cục trang (`.tf-container`, `.tf-hero`, `.tf-trust-wrap`, `.tf-grid-6`, `.tf-pdp`, `.tf-footer`…). Bảy khung trang (Trang chủ, Danh mục, Chi tiết SP, Chi tiết SP trên điện thoại, Đăng nhập / Đăng ký, Thanh toán, Thanh toán trên điện thoại) ghép từ chính các thành phần này; web chạy thử trong `web/` dùng bản chép của bundle.
