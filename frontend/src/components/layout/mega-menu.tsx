"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Plate } from "@/components/ui/plate";
import { cn } from "@/lib/utils";
import type { ArtKind } from "@/types/product";

export interface MegaGroup {
  key: string;
  label: string;
  href: string;
  links: { label: string; href: string }[];
}

export type MegaItem = { label: string; href: string; image: string; art: ArtKind };

/** Tải ảnh SP của bảng chọn một lần cho cả phiên (dùng chung giữa các lần mở) */
let itemsPromise: Promise<Record<string, MegaItem[]>> | null = null;
function loadItems() {
  itemsPromise ??= fetch("/api/mega")
    .then((r) => (r.ok ? (r.json() as Promise<Record<string, MegaItem[]>>) : {}))
    .catch(() => {
      itemsPromise = null; // lỗi mạng: lần mở sau thử lại
      return {};
    });
  return itemsPromise;
}

/* Bảng chọn rộng dưới header. Hàng trên: các nhóm (rê chuột/focus để xem trước, bấm để mở danh mục).
   Cột trái: lối tắt của nhóm. Bên phải: lưới ảnh SP. Esc hoặc bấm ra ngoài thì đóng. */
export function MegaMenu({
  label,
  groups,
  allHref,
  allLabel,
  active,
}: {
  label: string;
  groups: MegaGroup[];
  allHref: string;
  allLabel: string;
  active?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initial = Math.max(
    0,
    groups.findIndex((g) => pathname === g.href),
  );
  const [cur, setCur] = useState(initial);
  const boxRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Chuyển trang thì đóng bảng chọn
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setCur(initial);
  }

  useEffect(() => {
    if (!open) return;
    function outside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const g = groups[cur];
  // Chỉ dựng nội dung bảng chọn (ảnh SP) sau lần mở đầu: trang nào cũng có header, đỡ 12 ảnh ẩn mỗi trang
  const [everOpened, setEverOpened] = useState(false);
  const [items, setItems] = useState<Record<string, MegaItem[]>>({});
  if (open && !everOpened) setEverOpened(true);
  useEffect(() => {
    if (everOpened) void loadItems().then(setItems);
  }, [everOpened]);
  return (
    <div
      className="tf-mega"
      ref={boxRef}
      onBlur={(e) => {
        // Tab ra khỏi bảng chọn thì đóng, tránh bảng che phần tử đang được focus.
        // relatedTarget null = bấm chuột vào chỗ trống trong bảng: không đóng (bấm ra ngoài đã có bộ nghe mousedown).
        const to = e.relatedTarget as Node | null;
        if (open && to && !e.currentTarget.contains(to)) setOpen(false);
      }}
      onClickCapture={(e) => {
        // Bấm liên kết trong bảng thì đóng, kể cả liên kết tới chính trang đang xem
        if ((e.target as HTMLElement).closest("a[href]")) setOpen(false);
      }}
    >
      <button
        type="button"
        ref={btnRef}
        className={cn("tf-navdrop-btn", active && "is-active", open && "is-open")}
        aria-expanded={open}
        aria-controls="tf-mega-menu"
        onClick={() => setOpen(!open)}
      >
        {label}
        <Icon name="chevron" size={14} />
      </button>
      <div id="tf-mega-menu" className="tf-mega-panel" hidden={!open}>
        <div className="tf-mega-inner">
          <nav className="tf-mega-tabs" aria-label="Nhóm sản phẩm">
            {groups.map((x, i) => (
              <Link
                key={x.key}
                href={x.href}
                className={cn("tf-mega-tab", i === cur && "is-on")}
                // Chỉ đổi nhóm khi rê chuột. Đổi theo focus thì Tab qua hàng nhóm làm nhóm cuối luôn được chọn,
                // liên kết của các nhóm khác không tới được bằng bàn phím.
                onMouseEnter={() => setCur(i)}
              >
                {x.label}
              </Link>
            ))}
          </nav>
          {g && everOpened ? (
            <div className="tf-mega-body">
              <ul className="tf-mega-side">
                {g.links.map((l, i) => (
                  <li key={l.href}>
                    <Link href={l.href} className={i === 0 ? "is-first" : undefined}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="tf-mega-grid">
                {(items[g.key] ?? []).map((it) => (
                  <li key={it.href}>
                    <Link href={it.href}>
                      <Plate image={it.image} alt="" art={it.art} />
                      <span>{it.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link className="tf-navdrop-all" href={allHref}>
            {allLabel}
            <Icon name="arrow" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
