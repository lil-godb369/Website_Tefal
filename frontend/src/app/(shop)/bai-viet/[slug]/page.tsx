import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb, SectionTitle } from "@/components/ui/section";
import { loadPicks, loadPost } from "@/features/blog/load";
import { POSTS, getPost, metaDescription } from "@/features/blog/posts";
import { PostBlocks, PostCards } from "@/features/blog/post-view";
import { routes } from "@/lib/routes";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/bai-viet/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return { title: "Không tìm thấy bài viết" };
  const { body } = await loadPost(post);
  return pageMeta({ title: post.title, description: metaDescription(body.lead), path: routes.post(post.slug), type: "article" });
}

// Bài viết hoàn toàn tĩnh: đường dẫn lạ chờ dựng xong mới trả, nên bài không có trả 404 thật (không phải 200)
export const ensureStatic = "navigation";
// Đọc params ngoài Suspense là cố ý (để có 404/308 thật): báo Next là trang được phép chờ, tắt cảnh báo dev
export const instant = false;

export default async function PostPage({ params }: PageProps<"/bai-viet/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const [d, others] = await Promise.all([loadPost(post), Promise.all(POSTS.filter((x) => x !== post).map(loadPost))]);
  const picks = await loadPicks(d.body);

  return (
    <>
      <Breadcrumb
        items={[{ label: "Trang chủ", href: routes.home }, { label: "Bài viết", href: routes.blog }, { label: post.title }]}
      />
      <article className="tf-post">
        <header className="tf-post-head">
          <p className="tf-hero-kicker">Hướng dẫn chọn · {d.groupName}</p>
          <h1 className="tf-post-title">{post.title}</h1>
          <p className="tf-post-lead">{d.body.lead}</p>
        </header>
        <div className="tf-post-body tf-prose">
          <PostBlocks blocks={d.body.blocks} picks={picks} />
        </div>
      </article>
      <section className="tf-section">
        <SectionTitle title="Bài khác" moreHref={routes.blog} moreLabel="Tất cả bài viết" />
        <PostCards posts={others} />
      </section>
    </>
  );
}
