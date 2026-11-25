import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { VideoProduct } from "./data";
import { Figure, Highlight, Intro, Offer, Outro, Specs, Tech } from "./scenes";

export const FPS = 30;
const T = 12; // khung chuyển cảnh

/** Độ dài từng cảnh (giây). Cảnh giá bỏ qua khi SP không có giá. */
function scenes(p: VideoProduct) {
  return [
    { s: 4, el: <Intro p={p} /> },
    { s: 4, el: <Figure p={p} /> },
    { s: 4.5, el: <Tech p={p} /> },
    { s: 3.5, el: <Highlight p={p} /> },
    { s: 4, el: <Specs p={p} /> },
    ...(p.price ? [{ s: 4, el: <Offer p={p} /> }] : []),
    { s: 3, el: <Outro /> },
  ];
}

export function durationOf(p: VideoProduct) {
  const list = scenes(p);
  return list.reduce((n, x) => n + Math.round(x.s * FPS), 0) - (list.length - 1) * T;
}

export function SanPham({ product }: { product: VideoProduct }) {
  const list = scenes(product);
  return (
    <TransitionSeries>
      {list.flatMap((x, i) => {
        const seq = (
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={Math.round(x.s * FPS)}>
            {x.el}
          </TransitionSeries.Sequence>
        );
        if (i === 0) return [seq];
        // xen kẽ trượt ngang và mờ dần cho đỡ đơn điệu
        const presentation = i % 2 ? slide({ direction: "from-right" }) : fade();
        return [
          <TransitionSeries.Transition key={`t${i}`} presentation={presentation} timing={linearTiming({ durationInFrames: T })} />,
          seq,
        ];
      })}
    </TransitionSeries>
  );
}
