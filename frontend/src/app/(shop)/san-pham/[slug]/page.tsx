import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BadgeRow } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Plate } from "@/components/ui/plate";
import { PriceTag } from "@/components/ui/price-tag";
import { Breadcrumb, SectionTitle } from "@/components/ui/section";
import { FigureRow, SpecTable } from "@/components/ui/spec";
import { BuyActions } from "@/features/product/buy-actions";
import { ProductVideoPlayer } from "@/features/product/product-video";
import { getVideo, isoDuration, type ProductVideo } from "@/lib/videos";
import { ProductGrid } from "@/features/product/product-card";
import { vnd } from "@/lib/format";
import { badgesOf, figuresOf, metaOf } from "@/lib/product";
import { getAllProductIds, getGroup, getProduct, getRelated, toSummary } from "@/lib/queries/products";
import { productIdFromSlug, routes } from "@/lib/routes";
import { SITE_NAME, SITE_URL, pageMeta } from "@/lib/site";
import { JsonLd, breadcrumbLd } from "@/components/shared/json-ld";
import type { Product } from "@/types/product";

export async function generateStaticParams() {
  return (await getAllProductIds()).map((p) => ({ slug: routes.product(p).split("/").pop()! }));
}

async function load(slug: string) {
  const id = productIdFromSlug(slug);
  return id ? getProduct(id) : null;
}

function description(p: Product): string {
  const bits = [p.full];
  if (p.fig) bits.push(`${p.fig.l.toLowerCase()} ${p.fig.v} ${p.fig.u}`);
  bits.push(p.price > 0 ? `giá ${vnd(p.price)}${p.pct > 0 ? ` (giảm ${p.pct}%)` : ""}` : "gọi để báo giá");
  if (p.w) bits.push(`bảo hành ${p.w} tháng`);
  if (p.origin) bits.push(`sản xuất tại ${p.origin}`);
  return bits.join(", ") + ".";
}

export async function generateMetadata({ params }: PageProps<"/san-pham/[slug]">): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { title: "Không tìm thấy sản phẩm" };
  // Ảnh tạm còn logo cửa hàng cũ: chưa đưa vào og:image
  return pageMeta({ title: p.name, description: description(p), path: routes.product(p) });
}

/** Product cho Google (giá, tình trạng hàng). Chỉ xuất khi có giá: Product không có offers bị Google báo lỗi.
 *  Ảnh thêm vào khi có ảnh sạch. */
function productLd(p: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.full,
    sku: p.id,
    mpn: p.model,
    brand: { "@type": "Brand", name: "Tefal" },
    description: p.desc || undefined,
    offers: {
      "@type": "Offer",
      url: SITE_URL + routes.product(p),
      priceCurrency: "VND",
      price: p.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: p.stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}

/** VideoObject cho Google (video hiện trong kết quả tìm kiếm, tab Video) */
function videoLd(p: Product, v: ProductVideo) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `Video giới thiệu ${p.name}`,
    description: description(p),
    thumbnailUrl: [SITE_URL + v.poster],
    uploadDate: v.made,
    duration: isoDuration(v.seconds),
    contentUrl: SITE_URL + v.src,
  };
}

// Trang SP hoàn toàn tĩnh: đường dẫn chưa dựng sẵn phải chờ dựng xong mới trả (không gửi khung trước),
// nhờ vậy SP không có trả 404 thật và slug cũ trả 308 thật thay vì 200.
export const ensureStatic = "navigation";
// Đọc params ngoài Suspense là cố ý (để có 404/308 thật): báo Next là trang được phép chờ, tắt cảnh báo dev
export const instant = false;

export default async function ProductPage({ params }: PageProps<"/san-pham/[slug]">) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) notFound();
  // Tên SP đổi thì slug cũ chuyển về đường dẫn mới
  const canonical = routes.product(p);
  if (canonical !== `/san-pham/${slug}`) permanentRedirect(canonical);

  const [g, related] = await Promise.all([getGroup(p.g), getRelated(p.id, p.g, p.price)]);
  const summary = toSummary(p);
  const video = getVideo(p.id);

  const crumbs = [
    { label: "Trang chủ", href: routes.home },
    ...(g ? [{ label: g.name, href: routes.category(g.key) }] : []),
    { label: p.model },
  ];

  return (
    <>
      {p.price > 0 ? <JsonLd data={productLd(p)} /> : null}
      <JsonLd data={breadcrumbLd(crumbs, canonical)} />
      {video ? <JsonLd data={videoLd(p, video)} /> : null}
      <Breadcrumb items={crumbs} />
      <div className="tf-pdp">
        <div className="tf-gallery is-single" role="group" aria-label="Ảnh sản phẩm">
          <Plate image={p.img} alt={p.full} art={summary.art} eager />
        </div>
        <aside className="tf-buy">
          <div>
            <h1 className="tf-buy-name">{p.name}</h1>
            <p className="tf-buy-meta">{metaOf(p)}</p>
          </div>
          {p.price > 0 ? (
            <PriceTag price={p.price} original={p.orig} size="lg" />
          ) : (
            <p className="tf-price-ask">Sản phẩm chưa có giá bán. Gọi để được báo giá.</p>
          )}
          <BadgeRow items={badgesOf(p)} />
          <BuyActions product={summary} />
          <FigureRow items={figuresOf(p)} />
          <p className="tf-buy-note">
            <Icon name="store" size={18} />
            Xem và nấu thử tại showroom trước khi mua.
          </p>
        </aside>
      </div>

      {video ? (
        <section className="tf-section tf-section-tight">
          <SectionTitle title="Video giới thiệu" />
          <ProductVideoPlayer video={video} name={p.name} />
        </section>
      ) : null}

      <section className="tf-section tf-section-tight">
        <div className="tf-split">
          <div className="tf-split-aside">
            <h2 className="tf-section-title">Thông số và mô tả</h2>
          </div>
          <div className="tf-detail">
            {p.specs.length ? (
              <SpecTable rows={p.specs} />
            ) : (
              <p className="tf-cat-note">Thông số chưa đầy đủ, gọi để được tư vấn.</p>
            )}
            {p.desc || p.pts.length ? (
              <div className="tf-prose">
                {p.desc ? <p>{p.desc}</p> : null}
                {p.pts.length ? (
                  <ul>
                    {p.pts.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {related.length && g ? (
        <section className="tf-section">
          <SectionTitle
            title="Cùng nhóm, giá gần nhất"
            note={`${g.name} có ${g.count} mẫu đang bán.`}
            moreHref={routes.category(g.key)}
          />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </>
  );
}
