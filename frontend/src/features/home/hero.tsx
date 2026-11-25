import type { CSSProperties } from "react";
import { preload } from "react-dom";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/** Hero tràn hết chiều ngang, nền ảnh bếp, chữ bên trái */
export function Hero() {
  // Ảnh hero là ảnh nền CSS: báo trình duyệt tải sớm, không chờ đọc xong CSS (ảnh LCP của trang chủ)
  preload("/img/hero-bep.jpg", { as: "image", fetchPriority: "high" });
  return (
    <section className="tf-hero tf-hero-photo" style={{ "--hero-bg": 'url("/img/hero-bep.jpg")' } as CSSProperties}>
      <div>
        <p className="tf-hero-kicker">Nấu ngon, dọn nhanh, dùng bền</p>
        <h1 className="tf-hero-title">
          Đồ bếp Tefal <em>cho mỗi bữa cơm.</em>
        </h1>
        <p className="tf-hero-lead">
          Nồi chảo, nồi cơm điện, nồi chiên và máy xay chính hãng. Giá niêm yết rõ, thông số đầy đủ để so sánh trước
          khi mua.
        </p>
        <div className="tf-hero-actions">
          <Button variant="primary" href={routes.all}>
            Mua ngay
          </Button>
          <Button href="#danh-muc">Xem danh mục</Button>
        </div>
      </div>
    </section>
  );
}
