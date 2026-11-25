"use client";

import { create } from "zustand";
import type { ProductSummary } from "@/types/product";

/** Xem nhanh: thẻ SP mở, QuickViewHost trong layout vẽ. returnFocus = phần tử nhận lại focus khi đóng. */
export const useQuickView = create<{ item: ProductSummary | null; returnFocus: HTMLElement | null }>(() => ({
  item: null,
  returnFocus: null,
}));

export function openQuickView(item: ProductSummary, from: HTMLElement | null) {
  useQuickView.setState({ item, returnFocus: from });
}

export function closeQuickView() {
  useQuickView.setState({ item: null });
}

/** Bấm thường mở xem nhanh; ctrl/cmd/shift/alt/chuột giữa vẫn mở trang chi tiết như liên kết thường */
export function quickViewClick(item: ProductSummary) {
  return (e: React.MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openQuickView(item, e.currentTarget);
  };
}
