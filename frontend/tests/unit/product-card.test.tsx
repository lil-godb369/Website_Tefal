import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useShop } from "@/features/cart/shop-store";
import { ProductCard } from "@/features/product/product-card";
import type { ProductSummary } from "@/types/product";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const p: ProductSummary = {
  id: "DK-042",
  name: "Máy lọc nước BR653BY0",
  model: "BR653BY0",
  href: "/san-pham/may-loc-nuoc-br653by0-dk-042",
  groupName: "Máy lọc nước",
  art: "blender",
  price: 15552000,
  orig: 17010000,
  img: "",
  fig: { v: "5", u: "L", l: "Dung tích" },
  stock: true,
  w: 36,
  origin: "Trung Quốc",
  power: "2.200",
  quickSpecs: [],
};

describe("ProductCard", () => {
  beforeEach(() => useShop.setState({ cart: [], wish: [], compare: [] }));

  it("hiện tên, con số, giá và mức tiết kiệm", () => {
    render(<ProductCard product={p} />);
    expect(screen.getByRole("heading", { name: p.name })).toBeInTheDocument();
    expect(screen.getByText("5 L")).toBeInTheDocument();
    expect(screen.getByText(/15\.552\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Tiết kiệm 1\.458\.000/)).toBeInTheDocument();
  });

  it("nút thêm vào giỏ cộng dồn số lượng", async () => {
    render(<ProductCard product={p} />);
    const add = screen.getByRole("button", { name: `Thêm vào giỏ: ${p.name}` });
    await userEvent.click(add);
    await userEvent.click(add);
    expect(useShop.getState().cart).toMatchObject([{ id: "DK-042", qty: 2 }]);
  });

  it("nút yêu thích bật tắt và báo trạng thái", async () => {
    render(<ProductCard product={p} />);
    const wish = screen.getByRole("button", { name: `Yêu thích: ${p.name}` });
    expect(wish).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(wish);
    expect(wish).toHaveAttribute("aria-pressed", "true");
  });
});
