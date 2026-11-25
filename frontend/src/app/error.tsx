"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="tf-empty" style={{ paddingTop: "var(--space-16)" }}>
      <h1 className="tf-section-title">Trang gặp lỗi</h1>
      <p>Thử tải lại. Nếu vẫn lỗi, quay về trang chủ và chọn lại sản phẩm.</p>
      <div className="tf-hero-actions">
        <Button variant="primary" onClick={reset}>
          Tải lại
        </Button>
        <Button href={routes.home}>Về trang chủ</Button>
      </div>
    </div>
  );
}
