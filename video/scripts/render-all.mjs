// Xuất video mọi SP trong src/data.ts (PRODUCTS), rồi làm bản cho web:
//   out/<mã>.mp4                      bản gốc 1080p
//   ../frontend/public/video/<mã>.mp4  bản web 720p, nén vừa, faststart (phát được khi đang tải)
//   ../frontend/public/video/<mã>.jpg  ảnh bìa (poster) lấy ở giây thứ 2 (cảnh mở đầu đã hiện tên SP)
// Chạy: npm run render:all  (cần ffmpeg trong PATH)
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const web = resolve(root, "../frontend/public/video");
mkdirSync(resolve(root, "out"), { recursive: true });
mkdirSync(web, { recursive: true });

// Lấy danh sách mã SP từ data.ts (các mục có id: "XX-NNN")
const ids = [...readFileSync(resolve(root, "src/data.ts"), "utf8").matchAll(/id: "([A-Z]+-\d+)"/g)].map((m) => m[1]);
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });

for (const id of ids) {
  const full = resolve(root, `out/${id}.mp4`);
  console.log(`\n== ${id}`);
  run("npx", ["remotion", "render", "src/index.ts", `SP-${id}`, full, "--codec=h264", "--crf=20"]);
  run("ffmpeg", ["-v", "error", "-y", "-i", full, "-vf", "scale=1280:-2", "-c:v", "libx264", "-crf", "26",
    "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", resolve(web, `${id}.mp4`)]);
  run("ffmpeg", ["-v", "error", "-y", "-ss", "2", "-i", full, "-frames:v", "1", "-vf", "scale=1280:-2", "-q:v", "4",
    resolve(web, `${id}.jpg`)]);
  const kb = (f) => Math.round(statSync(f).size / 1024);
  console.log(`   web: ${kb(resolve(web, `${id}.mp4`))} KB, poster: ${kb(resolve(web, `${id}.jpg`))} KB`);
}
