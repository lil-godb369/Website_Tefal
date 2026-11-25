"use client";

import { useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuthStore } from "@/features/auth/use-user";
import { listenOtherTabs, switchOwner } from "./shop-store";

/** Nạp giỏ hàng sau khi trang hiện, theo dõi đăng nhập để đổi nơi lưu (khách ↔ tài khoản).
 *  Thư viện Supabase (~67 KB gzip) chỉ tải khi đã cấu hình, và tải sau khi trang đã hiện. */
export function ShopProvider() {
  useEffect(() => listenOtherTabs(), []);

  useEffect(() => {
    // Nạp giỏ của khách ngay, không chờ tải Supabase: bấm "Thêm vào giỏ" sớm không đè mất giỏ cũ.
    // Nếu đã đăng nhập, sự kiện của Supabase tới sau sẽ gộp giỏ này vào tài khoản (switchOwner).
    void switchOwner(null);
    if (!isSupabaseConfigured) {
      useAuthStore.setState({ user: null, ready: true });
      return;
    }
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/supabase/client").then(({ getBrowserSupabase }) => {
      const supabase = getBrowserSupabase();
      if (cancelled || !supabase) return;
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user ?? null;
        useAuthStore.setState({ user, ready: true });
        void switchOwner(user?.id ?? null);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);
  return null;
}
