import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Plate } from "@/components/ui/plate";
import { ProductCard } from "@/features/product/product-card";
import { routes } from "@/lib/routes";
import type { ProductSummary } from "@/types/product";
import type { LoadedPost } from "./load";
import { firstSentence, type PostBlock } from "./posts";

/** Thân bài: tiêu đề phụ, đoạn, ghi chú, danh sách, bảng, thẻ SP gợi ý, nút xem danh mục */
export function PostBlocks({ blocks, picks }: { blocks: PostBlock[]; picks: Map<string, ProductSummary> }) {
  return blocks.map((b, i) => {
    switch (b.kind) {
      case "h2":
        return <h2 key={i}>{b.text}</h2>;
      case "p":
        return <p key={i}>{b.text}</p>;
      case "note":
        return (
          <p key={i} className="tf-post-note">
            {b.text}
          </p>
        );
      case "ul":
        return (
          <ul key={i}>
            {b.items.map((t, j) => (
              <li key={j}>{t}</li>
            ))}
          </ul>
        );
      case "table":
        return (
          // bảng rộng cuộn ngang trên điện thoại: cho focus để cuộn bằng phím
          <div key={i} className="tf-post-table" tabIndex={0} role="region" aria-label={"Bảng " + b.head[0].toLowerCase()}>
            <table>
              <thead>
                <tr>
                  {b.head.map((c, j) => (
                    <th key={j} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, j) => (
                  <tr key={j}>
                    {r.map((c, k) =>
                      k === 0 ? (
                        <th key={k} scope="row">
                          {c}
                        </th>
                      ) : (
                        <td key={k}>{c}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "picks": {
        const ps = b.ids.map((id) => picks.get(id)).filter((p): p is ProductSummary => !!p);
        return ps.length ? (
          <div key={i} className="tf-grid-products tf-post-picks">
            {ps.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : null;
      }
      case "cta":
        return (
          <p key={i}>
            <Button variant="primary" href={b.href}>
              {b.text}
            </Button>
          </p>
        );
    }
  });
}

/** Thẻ bài viết ở trang danh sách và mục "Bài khác" */
export function PostCard({ post, body, groupName, pic }: LoadedPost) {
  return (
    <Link className="tf-blog-card" href={routes.post(post.slug)}>
      {pic ? (
        <span className="tf-blog-pic" aria-hidden="true">
          <Plate image={pic.img} alt="" art={pic.art} />
        </span>
      ) : null}
      <span className="tf-hero-kicker">Hướng dẫn chọn · {groupName}</span>
      <span className="tf-blog-title">{post.title}</span>
      <span className="tf-blog-text">{firstSentence(body.lead)}</span>
      <span className="tf-ctile-more">
        Đọc bài
        <Icon name="arrow" size={14} />
      </span>
    </Link>
  );
}

export function PostCards({ posts }: { posts: LoadedPost[] }) {
  return (
    <ul className="tf-blog-cards">
      {posts.map((x) => (
        <li key={x.post.slug}>
          <PostCard {...x} />
        </li>
      ))}
    </ul>
  );
}
