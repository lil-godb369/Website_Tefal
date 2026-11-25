import { describe, expect, it } from "vitest";
import { offPercent, vnd } from "@/lib/format";
import { productIdFromSlug, routes, safeNext } from "@/lib/routes";
import { slugify } from "@/lib/utils";
import { checkoutSchema } from "@/features/checkout/schema";
import { mergeShop, switchOwner, useShop } from "@/features/cart/shop-store";

describe("định dạng", () => {
  it("tiền đồng có dấu chấm và ký hiệu ₫", () => {
    expect(vnd(2679000)).toBe("2.679.000 ₫");
  });
  it("phần trăm giảm", () => {
    expect(offPercent(900, 1000)).toBe(10);
    expect(offPercent(1000, null)).toBe(0);
    expect(offPercent(0, 1000)).toBe(0);
  });
});

describe("đường dẫn", () => {
  it("slug bỏ dấu tiếng Việt", () => {
    expect(slugify("Nồi cơm điện tử 1.8L")).toBe("noi-com-dien-tu-1-8l");
  });
  it("đường dẫn SP đi rồi về được mã SP", () => {
    const href = routes.product({ id: "DK-042", name: "Máy lọc nước BR653BY0" });
    expect(href).toBe("/san-pham/may-loc-nuoc-br653by0-dk-042");
    expect(productIdFromSlug(href.split("/").pop()!)).toBe("DK-042");
  });
  it("chỉ chuyển về trang trong web", () => {
    expect(safeNext("/thanh-toan")).toBe("/thanh-toan");
    expect(safeNext("https://trang-la.com")).toBe("/");
    expect(safeNext("//trang-la.com")).toBe("/");
    expect(safeNext("/\\trang-la.com")).toBe("/");
    expect(safeNext("/\t/trang-la.com")).toBe("/");
    expect(safeNext("/thanh-toan?a=1#b")).toBe("/thanh-toan?a=1#b");
  });
});

describe("thanh toán", () => {
  const base = {
    name: "Nguyễn An",
    phone: "090 123 4567",
    delivery: "giao" as const,
    province: "Hà Nội",
    ward: "Phường Ba Đình",
    street: "25 Lê Lợi",
    note: "",
    payment: "cod" as const,
    saveAddress: true,
  };
  it("nhận số điện thoại có khoảng trắng", () => {
    const r = checkoutSchema.safeParse(base);
    expect(r.success && r.data.phone).toBe("0901234567");
  });
  it("giao tận nơi thì bắt địa chỉ, nhận tại showroom thì không", () => {
    const missing = { ...base, province: "", ward: "", street: "" };
    expect(checkoutSchema.safeParse(missing).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...missing, delivery: "showroom" }).success).toBe(true);
  });
  it("không cho chọn thanh toán online (chưa mở)", () => {
    expect(checkoutSchema.safeParse({ ...base, payment: "online" }).success).toBe(false);
  });
});

describe("gộp giỏ của khách vào tài khoản", () => {
  const item = (id: string) => ({
    id,
    name: id,
    model: id,
    href: "/",
    price: 100,
    orig: null,
    img: "",
    art: "pan" as const,
    origin: null,
  });
  it("tải lại trang không làm mất giỏ của khách", async () => {
    sessionStorage.setItem(
      "tefal-web:shop:khach",
      JSON.stringify({ state: { cart: [{ ...item("A-1"), qty: 1 }], wish: [], compare: [] }, version: 0 }),
    );
    // lần nạp đầu của trang: đặt lại state rồi đọc chỗ lưu, không được ghi đè chỗ lưu bằng giỏ rỗng
    await switchOwner(null);
    expect(useShop.getState().cart).toMatchObject([{ id: "A-1", qty: 1 }]);
    expect(sessionStorage.getItem("tefal-web:shop:khach")).toContain("A-1");
  });

  it("đăng nhập thì giỏ của khách chuyển vào tài khoản, đăng xuất thì khách thấy giỏ rỗng", async () => {
    await switchOwner(null);
    useShop.setState({ cart: [], wish: [], compare: [] });
    useShop.getState().add(item("B-9"));
    await switchOwner("user-1");
    expect(useShop.getState().cart.map((x) => x.id)).toContain("B-9");
    expect(sessionStorage.getItem("tefal-web:shop:khach")).toBeNull();
    await switchOwner(null);
    expect(useShop.getState().cart).toEqual([]);
  });

  it("cộng số lượng, không trùng yêu thích, so sánh tối đa 4", () => {
    const into = { cart: [{ ...item("A-1"), qty: 2 }], wish: [item("A-1")], compare: [item("A-1"), item("A-2"), item("A-3")] };
    const from = { cart: [{ ...item("A-1"), qty: 1 }, { ...item("B-1"), qty: 1 }], wish: [item("A-1"), item("B-1")], compare: [item("B-1"), item("B-2")] };
    const m = mergeShop(into, from);
    expect(m.cart.map((x) => [x.id, x.qty])).toEqual([["A-1", 3], ["B-1", 1]]);
    expect(m.wish.map((x) => x.id)).toEqual(["A-1", "B-1"]);
    expect(m.compare).toHaveLength(4);
  });
});
