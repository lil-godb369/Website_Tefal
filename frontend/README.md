# Tefal Web — bản Next.js

Web thật của Tefal Web, chuyển từ web chạy thử `../web/`. Giao diện giữ nguyên (CSS `tf-` chép từ bản chạy thử).

## Chạy

```bash
npm install
npm run dev          # http://localhost:3000
```

Claude chạy bằng cấu hình `tefal-next` trong `../.claude/launch.json` (cổng 3100).

Chưa có `.env.local` thì web vẫn chạy: xem hàng, lọc, giỏ, yêu thích, so sánh đều dùng được. Chỉ đăng nhập và đặt hàng bị tắt.

| Lệnh | Việc |
|---|---|
| `npm run build` | Dựng bản chạy thật (232 trang SP dựng sẵn) |
| `npm run lint` / `npm run typecheck` | Soát mã |
| `npm test` | Kiểm thử đơn vị (Vitest) |
| `npm run test:e2e` | Luồng mua hàng (Playwright). Lần đầu: `npx playwright install chromium` |
| `npm run data:import` | Chép lại dữ liệu từ `../web/assets/js/data.js` sang `src/data/catalog.json` |
| `node scripts/build-seed.mjs` | Sinh `supabase/seed.sql` từ `catalog.json` |

## Công nghệ

Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 (chỉ tiện ích, không preflight) · Zustand (giỏ hàng) · React Hook Form + Zod (form) · Supabase (`@supabase/ssr`) · Vitest + Testing Library · Playwright.

## Thư mục

```
src/
  app/                     định tuyến
    page.tsx               trang chủ
    (shop)/                danh-muc, danh-muc/[nhom], tim-kiem, san-pham/[slug], gio-hang, so-sanh
    (checkout)/thanh-toan/ trang thanh toán + actions.ts (Server Action đặt hàng)
    (account)/             dang-nhap, dang-ky, tai-khoan
    auth/callback/         Supabase quay về sau đăng nhập Google / xác nhận email
    api/products/          thông số đầy đủ cho trang so sánh
    sitemap.ts, robots.ts, not-found.tsx, error.tsx
  components/
    ui/                    thành phần gốc (TF cũ): Button, Icon, Plate, PriceTag, SpecFigure, form, section…
    layout/                SiteHeader, MegaMenu, Sheet, SiteFooter, Toast
  features/                theo nghiệp vụ
    home/ catalog/ product/ cart/ compare/ checkout/ auth/
  lib/
    queries/products.ts    lớp đọc dữ liệu SP (chỉ chạy server). Đổi sang Supabase: sửa ở đây.
    supabase/              client trình duyệt, server, proxy làm mới phiên
    product.ts, routes.ts, format.ts, utils.ts, site.ts, toast.ts
  data/catalog.json        232 SP (tạm, tới khi có Supabase riêng)
  styles/                  tokens.css, tf.css, site.css chép từ ../web/assets/css
  proxy.ts                 (Next 16 đổi tên middleware.ts) làm mới phiên Supabase
supabase/
  migrations/              bảng products, orders, profiles + RLS + hàm place_order
  seed.sql                 sinh bởi scripts/build-seed.mjs
tests/unit, tests/e2e
```

## Quy tắc

- **Giá do server quyết định.** Giỏ hàng lưu giá lúc thêm để hiện nhanh. Khi đặt hàng, `placeOrder` kiểm tra lại form bằng Zod. Hàm `place_order` trong Postgres tự tra giá trong bảng `products`. Trình duyệt không có quyền ghi bảng `orders`.
- **Khách không cần đăng nhập** để thêm giỏ, yêu thích, so sánh (lưu sessionStorage). Đăng nhập thì gộp vào tài khoản (localStorage theo user id). Chỉ đặt hàng mới cần đăng nhập. Xem `features/cart/shop-store.ts`.
- **Lọc/sắp xếp danh mục theo URL** (`?sap=`, `?gia=`, `?phap=1`, `?giam=1`, `?so=`), xử lý ở server.
- Bố cục điện thoại dùng `@media (max-width: 767px)`, không dùng lớp `.tf-phone`. Header dựng sẵn cả hai khung; phần chỉ hiện trên một loại màn hình gắn `tf-only-phone` / `tf-only-desk`.
- Đọc `params`/`searchParams`/cookie thì đặt trong `<Suspense>` (yêu cầu của Cache Components).
- Sửa giao diện chung: sửa `../design-system/`, chạy `tools/compile_tokens.py`, chép `tokens.css` sang `src/styles/`.

## Còn thiếu so với bản chạy thử

- "Mua nhiều nhất" và "Đã xem gần đây" ở trang chủ: cần bảng `orders` / `product_views`.
- Danh sách đơn trong trang tài khoản, đặt lại mật khẩu, lưu đăng ký nhận tin.

## Trước khi lên mạng

1. Tạo project Supabase riêng, chạy migration và `seed.sql`, điền `.env.local` / biến môi trường Vercel.
2. Thay ảnh SP bằng ảnh chính thức Tefal (ảnh hiện tại có logo cửa hàng cũ). Khi có: đặt `PHOTO_CROP = null` trong `src/lib/product.ts`, chuyển `Plate` sang `next/image`, thêm `image` vào JSON-LD.
3. Logo chính thức trong bộ nhận diện Tefal.
4. Chạy skill `security-review` cho đăng nhập và đặt hàng, `production-audit` trước khi đưa lên.
