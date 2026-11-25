"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/ui/price-tag";
import { useShop } from "@/features/cart/shop-store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

/** Nút mua chính trên trang chi tiết + thanh mua dưới đáy (điện thoại).
 *  Thanh dưới đáy chỉ hiện khi nút mua chính đã cuộn khỏi màn hình. */
export function BuyActions({ product: p }: { product: ProductSummary }) {
  const add = useShop((s) => s.add);
  const ref = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      setShowBar(!es[0].isIntersecting && es[0].boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const buy =
    p.price > 0 && !p.stock ? (
      <Button variant="primary" disabled>
        Tạm hết hàng
      </Button>
    ) : p.price > 0 ? (
      <Button variant="primary" onClick={() => add(p)}>
        Thêm vào giỏ
      </Button>
    ) : (
      <Button variant="primary" href={routes.showroom}>
        Gọi để báo giá
      </Button>
    );

  return (
    <>
      <div className="tf-buy-actions" ref={ref}>
        {buy}
        <Button href={routes.showroom}>Gọi tư vấn</Button>
      </div>
      <div className={cn("tf-buybar", showBar && "is-on")}>
        {p.price > 0 ? (
          <PriceTag price={p.price} original={p.orig} />
        ) : (
          <span className="tf-price-ask">Chưa có giá</span>
        )}
        {p.price > 0 && !p.stock ? (
          <Button variant="primary" block disabled>
            Tạm hết hàng
          </Button>
        ) : p.price > 0 ? (
          <Button variant="primary" block onClick={() => add(p)}>
            Thêm vào giỏ
          </Button>
        ) : (
          <Button variant="primary" block href={routes.showroom}>
            Gọi để báo giá
          </Button>
        )}
      </div>
    </>
  );
}
