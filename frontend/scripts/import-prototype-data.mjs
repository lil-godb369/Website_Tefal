// Chép dữ liệu SP từ web chạy thử (web/assets/js/data.js) sang src/data/catalog.json.
// Dùng tạm cho tới khi có Supabase riêng; khi đó src/lib/queries đọc DB thay cho file này.
// Chạy: npm run data:import
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = resolve(root, "../web/assets/js/data.js");
const out = resolve(root, "src/data/catalog.json");

const text = readFileSync(src, "utf8");
const start = text.indexOf("{");
const end = text.lastIndexOf("}");
if (start < 0 || end < start) throw new Error("Không đọc được window.TF_DATA trong " + src);
const data = JSON.parse(text.slice(start, end + 1));

const ids = new Set();
for (const p of data.products) {
  if (ids.has(p.id)) throw new Error("Trùng mã SP: " + p.id);
  ids.add(p.id);
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data) + "\n");
// Danh sách mã nhóm cho proxy.ts (trả 404 thật cho /danh-muc/<mã không có>). Nhỏ để proxy không phải nạp cả catalog.
writeFileSync(resolve(root, "src/data/route-index.json"), JSON.stringify({ groups: data.groups.map((g) => g.key) }) + "\n");
console.log(`Đã ghi ${data.products.length} SP, ${data.groups.length} nhóm vào ${out}`);
