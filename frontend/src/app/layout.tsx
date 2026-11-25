import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { RouteFocus } from "@/components/layout/route-focus";
import { SiteHeader } from "@/components/layout/site-header";
import { Toast } from "@/components/layout/toast";
import { ShopProvider } from "@/features/cart/shop-provider";
import { CompareBar } from "@/features/compare/compare-bar";
import { QuickViewHost } from "@/features/product/quick-view";
import { getCatalogInfo, getGroups, getMaxWarranty, getMegaMenu } from "@/lib/queries/products";
import { routes } from "@/lib/routes";
import { ALLOW_INDEX, SITE_DESCRIPTION, SITE_NAME, SITE_URL, trustItems } from "@/lib/site";
import { preconnect } from "react-dom";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  // 900 cho chữ trưng bày (hero, Giờ vàng): thiếu bản 900 thật thì trình duyệt tô đậm giả từ 800, nét bè, khác chỗ khác
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam",
  display: "swap",
});

// Ngắn để thẻ trình duyệt không bị cắt; từ khóa nồi chảo, nồi cơm, nồi chiên nằm ở description
const TITLE = "Tefal — Đồ bếp chính hãng";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — Tefal" },
  description: SITE_DESCRIPTION,
  // og:title, og:description để từng trang tự đặt (pageMeta), không để trang nào cũng mang chữ của trang chủ
  openGraph: { type: "website", siteName: SITE_NAME, locale: "vi_VN" },
  robots: ALLOW_INDEX ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#1f1e1b" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Ảnh SP tạm nằm ở bucket Supabase cũ (khác tên miền): mở kết nối sớm. Bỏ khi chuyển ảnh sang chỗ mới.
  preconnect("https://krtjhvqbdjbjibamgslg.supabase.co");
  const [mega, groups, maxWarranty, info] = await Promise.all([
    getMegaMenu(),
    getGroups(),
    getMaxWarranty(),
    getCatalogInfo(),
  ]);
  const menuGroups = groups
    .filter((g) => g.total > 0)
    .map((g) => ({ name: g.name, count: g.count, href: routes.category(g.key) }));

  return (
    <html lang="vi" data-theme="sang" className={beVietnam.variable}>
      <body>
        <a className="tf-skip" href="#noi-dung">
          Bỏ qua, tới nội dung
        </a>
        <SiteHeader mega={mega} menuGroups={menuGroups} totalProducts={info.total} maxWarranty={maxWarranty} />
        <main id="noi-dung" className="tf-container" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter groups={groups.filter((g) => g.count > 0)} trust={trustItems(maxWarranty)} built={info.built} />
        <RouteFocus />
        <QuickViewHost />
        <CompareBar />
        <Toast />
        <ShopProvider />
      </body>
    </html>
  );
}
