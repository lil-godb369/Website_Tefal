import { routes } from "@/lib/routes";
import { Button } from "./button";
import { Icon } from "./icon";

/** Hiện thay cho trang cần tài khoản */
export function LoginGate({ title, text, next }: { title: string; text?: string; next: string }) {
  return (
    <div className="tf-gate">
      <span className="tf-placed-icon">
        <Icon name="user" size={28} />
      </span>
      <h1 className="tf-auth-title">{title}</h1>
      <p>{text ?? "Bạn cần đăng nhập để tiếp tục. Chưa có tài khoản thì đăng ký mất chưa tới một phút."}</p>
      <div className="tf-hero-actions">
        <Button variant="primary" href={routes.signIn(next)}>
          Đăng nhập
        </Button>
        <Button href={routes.signUp(next)}>Đăng ký</Button>
      </div>
      <a className="tf-link" href={routes.all}>
        Tiếp tục xem sản phẩm
      </a>
    </div>
  );
}
