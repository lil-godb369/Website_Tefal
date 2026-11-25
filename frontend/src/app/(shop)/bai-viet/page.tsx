import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/section";
import { loadPost } from "@/features/blog/load";
import { POSTS } from "@/features/blog/posts";
import { PostCards } from "@/features/blog/post-view";
import { routes } from "@/lib/routes";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Bài viết",
  description: "Hướng dẫn chọn đồ bếp Tefal: nồi cơm điện, chảo chống dính, nồi chiên không dầu.",
  path: routes.blog,
});

export default async function BlogPage() {
  const posts = await Promise.all(POSTS.map(loadPost));
  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", href: routes.home }, { label: "Bài viết" }]} />
      <header className="tf-cat-head">
        <h1 className="tf-cat-title">Bài viết</h1>
      </header>
      <PostCards posts={posts} />
    </>
  );
}
