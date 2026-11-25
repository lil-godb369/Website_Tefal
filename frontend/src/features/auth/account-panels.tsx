"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useShop, useShopHydrated } from "@/features/cart/shop-store";
import { vnd } from "@/lib/format";
import { routes } from "@/lib/routes";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button
      onClick={async () => {
        const res = await getBrowserSupabase()?.auth.signOut();
        // Lỗi mạng: phiên chưa xóa, đừng báo đã đăng xuất. Giỏ của tài khoản xóa khỏi máy khi có SIGNED_OUT (switchOwner).
        if (res?.error) return toast("Chưa đăng xuất được. Kiểm tra mạng rồi thử lại.");
        toast("Đã đăng xuất.");
        router.replace(routes.home);
        router.refresh();
      }}
    >
      <Icon name="logout" size={16} />
      Đăng xuất
    </Button>
  );
}

/** Yêu thích và giỏ hàng (lưu trong trình duyệt theo tài khoản) */
export function AccountLists() {
  const ready = useShopHydrated();
  const wish = useShop((s) => s.wish);
  const count = useShop((s) => s.cart.reduce((n, x) => n + x.qty, 0));
  if (!ready) return null;
  return (
    <>
      <section className="tf-acc-card">
        <h2>Yêu thích</h2>
        {wish.length ? (
          <ul className="tf-acc-orders">
            {wish.map((x) => (
              <li key={x.id}>
                <Link className="tf-link" href={x.href}>
                  {x.name}
                </Link>
                <span>{x.price > 0 ? vnd(x.price) : "Gọi để báo giá"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có. Rê chuột vào thẻ sản phẩm rồi bấm hình trái tim.</p>
        )}
      </section>
      <section className="tf-acc-card">
        <h2>Giỏ hàng</h2>
        <p>{count ? `${count} sản phẩm đang chờ đặt.` : "Giỏ hàng đang trống."}</p>
        <Button href={count ? routes.cart : routes.all}>{count ? "Xem giỏ hàng" : "Xem đồ bếp"}</Button>
      </section>
    </>
  );
}
