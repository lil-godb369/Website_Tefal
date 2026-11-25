import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoProduct } from "./data";
import { Bracket, caps, fontFamily, GRAY, INK, ProductShot, RED, useRise, useSlowZoom } from "./ui";

const base = { fontFamily, color: INK } as const;

/* 1. Mở đầu: ảnh bếp bên trái kèm tên SP, nồi trượt vào khung xám bên phải */
export function Intro({ p }: { p: VideoProduct }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = useSlowZoom(1.04, 1.12);
  const slide = spring({ frame: frame - 0.3 * fps, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ ...base, flexDirection: "row", background: GRAY }}>
      <div style={{ position: "relative", width: "58%", overflow: "hidden" }}>
        <Img src={staticFile("bep.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.7), rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1))" }} />
        <div style={{ position: "absolute", left: 80, top: 330, color: "#fff" }}>
          <Bracket delay={0.4}>
            <div style={{ ...caps, ...useRise(0.6), fontSize: 30, fontWeight: 500 }}>{p.kind}</div>
            <div style={{ ...caps, ...useRise(0.8), fontSize: 78, fontWeight: 900, lineHeight: 1.15 }}>{p.line}</div>
            <div style={{ ...caps, ...useRise(1.0), fontSize: 30, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>Model {p.model}</div>
          </Bracket>
        </div>
      </div>
      <div style={{ position: "relative", flex: 1, display: "grid", placeItems: "center" }}>
        <ProductShot
          src={p.image}
          bg={GRAY}
          style={{ height: 760, transform: `translateX(${(1 - slide) * 420}px)`, opacity: slide }}
        />
      </div>
    </AbsoluteFill>
  );
}

/* 2. Con số quyết định: số rất lớn bên phải, SP bên trái phóng chậm */
export function Figure({ p }: { p: VideoProduct }) {
  const zoom = useSlowZoom(1, 1.06);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Đếm số 0 → giá trị cho cảm giác con số "chạy lên". Số kiểu Việt: "2.000" = hai nghìn, "1,8" = một phẩy tám
  const decimals = p.figure.value.includes(",") ? p.figure.value.split(",")[1].length : 0;
  const target = parseFloat(p.figure.value.replace(/\./g, "").replace(",", "."));
  const t = interpolate(frame, [0.4 * fps, 1.4 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Số dài (vd "2.000") thu nhỏ để không tràn mép phải
  const big = p.figure.value.length >= 5 ? 190 : 260;
  const shown = Number.isFinite(target)
    ? new Intl.NumberFormat("vi-VN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(target * t)
    : p.figure.value;
  return (
    <AbsoluteFill style={{ ...base, background: GRAY, flexDirection: "row", alignItems: "center" }}>
      <div style={{ width: "50%", display: "grid", placeItems: "center" }}>
        <ProductShot src={p.image} bg={GRAY} style={{ height: 820, transform: `scale(${zoom})` }} />
      </div>
      <div style={{ flex: 1 }}>
        <Bracket delay={0.2}>
          <div style={{ ...caps, ...useRise(0.3), fontSize: 40, fontWeight: 700 }}>{p.figure.label}</div>
          <div style={{ ...useRise(0.4), fontSize: big, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
            {shown}
            <span style={{ fontSize: big * 0.46, marginLeft: 16 }}>{p.figure.unit}</span>
          </div>
          <div style={{ ...useRise(1.2), fontSize: 36, fontWeight: 500, color: "#555" }}>{p.figure.note}</div>
        </Bracket>
      </div>
    </AbsoluteFill>
  );
}

/* 3. Công nghệ: nền tối, từng dòng hiện lần lượt như cảnh "màng lọc" của video mẫu; vòng sáng gợi ý gia nhiệt */
export function Tech({ p }: { p: VideoProduct }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ ...base, background: "radial-gradient(circle at 72% 50%, #2b3a4f 0%, #121a26 60%, #0b1018 100%)" }}>
      {/* vòng tròn tỏa ra, chỉ để trang trí */}
      {[0, 1, 2, 3].map((i) => {
        const cycle = ((frame / fps - i * 0.6) % 2.4 + 2.4) % 2.4;
        const r = interpolate(cycle, [0, 2.4], [80, 520]);
        const o = interpolate(cycle, [0, 0.3, 2.4], [0, 0.55, 0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 1380 - r,
              top: 540 - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `6px solid rgba(255,120,60,${o})`,
              boxShadow: `0 0 40px rgba(227,6,19,${o * 0.6})`,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", left: 140, top: 300, color: "#fff" }}>
        {p.tech.map((t, i) => (
          <div key={t} style={{ ...caps, ...useRise(0.3 + i * 0.7, 30), fontSize: 54, fontWeight: 800, margin: "0 0 34px", display: "flex", alignItems: "center", gap: 28 }}>
            <span style={{ width: 14, height: 14, background: RED, borderRadius: 2 }} />
            {t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

/* 4. Một điểm nổi bật: chữ canh giữa phía trên, SP lớn dần ở giữa */
export function Highlight({ p }: { p: VideoProduct }) {
  const zoom = useSlowZoom(0.94, 1.04);
  return (
    <AbsoluteFill style={{ ...base, background: "#fff", alignItems: "center" }}>
      <div style={{ marginTop: 70 }}>
        <Bracket delay={0.1} align="center">
          <div style={{ ...caps, ...useRise(0.2), fontSize: 64, fontWeight: 900 }}>{p.highlight.title}</div>
          <div style={{ ...caps, ...useRise(0.5), fontSize: 36, fontWeight: 500, color: "#555" }}>{p.highlight.sub}</div>
        </Bracket>
      </div>
      <ProductShot src={p.image} bg="#fff" style={{ height: 720, marginTop: 10, transform: `scale(${zoom})` }} />
    </AbsoluteFill>
  );
}

/* 5. Thông số: 4 ô hiện lần lượt */
export function Specs({ p }: { p: VideoProduct }) {
  return (
    <AbsoluteFill style={{ ...base, background: "#fff", padding: "120px 140px" }}>
      <div style={{ ...caps, ...useRise(0), fontSize: 44, fontWeight: 800, marginBottom: 60 }}>Thông số chính</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        {p.specs.map((s, i) => (
          <div key={s.label} style={{ ...useRise(0.25 + i * 0.25), background: GRAY, padding: "48px 56px" }}>
            <div style={{ fontSize: 64, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            <div style={{ fontSize: 30, fontWeight: 500, color: "#707072", marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

/* 6. Bảo hành và giá */
export function Offer({ p }: { p: VideoProduct }) {
  const zoom = useSlowZoom(1, 1.05);
  return (
    <AbsoluteFill style={{ ...base, background: GRAY, flexDirection: "row", alignItems: "center" }}>
      <div style={{ width: "46%", display: "grid", placeItems: "center" }}>
        <ProductShot src={p.image} bg={GRAY} style={{ height: 760, transform: `scale(${zoom})` }} />
      </div>
      <div style={{ flex: 1 }}>
        <Bracket delay={0.1}>
          <div style={{ ...caps, ...useRise(0.2), fontSize: 40, fontWeight: 700 }}>Bảo hành {p.warranty}</div>
          {p.price ? (
            <>
              <div style={{ ...useRise(0.5), fontSize: 120, fontWeight: 900, color: RED, letterSpacing: "-0.02em", marginTop: 20, fontVariantNumeric: "tabular-nums" }}>
                {p.price.now}
              </div>
              {p.price.was ? (
                <div style={{ ...useRise(0.7), fontSize: 40, fontWeight: 500, color: "#707072", display: "flex", gap: 24, alignItems: "baseline" }}>
                  <s>{p.price.was}</s>
                  {p.price.off ? <span style={{ color: RED, fontWeight: 700 }}>{p.price.off}</span> : null}
                </div>
              ) : null}
              <div style={{ ...useRise(0.9), fontSize: 24, color: "#707072", marginTop: 18 }}>{p.price.asOf}</div>
            </>
          ) : null}
        </Bracket>
      </div>
    </AbsoluteFill>
  );
}

/* 7. Kết: chữ Tefal màu đỏ (chưa có file logo chính thức nên không dùng logo) */
export function Outro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ ...base, background: "#fff", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 190, fontWeight: 800, color: RED, letterSpacing: "-0.03em", transform: `scale(${0.9 + s * 0.1})`, opacity: s }}>
        Tefal
      </div>
      <div style={{ ...caps, ...useRise(0.4), fontSize: 34, fontWeight: 500, color: "#707072", marginTop: 10 }}>
        Đồ bếp chính hãng
      </div>
    </AbsoluteFill>
  );
}
