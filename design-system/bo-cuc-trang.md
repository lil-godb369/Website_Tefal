# Bố cục trang

Khung của các trang chính (trang chủ, danh mục, chi tiết SP, tài khoản, thanh toán), theo phong cách cửa hàng sáng (15/10/2026). Mỗi khung có bản xem trực tiếp trong mục Thành phần, nhóm "Khung trang". Web chạy thử trong `web/` dựng đúng các khung này với dữ liệu thật.

## Trang chủ

```
┌───────────────────────────────────────────────────────────────┐
│ ◇ Chính hãng  ◇ Bảo hành 36 tháng  ◇ Showroom   Liên hệ  ◯ Đăng nhập / Đăng ký │  ink, icon accent-on-ink
├───────────────────────────────────────────────────────────────┤
│ Tefal     NỒI CHẢO  NỒI CƠM ĐIỆN  NỒI CHIÊN  …  (Tìm…)  ◯  (giỏ) │  logo màu brand; ◯ = tài khoản
├───────────────────────────────────────────────────────────────┤
│ ╭───────────────────────────────────────────────────────────╮ │
│ │ NẤU NGON, DỌN NHANH, DÙNG BỀN     ảnh bếp (nền, tràn ngang)│ │  --hero-bg, lớp phủ sáng trái
│ │ Đồ bếp Tefal                                               │ │  sans 54px
│ │ cho mỗi bữa cơm.                                           │ │  Playfair accent
│ │ lead 42 ký tự                                              │ │
│ │ [MUA NGAY] [XEM DANH MỤC]                                  │ │
│ ╰──────────╭────────────────────────────────────────────╮───╯ │
│            │ ◇ CHÍNH HÃNG │ ◇ BẢO HÀNH │ ◇ GIÁ │ ◇ SHOWROOM │   │  TrustBar đè mép hero
│            ╰────────────────────────────────────────────╯     │
│                     MUA THEO DANH MỤC                          │  SectionTitle
│                         ──●──                                  │  hoa văn
│                       XEM THÊM →                               │  liên kết dưới hoa văn
│                           ──                                   │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                      │  CategoryTile × 6
│ │ảnh │ │ảnh │ │ảnh │ │ảnh │ │ảnh │ │ảnh │                      │
│ │●   │ │●   │ │●   │ │●   │ │●   │ │●   │                      │  vòng icon accent
│ │TÊN │ │TÊN │ │TÊN │ │TÊN │ │TÊN │ │TÊN │                      │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                      │
│                       ƯU ĐÃI NỔI BẬT                           │
│                         ──●──                                  │
│                       XEM THÊM →                               │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                      │  ProductCard × 6
│ │−25%│ │−24%│ │ …  │ │    │ │    │ │    │                      │  nhãn giảm giá
│ │ảnh │ │ảnh │ │    │ │    │ │    │ │    │                      │
│ │tên │ │tên │      chip con số, giá, [THÊM VÀO GIỎ]            │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                      │
│ ╭─────────────────╮ ╭─────────────────╮ ╭─────────────────╮    │  PromoBanner × 3, tint
│ │ ĐANG GIẢM GIÁ   │ │ NỒI CƠM ĐIỆN    │ │ SẢN XUẤT TẠI PHÁP│   │
│ │ Giảm đến 25% …  │ │ 14 mẫu cao tần… │ │ 62 mẫu nồi chảo… │   │
│ │ [XEM ƯU ĐÃI] ảnh│ │ XEM NỒI CƠM → ảnh│ │ XEM NỒI CHẢO → ảnh│   │
│ ╰─────────────────╯ ╰─────────────────╯ ╰─────────────────╯    │
├───────────────────────────────────────────────────────────────┤
│ ◇ 4 cam kết (TrustBar dark)                                    │  ink
│ Tefal / giới thiệu │ DANH MỤC │ MUA HÀNG │ NHẬN TIN [email][ĐĂNG KÝ] │
│ nguồn dữ liệu                      Tefal là thương hiệu của Groupe SEB │
└───────────────────────────────────────────────────────────────┘
```

- Hero: nền ảnh bếp tràn ngang, chữ và hai nút bên trái. Không đặt thẻ "Nổi bật" trên ảnh (người dùng bỏ 15/10).
- "Ưu đãi nổi bật": 10 thẻ, 2 dòng × 5. Lấy tự động: SP có giá gốc lớn hơn giá bán, mỗi nhóm một mẫu trước, sắp theo mức giảm, đủ 10 thì dừng. Không gọi là "bán chạy" vì chưa có số liệu bán.
- Dưới ba băng khuyến mãi, mỗi khu một dòng 5 thẻ: "Được mua nhiều nhất" (đếm số lượng trong đơn đã đặt; ẩn khi chưa có đơn), "Giảm nhiều nhất" (theo mức giảm, bỏ mẫu đã ở Ưu đãi), "Bạn đã xem gần đây" (20 mẫu gần nhất của tài khoản, mở trang chi tiết hoặc xem nhanh đều tính; ẩn khi chưa đăng nhập).
- Ba băng khuyến mãi: tiêu đề tính từ dữ liệu (mức giảm sâu nhất, số mẫu nồi cơm, số mẫu nồi chảo sản xuất tại Pháp). Băng đầu có nút tối `solid`.
- Chân trang không có số điện thoại, chính sách giao hàng hay đổi trả cho tới khi cửa hàng có thật; giữ chỗ "Showroom: địa chỉ, giờ mở cửa và số điện thoại sẽ đặt ở đây."

## Xem nhanh sản phẩm (QuickView)

```
            nền mờ tối phủ cả trang
╭─────────────────────────────┬──────────────────────────────╮
│ −25%                        │ NỒI CHẢO                  (×) │
│                             │ Bộ nồi chảo … L827S404        │  Playfair 28px
│          ảnh lớn            │ Model L827S404, sản xuất …    │
│        khay plate           │ 1.338.000 ₫  1.789.000 ₫ −25% │
│                             │ (● Còn hàng) (Bảo hành 36 th) │
│                             │ 20–28 cm   36 tháng           │  tối đa 3 con số
│      [▢] [▢]  ảnh nhỏ       │ Đường kính       20–28 cm     │  4 dòng thông số
│                             │ [ THÊM VÀO GIỎ ] [XEM CHI TIẾT]│
│                             │ ⌂ Xem và nấu thử tại showroom │
╰─────────────────────────────┴──────────────────────────────╯
                 rộng tối đa 980px, hai cột bằng nhau
```

- Mở khi bấm thẻ SP; Ctrl/Cmd hoặc chuột giữa vẫn mở trang chi tiết.
- Esc, nút ×, bấm ra ngoài để đóng; con trỏ quay về thẻ vừa bấm.
- Điện thoại: tấm trượt lên từ đáy, ảnh 4:3 ở trên, hai nút dính đáy tấm.

## Trang danh mục

```
Trang chủ / Nồi chiên không dầu
╭──────────────────────────────────────────────────────────────╮
│ Nồi chiên không dầu                                    9 mẫu │  tint, Playfair 44px, số accent
╰──────────────────────────────────────────────────────────────╯
2 mẫu chưa có giá bán, hiện cuối danh sách với nút gọi báo giá.
╭──────────────────────────────────────────────────────────────╮
│ (Tất cả) (Dưới 1 triệu) (1 đến 3 triệu) (Trên 3 triệu)        │  chip lọc, aria-pressed
│ (Sản xuất tại Pháp) (Đang giảm giá)      Sắp xếp [Nổi bật ▾] │
╰──────────────────────────────────────────────────────────────╯
card  card  card  card  card                                     tf-grid-products
card  card  card  card                                           (tự chia, tối thiểu 200px)
            [Xem thêm 24 mẫu]  Đang hiện 24 trên 104
```

- Bộ lọc là nút bật/tắt (`aria-pressed`): khoảng giá, xuất xứ, đang giảm giá. Chỉ hiện lọc khi nó chia được danh sách (có cả SP Pháp và không Pháp).
- Sắp xếp: Nổi bật (giảm nhiều trước), Con số lớn trước, Giá tăng, Giá giảm, Giảm giá nhiều nhất. SP chưa có giá luôn xuống cuối.
- Trang tìm kiếm dùng cùng khung, tiêu đề "Kết quả cho “…”". Không có kết quả: một câu gợi ý và CategoryIndex.
- Hiện 24 mẫu, nút "Xem thêm" cho phần còn lại.

## Trang chi tiết sản phẩm

```
Trang chủ / Nồi cơm điện / RK819868
┌───────────────────────────────┐  ╭────────────────────────────╮
│                               │  │ Nồi cơm điện cao tần        │  surface, radius-md, dính khi cuộn
│        ảnh lớn 5:4            │  │ Rice Master Max RK819868    │  Playfair 30px
│        khay plate             │  │ Model RK819868, sản xuất …  │
│                               │  │ 2.679.000 ₫  3.269.000 ₫ −18%│
├───────────────┬───────────────┤  │ (● Còn hàng) (Bảo hành 24 th)│
│     ảnh 2     │     ảnh 3     │  │ [THÊM VÀO GIỎ] [GỌI TƯ VẤN] │
└───────────────┴───────────────┘  │ 1,8 L │ 1.400 W │ 24 tháng   │  tf-figure-row
              7 phần               │ ⌂ Xem và nấu thử tại showroom│
                                   ╰────────────────────────────╯ 5 phần
Thông số và mô tả   │ SpecTable (hàng lẻ nền bg)
                    │ Mô tả, tối đa 68 ký tự mỗi dòng
              CÙNG NHÓM, GIÁ GẦN NHẤT                 Xem cả nhóm →
card  card  card  card  card
```

- Ba con số: con số quyết định của SP, rồi công suất và dung tích nếu có, rồi bảo hành. Thiếu dữ liệu thì bớt ô, không hiện "0".
- SP chưa có giá: thay giá bằng "Sản phẩm chưa có giá bán. Gọi để được báo giá." và nút chính "Gọi để báo giá".
- SP cùng nhóm: 5 mẫu có giá gần nhất.

## Chi tiết sản phẩm trên điện thoại

```
┌─────────────────────┐
│ ◇ Hàng chính hãng   │  dải ink thu gọn, một cam kết
│ ≡  Tefal      ⌕  ▢ 2│  menu, logo, tìm, giỏ
│ Trang chủ / … / RK… │
│ ┌───────────────┐┌─ │  ảnh vuốt ngang, lộ mép ảnh sau
│ │     ảnh       ││  │
│ └───────────────┘└─ │
│ ╭─────────────────╮ │
│ │ Tên SP (24px)   │ │
│ │ Model, xuất xứ  │ │
│ │ 2.679.000 ₫ −18%│ │
│ │ 1,8L 1.400W 24th│ │  ba con số một hàng
│ │ (Còn hàng) (BH) │ │
│ │ [THÊM VÀO GIỎ]  │ │
│ │ Thông số …      │ │
│ ╰─────────────────╯ │
├─────────────────────┤
│ 2.679.000 ₫ [THÊM…] │  thanh mua dính đáy: hiện khi nút mua chính đã cuộn khỏi màn hình
└─────────────────────┘
```

- Giá và nút mua luôn trong tầm ngón cái.
- Danh mục và tìm kiếm mở thành lớp phủ toàn màn hình (Esc hoặc "Đóng" để thoát).
- Trang chủ trên điện thoại: hero xếp dọc (chữ ở trên, dải ảnh bếp ở dưới), cam kết 2 × 2, danh mục và ưu đãi 2 cột, băng khuyến mãi 1 cột.

## Đăng nhập / Đăng ký

```
Trang chủ / Tài khoản
╭────────────────────────────────╮
│ Đăng nhập                      │  Playfair 32px      Có tài khoản để
│ Chào mừng bạn quay lại.        │                     ◇ ĐẶT HÀNG NHANH
│ ┌ Đăng nhập để thêm SP vào giỏ ┐│  accent-soft         Không phải nhập lại địa chỉ
│ └ … Xong sẽ quay lại trang đó. ┘│  (khi bị chuyển tới) ◇ THEO DÕI BẢO HÀNH
│ ( Đăng nhập | Đăng ký )        │  nút gạt tròn        ◇ NHẬN TIN ƯU ĐÃI
│ [ G  Tiếp tục với Google     ] │                      TrustBar một cột
│ ───── hoặc dùng email ─────    │
│ Email                          │
│ [lan@gmail                   ] │  viền alert
│ Nhập email đúng dạng, …        │  câu lỗi alert
│ Mật khẩu                       │
│ [••••••••••              (mắt)] │  nút hiện mật khẩu
│                Quên mật khẩu?  │
│ [        ĐĂNG NHẬP           ] │
│ Chưa có tài khoản? Đăng ký     │
╰────────────────────────────────╯
     thẻ 480px                         phần còn lại
```

- Một thẻ cho cả hai việc; nút gạt đổi giữa Đăng nhập và Đăng ký mà không tải lại trang, đường dẫn đổi theo (`?che-do=dang-ky`).
- Đăng ký: họ tên, email, số điện thoại (không bắt buộc), mật khẩu, nhập lại mật khẩu.
- Đăng nhập xong quay về trang khách đang xem (`?tiep=`); nếu khách vừa bấm "Thêm vào giỏ" thì thêm luôn sản phẩm đó.
- Đã đăng nhập: trang tài khoản gồm bốn thẻ Thông tin, Đơn hàng, Địa chỉ giao hàng, Giỏ hàng, và nút Đăng xuất.
- Điện thoại: thẻ chiếm cả chiều ngang, phần "Có tài khoản để" xuống dưới.

## Thanh toán

```
Trang chủ / Giỏ hàng / Thanh toán
╭──────────────────────────────────────────────────────────────╮
│ Thanh toán                        Đặt hàng với tài khoản …   │  tint
╰──────────────────────────────────────────────────────────────╯
╭─────────────────────────────────────╮  ╭────────────────────────╮
│ ① Người nhận                         │  │ Đơn hàng               │  dính khi cuộn
│ [Họ và tên      ] [Số điện thoại   ] │  │ ▢² Nồi cơm …  2.679.000│  ảnh, số lượng
╰─────────────────────────────────────╯  │ ▢  Bộ nồi …   3.537.000│
╭─────────────────────────────────────╮  │ ─────────────────────  │
│ ② Cách nhận hàng                     │  │ Tạm tính     8.420.000 │
│ (●) Giao tận nơi  ( ) Nhận tại showroom│ │ Giao hàng  Báo khi x.n.│
│ [Tỉnh ▾] [Phường, xã]                │  │ Tổng         8.420.000 │
│ [Số nhà, tên đường               ]   │  │ [      ĐẶT HÀNG      ] │
│ ☑ Lưu địa chỉ này   Ghi chú [     ]  │  ╰────────────────────────╯
╰─────────────────────────────────────╯
╭─────────────────────────────────────╮
│ ③ Thanh toán                          │  ChoiceGroup dạng thẻ
│ (●) Tiền mặt khi nhận (COD)           │
│ ( ) Chuyển khoản ngân hàng            │
│ ( ) Thẻ, ví điện tử — chưa mở         │  mờ, ghi lý do
╰─────────────────────────────────────╯
          7 phần                               5 phần
```

- Cần đăng nhập; chưa đăng nhập thì thấy LoginGate "Đăng nhập để đặt hàng". Giỏ trống thì mời xem đồ bếp.
- Tỉnh thành theo danh sách 34 tỉnh, thành từ 1/7/2025; địa chỉ chỉ còn tỉnh và phường/xã.
- Phí giao không tự tính: ghi "Báo khi xác nhận". Nhận tại showroom thì ghi "Miễn phí".
- Thanh toán online khóa cho tới khi đăng ký cổng thanh toán.
- Đặt xong: trang xác nhận có mã đơn, hai thẻ Giao tới / Thanh toán, danh sách sản phẩm, nút "Tiếp tục mua sắm" và "Xem đơn trong tài khoản".
- Điện thoại: ba bước xếp dọc, ô nhập một cột, đơn hàng xuống cuối trang ngay trên nút Đặt hàng.
