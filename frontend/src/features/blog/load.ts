import "server-only";
import { getGroup, getGroupProducts, getSummaries } from "@/lib/queries/products";
import { cheapest, type Post } from "./posts";

/** Dựng bài từ dữ liệu SP: phần mở bài, các khối, tên nhóm, ảnh cho thẻ bài */
export async function loadPost(post: Post) {
  const [ps, group] = await Promise.all([getGroupProducts(post.group), getGroup(post.group)]);
  const body = post.build(ps);
  const pic = cheapest(ps.filter((p) => p.img));
  return {
    post,
    body,
    groupName: group?.name ?? "",
    pic: pic ? { img: pic.img, art: group?.art } : null,
  };
}

export type LoadedPost = Awaited<ReturnType<typeof loadPost>>;

/** Thẻ SP cho các khối "Gợi ý theo nhu cầu" */
export async function loadPicks(body: LoadedPost["body"]) {
  const ids = body.blocks.flatMap((b) => (b.kind === "picks" ? b.ids : []));
  const list = await getSummaries(ids);
  return new Map(list.map((p) => [p.id, p]));
}
