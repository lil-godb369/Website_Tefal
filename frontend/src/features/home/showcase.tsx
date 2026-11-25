"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Plate } from "@/components/ui/plate";
import { useShop } from "@/features/cart/shop-store";
import { vnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

export type ShowProduct = ProductSummary & { line: string };

/* Trưng bày kiểu Apple: một mẫu lớn canh giữa, hai ô nhỏ bên dưới.
   Chữ lấy từ dữ liệu SP (tên dòng, con số, xuất xứ, bảo hành); không thêm lời quảng cáo. */
function ShowItem({ p, big, delay = 0 }: { p: ShowProduct; big?: boolean; delay?: number }) {
  const Title = big ? "h2" : "h3";
  const add = useShop((s) => s.add);
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const [sweep, setSweep] = useState(false);

  // Hiện dần khi cuộn tới (lần đầu), rồi một vệt sáng lướt qua ảnh
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!shown) return;
    const t1 = setTimeout(() => setSweep(true), 700 + delay);
    const t2 = setTimeout(() => setSweep(false), 1900 + delay);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [shown, delay]);

  const sale = !!p.orig && p.orig > p.price;
  return (
    <article
      ref={ref}
      className={cn("tf-show tf-reveal", big ? "is-main" : "is-tile", shown && "is-in", sweep && "is-sweep")}
      style={delay ? { transitionDelay: delay + "ms" } : undefined}
    >
      <div className="tf-show-text">
        <p className="tf-show-kicker">{p.groupName}</p>
        <Title className="tf-show-title">{p.name.replace(/\s+[A-Z0-9]{6,}$/, "")}</Title>
        <p className="tf-show-lead">{p.line}</p>
        <p className="tf-show-price">
          <span className={sale ? "is-sale" : undefined}>{vnd(p.price)}</span>
          {sale && p.orig ? (
            <s>
              <span className="tf-sr">Giá gốc </span>
              {vnd(p.orig)}
            </s>
          ) : null}
        </p>
        <div className="tf-show-actions">
          <button
            type="button"
            className={cn("tf-btn tf-btn-primary", !big && "tf-btn-sm")}
            onClick={() => add(p)}
            aria-label={"Thêm vào giỏ: " + p.name}
          >
            Thêm vào giỏ
          </button>
          <Link className="tf-show-link" href={p.href} aria-label={"Tìm hiểu thêm về " + p.name}>
            Tìm hiểu thêm
          </Link>
        </div>
      </div>
      <Link className="tf-show-media" href={p.href} tabIndex={-1} aria-hidden="true">
        <Plate image={p.img} art={p.art} alt="" />
      </Link>
    </article>
  );
}

export function Showcase({ items }: { items: ShowProduct[] }) {
  const [main, ...tiles] = items;
  if (!main) return null;
  return (
    <section className="tf-showcase" aria-label="Sản phẩm nổi bật">
      <ShowItem p={main} big />
      {tiles.length ? (
        <div className="tf-show-grid">
          {tiles.map((p, i) => (
            <ShowItem key={p.id} p={p} delay={i * 120} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
