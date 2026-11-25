import type { Metadata } from "next";
import { Breadcrumb, CategoryTile, SectionTitle } from "@/components/ui/section";
import { ICON_OF } from "@/lib/product";
import { getBrandData } from "@/lib/queries/products";
import { routes } from "@/lib/routes";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Thương hiệu Tefal",
  description:
    "Tefal: thương hiệu đồ bếp ra đời năm 1956 tại Pháp, thuộc Groupe SEB. Xem các dòng sản phẩm Tefal đang bán.",
  path: routes.brand,
});

export default async function BrandPage() {
  const d = await getBrandData();
  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", href: routes.home }, { label: "Thương hiệu" }]} />
      <header className="tf-cat-head">
        <h1 className="tf-cat-title">Tefal</h1>
      </header>
      <div className="tf-brand">
        <div className="tf-prose">
          <p>
            Tefal là thương hiệu đồ gia dụng ra đời năm 1956 tại Pháp, gắn với chiếc chảo chống dính đầu tiên. Tên Tefal
            ghép từ TEFlon và ALuminium, hai vật liệu của chiếc chảo đó.
          </p>
          <p>Từ năm 1968, Tefal thuộc Groupe SEB, tập đoàn đồ gia dụng của Pháp.</p>
          <p>
            Trang này bán đồ bếp Tefal chính hãng: nồi chảo, nồi cơm điện, nồi chiên không dầu, máy xay, dao và dụng cụ
            bếp. Mỗi sản phẩm hiện rõ thông số, xuất xứ và giá.
          </p>
        </div>
        <dl className="tf-brand-facts">
          <div>
            <dt>Mẫu đồ bếp đang bán</dt>
            <dd>{d.kitchen}</dd>
          </div>
          <div>
            <dt>Nhóm sản phẩm</dt>
            <dd>{d.groups}</dd>
          </div>
          <div>
            <dt>Mẫu sản xuất tại Pháp</dt>
            <dd>{d.france}</dd>
          </div>
        </dl>
      </div>
      <section className="tf-section">
        <SectionTitle title="Các dòng sản phẩm" moreHref={routes.all} moreLabel="Tất cả sản phẩm" />
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
    </>
  );
}
