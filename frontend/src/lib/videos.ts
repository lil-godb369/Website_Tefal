/* Video giới thiệu SP, dựng từ ảnh và thông số bằng dự án ../video (Remotion).
   File nằm ở public/video/<mã>.mp4 (720p) và <mã>.jpg (ảnh bìa), sinh bởi `npm run render:all` trong ../video.
   Thêm SP: thêm mục trong ../video/src/data.ts, xuất lại, rồi thêm một dòng ở đây. */

export interface ProductVideo {
  src: string;
  poster: string;
  /** độ dài, giây */
  seconds: number;
  /** ngày dựng (yyyy-mm-dd), cho dữ liệu cấu trúc VideoObject */
  made: string;
}

const make = (id: string, seconds: number): ProductVideo => ({
  src: `/video/${id}.mp4`,
  poster: `/video/${id}.jpg`,
  seconds,
  made: "2026-10-23",
});

export const PRODUCT_VIDEOS: Record<string, ProductVideo> = {
  "DK-061": make("DK-061", 24.6),
  "DK-069": make("DK-069", 24.6),
  "DK-050": make("DK-050", 24.6),
};

export function getVideo(id: string): ProductVideo | null {
  return PRODUCT_VIDEOS[id] ?? null;
}

/** 24.6 → "PT25S" (ISO 8601, cho VideoObject) */
export function isoDuration(seconds: number): string {
  return `PT${Math.round(seconds)}S`;
}
