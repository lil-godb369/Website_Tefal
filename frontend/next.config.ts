import type { NextConfig } from "next";

// Header bảo mật cơ bản. CSP đầy đủ (nonce qua proxy.ts) làm khi chốt tên miền, nguồn ảnh và Supabase.
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" }, // chặn nhúng vào iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
