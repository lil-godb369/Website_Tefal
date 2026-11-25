"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ErrorSummary, focusErrors } from "@/components/ui/error-summary";
import { Field, GoogleButton, PasswordField } from "@/components/ui/form";
import { TrustBar } from "@/components/ui/section";
import { firstName } from "@/lib/format";
import { routes, safeNext } from "@/lib/routes";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { toast } from "@/lib/toast";
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from "./schema";

/* Đăng nhập / đăng ký bằng Supabase Auth (email + mật khẩu, Google).
   Chạy phía trình duyệt: phiên lưu ở cookie, ShopProvider nhận SIGNED_IN và gộp giỏ của khách vào tài khoản. */

type Mode = "in" | "up";

export function AuthCard({ mode }: { mode: Mode }) {
  const params = useSearchParams();
  const next = safeNext(params.get("tiep"), routes.account);
  const fromCheckout = next.startsWith(routes.checkout);

  async function google() {
    const supabase = getBrowserSupabase();
    if (!supabase) return toast("Chưa nối Supabase: chưa đăng nhập Google được.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?tiep=${encodeURIComponent(next)}` },
    });
    if (error) toast("Chưa đăng nhập Google được: " + error.message);
  }

  return (
    <div className="tf-auth">
      <div className="tf-auth-card">
        <h1 className="tf-auth-title">{mode === "up" ? "Tạo tài khoản" : "Đăng nhập"}</h1>
        <p className="tf-auth-lead">
          {mode === "up" ? "Lưu thông tin nhận hàng và theo dõi đơn của bạn." : "Chào mừng bạn quay lại."}
        </p>
        {isSupabaseConfigured ? null : (
          <p className="tf-field-error" role="alert">
            Web chưa nối Supabase (thiếu .env.local) nên chưa đăng nhập được. Giỏ hàng vẫn dùng được khi chưa đăng nhập.
          </p>
        )}
        {fromCheckout ? (
          <p className="tf-auth-why" role="status">
            Đăng nhập để đặt hàng. Giỏ hàng, yêu thích và so sánh bạn đã chọn sẽ được giữ lại.
          </p>
        ) : null}
        <div className="tf-auth-tabs" role="group" aria-label="Chọn đăng nhập hoặc đăng ký">
          <Link href={routes.signIn(next)} aria-current={mode === "in" ? "page" : undefined} replace>
            Đăng nhập
          </Link>
          <Link href={routes.signUp(next)} aria-current={mode === "up" ? "page" : undefined} replace>
            Đăng ký
          </Link>
        </div>
        <GoogleButton onClick={google}>{mode === "up" ? "Đăng ký với Google" : "Tiếp tục với Google"}</GoogleButton>
        <p className="tf-auth-or">
          <span>hoặc dùng email</span>
        </p>
        {mode === "up" ? <SignUpForm next={next} /> : <SignInForm next={next} />}
      </div>
      <aside className="tf-auth-aside">
        <h2>Có tài khoản để</h2>
        <TrustBar
          items={[
            { icon: "bag", title: "Đặt hàng nhanh", text: "Không phải nhập lại địa chỉ" },
            { icon: "award", title: "Theo dõi bảo hành", text: "Xem lại đơn và ngày mua" },
            { icon: "tag", title: "Nhận tin ưu đãi", text: "Khi có đợt giảm giá mới" },
          ]}
        />
      </aside>
    </div>
  );
}

function useDone(next: string) {
  const router = useRouter();
  return (msg: string) => {
    toast(msg);
    router.replace(next);
    router.refresh();
  };
}

function SignInForm({ next }: { next: string }) {
  const done = useDone(next);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema), shouldFocusError: false });

  const onSubmit = handleSubmit(
    async (v) => {
      setServerError("");
      const supabase = getBrowserSupabase();
      if (!supabase) return setServerError("Web chưa nối Supabase nên chưa đăng nhập được.");
      const { data, error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
      // Không nói rõ email hay mật khẩu sai: tránh lộ email nào đã có tài khoản
      if (error) return setServerError("Email hoặc mật khẩu chưa đúng.");
      done("Đã đăng nhập. Chào " + firstName(data.user.user_metadata?.full_name || "") + ".");
    },
    (errs, e) => focusErrors(e, Object.keys(errs).length),
  );

  return (
    <form className="tf-auth-form" noValidate onSubmit={onSubmit}>
      <ErrorSummary
        id="dn-loi"
        errors={[
          ["email", errors.email?.message],
          ["password", errors.password?.message],
        ]}
        ids={{ email: "dn-email", password: "dn-matkhau" }}
      />
      {serverError ? (
        <p className="tf-field-error" role="alert">
          {serverError}
        </p>
      ) : null}
      <Field
        id="dn-email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        id="dn-matkhau"
        label="Mật khẩu"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <div className="tf-auth-row">
        {/* TODO: trang đặt lại mật khẩu (supabase.auth.resetPasswordForEmail) */}
        <button type="button" className="tf-auth-text" onClick={() => toast("Lấy lại mật khẩu: sẽ làm sau.")}>
          Quên mật khẩu?
        </button>
      </div>
      <Button variant="primary" block type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </form>
  );
}

function SignUpForm({ next }: { next: string }) {
  const done = useDone(next);
  const [serverError, setServerError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema), shouldFocusError: false });

  const onSubmit = handleSubmit(
    async (raw) => {
      setServerError("");
      const v = signUpSchema.parse(raw);
      const supabase = getBrowserSupabase();
      if (!supabase) return setServerError("Web chưa nối Supabase nên chưa tạo tài khoản được.");
      const { data, error } = await supabase.auth.signUp({
        email: v.email,
        password: v.password,
        options: {
          data: { full_name: v.name, phone: v.phone || null },
          emailRedirectTo: `${location.origin}/auth/callback?tiep=${encodeURIComponent(next)}`,
        },
      });
      // Không in thẳng lỗi của Supabase ("User already registered"): tránh lộ email nào đã có tài khoản
      if (error) {
        return setServerError(
          error.code === "weak_password"
            ? "Mật khẩu quá dễ đoán. Chọn mật khẩu khác, ít nhất 8 ký tự."
            : "Chưa tạo được tài khoản. Nếu email này đã đăng ký, hãy chuyển sang Đăng nhập.",
        );
      }
      // Supabase bật xác nhận email thì chưa có phiên: báo kiểm tra hộp thư
      if (!data.session) return setSentTo(v.email);
      done("Đã tạo tài khoản. Chào " + firstName(v.name) + ".");
    },
    (errs, e) => focusErrors(e, Object.keys(errs).length),
  );

  if (sentTo) {
    return (
      // Form bị thay bằng đoạn này: đưa focus vào để trình đọc màn hình đọc và focus không rơi về body
      <p className="tf-auth-why" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
        Đã gửi thư xác nhận tới {sentTo}. Mở thư và bấm liên kết để hoàn tất đăng ký.
      </p>
    );
  }

  return (
    <form className="tf-auth-form" noValidate onSubmit={onSubmit}>
      <ErrorSummary
        id="dk-loi"
        errors={[
          ["name", errors.name?.message],
          ["email", errors.email?.message],
          ["phone", errors.phone?.message],
          ["password", errors.password?.message],
          ["password2", errors.password2?.message],
        ]}
        ids={{ name: "dk-ten", email: "dk-email", phone: "dk-sdt", password: "dk-matkhau", password2: "dk-matkhau2" }}
      />
      {serverError ? (
        <p className="tf-field-error" role="alert">
          {serverError}
        </p>
      ) : null}
      <Field id="dk-ten" label="Họ và tên" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <Field
        id="dk-email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        id="dk-sdt"
        label="Số điện thoại"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        optional
        hint="Để gọi xác nhận đơn và hẹn giờ giao."
        error={errors.phone?.message}
        {...register("phone")}
      />
      <PasswordField
        id="dk-matkhau"
        label="Mật khẩu"
        autoComplete="new-password"
        hint="Ít nhất 8 ký tự."
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        id="dk-matkhau2"
        label="Nhập lại mật khẩu"
        autoComplete="new-password"
        error={errors.password2?.message}
        {...register("password2")}
      />
      <Button variant="primary" block type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
      </Button>
    </form>
  );
}
