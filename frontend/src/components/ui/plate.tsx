"use client";

/* eslint-disable @next/next/no-img-element -- ảnh tạm cần cắt bằng CSS (PHOTO_CROP); đổi sang next/image khi có ảnh sạch */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PHOTO_CROP } from "@/lib/product";
import { cn } from "@/lib/utils";
import type { ArtKind } from "@/types/product";
import { ProductArt } from "./product-art";

/** Ảnh SP, cắt theo PHOTO_CROP nếu có. Khung cắt giữ tỉ lệ vùng cắt và nằm gọn trong khung chứa. */
export function Photo({
  src,
  alt = "",
  eager,
  className,
  onError,
  onLoad,
}: {
  src: string;
  alt?: string;
  eager?: boolean;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
}) {
  const c = PHOTO_CROP;
  const img = (
    <img
      src={src}
      alt={alt}
      // theo ảnh gốc 1200×1200 để giữ chỗ trước khi ảnh tải (giảm xô lệch bố cục)
      width={1200}
      height={1200}
      decoding="async"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      onError={onError}
      onLoad={onLoad}
      style={c ? { width: `${100 / c.w}%`, left: `${(-c.x / c.w) * 100}%`, top: `${(-c.y / c.h) * 100}%` } : undefined}
    />
  );
  if (!c) return img;
  return (
    <span className={cn("tf-crop", className)} style={{ aspectRatio: String(c.w / c.h) }}>
      {img}
    </span>
  );
}

// Ảnh lỗi, hoặc đã nằm trong màn hình 8 giây liền mà chưa tải xong: đổi sang hình vẽ nét
const PLATE_WAIT = 8000;

/** Khung ảnh nền xám của thẻ SP; ảnh lỗi thì hiện hình vẽ nét */
export function Plate({
  image,
  alt,
  art,
  tag,
  eager,
  className,
}: {
  image?: string;
  alt?: string;
  art?: ArtKind;
  tag?: ReactNode;
  eager?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const showImg = !!image && !failed;

  useEffect(() => {
    const el = ref.current;
    if (!showImg || loaded || !el) return;
    function settle() {
      const img = el?.querySelector("img");
      if (!img?.complete) return false;
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
      return true;
    }
    // Ảnh dựng sẵn từ server có thể tải xong (hoặc lỗi) trước khi React nạp: onLoad/onError không chạy
    queueMicrotask(settle);
    // Chỉ hẹn giờ khi khung đã vào màn hình (khung ẩn, ví dụ bảng chọn đang đóng, không tốn gì)
    if (typeof IntersectionObserver === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) {
        timer ??= setTimeout(() => {
          if (!settle()) setFailed(true);
        }, PLATE_WAIT);
      } else {
        clearTimeout(timer);
        timer = undefined;
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [showImg, loaded]);

  return (
    <div ref={ref} className={cn("tf-plate", className)}>
      {tag ? <span className="tf-plate-tag">{tag}</span> : null}
      {showImg ? (
        <Photo src={image} alt={alt} eager={eager} onError={() => setFailed(true)} onLoad={() => setLoaded(true)} />
      ) : (
        <ProductArt kind={art} />
      )}
    </div>
  );
}
