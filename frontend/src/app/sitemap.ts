import type { MetadataRoute } from "next";
import { POSTS } from "@/features/blog/posts";
import { getAllProductIds, getCatalogInfo, getGroups } from "@/lib/queries/products";
import { routes } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [groups, products, info] = await Promise.all([getGroups(), getAllProductIds(), getCatalogInfo()]);
  const lastModified = new Date(info.built);
  return [
    { url: SITE_URL + routes.home, lastModified },
    { url: SITE_URL + routes.all, lastModified },
    ...groups.map((g) => ({ url: SITE_URL + routes.category(g.key), lastModified })),
    { url: SITE_URL + routes.brand, lastModified },
    { url: SITE_URL + routes.origins, lastModified },
    { url: SITE_URL + routes.blog, lastModified },
    ...POSTS.map((p) => ({ url: SITE_URL + routes.post(p.slug), lastModified })),
    ...products.map((p) => ({ url: SITE_URL + routes.product(p), lastModified })),
  ];
}
