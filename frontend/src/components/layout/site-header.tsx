"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SearchField } from "@/components/ui/search-field";
import { CategoryIndex } from "@/components/ui/section";
import { displayName, useAuthStore } from "@/features/auth/use-user";
import { useShop } from "@/features/cart/shop-store";
import { firstName } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { MegaMenu, type MegaGroup } from "./mega-menu";
import { Sheet } from "./sheet";

/* Menu chính. Danh mục SP vào qua "Tất cả sản phẩm" (bảng chọn lớn) và 6 ô danh mục ở trang chủ. */
const NAV = [
  { label: "Trang chủ", href: routes.home },
  { label: "Tất cả sản phẩm", href: routes.all, mega: true },
  { label: "Thương hiệu", href: routes.brand },
  { label: "Xuất xứ", href: routes.origins },
  { label: "Bài viết", href: routes.blog },
];

function activeLabel(pathname: string): string | undefined {
  if (pathname === "/") return "Trang chủ";
  if (/^\/(danh-muc|san-pham|so-sanh|tim-kiem)/.test(pathname)) return "Tất cả sản phẩm";
  if (pathname.startsWith(routes.brand)) return "Thương hiệu";
  if (pathname.startsWith(routes.origins)) return "Xuất xứ";
  if (pathname.startsWith(routes.blog)) return "Bài viết";
}

/** Ô tìm điền sẵn từ khóa đang tìm (?q=). Đọc URL nên phải nằm trong Suspense. */
function QuerySearchField({ id }: { id: string }) {
  const q = useSearchParams().get("q") ?? "";
  return <SearchField id={id} defaultValue={q} key={q} />;
}

export interface HeaderProps {
  mega: MegaGroup[];
  menuGroups: { name: string; count: number; href: string }[];
  totalProducts: number;
  maxWarranty: number;
}

/** Dải cam kết tối + thanh trắng: logo chữ, menu, tìm kiếm, tài khoản, giỏ hàng.
 *  Điện thoại: thanh gọn với nút menu và nút tìm mở lớp phủ.
 *  Dựng sẵn cả hai khung; CSS (.tf-only-phone / .tf-only-desk, mốc 1024px) chọn khung nào hiện,
 *  nên server trả đúng bố cục ngay và trang không nhảy khi React chạy. */
export function SiteHeader({ mega, menuGroups, totalProducts, maxWarranty }: HeaderProps) {
  const pathname = usePathname();
  const count = useShop((s) => s.cart.reduce((n, x) => n + x.qty, 0));
  const { user, ready } = useAuthStore();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const active = activeLabel(pathname);

  // Chuyển trang thì đóng lớp phủ
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenu(false);
    setSearch(false);
  }

  const top = [
    { icon: "shield", text: "Hàng chính hãng Tefal" },
    { icon: "award", text: `Bảo hành đến ${maxWarranty} tháng` },
    { icon: "store", text: "Xem và nấu thử tại showroom" },
  ];
  const account = user
    ? { text: "Chào, " + firstName(displayName(user)), label: "Tài khoản của " + displayName(user) }
    : { text: "Đăng nhập / Đăng ký", label: "Đăng nhập hoặc đăng ký" };
  const accountHref = user ? routes.account : routes.signIn();

  return (
    <>
      <header className="tf-site-header">
        <div className="tf-topbar">
          <div className="tf-topbar-inner">
            {top.map((t, i) => (
              <span key={t.icon} className={cn("tf-topbar-item", i > 0 && "tf-only-desk")}>
                <Icon name={t.icon} size={16} />
                {t.text}
              </span>
            ))}
            <span className="tf-topbar-end tf-only-desk">
              <a className="tf-topbar-item" href={routes.showroom}>
                <Icon name="phone" size={16} />
                Liên hệ showroom
              </a>
              <Link
                className="tf-topbar-item"
                href={accountHref}
                style={{ visibility: ready ? undefined : "hidden" }}
              >
                <Icon name="user" size={16} />
                {account.text}
              </Link>
            </span>
          </div>
        </div>
        <div className="tf-header">
          <button
            className="tf-icon-btn tf-only-phone"
            type="button"
            aria-label="Mở menu"
            aria-expanded={menu}
            onClick={() => setMenu(true)}
          >
            <Icon name="menu" size={22} />
          </button>
          <Link className="tf-wordmark" href={routes.home}>
            <span className="tf-wordmark-name">Tefal</span>
            <span className="tf-wordmark-sub">Thương hiệu danh tiếng từ Pháp</span>
          </Link>
          <nav className="tf-nav tf-only-desk" aria-label="Danh mục chính">
            {NAV.map((n) =>
              n.mega ? (
                <MegaMenu
                  key={n.href}
                  label={n.label}
                  groups={mega}
                  allHref={n.href}
                  allLabel={`Xem tất cả ${totalProducts} sản phẩm`}
                  active={active === n.label}
                />
              ) : (
                <Link key={n.href} href={n.href} aria-current={active === n.label ? "page" : undefined}>
                  {n.label}
                </Link>
              ),
            )}
          </nav>
          <div className="tf-header-tools">
            <button
              className="tf-icon-btn tf-only-phone"
              type="button"
              aria-label="Tìm sản phẩm"
              onClick={() => setSearch(true)}
            >
              <Icon name="search" size={22} />
            </button>
            <Form action="/tim-kiem" className="tf-search-form tf-only-desk">
              <Suspense fallback={<SearchField id="tf-header-search" />}>
                <QuerySearchField id="tf-header-search" />
              </Suspense>
            </Form>
            <Link
              className={cn("tf-icon-btn", user && "is-signed")}
              href={accountHref}
              aria-label={account.label}
            >
              <Icon name="user" size={22} />
            </Link>
            <Link className="tf-icon-btn" href={routes.cart} aria-label={`Giỏ hàng, ${count} sản phẩm`}>
              <Icon name="bag" size={22} />
              {count ? (
                <span className="tf-cart-count" aria-hidden="true">
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      {menu ? (
        <Sheet label="Menu" onClose={() => setMenu(false)}>
          <nav className="tf-sheet-nav" aria-label="Menu chính">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={active === n.label ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <h2 className="tf-sheet-sub">Danh mục</h2>
          <CategoryIndex items={menuGroups} label="Tất cả danh mục" />
          <p className="tf-sheet-foot">
            <Link className="tf-link" href={accountHref}>
              {user ? "Tài khoản của tôi" : "Đăng nhập / Đăng ký"}
            </Link>
            <Link className="tf-link" href={routes.cart}>
              Xem giỏ hàng
            </Link>
          </p>
        </Sheet>
      ) : null}

      {search ? (
        <Sheet label="Tìm sản phẩm" onClose={() => setSearch(false)} initialFocusId="tf-sheet-search">
          <Form action="/tim-kiem" className="tf-sheet-form">
            <Suspense fallback={<SearchField id="tf-sheet-search" />}>
              <QuerySearchField id="tf-sheet-search" />
            </Suspense>
            <Button variant="primary" type="submit" block>
              Tìm
            </Button>
          </Form>
        </Sheet>
      ) : null}
    </>
  );
}
