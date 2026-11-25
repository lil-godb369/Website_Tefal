import "server-only";
import catalogJson from "@/data/catalog.json";
import type { Catalog, Group, Product } from "@/types/product";
import { vnd } from "@/lib/format";
import { ORIGINS, PRICE_BANDS, matches, shortName, showLine, sorter, summarize } from "@/lib/product";
import { routes } from "@/lib/routes";

/* Lớp đọc dữ liệu SP. Hiện đọc src/data/catalog.json (chép từ web chạy thử).
   Khi có Supabase riêng: thay thân các hàm bằng truy vấn bảng products, giữ nguyên chữ ký.
   "use cache" để Next.js dựng sẵn trang; dữ liệu đổi thì gọi revalidateTag("products"). */

const catalog = catalogJson as Catalog;
const byId = new Map(catalog.products.map((p) => [p.id, p]));
const groupMap: Record<string, Group> = Object.fromEntries(catalog.groups.map((g) => [g.key, g]));

export async function getCatalogInfo() {
  "use cache";
  return { built: catalog.built, total: catalog.products.length, kitchen: catalog.kitchen };
}

export async function getGroups(): Promise<Group[]> {
  "use cache";
  return catalog.groups;
}

export async function getGroup(key: string): Promise<Group | null> {
  "use cache";
  return groupMap[key] ?? null;
}

export async function getProduct(id: string): Promise<Product | null> {
  "use cache";
  return byId.get(id) ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
}

export async function getAllProductIds(): Promise<{ id: string; name: string }[]> {
  "use cache";
  return catalog.products.map((p) => ({ id: p.id, name: p.name }));
}

/** Bản gọn cho thẻ SP (gửi xuống trình duyệt) */
export async function getSummaries(ids: string[]) {
  return (await getProductsByIds(ids)).map((p) => summarize(p, groupMap));
}

export function toSummary(p: Product) {
  return summarize(p, groupMap);
}

export interface ListQuery {
  group?: string | null;
  q?: string | null;
  origin?: string | null;
  sort?: string | null;
  price?: string | null;
  france?: boolean;
  sale?: boolean;
}

/** Danh mục và tìm kiếm: trả về danh sách đã lọc + vài con số cho thanh công cụ */
export async function listProducts(query: ListQuery) {
  "use cache";
  const g = query.group ? groupMap[query.group] : null;
  const q = (query.q || "").trim();
  const origin = query.origin && ORIGINS.includes(query.origin) ? query.origin : null;

  let base = catalog.products;
  if (g) base = base.filter((p) => p.g === g.key);
  else if (q) base = base.filter((p) => matches(p, q, groupMap[p.g]?.name ?? ""));
  if (origin) base = base.filter((p) => p.origin === origin);

  const band = PRICE_BANDS.find((b) => b.key === query.price);
  const list = base
    .filter((p) => (!query.france || p.origin === "Pháp") && (!query.sale || p.pct > 0) && (!band || band.test(p)))
    .sort(sorter(query.sort || "noi-bat"));

  return {
    group: g,
    origin,
    list,
    baseCount: base.length,
    priced: base.filter((p) => p.price > 0).length,
    hasFrance: base.some((p) => p.origin === "Pháp") && base.some((p) => p.origin !== "Pháp"),
    hasSale: base.some((p) => p.pct > 0),
  };
}

/** Mô tả trang danh mục cho thẻ meta: chỉ con số có trong dữ liệu */
export async function groupDescription(g: Group): Promise<string> {
  "use cache";
  const ps = catalog.products.filter((p) => p.g === g.key && p.price > 0);
  if (!ps.length) return `${g.name} Tefal: ${g.total} mẫu, gọi để được báo giá.`;
  const lo = Math.min(...ps.map((p) => p.price));
  const hi = Math.max(...ps.map((p) => p.price));
  const sale = ps.filter((p) => p.pct > 0).length;
  return `${g.name} Tefal: ${ps.length} mẫu, giá từ ${vnd(lo)} đến ${vnd(hi)}${sale ? `, ${sale} mẫu đang giảm giá` : ""}. Xem thông số, so sánh rồi đặt hàng.`;
}

/** Dữ liệu cho trang chủ: ưu đãi, giảm sâu, khu trưng bày, băng khuyến mãi */
export async function getHomeData() {
  "use cache";
  const kitchen = catalog.products.filter((p) => p.price > 0 && catalog.kitchen.includes(p.g));
  const byDeal = kitchen.filter((p) => p.pct > 0 && p.img).sort((a, b) => b.pct - a.pct || b.price - a.price);
  // Ưu đãi: mỗi nhóm một mẫu trước, đủ 10 thì dừng; thiếu thì lấy tiếp theo mức giảm
  const deals: Product[] = [];
  const seen = new Set<string>();
  for (const p of byDeal) {
    if (deals.length < 10 && !seen.has(p.g)) {
      seen.add(p.g);
      deals.push(p);
    }
  }
  for (const p of byDeal) if (deals.length < 10 && !deals.includes(p)) deals.push(p);
  const deepest = byDeal.filter((p) => !deals.includes(p)).slice(0, 5);
  const img = (id: string) => byId.get(id)?.img ?? "";

  // Ảnh đại diện từng danh mục: mẫu có ảnh rõ, nhìn ra ngay là loại gì
  const tiles = categoryTiles();

  // Khu trưng bày kiểu Apple: một mẫu lớn, hai ô nhỏ
  const show = ["DK-061", "DK-069", "DK-050"]
    .map((id) => byId.get(id))
    .filter((p): p is Product => !!p)
    .map((p) => ({ ...summarize(p, groupMap), line: showLine(p) }));

  return {
    tiles,
    show,
    deals: deals.map((p) => summarize(p, groupMap)),
    deepest: deepest.map((p) => summarize(p, groupMap)),
    maxPct: byDeal[0]?.pct ?? 0,
    dealImages: [byDeal[0]?.img ?? "", byDeal[1]?.img ?? ""],
    riceImages: [img("DK-064"), img("DK-090")],
    frenchImages: [img("NC-059"), img("NC-061")],
    frenchPans: catalog.products.filter((p) => p.g === "noi-chao" && p.origin === "Pháp").length,
    rice: groupMap["noi-com-dien"],
  };
}

export async function getMaxWarranty(): Promise<number> {
  "use cache";
  return catalog.products.reduce((n, p) => Math.max(n, p.w || 0), 0);
}

/** Mọi mẫu của một nhóm (bài viết tính số liệu từ đây) */
export async function getGroupProducts(key: string): Promise<Product[]> {
  "use cache";
  return catalog.products.filter((p) => p.g === key);
}

/** Ảnh đại diện 6 danh mục, dùng chung cho trang chủ và trang Thương hiệu */
const TILES = [
  ["noi-chao", "NC-060"],
  ["noi-com-dien", "DK-067"],
  ["noi-chien", "DK-068"],
  ["may-xay-ep", "DK-050"],
  ["dao-dung-cu", "DK-052"],
  ["am-dun", "DK-088"],
] as const;

function categoryTiles() {
  return TILES.filter(([key]) => groupMap[key]).map(([key, id]) => ({
    group: groupMap[key],
    image: byId.get(id)?.img ?? "",
  }));
}

/** Trang Thương hiệu: số mẫu đồ bếp, số nhóm, số mẫu sản xuất tại Pháp */
export async function getBrandData() {
  "use cache";
  const inKitchen = (key: string) => catalog.kitchen.includes(key);
  return {
    kitchen: catalog.products.filter((p) => inKitchen(p.g)).length,
    groups: catalog.groups.filter((g) => inKitchen(g.key) && g.count > 0).length,
    france: catalog.products.filter((p) => p.origin === "Pháp").length,
    tiles: categoryTiles(),
  };
}

/** Trang Xuất xứ: mỗi nơi sản xuất có số mẫu, các nhóm và tối đa 3 ảnh */
export async function getOriginData() {
  "use cache";
  const rows = ORIGINS.map((origin) => {
    const ps = catalog.products.filter((p) => p.origin === origin);
    const groups = [...new Set(ps.map((p) => groupMap[p.g]?.name).filter((n): n is string => !!n))];
    const pics = ps
      .filter((p) => p.img)
      .slice(0, 3)
      .map((p) => ({ id: p.id, img: p.img, art: groupMap[p.g]?.art ?? "pan" }));
    return { origin, count: ps.length, groups, pics };
  }).filter((r) => r.count > 0);
  return { rows, unknown: catalog.products.filter((p) => !p.origin).length };
}

/** Mẫu cùng nhóm, giá gần nhất. Đối số là giá trị nhỏ để khóa cache gọn (không truyền cả SP). */
export async function getRelated(id: string, group: string, price: number, n = 5) {
  "use cache";
  return catalog.products
    .filter((x) => x.g === group && x.id !== id && x.price > 0)
    .sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price))
    .slice(0, n)
    .map((x) => summarize(x, groupMap));
}

/** Bảng chọn lớn ở header: mỗi nhóm có lối tắt. Ảnh SP tải riêng khi mở bảng (getMegaItems, /api/mega). */
export async function getMegaMenu() {
  "use cache";
  return catalog.groups
    .filter((g) => g.total > 0)
    .map((g) => {
      const inGroup = catalog.products.filter((p) => p.g === g.key);
      const base = routes.category(g.key);
      const links = [{ label: "Tất cả " + g.name.toLowerCase(), href: base }];
      if (inGroup.some((p) => p.pct > 0)) links.push({ label: "Đang giảm giá", href: base + "?giam=1&sap=giam-gia" });
      links.push({ label: "Giá thấp đến cao", href: base + "?sap=gia-tang" });
      if (inGroup.some((p) => p.fig)) links.push({ label: "Xếp theo con số", href: base + "?sap=con-so" });
      if (inGroup.some((p) => p.origin === "Pháp")) links.push({ label: "Sản xuất tại Pháp", href: base + "?phap=1" });
      return {
        key: g.key,
        label: g.name,
        href: base,
        links,
      };
    });
}

/** Ảnh SP của bảng chọn lớn: mã nhóm → tối đa 12 mẫu có ảnh (có giá trước, giảm sâu trước, rồi giá cao) */
export async function getMegaItems() {
  "use cache";
  return Object.fromEntries(
    catalog.groups.map((g) => [
      g.key,
      catalog.products
        .filter((p) => p.g === g.key && p.img)
        .sort((a, b) => Number(b.price > 0) - Number(a.price > 0) || b.pct - a.pct || b.price - a.price)
        .slice(0, 12)
        .map((p) => ({ label: shortName(p), href: routes.product(p), image: p.img, art: g.art })),
    ]),
  );
}
