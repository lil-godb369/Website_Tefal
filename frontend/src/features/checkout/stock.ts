/* Lỗi không đủ hàng từ place_order (mã P0409): chi tiết là JSON [{id, ten, con, dat}].
   Tách khỏi Server Action để kiểm thử được. */

export interface Shortage {
  id: string;
  /** tên SP (null khi mã không còn trong DB) */
  ten: string | null;
  /** số còn bán */
  con: number;
  /** số khách đặt */
  dat: number;
}

/** Đọc chi tiết lỗi P0409; sai định dạng thì trả mảng rỗng */
export function parseShortages(details: unknown): Shortage[] {
  if (typeof details !== "string") return [];
  try {
    const list: unknown = JSON.parse(details);
    if (!Array.isArray(list)) return [];
    return list
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((x) => ({
        id: String(x.id ?? ""),
        ten: typeof x.ten === "string" ? x.ten : null,
        con: Math.max(0, Number(x.con) || 0),
        dat: Math.max(0, Number(x.dat) || 0),
      }))
      .filter((x) => x.id);
  } catch {
    return [];
  }
}

/** "Nồi A: chỉ còn 1, bạn đặt 2. Nồi B: đã hết hàng." */
export function shortageMessage(list: Shortage[]): string {
  if (!list.length) return "Có sản phẩm trong giỏ không đủ hàng. Kiểm tra lại giỏ rồi đặt lại.";
  const lines = list.map((x) => {
    const name = x.ten ?? `Mã ${x.id}`;
    return x.con > 0 ? `${name}: chỉ còn ${x.con}, bạn đặt ${x.dat}.` : `${name}: đã hết hàng.`;
  });
  return `Không đủ hàng, đơn chưa được tạo. ${lines.join(" ")} Sửa số lượng hoặc bỏ món đó khỏi giỏ rồi đặt lại.`;
}
