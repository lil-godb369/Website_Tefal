import { NextResponse, type NextRequest } from "next/server";
import { getGroups, getProductsByIds } from "@/lib/queries/products";

/** GET /api/products?ids=DK-042,NC-060 → thông tin đầy đủ (kể cả thông số) để so sánh. Tối đa 8 mã. */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^[A-Z]+-\d+$/.test(s))
    .slice(0, 8);
  const [products, groups] = await Promise.all([getProductsByIds(ids), getGroups()]);
  const names = Object.fromEntries(groups.map((g) => [g.key, g.name]));
  return NextResponse.json(
    products.map((p) => ({ ...p, groupName: names[p.g] ?? "" })),
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
