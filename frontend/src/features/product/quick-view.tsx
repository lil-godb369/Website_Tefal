"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { BadgeRow } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Plate } from "@/components/ui/plate";
import { PriceTag } from "@/components/ui/price-tag";
import { FigureRow } from "@/components/ui/spec";
import { useShop } from "@/features/cart/shop-store";
import { offPercent } from "@/lib/format";
import { badgesOf, figuresOf, metaOf } from "@/lib/product";
import { routes } from "@/lib/routes";
import type { ProductSummary } from "@/types/product";
import { closeQuickView, useQuickView } from "./quick-view-store";

/** Đặt một lần trong layout. Vẽ hộp xem nhanh khi có thẻ SP mở. */
export function QuickViewHost() {
  const item = useQuickView((s) => s.item);
  const pathname = usePathname();
  // Đổi trang (vd bấm Back) thì đóng hộp xem nhanh
  useEffect(() => closeQuickView(), [pathname]);
  if (!item) return null;
  return <QuickViewDialog key={item.id} p={item} />;
}

/* Ảnh trái, thông tin và nút phải (điện thoại: tấm trượt từ dưới lên).
   Esc, nút đóng hoặc bấm ra ngoài thì đóng; Tab đi vòng trong hộp; đóng xong trả focus về thẻ đã mở. */
function QuickViewDialog({ p }: { p: ProductSummary }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const add = useShop((s) => s.add);
  const off = offPercent(p.price, p.orig);

  useEffect(() => {
    const back = useQuickView.getState().returnFocus ?? (document.activeElement as HTMLElement | null);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleRef.current?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeQuickView();
        return;
      }
      if (e.key !== "Tab" || !boxRef.current) return;
      const f = boxRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("keydown", key, true);
      document.body.style.overflow = overflow;
      back?.focus?.();
    };
  }, []);

  const meta = metaOf(p);
  return (
    <div
      className="tf-qv-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeQuickView();
      }}
    >
      <div
        ref={boxRef}
        className="tf-qv"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tf-qv-title"
        aria-describedby="tf-qv-desc"
      >
        <button type="button" className="tf-qv-close" aria-label="Đóng xem nhanh" onClick={closeQuickView}>
          <Icon name="close" size={22} />
        </button>
        <div className="tf-qv-media">
          <Plate image={p.img} alt={p.name} art={p.art} eager tag={off > 0 ? `−${off}%` : undefined} />
        </div>
        <div className="tf-qv-info">
          {p.groupName ? <p className="tf-qv-kicker">{p.groupName}</p> : null}
          <h2 id="tf-qv-title" ref={titleRef} tabIndex={-1} className="tf-qv-title">
            {p.name}
          </h2>
          <p id="tf-qv-desc" className="tf-buy-meta">
            {meta}
          </p>
          {p.price > 0 ? (
            <PriceTag price={p.price} original={p.orig} size="lg" />
          ) : (
            <p className="tf-price-ask">Sản phẩm chưa có giá bán. Gọi để được báo giá.</p>
          )}
          <BadgeRow items={badgesOf(p)} />
          <FigureRow items={figuresOf(p)} />
          {p.quickSpecs.length ? (
            <dl className="tf-qv-specs">
              {p.quickSpecs.map((r, i) => (
                <div key={i} style={{ display: "contents" }}>
                  <dt>{r[0]}</dt>
                  <dd>{r[1]}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <div className="tf-qv-actions">
            {p.price > 0 && !p.stock ? (
              <Button variant="primary" disabled>
                Tạm hết hàng
              </Button>
            ) : p.price > 0 ? (
              <Button
                variant="primary"
                onClick={() => {
                  closeQuickView();
                  add(p);
                }}
              >
                Thêm vào giỏ
              </Button>
            ) : (
              <Button variant="primary" href={routes.showroom} onClick={closeQuickView}>
                Gọi để báo giá
              </Button>
            )}
            <Button href={p.href} onClick={closeQuickView}>
              Xem chi tiết
            </Button>
          </div>
          <p className="tf-buy-note">
            <Icon name="store" size={18} />
            Xem và nấu thử tại showroom trước khi mua.
          </p>
        </div>
      </div>
    </div>
  );
}
