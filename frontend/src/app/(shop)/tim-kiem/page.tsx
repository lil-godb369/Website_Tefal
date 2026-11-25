import type { Metadata } from "next";
import { CatalogView } from "@/features/catalog/catalog-view";

// Trang kết quả tìm kiếm không cần lên Google
export const metadata: Metadata = {
  title: "Tìm sản phẩm",
  description: "Tìm đồ bếp Tefal theo tên hoặc mã model.",
  robots: { index: false, follow: true },
};

export default function SearchPage({ searchParams }: PageProps<"/tim-kiem">) {
  return <CatalogView basePath="/tim-kiem" searchParams={searchParams} />;
}
