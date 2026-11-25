"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Next không tự chuyển focus khi đổi trang phía trình duyệt: focus rơi về body, người dùng bàn phím
 *  và trình đọc màn hình phải đi lại từ đầu. Đổi đường dẫn (không tính ?query, không tính lần tải đầu)
 *  thì đưa focus vào tiêu đề h1 của trang, không có thì vào vùng nội dung chính. */
export function RouteFocus() {
  const pathname = usePathname();
  // So với đường dẫn lần trước (không dùng cờ "lần đầu": StrictMode chạy effect 2 lần làm cờ sai)
  const last = useRef(pathname);
  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    // Chờ trang mới vẽ xong
    const t = setTimeout(() => {
      const main = document.getElementById("noi-dung");
      // Next giữ trang cũ ẩn trong DOM (Activity): chỉ lấy h1 đang hiện
      const h1 = Array.from(main?.querySelectorAll<HTMLElement>("h1") ?? []).find((el) => el.checkVisibility());
      if (h1 && !h1.hasAttribute("tabindex")) h1.setAttribute("tabindex", "-1");
      (h1 ?? main)?.focus({ preventScroll: true });
    }, 50);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}
