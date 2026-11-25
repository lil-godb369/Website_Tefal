import type { Metadata } from "next";
import { CartView } from "@/features/cart/cart-view";
import { getCatalogInfo, getGroups } from "@/lib/queries/products";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Giỏ hàng", robots: { index: false } };

export default async function CartPage() {
  const [groups, info] = await Promise.all([getGroups(), getCatalogInfo()]);
  const categories = groups
    .filter((g) => info.kitchen.includes(g.key) && g.count > 0)
    .map((g) => ({ name: g.name, count: g.count, href: routes.category(g.key) }));
  return <CartView categories={categories} />;
}
