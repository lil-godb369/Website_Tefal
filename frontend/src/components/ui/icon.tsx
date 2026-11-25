/* Biểu tượng nét, vẽ theo bộ Lucide. Chuỗi = path, {c} = hình tròn [cx, cy, r]. */
type Part = string | { c: [number, number, number] };

const ICONS: Record<string, Part[]> = {
  search: [{ c: [11, 11, 7] }, "M16.5 16.5L21 21"],
  bag: ["M5 8h14l-1.2 13H6.2L5 8z", "M9 8V6.5a3 3 0 0 1 6 0V8"],
  menu: ["M4 7h16M4 12h16M4 17h16"],
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
  chevron: ["M6 9l6 6 6-6"],
  shield: ["M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z", "M9 12l2 2 4-4"],
  award: [{ c: [12, 9, 6] }, "M8.5 13.5L7 21l5-3 5 3-1.5-7.5"],
  tag: ["M3 12V4h8l10 10-8 8L3 12z", { c: [7.5, 8.5, 1.5] }],
  store: ["M4 10v10h16V10", "M3 10l2-6h14l2 6H3z", "M10 20v-5h4v5"],
  phone: ["M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"],
  pot: ["M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z", "M2 10h2M20 10h2", "M9 6h6"],
  cooker: ["M5 11a7 5 0 0 1 14 0", "M4 11h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5z", "M10 6h4"],
  fryer: ["M7 3h10a2 2 0 0 1 2 2l.5 16h-15L5 5a2 2 0 0 1 2-2z", "M5.3 12h13.4", { c: [12, 7.5, 1.5] }],
  blender: ["M7 3h10l-1.5 11h-7L7 3z", "M8 14h8v7H8z", "M11 17.5h2"],
  knife: ["M3 21L15 9", "M15 9l5-5c1 3 0 6-3 8l-2-3z"],
  kettle: ["M6 9h11l1 11H5l1-11z", "M17 11h2a2 2 0 0 1 0 4h-1.6", "M9 5h5l1 4H8l1-4z"],
  drop: ["M12 3c3.5 4.5 6 7.7 6 11a6 6 0 0 1-12 0c0-3.3 2.5-6.5 6-11z"],
  home: ["M3 11l9-7 9 7", "M5 10v10h14V10"],
  user: [{ c: [12, 8, 4] }, "M4 21a8 8 0 0 1 16 0"],
  eye: ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z", { c: [12, 12, 3] }],
  eyeOff: [
    "M3 3l18 18",
    "M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9",
    "M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6",
    "M9.9 9.9a3 3 0 0 0 4.2 4.2",
  ],
  logout: ["M15 4h4v16h-4", "M10 8l-4 4 4 4", "M6 12h11"],
  heart: ["M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6.5 5 5 0 0 1 21.2 11C19 15.6 12 20 12 20z"],
  compare: ["M8 4v16", "M16 4v16", "M4 8l4-4 4 4", "M12 16l4 4 4-4"],
  close: ["M6 6l12 12", "M18 6L6 18"],
};

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  stroke = 1.6,
  className,
}: {
  name: IconName | string;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const parts = ICONS[name] ?? ICONS.pot;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {parts.map((d, i) =>
        typeof d === "string" ? <path key={i} d={d} /> : <circle key={i} cx={d.c[0]} cy={d.c[1]} r={d.c[2]} />,
      )}
    </svg>
  );
}
