import type { MetadataRoute } from "next";
import { ALLOW_INDEX, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Bản xem trước trên Vercel: chặn hết
  if (!ALLOW_INDEX) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /tim-kiem không chặn ở đây: trang đó có noindex, Google phải vào được mới đọc được noindex
      disallow: ["/api/", "/auth/", "/gio-hang", "/thanh-toan", "/tai-khoan"],
    },
    sitemap: SITE_URL + "/sitemap.xml",
  };
}
