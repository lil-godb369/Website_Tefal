import Link from "next/link";
import type { ProductVideo } from "@/lib/videos";

/* Video giới thiệu SP: không tự chạy, chỉ tải khi khách bấm phát (preload="none"), có ảnh bìa.
   Video không có tiếng; mọi chữ trên video (con số, công nghệ, thông số, giá) đều có sẵn dạng chữ trên trang SP,
   nên phần chú thích nói rõ điều đó cho người dùng trình đọc màn hình. */
export function ProductVideoPlayer({
  video,
  name,
  href,
}: {
  video: ProductVideo;
  name: string;
  /** có thì hiện tên SP dạng liên kết dưới video (dùng ở trang chủ) */
  href?: string;
}) {
  return (
    <figure className="tf-video">
      <video
        controls
        preload="none"
        playsInline
        poster={video.poster}
        width={1280}
        height={720}
        aria-label={`Video giới thiệu ${name}`}
      >
        <source src={video.src} type="video/mp4" />
      </video>
      <figcaption>
        {href ? (
          <Link className="tf-video-name" href={href}>
            {name}
          </Link>
        ) : null}
        <span className="tf-video-note">
          Video {Math.round(video.seconds)} giây, không có tiếng. Thông tin trong video có đủ ở trang sản phẩm.
        </span>
      </figcaption>
    </figure>
  );
}
