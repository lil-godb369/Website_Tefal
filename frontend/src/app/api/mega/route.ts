import { NextResponse } from "next/server";
import { getMegaItems } from "@/lib/queries/products";

/** GET /api/mega → ảnh SP của bảng chọn lớn, theo mã nhóm. Tải khi người dùng mở bảng lần đầu,
 *  để khỏi gửi kèm ~120 ảnh SP trong mọi trang. */
export async function GET() {
  return NextResponse.json(await getMegaItems(), {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=86400" },
  });
}
