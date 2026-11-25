import type { Metadata } from "next";
import { CatalogView } from "@/features/catalog/catalog-view";
import { ORIGINS } from "@/lib/product";
import { routes } from "@/lib/routes";
import { pageMeta, pageNumber } from "@/lib/site";

export async function generateMetadata({ searchParams }: PageProps<"/danh-muc">): Promise<Metadata> {
  const sp = await searchParams;
  const o = sp["xuat-xu"];
  const page = pageNumber(sp.trang);
  const origin = typeof o === "string" && ORIGINS.includes(o) ? o : null;
  // ?xuat-xu= cho ra nội dung riêng: tiêu đề và canonical riêng để Google không gộp vào "Tất cả sản phẩm"
  if (origin) {
    return pageMeta({
      title: `Đồ bếp Tefal sản xuất tại ${origin}`,
      description: `Các mẫu đồ bếp Tefal sản xuất tại ${origin}: giá, mức giảm và thông số để so sánh.`,
      path: routes.byOrigin(origin),
      page,
    });
  }
  return pageMeta({
    title: "Tất cả sản phẩm",
    description: "Toàn bộ đồ bếp và đồ gia dụng Tefal đang bán: giá, mức giảm và thông số để so sánh.",
    path: routes.all,
    page,
  });
}

export default function AllProductsPage({ searchParams }: PageProps<"/danh-muc">) {
  return <CatalogView basePath={routes.all} searchParams={searchParams} />;
}
