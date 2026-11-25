import { expect, test } from "@playwright/test";

/* Luồng mua hàng của khách (chưa đăng nhập): xem danh mục → thêm giỏ → sửa số lượng → bị mời đăng nhập khi đặt hàng.
   Chạy: npm run test:e2e (lần đầu cần: npx playwright install chromium) */

test("khách thêm giỏ, sửa số lượng, bị mời đăng nhập khi đặt hàng", async ({ page }) => {
  await page.goto("/danh-muc/noi-com-dien");
  await expect(page.getByRole("heading", { level: 1, name: "Nồi cơm điện" })).toBeVisible();

  const card = page.locator(".tf-card").first();
  const name = (await card.locator(".tf-card-name").textContent())!.trim();
  await card.hover();
  await card.getByRole("button", { name: `Thêm vào giỏ: ${name}` }).click();
  await expect(page.locator(".tf-toast")).toContainText("Đã thêm vào giỏ");

  await page.goto("/gio-hang");
  await expect(page.getByRole("link", { name })).toBeVisible();
  await page.getByRole("button", { name: "Thêm một" }).click();
  await expect(page.locator(".tf-qty output")).toHaveText("2");

  await page.getByRole("link", { name: /Đăng nhập để đặt hàng/ }).click();
  await expect(page).toHaveURL(/\/dang-nhap\?tiep=%2Fthanh-toan/);
});

test("tìm theo mã model không dấu", async ({ page }) => {
  await page.goto("/tim-kiem?q=noi chien");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("noi chien");
  await expect(page.locator(".tf-card").first()).toBeVisible();
});

test("phân trang danh mục: mỗi trang 24 mẫu, có canonical riêng", async ({ page }) => {
  await page.goto("/danh-muc/noi-chao");
  await expect(page.locator(".tf-card")).toHaveCount(24);
  await page.getByRole("navigation", { name: "Phân trang" }).getByRole("link", { name: "Trang sau" }).click();
  await expect(page).toHaveURL(/\?trang=2$/);
  await expect(page.locator('.tf-pager a[aria-current="page"]')).toHaveText("2");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/danh-muc\/noi-chao\?trang=2$/);
});

test("đường dẫn sai trả 404", async ({ page }) => {
  for (const path of ["/san-pham/khong-co-zz-999", "/danh-muc/khong-co", "/bai-viet/khong-co"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
  }
});
