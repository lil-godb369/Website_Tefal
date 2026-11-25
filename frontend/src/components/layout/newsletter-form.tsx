"use client";

import { toast } from "@/lib/toast";

/** Ô nhận tin. TODO: lưu vào bảng newsletter_subscribers khi có Supabase. */
export function NewsletterForm() {
  return (
    <form
      className="tf-subscribe"
      onSubmit={(e) => {
        e.preventDefault();
        toast("Chưa lưu đăng ký nhận tin: web chưa nối cơ sở dữ liệu.");
      }}
    >
      <label className="tf-sr" htmlFor="tf-sub-email">
        Email của bạn
      </label>
      <input id="tf-sub-email" type="email" required placeholder="Email của bạn" autoComplete="email" />
      <button type="submit">Đăng ký</button>
    </form>
  );
}
