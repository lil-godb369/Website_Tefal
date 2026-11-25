"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SORTS } from "@/lib/product";

/** Chọn cách sắp xếp: đổi tham số ?sap= trên URL, giữ các bộ lọc khác.
 *  Hiện ngay lựa chọn mới trong lúc chờ server (nơi dùng đặt key={value} để đồng bộ lại khi trang trả về). */
export function SortSelect({ value }: { value: string }) {
  const [picked, setPicked] = useState(value);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="tf-sort">
      Sắp xếp{" "}
      <select
        value={picked}
        onChange={(e) => {
          setPicked(e.target.value);
          const next = new URLSearchParams(params);
          if (e.target.value === "noi-bat") next.delete("sap");
          else next.set("sap", e.target.value);
          next.delete("so");
          next.delete("trang");
          const qs = next.toString();
          // replace: lướt mũi tên qua các lựa chọn không chất đầy lịch sử trình duyệt
          router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
      >
        {SORTS.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
