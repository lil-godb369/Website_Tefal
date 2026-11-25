import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/features/catalog/catalog-view";
import { getGroup, getGroups, groupDescription } from "@/lib/queries/products";
import { routes } from "@/lib/routes";
import { pageMeta, pageNumber } from "@/lib/site";

export async function generateStaticParams() {
  return (await getGroups()).map((g) => ({ nhom: g.key }));
}

export async function generateMetadata({ params, searchParams }: PageProps<"/danh-muc/[nhom]">): Promise<Metadata> {
  const g = await getGroup((await params).nhom);
  const page = pageNumber((await searchParams).trang);
  if (!g) return { title: "Không tìm thấy danh mục" };
  return pageMeta({
    title: `${g.name} Tefal chính hãng, ${g.total} mẫu`,
    description: await groupDescription(g),
    path: routes.category(g.key),
    page,
  });
}

// Đọc nhóm ở cấp trang (ngoài Suspense) để danh mục không có trả 404 thật.
// Phần đọc ?sap=, ?gia=… vẫn nằm trong Suspense (CatalogView).
export const instant = false;

export default async function CategoryPage({ params, searchParams }: PageProps<"/danh-muc/[nhom]">) {
  const { nhom } = await params;
  if (!(await getGroup(nhom))) notFound();
  return <CatalogView basePath={routes.category(nhom)} group={nhom} searchParams={searchParams} />;
}
