import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { BadgeData } from "@/lib/product";

export function Badge({
  tone = "neutral",
  dot,
  children,
}: {
  tone?: BadgeData["tone"];
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={cn("tf-badge", tone !== "neutral" && `tf-badge-${tone}`)}>
      {dot ? <span className="tf-badge-dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function BadgeRow({ items }: { items: BadgeData[] }) {
  if (!items.length) return null;
  return (
    <div className="tf-card-badges">
      {items.map((b, i) => (
        <Badge key={i} tone={b.tone} dot={b.dot}>
          {b.text}
        </Badge>
      ))}
    </div>
  );
}
