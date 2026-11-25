import Link from "next/link";
import { TrustBar, type TrustItem } from "@/components/ui/section";
import { routes } from "@/lib/routes";
import { NewsletterForm } from "./newsletter-form";

/** Chân trang: dải cam kết, cột thông tin showroom, danh mục, mua hàng, ô nhận tin */
export function SiteFooter({
  groups,
  trust,
  built,
}: {
  groups: { key: string; name: string }[];
  trust: TrustItem[];
  built: string;
}) {
  const builtVi = built.split("-").reverse().join("/");
  return (
    <footer className="tf-footer">
      <div className="tf-container">
        <div className="tf-footer-trust">
          <TrustBar dark items={trust} />
        </div>
        <div className="tf-footer-cols">
          <div id="showroom">
            <Link className="tf-wordmark" href={routes.home}>
              <span className="tf-wordmark-name">Tefal</span>
              <span className="tf-wordmark-sub">Thương hiệu danh tiếng từ Pháp</span>
            </Link>
            <p>Nồi chảo, nồi cơm, nồi chiên, máy xay và dụng cụ bếp Tefal. Mỗi sản phẩm hiện rõ thông số và giá.</p>
            {/* Chưa có thông tin thật: không tự đặt địa chỉ, giờ mở cửa, số điện thoại */}
            <p>Showroom: địa chỉ, giờ mở cửa và số điện thoại tư vấn sẽ đặt ở đây.</p>
          </div>
          <div>
            <h2>Danh mục</h2>
            <ul>
              {groups.map((g) => (
                <li key={g.key}>
                  <Link href={routes.category(g.key)}>{g.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Mua hàng</h2>
            <ul>
              <li>
                <Link href={routes.all}>Tất cả đồ bếp</Link>
              </li>
              <li>
                <Link href={routes.all + "?giam=1&sap=giam-gia"}>Đang giảm giá</Link>
              </li>
              <li>
                <Link href={routes.compare}>So sánh</Link>
              </li>
              <li>
                <Link href={routes.cart}>Giỏ hàng</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>Nhận tin ưu đãi</h2>
            <p>Báo khi có mẫu mới hoặc đợt giảm giá.</p>
            <NewsletterForm />
          </div>
        </div>
        <div className="tf-footer-bottom">
          <span>Giá và tồn kho lấy từ dữ liệu ngày {builtVi}.</span>
          <span>Tefal là thương hiệu của Groupe SEB.</span>
        </div>
      </div>
    </footer>
  );
}
