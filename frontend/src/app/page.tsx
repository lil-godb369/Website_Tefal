import { CategoryTile, PromoBanner, SectionTitle, TrustBar } from "@/components/ui/section";
import { FlashSale } from "@/features/home/flash-sale";
import { Hero } from "@/features/home/hero";
import { Showcase } from "@/features/home/showcase";
import { ProductGrid } from "@/features/product/product-card";
import { ProductVideoPlayer } from "@/features/product/product-video";
import { getVideo } from "@/lib/videos";
import { ICON_OF } from "@/lib/product";
import { getHomeData, getMaxWarranty } from "@/lib/queries/products";
import { routes } from "@/lib/routes";
import { SITE_DESCRIPTION, trustItems } from "@/lib/site";
import { JsonLd, organizationLd } from "@/components/shared/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Tefal", locale: "vi_VN", title: "Tefal — Đồ bếp chính hãng", description: SITE_DESCRIPTION, url: "/" },
};

/* Trang chủ: hero → 4 cam kết → 6 ô danh mục → ưu đãi trong ngày → trưng bày → 3 băng khuyến mãi → giảm nhiều nhất.
   "Mua nhiều nhất" và "Đã xem gần đây" cần bảng orders / product_views trên Supabase: làm sau. */
export default async function HomePage() {
  const [d, maxWarranty] = await Promise.all([getHomeData(), getMaxWarranty()]);

  return (
    <>
      <JsonLd data={organizationLd()} />
      <Hero />

      <div className="tf-trust-wrap">
        <TrustBar items={trustItems(maxWarranty)} />
      </div>

      <section className="tf-section" id="danh-muc">
        <SectionTitle title="Mua theo danh mục" moreHref={routes.all} />
        <div className="tf-grid-6">
          {d.tiles.map(({ group: g, image }) => (
            <CategoryTile
              key={g.key}
              name={g.name}
              count={g.count}
              href={routes.category(g.key)}
              image={image}
              art={g.art}
              icon={ICON_OF[g.key]}
            />
          ))}
        </div>
      </section>

      <div className="tf-section">
        <FlashSale items={d.deals} />
      </div>

      <div className="tf-section">
        <Showcase items={d.show} />
      </div>

      {d.show.some((p) => getVideo(p.id)) ? (
        <section className="tf-section">
          <SectionTitle title="Video sản phẩm" note="Mỗi video khoảng 25 giây, dựng từ thông số sản phẩm." />
          <div className="tf-video-grid">
            {d.show.map((p) => {
              const v = getVideo(p.id);
              return v ? <ProductVideoPlayer key={p.id} video={v} name={p.name} href={p.href} /> : null;
            })}
          </div>
        </section>
      ) : null}

      <section className="tf-section">
        <div className="tf-grid-3 tf-promos">
          <PromoBanner
            kicker="Đang giảm giá"
            title={`Giảm đến ${d.maxPct}% cho đồ bếp Tefal`}
            cta="Xem ưu đãi"
            solid
            href={routes.all + "?giam=1&sap=giam-gia"}
            images={d.dealImages}
          />
          {d.rice ? (
            <PromoBanner
              kicker={d.rice.name}
              title={`${d.rice.count} mẫu cao tần và điện tử`}
              cta="Xem nồi cơm"
              href={routes.category("noi-com-dien")}
              images={d.riceImages}
            />
          ) : null}
          <PromoBanner
            kicker="Sản xuất tại Pháp"
            title={`${d.frenchPans} mẫu nồi chảo từ nhà máy Pháp`}
            cta="Xem nồi chảo"
            href={routes.category("noi-chao") + "?phap=1"}
            images={d.frenchImages}
          />
        </div>
      </section>

      {d.deepest.length ? (
        <section className="tf-section">
          <SectionTitle
            title="Giảm nhiều nhất"
            note="Xếp theo mức giảm so với giá niêm yết, không lặp các mẫu ở trên."
            moreHref={routes.all + "?giam=1&sap=giam-gia"}
          />
          <ProductGrid products={d.deepest} className="tf-grid-5" />
        </section>
      ) : null}
    </>
  );
}
