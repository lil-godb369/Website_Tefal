import Link from "next/link";
import { Suspense } from "react";
import { JsonLd, breadcrumbLd } from "@/components/shared/json-ld";
import { Breadcrumb, CategoryIndex } from "@/components/ui/section";
import { ProductGrid } from "@/features/product/product-card";
import { PRICE_BANDS, SORTS } from "@/lib/product";
import { getGroups, listProducts, toSummary } from "@/lib/queries/products";
import { routes } from "@/lib/routes";
import { SortSelect } from "./sort-select";

/* Danh mục, "Tất cả sản phẩm" và tìm kiếm dùng chung. Lọc/sắp xếp theo tham số URL:
   ?sap=gia-tang  ?gia=duoi-1|1-3|tren-3  ?phap=1  ?giam=1  ?xuat-xu=Pháp  ?q=…  ?trang=2 (phân trang, 24 mẫu mỗi trang) */

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const PAGE = 24;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

interface ViewProps {
  basePath: string;
  group?: string;
  searchParams: SearchParams;
}

export function CatalogView(props: ViewProps) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogResults {...props} />
    </Suspense>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="tf-cat-head" aria-busy="true">
      <p className="tf-cat-note">Đang tải sản phẩm…</p>
    </div>
  );
}

/** Phần đọc URL. Phải nằm trong <Suspense> (CatalogView đã bọc sẵn). */
export async function CatalogResults({ basePath, group, searchParams }: ViewProps) {
  const sp = await searchParams;
  const q = (first(sp.q) ?? "").trim();
  const sortParam = first(sp.sap);
  const sort = SORTS.some((s) => s.key === sortParam) ? sortParam! : "noi-bat";
  const priceParam = first(sp.gia);
  const price = PRICE_BANDS.some((b) => b.key === priceParam) ? priceParam! : null;
  const france = first(sp.phap) === "1";
  const sale = first(sp.giam) === "1";

  const r = await listProducts({ group, q, origin: first(sp["xuat-xu"]), sort, price, france, sale });
  const isSearch = basePath === "/tim-kiem";
  const title =
    (r.group ? r.group.name : isSearch ? (q ? `Kết quả cho “${q}”` : "Tìm sản phẩm") : r.origin ? "Sản phẩm" : "Tất cả sản phẩm") +
    (r.origin ? " sản xuất tại " + r.origin : "");

  /** Đường dẫn giữ tham số hiện tại, đổi vài tham số (null = bỏ). Đổi bộ lọc thì về trang đầu. */
  function hrefWith(changes: Record<string, string | null>) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      const val = first(v);
      if (val !== undefined && k !== "so" && k !== "trang") next.set(k, val);
    }
    for (const [k, v] of Object.entries(changes)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function chip(label: string, pressed: boolean, href: string) {
    return (
      // Link không nhận aria-pressed: dùng aria-current. rel=nofollow để bot không lần theo mọi tổ hợp bộ lọc.
      <Link
        key={label}
        className="tf-chip"
        href={href}
        aria-current={pressed ? "true" : undefined}
        rel="nofollow"
        scroll={false}
        replace
      >
        {label}
      </Link>
    );
  }

  const groups = await getGroups();
  const empty = (
    <div className="tf-empty">
      <p>
        {isSearch && q
          ? `Không có sản phẩm khớp “${q}”. Thử mã model đầy đủ, hoặc chọn một danh mục:`
          : isSearch
            ? "Nhập tên hoặc mã model vào ô tìm kiếm, hoặc chọn một danh mục:"
            : "Không có sản phẩm khớp bộ lọc. Bỏ bớt một bộ lọc, hoặc chọn danh mục khác:"}
      </p>
      <CategoryIndex
        items={groups
          .filter((x) => x.count > 0)
          .map((x) => ({ name: x.name, count: x.count, href: routes.category(x.key) }))}
      />
    </div>
  );
  // Phân trang thật (mỗi trang một URL, Google lần được hết SP) thay cho "Xem thêm" nối dài trên một URL
  const pages = Math.max(1, Math.ceil(r.list.length / PAGE));
  const page = Math.min(pages, Math.max(1, Math.floor(Number(first(sp.trang))) || 1));
  const shown = r.list.slice((page - 1) * PAGE, page * PAGE).map(toSummary);
  const pageHref = (n: number) => hrefWith({ trang: n > 1 ? String(n) : null });
  const showList = !(isSearch && !q);

  const crumbs = [{ label: "Trang chủ", href: routes.home }, { label: title }];
  return (
    <>
      {r.group ? <JsonLd data={breadcrumbLd(crumbs, basePath)} /> : null}
      <Breadcrumb items={crumbs} />
      <header className="tf-cat-head">
        <h1 className="tf-cat-title">{title}</h1>
        {showList ? (
          <span className="tf-cat-count">
            {String(r.list.length)}
            <small>{r.list.length === r.baseCount ? "mẫu" : `trên ${r.baseCount} mẫu`}</small>
          </span>
        ) : null}
      </header>
      {r.group?.key === "ngoai-bep" ? (
        <p className="tf-cat-note">
          Máy hút bụi, bàn ủi, quạt và máy lọc không khí. Không thuộc đồ bếp nhưng vẫn là sản phẩm Tefal.
        </p>
      ) : null}
      {showList && r.priced < r.baseCount ? (
        <p className="tf-cat-note">
          {r.baseCount - r.priced} mẫu chưa có giá bán, hiện cuối danh sách với nút gọi báo giá.
        </p>
      ) : null}
      {showList && r.baseCount ? (
        <div className="tf-toolbar">
          <div className="tf-chips" role="group" aria-label="Lọc sản phẩm">
            {chip("Tất cả", !price && !france && !sale, hrefWith({ gia: null, phap: null, giam: null }))}
            {PRICE_BANDS.map((b) => chip(b.label, price === b.key, hrefWith({ gia: price === b.key ? null : b.key })))}
            {r.hasFrance ? chip("Sản xuất tại Pháp", france, hrefWith({ phap: france ? null : "1" })) : null}
            {r.hasSale ? chip("Đang giảm giá", sale, hrefWith({ giam: sale ? null : "1" })) : null}
          </div>
          <SortSelect key={sort} value={sort} />
        </div>
      ) : null}
      {/* Báo cho trình đọc màn hình khi lọc hoặc xem thêm làm đổi số mẫu */}
      <p className="tf-sr" role="status">
        {showList ? `${pages > 1 ? `Trang ${page} trên ${pages}, ` : ""}${shown.length} trên ${r.list.length} mẫu` : ""}
      </p>
      <h2 className="tf-sr">Danh sách sản phẩm</h2>
      {showList && shown.length ? <ProductGrid products={shown} /> : empty}
      {showList && pages > 1 ? <Pager page={page} pages={pages} href={pageHref} /> : null}
    </>
  );
}

/** Số trang hiện quanh trang đang xem: 1 … 4 5 6 … 12 */
function pageList(page: number, pages: number): (number | "…")[] {
  const keep = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const n of [...keep].sort((x, y) => x - y)) {
    if (n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}

function Pager({ page, pages, href }: { page: number; pages: number; href: (n: number) => string }) {
  return (
    <nav className="tf-pager" aria-label="Phân trang">
      {page > 1 ? (
        <Link className="tf-pager-step" href={href(page - 1)} rel="prev">
          Trang trước
        </Link>
      ) : null}
      <ol>
        {pageList(page, pages).map((n, i) =>
          n === "…" ? (
            <li key={"gap" + i} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={href(n)}
                aria-current={n === page ? "page" : undefined}
                aria-label={`Trang ${n}`}
              >
                {n}
              </Link>
            </li>
          ),
        )}
      </ol>
      {page < pages ? (
        <Link className="tf-pager-step" href={href(page + 1)} rel="next">
          Trang sau
        </Link>
      ) : null}
    </nav>
  );
}
