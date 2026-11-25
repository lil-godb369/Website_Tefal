import type { ArtKind } from "@/types/product";

/* Hình vẽ nét thay ảnh khi ảnh lỗi. e = ellipse, r = rect, c = circle. */
type Part =
  | string
  | { e: [number, number, number, number] }
  | { r: [number, number, number, number] }
  | { c: [number, number, number] };

const ART: Record<ArtKind, Part[]> = {
  pan: [
    "M15 80 Q17 114 85 116 Q153 114 155 80",
    "M153 76 L194 61 Q199 60 198 66 L157 83",
    { e: [85, 80, 70, 26] },
    { e: [85, 80, 60, 20] },
  ],
  cooker: [
    "M38 72 Q38 142 100 142 Q162 142 162 72",
    "M34 72 Q100 26 166 72 Z",
    { r: [88, 38, 24, 9] },
    { r: [82, 96, 36, 16] },
    "M38 72 L162 72",
  ],
  blender: [
    "M76 116 L68 32 L132 32 L124 116 Z",
    { r: [66, 22, 68, 10] },
    { r: [70, 116, 60, 30] },
    { c: [100, 131, 6] },
    "M88 92 L112 84",
  ],
  fryer: [
    "M50 40 Q50 30 60 30 L140 30 Q150 30 150 40 L153 142 L47 142 Z",
    "M49 94 L151 94",
    { r: [84, 108, 32, 10] },
    { c: [100, 60, 13] },
  ],
  knife: [{ r: [18, 80, 56, 15] }, "M74 80 L168 80 Q184 82 188 95 L74 95", { c: [32, 87.5, 2] }, { c: [58, 87.5, 2] }],
  set: [
    { e: [72, 56, 42, 11] },
    "M30 56 L35 122 Q72 134 109 122 L114 56",
    "M66 45 L78 45",
    "M114 66 L136 62",
    { e: [140, 112, 46, 14] },
    "M94 112 Q96 134 140 135 Q184 134 186 112",
  ],
};

export function ProductArt({ kind }: { kind?: ArtKind }) {
  const parts = ART[kind ?? "pan"] ?? ART.pan;
  return (
    <svg className="tf-art" viewBox="0 0 200 160" aria-hidden="true" focusable="false">
      {parts.map((d, i) => {
        if (typeof d === "string") return <path key={i} d={d} />;
        if ("e" in d) return <ellipse key={i} cx={d.e[0]} cy={d.e[1]} rx={d.e[2]} ry={d.e[3]} />;
        if ("r" in d) return <rect key={i} x={d.r[0]} y={d.r[1]} width={d.r[2]} height={d.r[3]} rx={3} />;
        return <circle key={i} cx={d.c[0]} cy={d.c[1]} r={d.c[2]} />;
      })}
    </svg>
  );
}
