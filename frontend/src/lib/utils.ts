export { clsx as cn } from "clsx";

/** Bỏ dấu tiếng Việt, chữ thường: dùng để tìm kiếm và tạo slug */
export function norm(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/** "Nồi cơm điện tử 1.8L" -> "noi-com-dien-tu-1-8l" */
export function slugify(s: string): string {
  return norm(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
