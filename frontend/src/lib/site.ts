import type { Metadata } from "next";
import type { TrustItem } from "@/components/ui/section";

export const SITE_NAME = "Tefal";

/** Địa chỉ gốc cho canonical, sitemap, JSON-LD. Thứ tự: biến tự đặt → tên miền chính trên Vercel → máy. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/** Chỉ bản chính thức mới cho Google lập chỉ mục; bản xem trước trên Vercel thì chặn. */
export const ALLOW_INDEX = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;
export const SITE_DESCRIPTION =
  "Nồi chảo, nồi cơm điện, nồi chiên không dầu, máy xay và dụng cụ bếp Tefal chính hãng. Giá niêm yết rõ, thông số đầy đủ, bảo hành đến 36 tháng.";

/** 4 cam kết: chỉ viết điều có trong dữ liệu (không tự đặt miễn phí giao, đổi trả, số điện thoại) */
export function trustItems(maxWarranty: number): TrustItem[] {
  return [
    { icon: "shield", title: "Chính hãng Tefal", text: "Thương hiệu của Groupe SEB" },
    { icon: "award", title: `Bảo hành đến ${maxWarranty} tháng`, text: "Theo chính sách của hãng" },
    { icon: "tag", title: "Giá niêm yết rõ", text: "Hiện cả giá gốc và mức giảm" },
    { icon: "store", title: "Tư vấn tại showroom", text: "Xem và nấu thử trước khi mua" },
  ];
}

/** Số trang từ ?trang= (1 nếu không có hoặc sai) */
export function pageNumber(v: string | string[] | undefined): number {
  const n = Math.floor(Number(Array.isArray(v) ? v[0] : v));
  return n > 1 ? n : 1;
}

/** Metadata một trang: title, description, canonical và thẻ og riêng của trang đó.
 *  (openGraph của trang con thay hẳn openGraph của layout, nên phải ghi đủ siteName, locale.) */
export function pageMeta({
  title,
  description,
  path,
  type = "website",
  page = 1,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  /** trang thứ mấy của danh sách phân trang: mỗi trang có canonical riêng */
  page?: number;
}): Metadata {
  const url = page > 1 ? `${path}${path.includes("?") ? "&" : "?"}trang=${page}` : path;
  const t = page > 1 ? `${title}, trang ${page}` : title;
  return {
    title: t,
    description,
    alternates: { canonical: url },
    openGraph: { type, siteName: SITE_NAME, locale: "vi_VN", title: `${t} — ${SITE_NAME}`, description, url },
  };
}
