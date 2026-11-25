import { NextResponse, type NextRequest } from "next/server";
import routeIndex from "@/data/route-index.json";
import { updateSession } from "@/lib/supabase/proxy";

const GROUPS = new Set(routeIndex.groups);

export async function proxy(request: NextRequest) {
  // Danh mục không có: trả 404 thật. Trang danh mục đọc ?sap=… theo từng yêu cầu nên không chặn được ở trang
  // (khung trang đã gửi với mã 200). Khi có Supabase: sinh route-index.json lúc build từ bảng product_groups.
  const m = /^\/danh-muc\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  if (m && !GROUPS.has(decodeURIComponent(m[1]))) {
    return NextResponse.rewrite(new URL("/khong-tim-thay", request.url), { status: 404 });
  }
  return updateSession(request);
}

export const config = {
  // Bỏ qua file tĩnh, ảnh, sitemap/robots và API đọc SP. Bỏ qua lượt tải trước (prefetch): không cần làm mới phiên.
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|img/|video/|api/|favicon.ico|apple-icon.png|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
