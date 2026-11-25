"use server";

import { checkoutSchema, orderItemsSchema, type PlaceOrderResult } from "@/features/checkout/schema";
import { parseShortages, shortageMessage } from "@/features/checkout/stock";
import { getProductsByIds } from "@/lib/queries/products";
import { getServerSupabase } from "@/lib/supabase/server";

/** Đặt hàng. Không tin gì từ trình duyệt: kiểm tra lại form, bắt đăng nhập, giá lấy từ dữ liệu server.
 *  Ghi đơn qua hàm place_order trong Postgres (supabase/migrations): hàm tự tra giá trong bảng products. */
export async function placeOrder(form: unknown, items: unknown, shownTotal: unknown): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(form);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Thông tin chưa đúng, kiểm tra lại các ô báo lỗi.", fieldErrors };
  }
  const lines = orderItemsSchema.safeParse(items);
  if (!lines.success) return { ok: false, message: "Giỏ hàng không hợp lệ hoặc đang trống." };

  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, message: "Web chưa nối Supabase nên chưa nhận đơn được. Giỏ hàng vẫn giữ nguyên." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Phiên đăng nhập đã hết. Đăng nhập lại để đặt hàng." };

  // Bỏ mã SP không còn bán (DB còn lọc thêm hàng hết và tự tính giá)
  const products = await getProductsByIds(lines.data.map((x) => x.id));
  const known = lines.data.filter((x) => products.some((p) => p.id === x.id));
  if (!known.length) return { ok: false, message: "Các sản phẩm trong giỏ không còn bán." };
  const cartTotal = typeof shownTotal === "number" ? shownTotal : -1;

  const v = parsed.data;
  const { data, error } = await supabase.rpc("place_order", {
    p_items: known,
    p_name: v.name,
    p_phone: v.phone,
    p_delivery: v.delivery,
    p_address: v.delivery === "giao" ? { province: v.province, ward: v.ward, street: v.street } : null,
    p_payment: v.payment,
    p_note: v.note,
    p_save_address: v.saveAddress,
  });
  if (error?.code === "P0429") {
    return { ok: false, message: "Bạn vừa gửi nhiều đơn. Chờ showroom gọi xác nhận, hoặc thử lại sau 30 phút." };
  }
  // Không đủ hàng (người khác vừa đặt mất, hoặc đặt nhiều hơn số còn): cả đơn không tạo, báo rõ từng món
  if (error?.code === "P0409") {
    const shortages = parseShortages(error.details);
    return { ok: false, message: shortageMessage(shortages), shortages };
  }
  const order = data as { id?: unknown; subtotal?: unknown; items?: unknown } | null;
  if (error || typeof order?.id !== "string" || typeof order.subtotal !== "number") {
    console.error("place_order", error);
    return { ok: false, message: "Chưa ghi được đơn. Thử lại sau ít phút, giỏ hàng vẫn giữ nguyên." };
  }
  // Tổng tiền lấy từ DB (giá hiện tại). Khác tạm tính trong giỏ thì báo khách.
  const acceptedIds = Array.isArray(order.items) ? order.items.filter((x): x is string => typeof x === "string") : [];
  return {
    ok: true,
    orderId: order.id,
    total: order.subtotal,
    // Khác tạm tính trong giỏ, hoặc có mã SP không còn bán bị bỏ trước khi gửi
    priceChanged: order.subtotal !== cartTotal || acceptedIds.length !== known.length,
    acceptedIds,
  };
}
