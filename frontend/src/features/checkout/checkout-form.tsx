"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { placeOrder } from "@/app/(checkout)/thanh-toan/actions";
import { Button } from "@/components/ui/button";
import { ErrorSummary, focusErrors } from "@/components/ui/error-summary";
import { ChoiceGroup, Field, SelectField } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { LoginGate } from "@/components/ui/login-gate";
import { Plate } from "@/components/ui/plate";
import { Breadcrumb } from "@/components/ui/section";
import { displayName, useAuthStore } from "@/features/auth/use-user";
import { useShop, useShopHydrated, type CartLine } from "@/features/cart/shop-store";
import { firstName, vnd } from "@/lib/format";
import { routes } from "@/lib/routes";
import { DELIVERY, PAYMENT, PROVINCES } from "./options";
import { checkoutSchema, type CheckoutInput } from "./schema";
import type { Shortage } from "./stock";

const FIELD_IDS = { name: "tt-ten", phone: "tt-sdt", province: "tt-tinh", ward: "tt-xa", street: "tt-duong" };

function OrderLines({ items }: { items: CartLine[] }) {
  return (
    <ul className="tf-order-lines" tabIndex={0} aria-label="Sản phẩm trong đơn">
      {items.map((x) => (
        <li key={x.id}>
          <span className="tf-order-thumb">
            <Plate image={x.img} alt="" art={x.art} />
            <span className="tf-order-qty">
              <span className="tf-sr">Số lượng </span>
              {x.qty}
            </span>
          </span>
          <span className="tf-order-name">
            {x.name}
            <small>Model {x.model}</small>
          </span>
          <span className="tf-order-price">{x.price ? vnd(x.price * x.qty) : "Báo giá"}</span>
        </li>
      ))}
    </ul>
  );
}

function OrderTotals({ subtotal, delivery }: { subtotal: number; delivery: string }) {
  return (
    <dl className="tf-order-totals">
      <dt>Tạm tính</dt>
      <dd>{vnd(subtotal)}</dd>
      <dt>Giao hàng</dt>
      <dd>{delivery === "showroom" ? "Miễn phí" : "Báo khi xác nhận"}</dd>
      <dt className="tf-cart-total">Tổng</dt>
      <dd className="tf-cart-total">{vnd(subtotal)}</dd>
    </dl>
  );
}

type Placed = { id: string; name: string; phone: string; delivery: string; total: number; priceChanged: boolean };

/** Màn hình đã đặt hàng. Focus vào tiêu đề một lần khi hiện (không kéo focus lại mỗi lần vẽ lại). */
function PlacedView({ placed, crumbs }: { placed: Placed; crumbs: React.ReactNode }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);
  return (
    <>
      {crumbs}
      <div className="tf-placed">
        <span className="tf-placed-icon">
          <Icon name="shield" size={28} />
        </span>
        <h1 className="tf-auth-title" tabIndex={-1} ref={titleRef}>
          Đã nhận đơn {placed.id}
        </h1>
        <p>
          Cảm ơn {firstName(placed.name)}. Showroom sẽ gọi số {placed.phone} để xác nhận đơn
          {placed.delivery === "giao" ? ", báo phí giao và hẹn giờ giao." : " và hẹn giờ bạn qua nhận."}
        </p>
        <p>
          Tạm tính theo giá hiện tại: <strong>{vnd(placed.total)}</strong>
          {placed.delivery === "giao" ? ", chưa gồm phí giao." : "."}
          {placed.priceChanged ? " Giá đã đổi so với lúc bạn thêm vào giỏ, hoặc có sản phẩm vừa hết hàng." : null}
        </p>
        <div className="tf-hero-actions">
          <Button variant="primary" href={routes.all}>
            Tiếp tục mua sắm
          </Button>
          <Button href={routes.account}>Xem đơn trong tài khoản</Button>
        </div>
      </div>
    </>
  );
}

export function CheckoutView() {
  const shopReady = useShopHydrated();
  const { user, ready: authReady } = useAuthStore();
  const cart = useShop((s) => s.cart);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const crumbs = (
    <Breadcrumb
      items={[{ label: "Trang chủ", href: routes.home }, { label: "Giỏ hàng", href: routes.cart }, { label: "Thanh toán" }]}
    />
  );

  if (placed) return <PlacedView placed={placed} crumbs={crumbs} />;

  if (!shopReady || !authReady) return crumbs;
  if (!user) {
    return (
      <LoginGate
        title="Đăng nhập để đặt hàng"
        next={routes.checkout}
        text="Cần đăng nhập để giao hàng đúng người. Giỏ hàng bạn đã chọn vẫn được giữ lại sau khi đăng nhập."
      />
    );
  }
  if (!cart.length) {
    return (
      <>
        {crumbs}
        <div className="tf-empty">
          <h1 className="tf-section-title">Giỏ hàng đang trống</h1>
          <p>Thêm sản phẩm vào giỏ trước khi thanh toán.</p>
          <Button variant="primary" href={routes.all}>
            Xem đồ bếp
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {crumbs}
      <header className="tf-cat-head">
        <h1 className="tf-cat-title">Thanh toán</h1>
        <p className="tf-checkout-login">Đặt hàng với tài khoản {user.email}</p>
      </header>
      <CheckoutForm
        cart={cart}
        defaults={{ name: displayName(user), phone: (user.user_metadata?.phone as string | undefined) ?? "" }}
        onPlaced={setPlaced}
      />
    </>
  );
}

function CheckoutForm({
  cart,
  defaults,
  onPlaced,
}: {
  cart: CartLine[];
  defaults: { name: string; phone: string };
  onPlaced: (o: Placed) => void;
}) {
  const removeOrdered = useShop((s) => s.removeOrdered);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  // Món không đủ hàng do server báo (P0409): khách bấm nút mới sửa giỏ, không tự đổi
  const [shortages, setShortages] = useState<Shortage[]>([]);
  const { setQty, remove } = useShop.getState();
  function fixCart() {
    for (const x of shortages) {
      if (x.con > 0) setQty(x.id, x.con);
      else remove(x.id);
    }
    setShortages([]);
    setServerError("Đã sửa giỏ theo số còn lại. Kiểm tra lại đơn rồi bấm Đặt hàng.");
  }
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    shouldFocusError: false,
    defaultValues: {
      name: defaults.name,
      phone: defaults.phone,
      delivery: "giao",
      province: "",
      ward: "",
      street: "",
      note: "",
      payment: "cod",
      saveAddress: true,
    },
  });
  const delivery = useWatch({ control, name: "delivery" });
  const payment = useWatch({ control, name: "payment" });
  const subtotal = cart.reduce((n, x) => n + x.price * x.qty, 0);
  const unpriced = cart.filter((x) => !x.price).length;

  const onSubmit = handleSubmit(
    (v, e) => {
      const form = e?.target instanceof HTMLFormElement ? e.target : null;
      setServerError("");
      setShortages([]);
      startTransition(async () => {
        let r: Awaited<ReturnType<typeof placeOrder>>;
        try {
          r = await placeOrder(
            v,
            cart.map((x) => ({ id: x.id, qty: x.qty })),
            subtotal,
          );
        } catch {
          // Mất mạng hoặc server từ chối: giữ form và giỏ, không để cả trang thành trang lỗi
          setServerError("Chưa gửi được đơn. Kiểm tra mạng rồi bấm Đặt hàng lại.");
          return;
        }
        if (r.ok) {
          const done = r;
          // Hiện màn hình "Đã nhận đơn" trước rồi mới bỏ món khỏi giỏ (không thoáng hiện "Giỏ hàng đang trống").
          // Chỉ bỏ những món đã vào đơn; món hết hàng vẫn ở lại giỏ.
          flushSync(() =>
            onPlaced({
              id: done.orderId,
              name: v.name,
              phone: v.phone,
              delivery: v.delivery,
              total: done.total,
              priceChanged: done.priceChanged,
            }),
          );
          removeOrdered(done.acceptedIds);
          window.scrollTo(0, 0);
          return;
        }
        setServerError(r.message);
        setShortages(r.shortages ?? []);
        if (r.fieldErrors) {
          for (const [k, msg] of Object.entries(r.fieldErrors)) setError(k as keyof CheckoutInput, { message: msg });
          focusErrors(form, Object.keys(r.fieldErrors).length);
        }
      });
    },
    (errs, e) => focusErrors(e, Object.keys(errs).length),
  );

  return (
    <form id="tf-checkout" className="tf-checkout" noValidate onSubmit={onSubmit}>
      <div className="tf-checkout-main">
        <ErrorSummary
          id="tt-loi"
          errors={[
            ["name", errors.name?.message],
            ["phone", errors.phone?.message],
            ["province", errors.province?.message],
            ["ward", errors.ward?.message],
            ["street", errors.street?.message],
          ]}
          ids={FIELD_IDS}
        />
        {serverError ? (
          <p className="tf-field-error" role="alert">
            {serverError}
          </p>
        ) : null}
        {shortages.length ? (
          <Button onClick={fixCart}>Sửa giỏ theo số còn lại</Button>
        ) : null}
        <section className="tf-acc-card tf-checkout-step">
          <h2>
            <span className="tf-step-no">1</span>Người nhận
          </h2>
          <div className="tf-form-grid">
            <Field id={FIELD_IDS.name} label="Họ và tên" autoComplete="name" error={errors.name?.message} {...register("name")} />
            <Field
              id={FIELD_IDS.phone}
              label="Số điện thoại"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              hint="Để gọi xác nhận đơn."
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>
        </section>
        <section className="tf-acc-card tf-checkout-step">
          <h2>
            <span className="tf-step-no">2</span>Cách nhận hàng
          </h2>
          <ChoiceGroup
            legend="Chọn cách nhận hàng"
            name="giao-hang"
            items={DELIVERY}
            value={delivery}
            onChange={(k) => setValue("delivery", k as CheckoutInput["delivery"])}
          />
          {delivery === "giao" ? (
            <div className="tf-form-grid">
              <SelectField
                id={FIELD_IDS.province}
                label="Tỉnh, thành phố"
                autoComplete="address-level1"
                placeholder="Chọn tỉnh, thành phố"
                options={PROVINCES}
                error={errors.province?.message}
                {...register("province")}
              />
              <Field
                id={FIELD_IDS.ward}
                label="Phường, xã"
                autoComplete="address-level2"
                error={errors.ward?.message}
                {...register("ward")}
              />
              <div className="tf-form-wide">
                <Field
                  id={FIELD_IDS.street}
                  label="Số nhà, tên đường"
                  autoComplete="street-address"
                  hint="Ví dụ: 25 Lê Lợi. Ở nông thôn ghi thôn, ấp."
                  error={errors.street?.message}
                  {...register("street")}
                />
              </div>
              <label className="tf-check tf-form-wide">
                <input type="checkbox" {...register("saveAddress")} />
                Lưu địa chỉ này cho lần sau
              </label>
            </div>
          ) : null}
          <div className="tf-field">
            <label htmlFor="tt-ghichu">
              Ghi chú<span className="tf-field-opt"> (không bắt buộc)</span>
            </label>
            <textarea
              id="tt-ghichu"
              rows={2}
              placeholder="Giờ nhận hàng, chỉ đường, xuất hóa đơn…"
              {...register("note")}
            />
          </div>
        </section>
        <section className="tf-acc-card tf-checkout-step">
          <h2>
            <span className="tf-step-no">3</span>Thanh toán
          </h2>
          <ChoiceGroup
            legend="Chọn cách thanh toán"
            name="thanh-toan"
            items={PAYMENT}
            value={payment}
            onChange={(k) => setValue("payment", k as CheckoutInput["payment"])}
          />
        </section>
      </div>
      <aside className="tf-cart-sum tf-checkout-sum">
        <h2 className="heading">Đơn hàng</h2>
        <OrderLines items={cart} />
        <OrderTotals subtotal={subtotal} delivery={delivery} />
        {unpriced ? (
          <p className="tf-cat-note">{unpriced} sản phẩm chưa có giá, showroom báo giá khi gọi xác nhận.</p>
        ) : null}
        <Button variant="primary" block type="submit" disabled={pending}>
          {pending ? "Đang gửi đơn…" : "Đặt hàng"}
        </Button>
        <p className="tf-cat-note">Giá được tính lại theo giá hiện tại khi gửi đơn.</p>
      </aside>
    </form>
  );
}
