"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Plate } from "@/components/ui/plate";
import { PriceTag } from "@/components/ui/price-tag";
import { Breadcrumb } from "@/components/ui/section";
import { COMPARE_MAX, useShop, useShopHydrated } from "@/features/cart/shop-store";
import { routes } from "@/lib/routes";
import { toast } from "@/lib/toast";
import type { Product } from "@/types/product";

type Full = Product & { groupName: string };

/** So sánh tối đa 4 mẫu: mỗi mẫu một cột, hàng là thông số (hợp các tên thông số, ô trống ghi "—") */
export function CompareView() {
  const ready = useShopHydrated();
  const items = useShop((s) => s.compare);
  const { removeCompare, add } = useShop.getState();
  const [full, setFull] = useState<Record<string, Full>>({});
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // Chỉ tải thông số của mẫu chưa có (bỏ một mẫu thì không tải lại cả bảng)
  const missing = items
    .map((x) => x.id)
    .filter((id) => !full[id])
    .join(",");

  useEffect(() => {
    if (!missing) return;
    const ctl = new AbortController();
    fetch(`/api/products?ids=${encodeURIComponent(missing)}`, { signal: ctl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<Full[]>;
      })
      .then((list) => {
        setFailed(false);
        setFull((old) => ({ ...old, ...Object.fromEntries(list.map((p) => [p.id, p])) }));
        // Mẫu lưu từ trước nhưng nay không còn bán: bỏ khỏi so sánh để bảng không chờ mãi
        const gone = missing.split(",").filter((id) => !list.some((p) => p.id === id));
        for (const id of gone) removeCompare(id);
        if (gone.length) toast(`Đã bỏ ${gone.length} mẫu không còn bán khỏi so sánh.`);
      })
      .catch((e: unknown) => {
        if ((e as Error)?.name !== "AbortError") setFailed(true);
      });
    return () => ctl.abort();
  }, [missing, attempt, removeCompare]);

  const head = (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", href: routes.home }, { label: "So sánh" }]} />
      <header className="tf-cat-head">
        <h1 className="tf-cat-title" tabIndex={-1}>
          So sánh sản phẩm
        </h1>
        <span className="tf-cat-count">
          {ready ? String(items.length) : "…"}
          <small>trên {COMPARE_MAX} mẫu</small>
        </span>
      </header>
    </>
  );
  if (!ready) return head;
  if (!items.length) {
    return (
      <>
        {head}
        <div className="tf-empty">
          <p>
            Chưa có mẫu nào để so sánh. Rê chuột vào thẻ sản phẩm rồi bấm nút So sánh, tối đa {COMPARE_MAX} mẫu.
          </p>
          <Button variant="primary" href={routes.all}>
            Xem đồ bếp
          </Button>
        </div>
      </>
    );
  }

  const ps = items.map((x) => full[x.id]);
  const loaded = ps.every(Boolean);
  const rows: string[] = [];
  if (loaded) for (const p of ps) for (const r of p.specs) if (!rows.includes(r[0])) rows.push(r[0]);
  const specOf = (p: Full | undefined, name: string) => p?.specs.find((x) => x[0] === name)?.[1] ?? "—";
  const groups = new Set(ps.map((p) => p?.g).filter(Boolean));

  function removeOne(id: string) {
    removeCompare(id);
    setTimeout(() => {
      (document.querySelector<HTMLElement>(".tf-cmp-remove") ?? document.querySelector<HTMLElement>("main h1"))?.focus();
    }, 0);
  }

  return (
    <>
      {head}
      {groups.size > 1 ? (
        <p className="tf-cat-note">Các mẫu thuộc nhóm khác nhau nên nhiều thông số không đặt cạnh nhau được.</p>
      ) : null}
      <div className="tf-cmp-scroll" tabIndex={0} role="region" aria-label="Bảng so sánh, cuộn ngang được">
        <table className="tf-cmp">
          <caption className="tf-sr">So sánh {items.length} sản phẩm</caption>
          <thead>
            <tr>
              <td />
              {items.map((p) => (
                <th key={p.id} scope="col">
                  <div className="tf-cmp-head">
                    <Link href={p.href} className="tf-cmp-img" tabIndex={-1} aria-hidden="true">
                      <Plate image={p.img} alt="" art={p.art} />
                    </Link>
                    <Link href={p.href} className="tf-cmp-name">
                      {p.name}
                    </Link>
                    <button
                      type="button"
                      className="tf-cmp-remove"
                      aria-label={"Bỏ khỏi so sánh: " + p.name}
                      onClick={() => removeOne(p.id)}
                    >
                      <Icon name="close" size={14} />
                      Bỏ
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Giá</th>
              {items.map((p) => (
                <td key={p.id}>
                  {p.price > 0 ? (
                    <PriceTag price={p.price} original={p.orig} />
                  ) : (
                    <span className="tf-price-ask">Gọi để báo giá</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Nhóm</th>
              {items.map((p) => (
                <td key={p.id}>{full[p.id]?.groupName || "—"}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Model</th>
              {items.map((p) => (
                <td key={p.id}>{p.model}</td>
              ))}
            </tr>
            {loaded ? (
              rows.map((name) => (
                <tr key={name}>
                  <th scope="row">{name}</th>
                  {items.map((p) => (
                    <td key={p.id}>{specOf(full[p.id], name)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <th scope="row">Thông số</th>
                <td colSpan={items.length}>
                  {failed ? (
                    <>
                      Chưa tải được thông số.{" "}
                      <button type="button" className="tf-link" onClick={() => setAttempt((n) => n + 1)}>
                        Thử lại
                      </button>
                    </>
                  ) : (
                    "Đang tải…"
                  )}
                </td>
              </tr>
            )}
            <tr>
              <td />
              {items.map((p) => (
                <td key={p.id}>
                  {p.price > 0 ? (
                    <Button variant="primary" size="sm" onClick={() => add(p)} aria-label={"Thêm vào giỏ: " + p.name}>
                      Thêm vào giỏ
                    </Button>
                  ) : (
                    <Button size="sm" href={p.href}>
                      Xem báo giá
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
