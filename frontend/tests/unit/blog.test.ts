import { describe, expect, it } from "vitest";
import catalogJson from "@/data/catalog.json";
import { POSTS, firstSentence, metaDescription, priceRange } from "@/features/blog/posts";
import type { Catalog } from "@/types/product";

const catalog = catalogJson as Catalog;
const ofGroup = (g: string) => catalog.products.filter((p) => p.g === g);

describe("bài viết", () => {
  it("mỗi bài dựng được từ dữ liệu, số mẫu ở mở bài khớp dữ liệu", () => {
    for (const post of POSTS) {
      const ps = ofGroup(post.group);
      const { lead, blocks } = post.build(ps);
      expect(lead).toMatch(/^Tefal (hiện )?có \d+ mẫu/);
      expect(lead).not.toMatch(/NaN|Infinity|undefined/);
      expect(blocks.some((b) => b.kind === "cta")).toBe(true);
      // mã SP gợi ý đều có thật trong nhóm
      const ids = new Set(ps.map((p) => p.id));
      for (const b of blocks) if (b.kind === "picks") b.ids.forEach((id) => expect(ids.has(id)).toBe(true));
    }
    const rice = POSTS.find((p) => p.slug === "chon-noi-com-dien")!;
    const priced = ofGroup("noi-com-dien").filter((p) => p.price > 0).length;
    expect(rice.build(ofGroup("noi-com-dien")).lead).toContain(`có ${priced} mẫu nồi cơm điện`);
  });

  it("không có dấu chấm than trong bài", () => {
    for (const post of POSTS) {
      const { lead, blocks } = post.build(ofGroup(post.group));
      expect(JSON.stringify({ title: post.title, lead, blocks })).not.toContain("!");
    }
  });

  it("khoảng giá, câu đầu, mô tả meta", () => {
    expect(priceRange([])).toBe("—");
    expect(firstSentence("Câu một. Câu hai.")).toBe("Câu một.");
    const long = "từ ".repeat(80);
    expect(metaDescription(long).length).toBeLessThanOrEqual(156);
  });
});
