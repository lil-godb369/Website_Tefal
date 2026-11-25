import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Không tìm thấy trang", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="tf-empty" style={{ paddingTop: "var(--space-16)" }}>
      <h1 className="tf-section-title">Không tìm thấy trang</h1>
      <p>Đường dẫn có thể đã cũ. Tìm theo mã model hoặc chọn một danh mục.</p>
      <Button href={routes.all}>Xem tất cả đồ bếp</Button>
    </div>
  );
}
