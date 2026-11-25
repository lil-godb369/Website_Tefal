import { SITE_NAME, SITE_URL } from "@/lib/site";

/** Dữ liệu cấu trúc schema.org cho Google. JSON.stringify không thoát "<": thay để không đóng nhầm thẻ script. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** BreadcrumbList từ đúng mảng đường dẫn hiện trên trang (mục cuối không có href = trang hiện tại) */
export function breadcrumbLd(items: { label: string; href?: string }[], currentPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      item: SITE_URL + (it.href ?? currentPath),
    })),
  };
}

/** Thông tin cửa hàng cho trang chủ. Thêm logo khi có file logo chính thức. */
export function organizationLd() {
  return { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_URL };
}
