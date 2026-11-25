"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

/** Người dùng hiện tại phía trình duyệt. ready = đã hỏi Supabase xong (tránh nháy "Đăng nhập" khi đang tải). */
export const useAuthStore = create<{ user: User | null; ready: boolean }>(() => ({ user: null, ready: false }));

export function useUser() {
  return useAuthStore((s) => s.user);
}

export function displayName(user: User | null): string {
  if (!user) return "";
  const name = (user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined);
  return name || user.email || "";
}
