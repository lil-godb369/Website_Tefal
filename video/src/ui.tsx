import { loadFont } from "@remotion/google-fonts/BeVietnamPro";
import type { CSSProperties, ReactNode } from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Cùng font với web (Be Vietnam Pro), đủ dấu tiếng Việt
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "700", "800", "900"],
  subsets: ["latin", "vietnamese"],
});

export const RED = "#e30613";
export const INK = "#111111";
export const GRAY = "#f5f5f5";

/** Hiện dần + trượt lên, bắt đầu sau `delay` giây */
export function useRise(delay = 0, distance = 40) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay * fps, fps, config: { damping: 200 } });
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` } satisfies CSSProperties;
}

/** Phóng chậm cả cảnh (Ken Burns) */
export function useSlowZoom(from = 1, to = 1.08) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
}

/* Khối chữ có góc vuông đỏ ở trên-trái và dưới-phải, như video mẫu của Tefal.
   Góc vẽ ra theo `delay` giây rồi chữ hiện sau. */
export function Bracket({
  children,
  delay = 0,
  align = "left",
  size = 30,
  thickness = 6,
  pad = "28px 44px",
}: {
  children: ReactNode;
  delay?: number;
  align?: "left" | "center";
  size?: number;
  thickness?: number;
  pad?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay * fps, fps, config: { damping: 200 }, durationInFrames: 18 });
  const corner = (pos: CSSProperties, borders: CSSProperties) => (
    <span
      style={{
        position: "absolute",
        width: size * p,
        height: size * p,
        borderColor: RED,
        borderStyle: "solid",
        borderWidth: 0,
        ...borders,
        ...pos,
      }}
    />
  );
  return (
    <div style={{ position: "relative", padding: pad, textAlign: align, display: "inline-block" }}>
      {corner({ top: 0, left: 0 }, { borderTopWidth: thickness, borderLeftWidth: thickness })}
      {corner({ bottom: 0, right: 0 }, { borderBottomWidth: thickness, borderRightWidth: thickness })}
      {children}
    </div>
  );
}

/** Ảnh SP nền trắng: hòa vào nền của cảnh bằng multiply để không lộ khung trắng.
 *  Khung bọc tự mang màu nền và isolation: chuyển cảnh bọc mỗi cảnh trong lớp riêng (trong suốt),
 *  nếu không ảnh sẽ hòa với lớp trong suốt đó và vẫn lộ nền trắng. */
export function ProductShot({ src, bg, style }: { src: string; bg: string; style?: CSSProperties }) {
  return (
    <div style={{ background: bg, isolation: "isolate", lineHeight: 0, ...style }}>
      <Img src={staticFile(src)} style={{ mixBlendMode: "multiply", objectFit: "contain", height: "100%" }} />
    </div>
  );
}

export const caps: CSSProperties = { textTransform: "uppercase", letterSpacing: "0.01em" };
