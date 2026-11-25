"use client";

import { useToastStore } from "@/lib/toast";
import { cn } from "@/lib/utils";

/** Vùng thông báo, đặt một lần trong layout. Gọi toast("…") từ bất cứ đâu để hiện. */
export function Toast() {
  const msg = useToastStore((s) => s.msg);
  return (
    <div className={cn("tf-toast", msg && "is-on")} role="status" aria-live="polite">
      {msg}
    </div>
  );
}
