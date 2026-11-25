import type { Metadata } from "next";
import Link from "next/link";
import { Plate } from "@/components/ui/plate";
import { Breadcrumb } from "@/components/ui/section";
import { getOriginData } from "@/lib/queries/products";
import { routes } from "@/lib/routes";
import { pageMeta } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { rows } = await getOriginData();
  return pageMeta({
    title: "Xuất xứ sản phẩm",
    description: `Đồ bếp Tefal theo nơi sản xuất: ${rows.map((r) => r.origin).join(", ")}.`,
    path: routes.origins,
  });
}

export default async function OriginPage() {
  const { rows, unknown } = await getOriginData();
  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", href: routes.home }, { label: "Xuất xứ" }]} />
      <header className="tf-cat-head">
        <h1 className="tf-cat-title">Xuất xứ sản phẩm</h1>
      </header>
      <ul className="tf-origins">
        {rows.map((r) => (
          <li key={r.origin}>
            <Link className="tf-origin" href={routes.byOrigin(r.origin)}>
              <span className="tf-origin-pics" aria-hidden="true">
                {r.pics.map((p) => (
                  <Plate key={p.id} image={p.img} alt="" art={p.art} />
                ))}
              </span>
              <span className="tf-origin-body">
                <span className="tf-origin-name">Sản xuất tại {r.origin}</span>
                <span className="tf-origin-count">{r.count} mẫu</span>
                <span className="tf-origin-groups">
                  {r.groups.slice(0, 4).join(", ") + (r.groups.length > 4 ? "…" : "")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="tf-cat-note">
        Xuất xứ theo thông tin sản phẩm.{unknown ? ` ${unknown} mẫu chưa ghi xuất xứ.` : ""}
      </p>
    </>
  );
}
