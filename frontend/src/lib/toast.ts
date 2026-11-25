"use client";

import { create } from "zustand";

/** Thông báo nhỏ ở góc màn hình (vùng role=status trong components/layout/toast.tsx). */
export const useToastStore = create<{ msg: string }>(() => ({ msg: "" }));

let show: ReturnType<typeof setTimeout> | undefined;
let hide: ReturnType<typeof setTimeout> | undefined;

export function toast(msg: string) {
  clearTimeout(show);
  clearTimeout(hide);
  // Xóa rồi đặt lại để trình đọc màn hình đọc cả khi chữ trùng lần trước
  useToastStore.setState({ msg: "" });
  show = setTimeout(() => {
    useToastStore.setState({ msg });
    hide = setTimeout(() => useToastStore.setState({ msg: "" }), 4000);
  }, 60);
}
