"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Plate } from "@/components/ui/plate";
import { Breadcrumb, CategoryIndex } from "@/components/ui/section";
import { useAuthStore } from "@/features/auth/use-user";
import { vnd } from "@/lib/format";
import { metaOf } from "@/lib/product";
import { routes } from "@/lib/routes";
import { useShop, useShopHydrated } from "./shop-store";

/** Giỏ hàng: khách xem và sửa được; chỉ bước đặt hàng mới cần đăng nhập */
export function CartView({ categories }: { categories: { name: string; count: number; href: string }[] }) {
  const ready = useShopHydrated();
  const cart = useShop((s) => s.cart);
  const { setQty, remove } = useShop.getState();
  const user = useAuthStore((s) => s.user);
  const total = cart.reduce((n, x) => n + x.price * x.qty, 0);
  const count = cart.reduce((n, x) => n + x.qty, 0);
  const unpriced = cart.filter((x) => !x.price).length;

  // Bỏ một món: focus sang nút "Bỏ" kế tiếp (hoặc tiêu đề khi giỏ trống) để người dùng bàn phím không bị lạc
  function removeRow(id: string, e: React.MouseEvent<HTMLElement>) {
    const all = Array.from(document.querySelectorAll<HTMLElement>(".tf-cart-remove"));
    const i = all.indexOf(e.currentTarget.closest(".tf-cart-row")!.querySelector(".tf-cart-remove")!);
    remove(id);
    setTimeout(() => {
      const left = document.querySelectorAll<HTMLElement>(".tf-cart-remove");
      const to = left.length ? left[Math.min(i, left.length - 1)] : document.querySelector<HTMLElement>("main h1");
      to?.focus();
    }, 0);
  }

  const head = (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", href: routes.home }, { label: "Giỏ hàng" }]} />
      <header className="tf-cat-head">
        <h1 className="tf-cat-title" tabIndex={-1}>
          Giỏ hàng
        </h1>
        <span className="tf-cat-count">
          {ready ? String(count) : "…"}
          <small>sản phẩm</small>
        </span>
      </header>
    </>
  );

  if (!ready) return head;

  if (!cart.length) {
    return (
      <>
        {head}
        <div className="tf-empty">
          <p>Giỏ hàng đang trống. Chọn một danh mục để bắt đầu:</p>
          <CategoryIndex items={categories} />
        </div>
      </>
    );
  }

  return (
    <>
      {head}
      <div className="tf-cart">
        <ul className="tf-cart-list">
          {cart.map((x) => (
            <li key={x.id} className="tf-cart-row">
              <Link href={x.href} className="tf-cart-thumb" tabIndex={-1} aria-hidden="true">
                <Plate image={x.img} alt="" art={x.art} />
              </Link>
              <div className="tf-cart-info">
                <Link href={x.href} className="tf-cart-name">
                  {x.name}
                </Link>
                <span className="tf-card-meta">{metaOf(x)}</span>
                <button
                  type="button"
                  className="tf-cart-remove"
                  aria-label={"Bỏ khỏi giỏ: " + x.name}
                  onClick={(e) => removeRow(x.id, e)}
                >
                  <Icon name="close" size={14} />
                  Bỏ khỏi giỏ
                </button>
              </div>
              <div className="tf-qty" role="group" aria-label={"Số lượng " + x.name}>
                {/* Còn 1 thì "−" tắt, không tự thành nút xóa: bấm liên tiếp không lỡ bỏ món. Bỏ món dùng nút "Bỏ khỏi giỏ". */}
                <button
                  type="button"
                  aria-label={"Bớt một: " + x.name}
                  disabled={x.qty <= 1}
                  onClick={() => setQty(x.id, x.qty - 1)}
                >
                  −
                </button>
                <output aria-live="polite">{x.qty}</output>
                <button type="button" aria-label="Thêm một" onClick={() => setQty(x.id, x.qty + 1)}>
                  +
                </button>
              </div>
              <span className="tf-cart-line">{x.price ? vnd(x.price * x.qty) : "Gọi báo giá"}</span>
            </li>
          ))}
        </ul>
        <aside className="tf-cart-sum">
          <h2 className="heading">Tạm tính</h2>
          <dl>
            <dt>Sản phẩm</dt>
            <dd>{count}</dd>
            <dt>Giao hàng</dt>
            <dd>Tính khi đặt hàng</dd>
            <dt className="tf-cart-total">Tổng</dt>
            <dd className="tf-cart-total">{vnd(total)}</dd>
          </dl>
          {unpriced ? <p className="tf-cat-note">{unpriced} sản phẩm chưa có giá, chưa tính vào tổng.</p> : null}
          {user ? (
            <Button variant="primary" block href={routes.checkout}>
              Đặt hàng
            </Button>
          ) : (
            <Button variant="primary" block href={routes.signIn(routes.checkout)}>
              Đăng nhập để đặt hàng
            </Button>
          )}
          {user ? null : (
            <p className="tf-cat-note">
              Giỏ hàng đang lưu tạm trong phiên này. Đăng nhập hoặc đăng ký thì giỏ, danh sách yêu thích và so sánh
              được giữ lại trong tài khoản.
            </p>
          )}
          <p className="tf-cat-note">Giá trong giỏ lấy lúc bạn thêm; khi đặt hàng, giá được tính lại theo giá hiện tại.</p>
        </aside>
      </div>
    </>
  );
}
