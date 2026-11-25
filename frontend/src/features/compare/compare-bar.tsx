"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Plate } from "@/components/ui/plate";
import { COMPARE_MAX, useShop } from "@/features/cart/shop-store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Thanh nổi cuối màn hình khi có SP đang chờ so sánh */
export function CompareBar() {
  const items = useShop((s) => s.compare);
  const clear = useShop((s) => s.clearCompare);
  const pathname = usePathname();
  if (!items.length || pathname === routes.compare) return null;
  return (
    <div
      // Trang chi tiết có thanh mua dưới đáy (điện thoại): đẩy thanh so sánh lên trên
      className={cn("tf-cmpbar", pathname.startsWith("/san-pham/") && "is-pdp")}
      role="region"
      aria-label="Sản phẩm đang so sánh"
    >
      <span className="tf-cmpbar-thumbs" aria-hidden="true">
        {items.map((p) => (
          <span key={p.id} className="tf-cmpbar-thumb">
            <Plate image={p.img} alt="" art={p.art} />
          </span>
        ))}
      </span>
      <span className="tf-cmpbar-text">
        So sánh {items.length}/{COMPARE_MAX}
      </span>
      <Button variant="primary" size="sm" href={routes.compare}>
        Xem so sánh
      </Button>
      <button type="button" className="tf-cmpbar-clear" aria-label="Xóa hết sản phẩm so sánh" onClick={clear}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
