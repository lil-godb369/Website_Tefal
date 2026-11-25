import type { ArtKind, Group, KeyFigure, Product, ProductSummary } from "@/types/product";
import { routes } from "./routes";
import { norm } from "./utils";

/** Ảnh tạm lấy từ bucket cũ có logo và ô khuyến mãi cửa hàng cũ bên phải: cắt lấy vùng SP.
 *  Có ảnh sạch (ảnh chính thức Tefal) thì đặt null. Đơn vị: phần của ảnh gốc. */
export const PHOTO_CROP: { x: number; y: number; w: number; h: number } | null = {
  x: 0.02,
  y: 0.13,
  w: 0.6,
  h: 0.8,
};

export const ORIGINS = ["Pháp", "Trung Quốc", "Việt Nam", "Nhật Bản", "Ý"];

export const ICON_OF: Record<string, string> = {
  "noi-chao": "pot",
  "noi-com-dien": "cooker",
  "noi-chien": "fryer",
  "noi-ap-suat": "cooker",
  "may-xay-ep": "blender",
  "dao-dung-cu": "knife",
  "am-dun": "kettle",
  "may-loc-nuoc": "drop",
  khac: "pot",
  "ngoai-bep": "home",
};

export interface Figure {
  value: string;
  unit?: string;
  label?: string;
}

export function metaOf(p: Pick<Product, "model" | "origin">): string {
  return "Model " + p.model + (p.origin ? ", sản xuất tại " + p.origin : "");
}

export interface BadgeData {
  text: string;
  tone?: "neutral" | "ok" | "accent" | "alert";
  dot?: boolean;
}

export function badgesOf(p: Pick<Product, "stock" | "w">): BadgeData[] {
  const b: BadgeData[] = [];
  if (p.stock) b.push({ text: "Còn hàng", tone: "ok", dot: true });
  if (p.w) b.push({ text: "Bảo hành " + p.w + " tháng" });
  return b;
}

export function figOf(fig: KeyFigure | null): Figure | null {
  return fig ? { value: fig.v, unit: fig.u, label: fig.l } : null;
}

/** Tối đa 3 con số lớn cho trang chi tiết và xem nhanh */
export function figuresOf(p: Pick<Product, "fig" | "power" | "w"> & { cap?: string | null }): Figure[] {
  const f: Figure[] = [];
  if (p.fig) f.push({ value: p.fig.v, unit: p.fig.u, label: p.fig.l });
  if (p.power && !(p.fig && p.fig.u === "W")) f.push({ value: p.power, unit: "W", label: "Công suất" });
  if (p.cap && !(p.fig && p.fig.u === "L")) f.push({ value: p.cap, unit: "L", label: "Dung tích" });
  if (p.w) f.push({ value: String(p.w), unit: "tháng", label: "Bảo hành" });
  return f.slice(0, 3);
}

/** Số để xếp "con số lớn trước": "1,8–2" -> 2 */
export function figNum(p: Product): number {
  if (!p.fig) return -1;
  const parts = String(p.fig.v).split("–");
  return parseFloat(parts[parts.length - 1].replace(",", ".")) || -1;
}

/** "Nồi cơm điện tử Delirice RK7711Y0 1.8L" -> bỏ mã model và phần sau cho gọn */
export function shortName(p: Pick<Product, "name" | "model">): string {
  const re = new RegExp("\\s*" + p.model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ".*$");
  return p.name.replace(re, "").replace(/,\s*$/, "") || p.name;
}

/** Dòng mô tả ngắn cho khu trưng bày: chỉ lấy từ dữ liệu */
export function showLine(p: Product): string {
  const bits: string[] = [];
  if (p.fig) bits.push(p.fig.l + " " + p.fig.v + (p.fig.u ? " " + p.fig.u : ""));
  if (p.power && (!p.fig || p.fig.u !== "W")) bits.push(p.power + " W");
  if (p.origin) bits.push("Sản xuất tại " + p.origin);
  if (p.w) bits.push("Bảo hành " + p.w + " tháng");
  return bits.join(" · ");
}

export function summarize(p: Product, groups: Record<string, Group>): ProductSummary {
  const g = groups[p.g];
  return {
    id: p.id,
    name: p.name,
    model: p.model,
    href: routes.product(p),
    groupName: g?.name ?? "",
    art: (g?.art ?? "pan") as ArtKind,
    price: p.price,
    orig: p.orig,
    img: p.img,
    fig: p.fig,
    stock: p.stock,
    w: p.w,
    origin: p.origin,
    power: p.power,
    quickSpecs: p.specs.filter((r) => !/^(Bảo hành|Xuất xứ)$/.test(r[0])).slice(0, 4),
  };
}

/* ---------- lọc và sắp xếp danh mục ---------- */

export const SORTS = [
  { key: "noi-bat", label: "Nổi bật" },
  { key: "con-so", label: "Con số lớn trước" },
  { key: "gia-tang", label: "Giá thấp đến cao" },
  { key: "gia-giam", label: "Giá cao đến thấp" },
  { key: "giam-gia", label: "Giảm giá nhiều nhất" },
] as const;
export type SortKey = (typeof SORTS)[number]["key"];

export const PRICE_BANDS = [
  { key: "duoi-1", label: "Dưới 1 triệu", test: (p: Product) => p.price > 0 && p.price < 1e6 },
  { key: "1-3", label: "1 đến 3 triệu", test: (p: Product) => p.price >= 1e6 && p.price <= 3e6 },
  { key: "tren-3", label: "Trên 3 triệu", test: (p: Product) => p.price > 3e6 },
] as const;

export function sorter(key: string) {
  return (a: Product, b: Product): number => {
    const priced = Number(b.price > 0) - Number(a.price > 0);
    if (priced) return priced; // SP chưa có giá luôn xuống cuối
    if (key === "gia-tang") return a.price - b.price;
    if (key === "gia-giam") return b.price - a.price;
    if (key === "giam-gia") return b.pct - a.pct || a.price - b.price;
    if (key === "con-so") return figNum(b) - figNum(a) || a.price - b.price;
    return b.pct - a.pct || b.price - a.price;
  };
}

/** Tìm theo tên, mã model, mã SP, tên nhóm; bỏ dấu, mọi từ đều phải khớp */
export function matches(p: Product, q: string, groupName: string): boolean {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const hay = norm([p.name, p.full, p.model, p.id, groupName].join(" "));
  return terms.every((t) => hay.includes(t));
}
