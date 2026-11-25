import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui/section";
import { AccountLists, SignOutButton } from "@/features/auth/account-panels";
import { firstName } from "@/lib/format";
import { routes } from "@/lib/routes";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Tài khoản", robots: { index: false } };

export default function AccountPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", href: routes.home }, { label: "Tài khoản" }]} />
      <Suspense fallback={<p className="tf-cat-note">Đang tải tài khoản…</p>}>
        <Account />
      </Suspense>
    </>
  );
}

async function Account() {
  // Kiểm tra ở server (getUser xác minh với Supabase Auth), không tin dữ liệu phía trình duyệt
  const user = await getCurrentUser();
  if (!user) redirect(routes.signIn(routes.account));
  const name = (user.user_metadata?.full_name as string | undefined) || user.email || "";
  const phone = user.user_metadata?.phone as string | undefined;
  const since = user.created_at ? user.created_at.slice(0, 10).split("-").reverse().join("/") : "—";

  return (
    <>
      <header className="tf-cat-head">
        <h1 className="tf-cat-title">Chào {firstName(name)}</h1>
        <SignOutButton />
      </header>
      <div className="tf-acc-grid">
        <section className="tf-acc-card">
          <h2>Thông tin</h2>
          <dl>
            <dt>Họ và tên</dt>
            <dd>{name}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Số điện thoại</dt>
            <dd>{phone || "Chưa có"}</dd>
            <dt>Tham gia</dt>
            <dd>{since}</dd>
          </dl>
        </section>
        <section className="tf-acc-card">
          <h2>Đơn hàng</h2>
          {/* TODO: đọc bảng orders (RLS: chỉ thấy đơn của mình) */}
          <p>Bạn chưa có đơn hàng nào.</p>
        </section>
        <section className="tf-acc-card">
          <h2>Địa chỉ giao hàng</h2>
          <p>Chưa có. Địa chỉ sẽ được lưu khi bạn đặt hàng.</p>
        </section>
        <AccountLists />
      </div>
    </>
  );
}
