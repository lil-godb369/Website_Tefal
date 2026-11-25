import { cn } from "@/lib/utils";
import { Icon } from "./icon";

/** Ô tìm kiếm bo tròn. Đặt trong form có action tới trang tìm kiếm. */
export function SearchField({
  id = "tf-search",
  label = "Tìm sản phẩm",
  placeholder = "Tìm tên hoặc mã model",
  defaultValue,
  className,
  autoFocus,
}: {
  id?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={cn("tf-search", className)} role="search">
      <Icon name="search" size={18} />
      <label className="tf-sr" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
      />
    </div>
  );
}
