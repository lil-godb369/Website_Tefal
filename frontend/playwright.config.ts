import { defineConfig, devices } from "@playwright/test";

// Có sẵn server (vd dev server cổng 3100 của Claude): PLAYWRIGHT_BASE_URL=http://localhost:3100 npm run test:e2e
// Next 16 không cho chạy hai `next dev` trong cùng thư mục.
const external = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: external ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: external
    ? undefined
    : { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI },
});
