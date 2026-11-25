import { z } from "zod";

/** Bỏ khoảng trắng, chấm, gạch: "090 123.4567" -> "0901234567" */
export function cleanPhone(v: string): string {
  return (v || "").replace(/[\s.\-]/g, "");
}

export const PHONE_RE = /^(0|\+84)\d{9}$/;
const PHONE_MSG = "Số điện thoại gồm 10 số, bắt đầu bằng 0.";
const EMAIL_MSG = "Nhập email đúng dạng, ví dụ ten@gmail.com.";

export const phoneSchema = z
  .string()
  .transform(cleanPhone)
  .refine((v) => PHONE_RE.test(v), PHONE_MSG);

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email(EMAIL_MSG)),
  password: z.string().min(1, "Nhập mật khẩu."),
});
export type SignInInput = z.input<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Nhập họ tên để chúng tôi xưng hô và giao hàng."),
    email: z.string().trim().toLowerCase().pipe(z.email(EMAIL_MSG)),
    phone: z
      .string()
      .transform(cleanPhone)
      .refine((v) => !v || PHONE_RE.test(v), PHONE_MSG),
    password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự."),
    password2: z.string(),
  })
  .refine((v) => v.password.length < 8 || v.password2 === v.password, {
    path: ["password2"],
    message: "Hai mật khẩu chưa khớp.",
  });
export type SignUpInput = z.input<typeof signUpSchema>;
