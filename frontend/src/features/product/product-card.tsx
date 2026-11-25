"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Plate } from "@/components/ui/plate";
import { PriceTag } from "@/components/ui/price-tag";
import { SpecFigure } from "@/components/ui/spec";
import { useShop } from "@/features/cart/shop-store";
import { offPercent } from "@/lib/format";
import { figOf } from "@/lib/product";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";
import { quickViewClick } from "./quick-view-store";

/** Thẻ SP phẳng: ảnh nền xám, tên, con số dạng chip, giá. Ba nút hiện khi rê chuột hoặc focus
 *  (luôn hiện trên màn hình cảm ứng): Yêu thích, So sánh, Thêm vào giỏ. Bấm thẻ mở xem nhanh. */
export function ProductCard({ product: p, className }: { product: ProductSummary; className?: string }) {
  const wished = useShop((s) => s.wish.some((x) => x.id === p.id));
  const compared = useShop((s) => s.compare.some((x) => x.id === p.id));
  const { add, toggleWish, toggleCompare } = useShop.getState();
  const off = offPercent(p.price, p.orig);
  const fig = figOf(p.fig);

  function tool(key: string, icon: string, label: string, onClick: () => void, pressed?: boolean) {
    return (
      <button
        key={key}
        type="button"
        className={cn("tf-card-tool", `tf-tool-${key}`, pressed && "is-on")}
        data-tip={label}
        aria-label={`${label}: ${p.name}`}
        aria-pressed={pressed === undefined ? undefined : pressed}
        onClick={onClick}
      >
        <Icon name={icon} size={18} />
      </button>
    );
  }

  return (
    <article className={cn("tf-card", className)}>
      <Link className="tf-card-link" href={p.href} onClick={quickViewClick(p)} aria-haspopup="dialog">
        <Plate
          image={p.img}
          alt=""
          art={p.art}
          tag={
            off > 0 ? (
              <>
                <span className="tf-sr">Giảm </span>−{off}%
              </>
            ) : undefined
          }
        />
        <div className="tf-card-body">
          <h3 className="tf-card-name">{p.name}</h3>
          {fig ? <SpecFigure chip {...fig} /> : null}
          {p.price > 0 ? (
            <PriceTag price={p.price} original={p.orig} showOff={false} save />
          ) : (
            <span className="tf-price-ask">Gọi để báo giá</span>
          )}
        </div>
      </Link>
      <div className="tf-card-tools" role="group" aria-label={"Thao tác với " + p.name}>
        {tool("wish", "heart", "Yêu thích", () => toggleWish(p), wished)}
        {tool("cmp", "compare", "So sánh", () => toggleCompare(p), compared)}
        {/* Hết hàng thì không cho thêm giỏ (đặt hàng sẽ bị bỏ món này) */}
        {p.price > 0 && p.stock ? tool("add", "bag", "Thêm vào giỏ", () => add(p)) : null}
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  className = "tf-grid-products",
}: {
  products: ProductSummary[];
  className?: string;
}) {
  return (
    <div className={className}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
