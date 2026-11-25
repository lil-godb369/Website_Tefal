import { Composition } from "remotion";
import { PRODUCTS } from "./data";
import { durationOf, FPS, SanPham } from "./SanPham";

/** Mỗi SP một composition, tên "SP-<mã>" (vd SP-DK-061). Xuất tất cả: npm run render:all */
export function Root() {
  return (
    <>
      {PRODUCTS.map((p) => (
        <Composition
          key={p.id}
          id={`SP-${p.id}`}
          component={SanPham}
          durationInFrames={durationOf(p)}
          fps={FPS}
          width={1920}
          height={1080}
          defaultProps={{ product: p }}
        />
      ))}
    </>
  );
}
