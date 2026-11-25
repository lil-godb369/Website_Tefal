import { slugify } from "./utils";

/** Đường dẫn trong web. Viết tiếng Việt không dấu, giống bản chạy thử. */
export const routes = {
  home: "/",
  all: "/danh-muc",
  category: (key: string) => `/danh-muc/${key}`,
  /** "/san-pham/may-loc-nuoc-br653by0-dk-042": tên cho dễ đọc, mã SP ở cuối để tra */
  product: (p: { id: string; name: string }) => `/san-pham/${slugify(p.name)}-${p.id.toLowerCase()}`,
  search: (q?: string) => (q ? `/tim-kiem?q=${encodeURIComponent(q)}` : "/tim-kiem"),
  cart: "/gio-hang",
  compare: "/so-sanh",
  checkout: "/thanh-toan",
  signIn: (next?: string) => (next ? `/dang-nhap?tiep=${encodeURIComponent(next)}` : "/dang-nhap"),
  signUp: (next?: string) => (next ? `/dang-ky?tiep=${encodeURIComponent(next)}` : "/dang-ky"),
  account: "/tai-khoan",
  brand: "/thuong-hieu",
  origins: "/xuat-xu",
  /** danh mục lọc theo nơi sản xuất */
  byOrigin: (origin: string) => `/danh-muc?xuat-xu=${encodeURIComponent(origin)}`,
  blog: "/bai-viet",
  post: (slug: string) => `/bai-viet/${slug}`,
  showroom: "#showroom",
} as const;

/** Lấy mã SP từ slug: "...-dk-042" -> "DK-042" */
export function productIdFromSlug(slug: string): string | null {
  const m = /([a-z]+-\d+)$/.exec(slug);
  return m ? m[1].toUpperCase() : null;
}

/** Chỉ cho chuyển tới đường dẫn trong web (chặn ?tiep=https://trang-la.com) */
export function safeNext(next: string | null | undefined, fallback: string = routes.home): string {
  // Chặn "/\evil.com", "/<tab>/evil.com"…: trình duyệt hiểu các dạng này là trang ngoài.
  // Dựng URL trên một gốc giả rồi chỉ nhận khi gốc không đổi.
  if (!next || !next.startsWith("/") || /[\\\u0000-\u001f\u007f]/.test(next)) return fallback;
  try {
    const u = new URL(next, "http://tefal.invalid");
    return u.origin === "http://tefal.invalid" ? u.pathname + u.search + u.hash : fallback;
  } catch {
    return fallback;
  }
}
