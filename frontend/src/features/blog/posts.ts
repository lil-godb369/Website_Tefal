import { vnd } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { Product } from "@/types/product";

/* Bài viết: hướng dẫn chọn đồ bếp (người dùng duyệt 16/10/2026, chép từ web chạy thử).
   Mọi con số trong bài tính từ dữ liệu SP của nhóm lúc dựng trang, nên tự đúng khi dữ liệu đổi.
   Câu "phù hợp mấy người" lấy theo mô tả của chính các mẫu đó. */

export type PostBlock =
  | { kind: "h2"; text: string }
  | { kind: "p"; text: string }
  | { kind: "note"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "table"; head: string[]; rows: (string | number)[][] }
  /** mã SP gợi ý, hiện bằng thẻ SP */
  | { kind: "picks"; ids: string[] }
  | { kind: "cta"; text: string; href: string };

export interface PostBody {
  lead: string;
  blocks: PostBlock[];
}

export interface Post {
  slug: string;
  /** khóa nhóm SP mà bài nói tới */
  group: string;
  title: string;
  /** ps: mọi mẫu của nhóm `group` */
  build: (ps: Product[]) => PostBody;
}

/* ---------- tính số liệu ---------- */

const priced = (ps: Product[]) => ps.filter((p) => p.price > 0);

/** "1,8–2" -> 2 */
export function figV(p: Product): number {
  if (!p.fig) return NaN;
  const parts = String(p.fig.v).split("–");
  return parseFloat(parts[parts.length - 1].replace(",", "."));
}

const specOf = (p: Product, k: string) => p.specs.find((x) => x[0] === k)?.[1] ?? null;

export function priceRange(ps: Product[]): string {
  const prices = priced(ps).map((p) => p.price);
  if (!prices.length) return "—";
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  return lo === hi ? vnd(lo) : `${vnd(lo)} – ${vnd(hi)}`;
}

export function cheapest(ps: Product[]): Product | undefined {
  return [...priced(ps)].sort((a, b) => a.price - b.price)[0];
}

const num = (n: number) => String(n).replace(".", ",");
const ids = (ps: (Product | undefined)[]) => ps.filter((p): p is Product => !!p).map((p) => p.id);

function capRange(ps: Product[]) {
  const caps = ps.map(figV).filter((v) => !isNaN(v));
  return { lo: num(Math.min(...caps)), hi: num(Math.max(...caps)) };
}

/* ---------- 3 bài ---------- */

const riceCooker: Post = {
  slug: "chon-noi-com-dien",
  group: "noi-com-dien",
  title: "Chọn nồi cơm điện Tefal theo số người ăn",
  build(ps) {
    const all = priced(ps);
    const by = (lo: number, hi: number) => all.filter((p) => figV(p) >= lo && figV(p) <= hi);
    const mini = by(0, 1);
    const mid = by(1.1, 1.6);
    const big = by(1.7, 2.5);
    const co = all.filter((p) => /(^|\s)cơ(\s|$)/.test(specOf(p, "Loại") || ""));
    const ih = all.filter((p) => /cao tần|IH/.test(p.name + " " + (p.desc || "") + " " + p.pts.join(" ")));
    const dt = all.filter((p) => !co.includes(p) && !ih.includes(p));
    const ceramic = all.filter((p) => specOf(p, "Chất liệu") === "Ceramic");
    const cap = capRange(all);
    return {
      lead: `Tefal hiện có ${all.length} mẫu nồi cơm điện đang bán, dung tích từ ${cap.lo} đến ${cap.hi} lít, giá ${priceRange(all)}. Chọn nhanh bằng ba câu hỏi: nhà mấy người ăn, muốn nấu kiểu nào, và chi bao nhiêu.`,
      blocks: [
        { kind: "h2", text: "1. Dung tích theo số người ăn" },
        { kind: "p", text: "Đây là bước quan trọng nhất. Nồi quá lớn tốn điện và cơm ít dễ khô; nồi quá nhỏ phải nấu hai lần." },
        {
          kind: "table",
          head: ["Dung tích", "Hợp với", "Số mẫu", "Giá"],
          rows: [
            ["0,7 lít", "1–2 người", mini.length, priceRange(mini)],
            ["1,5 lít", "2–4 người", mid.length, priceRange(mid)],
            ["1,8–2 lít", "4–6 người", big.length, priceRange(big)],
          ],
        },
        { kind: "note", text: 'Cột "Hợp với" lấy theo mô tả của chính các mẫu trong nhóm. Mẫu 1,8 lít nấu được khoảng 10 cốc gạo.' },
        { kind: "h2", text: "2. Cách nồi làm nóng" },
        {
          kind: "ul",
          items: [
            `Nồi cơ (${co.length} mẫu): nắp gài, một nút gạt nấu và giữ ấm. Đơn giản, giá thấp, công suất nhỏ.`,
            `Nồi điện tử (${dt.length} mẫu): bảng phím hoặc cảm ứng, nhiều chương trình nấu như cơm, cháo, hấp. Giá ${priceRange(dt)}.`,
            `Nồi cao tần IH (${ih.length} mẫu): làm nóng trực tiếp cả lòng nồi bằng cảm ứng điện từ, nhiệt lan đều hơn, công suất 1.200–1.400 W. Giá ${priceRange(ih)}.`,
          ],
        },
        {
          kind: "p",
          text: "Nấu cơm trắng mỗi ngày thì nồi điện tử đã đủ. Nồi cao tần đáng cân nhắc khi muốn cơm chín đều hơn: các mẫu cao tần đều ghi công nghệ lan nhiệt khắp lòng nồi.",
        },
        { kind: "h2", text: "3. Lòng nồi" },
        {
          kind: "p",
          text: `${ceramic.length} trên ${all.length} mẫu ghi chất liệu ceramic. Lòng nồi dày giữ nhiệt tốt hơn; thông số độ dày ghi trong trang chi tiết của từng mẫu. Dùng muỗng nhựa hoặc gỗ đi kèm để lớp phủ bền lâu.`,
        },
        { kind: "h2", text: "Gợi ý theo nhu cầu" },
        { kind: "picks", ids: ids([cheapest(mini), cheapest(dt.filter((p) => figV(p) >= 1.8)), cheapest(ih)]) },
        {
          kind: "cta",
          text: `Xem ${all.length} nồi cơm điện xếp theo dung tích`,
          href: routes.category("noi-com-dien") + "?sap=con-so",
        },
      ],
    };
  },
};

const pan: Post = {
  slug: "chon-chao-chong-dinh",
  group: "noi-chao",
  title: "Chọn chảo chống dính Tefal: cỡ chảo, lớp phủ, loại bếp",
  build(ps) {
    const pans = priced(ps.filter((p) => /^Chảo/.test(p.name)));
    const dia = (...d: string[]) => pans.filter((p) => p.fig && d.includes(p.fig.v));
    const induction = pans.filter((p) => specOf(p, "Đáy nhiễm từ") === "Có");
    const ti = pans.filter((p) => specOf(p, "Lớp phủ chống dính") === "Titanium");
    const ce = pans.filter((p) => specOf(p, "Lớp phủ chống dính") === "Ceramic");
    const signal = pans.filter((p) => /Thermo-Signal|báo nhiệt/i.test(p.pts.join(" ") + " " + (p.desc || "")));
    const fr = pans.filter((p) => p.origin === "Pháp");
    return {
      lead: `Tefal có ${pans.length} mẫu chảo đang bán, đường kính 16 đến 30 cm, giá ${priceRange(pans)}. Chọn theo ba điều: cỡ chảo hợp khẩu phần, lớp chống dính, và chảo có dùng được trên bếp nhà bạn không.`,
      blocks: [
        { kind: "h2", text: "1. Cỡ chảo" },
        {
          kind: "table",
          head: ["Đường kính", "Thường dùng cho", "Số mẫu", "Giá"],
          rows: [
            ["20 cm", "Chiên trứng, khẩu phần 1–2 người", dia("20").length, priceRange(dia("20"))],
            ["24–26 cm", "Nấu hằng ngày cho 2–4 người", dia("24", "26").length, priceRange(dia("24", "26"))],
            ["28–30 cm", "Xào nhiều, chiên cá, nhà đông người", dia("28", "30").length, priceRange(dia("28", "30"))],
          ],
        },
        {
          kind: "p",
          text: "Nếu chỉ mua một chiếc, cỡ 24–26 cm dùng được nhiều việc nhất. Nhà 4 người trở lên nên có thêm một chiếc 28 cm.",
        },
        { kind: "h2", text: "2. Lớp chống dính" },
        {
          kind: "ul",
          items: [
            `Titanium (${ti.length} mẫu): lớp phủ gia cường, mô tả sản phẩm nhấn mạnh khả năng chống trầy xước.`,
            `Ceramic (${ce.length} mẫu): lớp phủ gốc khoáng, bề mặt sáng màu.`,
            `${pans.length - ti.length - ce.length} mẫu còn lại không ghi loại lớp phủ trong thông số; xem mô tả trong trang chi tiết hoặc hỏi showroom.`,
          ],
        },
        {
          kind: "p",
          text: `${signal.length} mẫu có điểm báo nhiệt Thermo-Signal: chấm tròn giữa lòng chảo đổi màu khi chảo đủ nóng (khoảng 180 °C) để cho thức ăn vào.`,
        },
        { kind: "h2", text: "3. Loại bếp" },
        {
          kind: "p",
          text: `${induction.length} trên ${pans.length} mẫu ghi rõ đáy nhiễm từ, dùng được trên bếp từ, bếp gas và bếp hồng ngoại. Nhà dùng bếp từ nên chọn trong nhóm này; mẫu không ghi thì hỏi showroom trước khi mua.`,
        },
        { kind: "h2", text: "4. Dùng sao cho bền" },
        {
          kind: "ul",
          items: [
            "Đun lửa vừa, không đun chảo không trên lửa lớn.",
            "Dùng sạn gỗ hoặc silicon, tránh dụng cụ kim loại sắc cạnh.",
            "Để chảo nguội rồi mới rửa, dùng miếng rửa mềm.",
          ],
        },
        { kind: "p", text: `${fr.length} mẫu chảo trong danh sách sản xuất tại Pháp.` },
        { kind: "h2", text: "Gợi ý theo nhu cầu" },
        {
          kind: "picks",
          ids: ids([
            cheapest(dia("24")),
            cheapest(dia("28").filter((p) => induction.includes(p))),
            cheapest(ti.filter((p) => p.origin === "Pháp")),
          ]),
        },
        { kind: "cta", text: "Xem tất cả nồi chảo", href: routes.category("noi-chao") },
      ],
    };
  },
};

const airFryer: Post = {
  slug: "chon-noi-chien-khong-dau",
  group: "noi-chien",
  title: "Chọn nồi chiên không dầu Tefal theo dung tích",
  build(all) {
    const sold = priced(all);
    const cap = capRange(all);
    const small = sold.filter((p) => figV(p) <= 5);
    const six = sold.filter((p) => figV(p) === 6);
    const big = sold.filter((p) => figV(p) > 6 && figV(p) < 15);
    const oven = sold.filter((p) => figV(p) >= 15);
    const win = sold.filter((p) => /Window/i.test(p.name));
    const unpriced = all.length - sold.length;
    const blocks: PostBlock[] = [
      { kind: "h2", text: "1. Dung tích" },
      {
        kind: "table",
        head: ["Dung tích", "Hợp với", "Số mẫu có giá", "Giá"],
        rows: [
          ["4,2–5 lít", "Nhà ít người, món nhỏ", small.length, priceRange(small)],
          ["6 lít", "Gia đình 4–6 người", six.length, priceRange(six)],
          ["7,5 lít", "Khẩu phần lớn trong một lần nấu", big.length, priceRange(big)],
          ["20 lít", "Kết hợp lò nướng", oven.length, priceRange(oven)],
        ],
      },
      {
        kind: "note",
        text: "Mẫu 6 lít ghi trong mô tả là hợp gia đình 4–6 người. Kích thước giỏ chiên ghi trong trang chi tiết của từng mẫu.",
      },
    ];
    if (unpriced) blocks.push({ kind: "p", text: `${unpriced} mẫu loại lớn nhiều ngăn chưa có giá bán; gọi showroom để được báo giá.` });
    blocks.push(
      { kind: "h2", text: "2. Điều khiển và chương trình nấu" },
      {
        kind: "ul",
        items: [
          "Phím bấm hoặc cảm ứng: cả hai đều có màn hình số, chọn được nhiệt độ và thời gian.",
          "Các mẫu có ghi thông số đều có 8–10 chương trình cài sẵn; dải nhiệt 80–200 °C.",
          `Dòng Window (${win.length} mẫu) có cửa sổ trên thân máy, xem thức ăn mà không cần kéo giỏ ra.`,
        ],
      },
      { kind: "h2", text: "3. Điện và chỗ đặt" },
      {
        kind: "p",
        text: "Công suất các mẫu từ 1.550 đến 2.020 W. Nên cắm vào ổ riêng, không dùng chung ổ chia với bếp điện hay ấm siêu tốc. Chừa khoảng trống phía sau và hai bên máy để hơi nóng thoát ra.",
      },
      { kind: "h2", text: "Gợi ý theo nhu cầu" },
      { kind: "picks", ids: ids([cheapest(small), cheapest(six), cheapest(big)]) },
      { kind: "cta", text: "Xem tất cả nồi chiên không dầu", href: routes.category("noi-chien") },
    );
    return {
      lead: `Tefal có ${all.length} mẫu nồi chiên không dầu, dung tích ${cap.lo} đến ${cap.hi} lít. ${sold.length} mẫu đang có giá, ${priceRange(sold)}. Dung tích là điều cần chọn đầu tiên, sau đó mới tới cách điều khiển và tính năng.`,
      blocks,
    };
  },
};

export const POSTS: Post[] = [riceCooker, pan, airFryer];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/** Câu đầu của phần mở bài, cho thẻ bài viết */
export function firstSentence(lead: string): string {
  return lead.split(". ")[0] + ".";
}

/** Mô tả cho thẻ meta: tối đa 155 ký tự, cắt ở ranh giới từ */
export function metaDescription(lead: string): string {
  if (lead.length <= 155) return lead;
  const cut = lead.slice(0, 155);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "") + "…";
}
