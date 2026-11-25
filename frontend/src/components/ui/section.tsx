import Link from "next/link";
import type { ArtKind } from "@/types/product";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { Photo, Plate } from "./plate";
import { ProductArt } from "./product-art";

/** Tiêu đề khu vực canh trái, có liên kết "Xem thêm" và dòng ghi chú */
export function SectionTitle({
  title,
  moreHref,
  moreLabel = "Xem thêm",
  note,
  className,
}: {
  title: string;
  moreHref?: string;
  moreLabel?: string;
  note?: string;
  className?: string;
}) {
  return (
    <div className={cn("tf-stitle", className)}>
      <h2 className="tf-stitle-text">{title}</h2>
      {moreHref ? (
        <Link className="tf-stitle-more" href={moreHref}>
          {moreLabel}
          <Icon name="arrow" size={16} />
        </Link>
      ) : null}
      {note ? <p className="tf-stitle-note">{note}</p> : null}
    </div>
  );
}

export interface TrustItem {
  icon: string;
  title: string;
  text?: string;
}

/** Dải cam kết có biểu tượng */
export function TrustBar({ items, dark, className }: { items: TrustItem[]; dark?: boolean; className?: string }) {
  return (
    <ul className={cn("tf-trust", dark && "tf-trust-dark", className)}>
      {items.map((it, i) => (
        <li key={i}>
          <span className="tf-trust-icon">
            <Icon name={it.icon} size={dark ? 26 : 24} stroke={1.4} />
          </span>
          <span>
            <strong>{it.title}</strong>
            {it.text ? <span>{it.text}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Ô danh mục: ảnh, biểu tượng tròn, tên, số mẫu */
export function CategoryTile({
  name,
  href,
  image,
  art,
  icon,
  count,
}: {
  name: string;
  href: string;
  image?: string;
  art?: ArtKind;
  icon: string;
  count?: number;
}) {
  return (
    <Link className="tf-ctile" href={href}>
      <span className="tf-ctile-media">
        <Plate image={image} alt="" art={art} />
        <span className="tf-ctile-icon">
          <Icon name={icon} size={18} />
        </span>
      </span>
      <span className="tf-ctile-body">
        <span className="tf-ctile-name">{name}</span>
        <span className="tf-ctile-more">
          {count ? count + " mẫu" : "Xem ngay"}
          <Icon name="arrow" size={14} />
        </span>
      </span>
    </Link>
  );
}

/** Băng khuyến mãi: chữ trái, ảnh SP phải (không có ảnh thì hình vẽ nét) */
export function PromoBanner({
  kicker,
  title,
  cta = "Xem ngay",
  href,
  images = [],
  art,
  solid,
}: {
  kicker?: string;
  title: string;
  cta?: string;
  href: string;
  images?: string[];
  art?: ArtKind;
  solid?: boolean;
}) {
  const imgs = images.filter(Boolean).slice(0, 2);
  return (
    <Link className="tf-promo" href={href}>
      <span className="tf-promo-copy">
        {kicker ? <span className="tf-promo-kicker">{kicker}</span> : null}
        <span className="tf-promo-title">{title}</span>
        <span className={cn("tf-promo-cta", solid && "is-solid")}>
          {cta}
          {solid ? null : <Icon name="arrow" size={14} />}
        </span>
      </span>
      <span className="tf-promo-art">
        {imgs.length ? imgs.map((src, i) => <Photo key={i} src={src} />) : art ? <ProductArt kind={art} /> : null}
      </span>
    </Link>
  );
}

/** Danh mục dạng danh sách (menu, trang trống) */
export function CategoryIndex({
  items,
  label = "Danh mục",
  unit = "mẫu",
  total,
}: {
  items: { name: string; count: number; href: string }[];
  label?: string;
  unit?: string;
  total?: string;
}) {
  return (
    <nav aria-label={label}>
      <ul className="tf-index">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href}>
              <span className="tf-index-name">{it.name}</span>
              <span className="tf-index-count">
                {it.count}
                <small>{unit}</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {total ? <p className="tf-index-total">{total}</p> : null}
    </nav>
  );
}

/** Đường dẫn "Trang chủ / Danh mục / …"; mục cuối không có href */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="tf-crumbs" aria-label="Đường dẫn">
      {items.map((it, i) => (
        <span key={i} style={{ display: "contents" }}>
          {i > 0 ? <span aria-hidden="true">/</span> : null}
          {it.href ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}
