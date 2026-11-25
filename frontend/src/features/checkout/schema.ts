import { z } from "zod";
import type { Shortage } from "./stock";
import { phoneSchema } from "@/features/auth/schema";
import { PROVINCES } from "./options";

/* Một schema dùng cho cả form (trình duyệt) và Server Action (server kiểm tra lại). */

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(2, "Nhập họ tên người nhận."),
    phone: phoneSchema,
    delivery: z.enum(["giao", "showroom"]),
    province: z.string(),
    ward: z.string().trim(),
    street: z.string().trim(),
    note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự."),
    // "online" chưa mở
    payment: z.enum(["cod", "chuyen-khoan"]),
    saveAddress: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.delivery !== "giao") return;
    if (!PROVINCES.includes(v.province))
      ctx.addIssue({ code: "custom", path: ["province"], message: "Chọn tỉnh hoặc thành phố." });
    if (v.ward.length < 2) ctx.addIssue({ code: "custom", path: ["ward"], message: "Nhập phường hoặc xã." });
    if (v.street.length < 3)
      ctx.addIssue({ code: "custom", path: ["street"], message: "Nhập số nhà, tên đường hoặc thôn, ấp." });
  });

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;

export const orderItemsSchema = z
  .array(z.object({ id: z.string().regex(/^[A-Z]+-\d+$/), qty: z.number().int().min(1).max(99) }))
  .min(1, "Giỏ hàng đang trống.")
  .max(50);

export type PlaceOrderResult =
  | { ok: true; orderId: string; total: number; priceChanged: boolean; acceptedIds: string[] }
  | { ok: false; message: string; fieldErrors?: Record<string, string>; shortages?: Shortage[] };
