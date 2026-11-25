import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps {
  variant?: "outline" | "primary" | "dark" | "quiet";
  size?: "md" | "sm";
  block?: boolean;
  className?: string;
  children: ReactNode;
  /** có href thì là liên kết */
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  "aria-label"?: string;
}

/** Nút. Có href thì là liên kết (Link; "#..." là thẻ a thường), không thì là button. */
export function Button({
  variant = "outline",
  size,
  block,
  className,
  children,
  href,
  type = "button",
  ...rest
}: ButtonProps) {
  const cls = cn(
    "tf-btn",
    variant !== "outline" && `tf-btn-${variant}`,
    size === "sm" && "tf-btn-sm",
    block && "tf-btn-block",
    className,
  );
  if (href !== undefined) {
    const { disabled: _disabled, ...linkProps } = rest;
    void _disabled;
    return href.startsWith("#") ? (
      <a className={cls} href={href} {...linkProps}>
        {children}
      </a>
    ) : (
      <Link className={cls} href={href} {...linkProps}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
