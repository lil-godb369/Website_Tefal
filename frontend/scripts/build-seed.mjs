// Sinh supabase/seed.sql từ src/data/catalog.json (232 SP từ web chạy thử).
// Chạy: node scripts/build-seed.mjs   rồi   supabase db reset (máy) hoặc dán vào SQL Editor.
// Lưu ý: image_url vẫn trỏ bucket cũ (có logo cửa hàng cũ). Thay bằng ảnh chính thức Tefal trước khi lên mạng.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const data = JSON.parse(readFileSync(resolve(root, "src/data/catalog.json"), "utf8"));

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const n = (v) => (v === null || v === undefined ? "null" : String(Number(v)));
const j = (v) => (v === null || v === undefined ? "null" : `${q(JSON.stringify(v))}::jsonb`);

const groups = data.groups.map(
  (g, i) => `(${q(g.key)}, ${q(g.name)}, ${q(g.art)}, ${i})`,
);
const products = data.products.map((p) =>
  [
    q(p.id), q(p.g), q(p.name), q(p.full), q(p.model), n(p.price), n(p.orig), n(p.pct), q(p.origin), n(p.w),
    p.stock ? "true" : "false", q(p.img), j(p.fig), q(p.power), q(p.cap), j(p.specs), q(p.desc), j(p.pts),
  ].join(", "),
);

const sql = `-- Sinh bởi scripts/build-seed.mjs từ dữ liệu ngày ${data.built}. Đừng sửa tay.
insert into public.product_groups (key, name, art, sort) values
${groups.join(",\n")}
on conflict (key) do update set name = excluded.name, art = excluded.art, sort = excluded.sort;

insert into public.products (id, group_key, name, full_name, model, price, orig_price, pct, origin, warranty_months,
  in_stock, image_url, key_figure, power, capacity, specs, description, points) values
${products.map((r) => `(${r})`).join(",\n")}
on conflict (id) do update set
  group_key = excluded.group_key, name = excluded.name, full_name = excluded.full_name, model = excluded.model,
  price = excluded.price, orig_price = excluded.orig_price, pct = excluded.pct, origin = excluded.origin,
  warranty_months = excluded.warranty_months, in_stock = excluded.in_stock, image_url = excluded.image_url,
  key_figure = excluded.key_figure, power = excluded.power, capacity = excluded.capacity, specs = excluded.specs,
  description = excluded.description, points = excluded.points, updated_at = now();
`;

writeFileSync(resolve(root, "supabase/seed.sql"), sql);
console.log(`Đã ghi supabase/seed.sql: ${data.groups.length} nhóm, ${data.products.length} SP`);
