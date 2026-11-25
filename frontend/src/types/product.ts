/** Hình vẽ nét thay ảnh khi ảnh lỗi (khớp ProductArt) */
export type ArtKind = "pan" | "cooker" | "blender" | "fryer" | "knife" | "set";

export interface Group {
  key: string;
  name: string;
  art: ArtKind;
  /** số mẫu có giá */
  count: number;
  /** tổng số mẫu, kể cả chưa có giá */
  total: number;
}

/** Con số quyết định của SP: "5 L Dung tích" */
export interface KeyFigure {
  v: string;
  u: string;
  l: string;
}

/** Một SP như trong dữ liệu xuất (catalog.json). Khi có Supabase: một dòng bảng products. */
export interface Product {
  id: string;
  name: string;
  full: string;
  model: string;
  /** khóa nhóm (Group.key) */
  g: string;
  /** 0 = chưa có giá, gọi để báo giá */
  price: number;
  orig: number | null;
  pct: number;
  origin: string | null;
  /** bảo hành, tháng */
  w: number | null;
  stock: boolean;
  img: string;
  fig: KeyFigure | null;
  power: string | null;
  cap: string | null;
  specs: [string, string][];
  desc: string;
  pts: string[];
}

export interface Catalog {
  groups: Group[];
  products: Product[];
  /** các nhóm thuộc đồ bếp (ngoài ra là "Ngoài bếp") */
  kitchen: string[];
  /** ngày chụp dữ liệu, yyyy-mm-dd */
  built: string;
}

/** Bản gọn gửi xuống trình duyệt: đủ cho thẻ SP, xem nhanh, giỏ hàng. Không gửi cả catalog. */
export interface ProductSummary {
  id: string;
  name: string;
  model: string;
  href: string;
  groupName: string;
  art: ArtKind;
  price: number;
  orig: number | null;
  img: string;
  fig: KeyFigure | null;
  stock: boolean;
  w: number | null;
  origin: string | null;
  power: string | null;
  /** tối đa 4 dòng thông số cho xem nhanh (bỏ Bảo hành, Xuất xứ) */
  quickSpecs: [string, string][];
}
