import type { Metadata } from "next";
import { CompareView } from "@/features/compare/compare-view";

export const metadata: Metadata = {
  title: "So sánh sản phẩm",
  description: "So sánh giá và thông số các mẫu đồ bếp Tefal cạnh nhau.",
  robots: { index: false },
};

export default function ComparePage() {
  return <CompareView />;
}
