"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { Plate } from "@/components/ui/plate";
import { useShop } from "@/features/cart/shop-store";
import { quickViewClick } from "@/features/product/quick-view-store";
import { offPercent, vnd } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

/* Ưu đãi trong ngày có đếm ngược. Khung giờ lặp lại mỗi ngày; người dùng chốt 06:00–23:59 (16/10/2026). */
const FLASH = { title: "Giờ vàng giá tốt", from: "06:00:00", to: "23:59:59" };
// Lọc đúng các mẫu đang giảm (giam=1), xếp giảm nhiều trước
const SALE_HREF = routes.all + "?giam=1&sap=giam-gia";

function atTime(hms: string, base: number) {
  const [h, m, s] = hms.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h || 0, m || 0, s || 0, 0);
  return d.getTime();
}

/* Đồng hồ theo giây cho mọi nơi cần; server trả null (không biết giờ của khách) */
function subscribeSecond(cb: () => void) {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
}
const nowSecond = () => Math.floor(Date.now() / 1000) * 1000;

function useFlashClock() {
  const now = useSyncExternalStore(subscribeSecond, nowSecond, () => null);
  if (now === null) return null;
  const start = atTime(FLASH.from, now);
  const end = atTime(FLASH.to, now);
  if (now < start) return { state: "soon" as const, left: start - now };
  if (now <= end) return { state: "on" as const, left: end - now };
  return { state: "over" as const, left: 0 };
}

const pad2 = (n: number) => (n < 10 ? "0" : "") + n;

/** Số lăn: mỗi chữ số là dải 0–9 trượt dọc trong ô cao một dòng */
function RollNumber({ value }: { value: number }) {
  return (
    <strong className="tf-roll">
      {pad2(value)
        .split("")
        .map((d, i) => (
          <span key={i} className="tf-roll-d">
            <span className="tf-roll-strip" style={{ transform: `translateY(${-Number(d) * 10}%)` }}>
              {"0123456789".split("").map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ))}
    </strong>
  );
}

/* Giảm chuyển động theo cài đặt máy (server: không biết, coi như không) */
const REDUCE = "(prefers-reduced-motion: reduce)";
function subscribeReduce(cb: () => void) {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Đồng hồ đếm ngược. Tách riêng: chỉ phần này vẽ lại mỗi giây, 10 thẻ SP không bị vẽ lại theo. */
function FlashTimer() {
  const c = useFlashClock();
  const left = c ? Math.floor(c.left / 1000) : 0;
  const hh = Math.floor(left / 3600);
  const mm = Math.floor((left % 3600) / 60);
  const ss = left % 60;
  const label = !c
    ? "Chương trình trong ngày"
    : c.state === "soon"
      ? "Chương trình bắt đầu sau"
      : c.state === "on"
        ? "Chương trình kết thúc sau"
        : `Hôm nay đã kết thúc. Mở lại lúc ${FLASH.from.slice(0, 5)} ngày mai`;
  // Đọc cho trình đọc màn hình theo phút, không đọc từng giây
  const spoken = !c || c.state === "over" ? label : `${label} ${hh} giờ ${mm} phút`;
  return (
    <div className="tf-flash-timer">
      <p className="tf-flash-label">{label}</p>
      {c && c.state !== "over" ? (
        <div className="tf-flash-clock" aria-hidden="true">
          {(
            [
              [hh, "Giờ"],
              [mm, "Phút"],
              [ss, "Giây"],
            ] as const
          ).map(([v, unit]) => (
            <span key={unit} className="tf-flash-box">
              <RollNumber value={v} />
              <small>{unit}</small>
            </span>
          ))}
        </div>
      ) : null}
      <span className="tf-sr" role="timer" aria-live="off">
        {spoken}
      </span>
    </div>
  );
}

export function FlashSale({ items }: { items: ProductSummary[] }) {
  const add = useShop((s) => s.add);
  const listRef = useRef<HTMLUListElement>(null);
  const reduce = useSyncExternalStore(subscribeReduce, () => window.matchMedia(REDUCE).matches, () => false);
  // null = người dùng chưa bấm: máy bật giảm chuyển động thì mặc định không tự trượt
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reduce;
  const [hold, setHold] = useState(false);

  // Tự trượt mỗi 3 giây, hết thì quay về đầu. Dừng khi rê chuột, focus vào trong, hoặc bấm Tạm dừng (WCAG 2.2.2).
  function step(dir: 1 | -1) {
    const el = listRef.current;
    const card = el?.querySelector(".tf-flash-card");
    if (!el || !card) return;
    const how: ScrollBehavior = window.matchMedia(REDUCE).matches ? "auto" : "smooth";
    const w = card.getBoundingClientRect().width;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: how });
    else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: how });
    else el.scrollBy({ left: dir * w, behavior: how });
  }
  useEffect(() => {
    if (paused || hold) return;
    const t = setInterval(() => step(1), 3000);
    return () => clearInterval(t);
  }, [paused, hold]);

  return (
    <section className="tf-flash" aria-labelledby="tf-flash-title">
      <div className="tf-flash-head">
        <h2 id="tf-flash-title" className="tf-flash-title">
          <Link href={SALE_HREF}>{FLASH.title}</Link>
        </h2>
        <FlashTimer />
      </div>
      <div
        className="tf-flash-track"
        onMouseEnter={() => setHold(true)}
        onMouseLeave={() => setHold(false)}
        onFocus={() => setHold(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setHold(false);
        }}
      >
        <button type="button" className="tf-flash-nav is-prev" aria-label="Sản phẩm trước" onClick={() => step(-1)}>
          <Icon name="arrow" size={18} />
        </button>
        <button type="button" className="tf-flash-nav is-next" aria-label="Sản phẩm sau" onClick={() => step(1)}>
          <Icon name="arrow" size={18} />
        </button>
        <ul className="tf-flash-list" ref={listRef}>
          {items.map((x) => {
            const off = offPercent(x.price, x.orig);
            return (
              <li key={x.id} className="tf-flash-card">
                <Link className="tf-flash-link" href={x.href} aria-haspopup="dialog" onClick={quickViewClick(x)}>
                  <Plate image={x.img} alt="" art={x.art} />
                  <span className="tf-flash-name">{x.name}</span>
                </Link>
                <div className="tf-flash-foot">
                  <div className="tf-flash-prices">
                    <span className="tf-flash-now">
                      <span className="tf-sr">Giá bán </span>
                      {vnd(x.price)}
                    </span>
                    {off && x.orig ? (
                      <span className="tf-flash-was">
                        <s>
                          <span className="tf-sr">Giá gốc </span>
                          {vnd(x.orig)}
                        </s>
                        <span className="tf-flash-off">
                          <span className="tf-sr">Giảm </span>−{off}%
                        </span>
                      </span>
                    ) : null}
                    {off && x.orig ? <span className="tf-price-save">Tiết kiệm {vnd(x.orig - x.price)}</span> : null}
                  </div>
                  <button
                    type="button"
                    className="tf-flash-add"
                    aria-label={(x.stock ? "Thêm vào giỏ: " : "Tạm hết hàng: ") + x.name}
                    disabled={!x.stock}
                    onClick={() => add(x)}
                  >
                    <Icon name="bag" size={18} />
                  </button>
                </div>
                <span className={cn("tf-flash-stock", !x.stock && "is-out")}>
                  {x.stock ? "Còn hàng" : "Tạm hết hàng"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="tf-flash-foot-row">
        <button type="button" className="tf-flash-pause" onClick={() => setUserPaused(!paused)}>
          {paused ? "Tự chạy" : "Tạm dừng"}
        </button>
        <Link className="tf-flash-more" href={SALE_HREF}>
          Xem tất cả sản phẩm đang giảm giá
          <Icon name="arrow" size={14} />
        </Link>
      </div>
    </section>
  );
}
