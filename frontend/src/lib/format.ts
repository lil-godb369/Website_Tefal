const vndFormat = new Intl.NumberFormat("vi-VN");

/** 2679000 -> "2.679.000 ₫" (khoảng trắng không ngắt trước ký hiệu đồng) */
export function vnd(n: number): string {
  return vndFormat.format(Math.round(n)) + " ₫";
}

/** Phần trăm giảm so với giá gốc, 0 nếu không giảm */
export function offPercent(price: number, orig: number | null | undefined): number {
  return orig && orig > price && price > 0 ? Math.round((1 - price / orig) * 100) : 0;
}

/** Tên gọi: chữ cuối của họ tên ("Nguyễn Văn An" -> "An") */
export function firstName(name: string): string {
  const w = (name || "").trim().split(/\s+/);
  return w[w.length - 1] || "";
}
