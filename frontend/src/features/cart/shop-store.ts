"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { toast } from "@/lib/toast";
import type { ProductSummary } from "@/types/product";

/* Giỏ hàng, yêu thích, so sánh. Khách không cần đăng nhập:
   - Khách: sessionStorage "tefal-web:shop:khach" (mất khi đóng tab).
   - Đã đăng nhập: localStorage "tefal-web:shop:<user id>".
   - Đăng nhập/đăng ký: gộp dữ liệu của khách vào tài khoản (switchOwner).
   Chỉ đặt hàng mới cần đăng nhập. Giá trong giỏ là ảnh chụp lúc thêm; server tính lại khi đặt hàng.
   Khi có Supabase: có thể lưu thêm giỏ vào bảng carts để dùng trên nhiều máy. */

export const COMPARE_MAX = 4;
const QTY_MAX = 99;
const KEY = "tefal-web:shop";
const GUEST = "khach";

/** Phần của SP cần để vẽ giỏ, yêu thích, thanh so sánh */
export type ShopItem = Pick<ProductSummary, "id" | "name" | "model" | "href" | "price" | "orig" | "img" | "art" | "origin">;
export interface CartLine extends ShopItem {
  qty: number;
}

interface ShopData {
  cart: CartLine[];
  wish: ShopItem[];
  compare: ShopItem[];
}

interface ShopState extends ShopData {
  add: (item: ShopItem) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clearCart: () => void;
  /** bỏ các món đã đặt hàng (không báo) */
  removeOrdered: (ids: string[]) => void;
  toggleWish: (item: ShopItem) => void;
  toggleCompare: (item: ShopItem) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
}

const empty: ShopData = { cart: [], wish: [], compare: [] };

export function toShopItem(p: ProductSummary | ShopItem): ShopItem {
  return {
    id: p.id,
    name: p.name,
    model: p.model,
    href: p.href,
    price: p.price,
    orig: p.orig,
    img: p.img,
    art: p.art,
    origin: p.origin,
  };
}

/* ---------- nơi lưu theo chủ sở hữu (khách hoặc user id) ---------- */
let owner: string | null = null;
const memory = new Map<string, string>(); // trình duyệt chặn lưu trữ thì giữ trong bộ nhớ

function area(forOwner: string | null): Storage | null {
  try {
    return forOwner ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}
function keyOf(forOwner: string | null) {
  return `${KEY}:${forOwner ?? GUEST}`;
}
function read(forOwner: string | null): string | null {
  const k = keyOf(forOwner);
  try {
    return area(forOwner)?.getItem(k) ?? memory.get(k) ?? null;
  } catch {
    return memory.get(k) ?? null;
  }
}
function write(forOwner: string | null, value: string) {
  const k = keyOf(forOwner);
  memory.set(k, value);
  try {
    area(forOwner)?.setItem(k, value);
  } catch {
    /* hết chỗ hoặc bị chặn: vẫn còn bản trong bộ nhớ */
  }
}
function drop(forOwner: string | null) {
  const k = keyOf(forOwner);
  memory.delete(k);
  try {
    area(forOwner)?.removeItem(k);
  } catch {
    /* bỏ qua */
  }
}

// Không ghi khi chưa nạp lần đầu hoặc đang đổi chủ sở hữu: trạng thái rỗng tạm thời sẽ đè lên dữ liệu đã lưu
// (vd bấm "Thêm vào giỏ" ngay khi trang vừa tải, lúc giỏ cũ chưa nạp xong)
let paused = true;

const ownerStorage: StateStorage = {
  getItem: () => read(owner),
  setItem: (_name, value) => {
    if (!paused) write(owner, value);
  },
  removeItem: () => drop(owner),
};

function parse(raw: string | null): ShopData {
  try {
    const s = raw ? JSON.parse(raw)?.state : null;
    return {
      cart: Array.isArray(s?.cart) ? s.cart : [],
      wish: Array.isArray(s?.wish) ? s.wish : [],
      compare: Array.isArray(s?.compare) ? s.compare : [],
    };
  } catch {
    return { ...empty };
  }
}

export function mergeShop(into: ShopData, from: ShopData): ShopData {
  const cart = into.cart.map((x) => ({ ...x }));
  for (const x of from.cart) {
    const it = cart.find((y) => y.id === x.id);
    if (it) it.qty = Math.min(QTY_MAX, it.qty + x.qty);
    else cart.push(x);
  }
  const uniq = (a: ShopItem[], b: ShopItem[]) => [...a, ...b.filter((x) => !a.some((y) => y.id === x.id))];
  return { cart, wish: uniq(into.wish, from.wish), compare: uniq(into.compare, from.compare).slice(0, COMPARE_MAX) };
}

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      ...empty,
      add: (item) => {
        const cart = get().cart.map((x) => ({ ...x }));
        const it = cart.find((x) => x.id === item.id);
        if (it) it.qty = Math.min(QTY_MAX, it.qty + 1);
        else cart.push({ ...toShopItem(item), qty: 1 });
        set({ cart });
        toast("Đã thêm vào giỏ: " + item.name);
      },
      setQty: (id, qty) =>
        set({ cart: get().cart.map((x) => (x.id === id ? { ...x, qty: Math.min(QTY_MAX, Math.max(1, qty)) } : x)) }),
      remove: (id) => {
        const it = get().cart.find((x) => x.id === id);
        set({ cart: get().cart.filter((x) => x.id !== id) });
        if (it) toast("Đã bỏ khỏi giỏ: " + it.name);
      },
      clearCart: () => set({ cart: [] }),
      removeOrdered: (ids) => set({ cart: get().cart.filter((x) => !ids.includes(x.id)) }),
      toggleWish: (item) => {
        const on = !get().wish.some((x) => x.id === item.id);
        set({ wish: on ? [...get().wish, toShopItem(item)] : get().wish.filter((x) => x.id !== item.id) });
        toast((on ? "Đã thêm vào yêu thích: " : "Đã bỏ khỏi yêu thích: ") + item.name);
      },
      toggleCompare: (item) => {
        const list = get().compare;
        if (list.some((x) => x.id === item.id)) {
          set({ compare: list.filter((x) => x.id !== item.id) });
          toast("Đã bỏ khỏi so sánh: " + item.name);
          return;
        }
        if (list.length >= COMPARE_MAX) {
          toast(`Chỉ so sánh được ${COMPARE_MAX} mẫu cùng lúc. Bỏ bớt một mẫu trước.`);
          return;
        }
        set({ compare: [...list, toShopItem(item)] });
        toast(`Đã thêm vào so sánh (${list.length + 1}/${COMPARE_MAX}): ${item.name}`);
      },
      removeCompare: (id) => set({ compare: get().compare.filter((x) => x.id !== id) }),
      clearCompare: () => set({ compare: [] }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => ownerStorage),
      partialize: (s) => ({ cart: s.cart, wish: s.wish, compare: s.compare }),
      // Nạp sau khi trang đã hiện (ShopProvider) để HTML server và trình duyệt khớp nhau
      skipHydration: true,
    },
  ),
);

/** true khi đã nạp xong giỏ từ nơi lưu (trước đó đừng kết luận "giỏ trống") */
export function useShopHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useShop.persist.onFinishHydration(cb),
    () => useShop.persist.hasHydrated(),
    () => false,
  );
}

/** Tab khác (cùng chủ sở hữu) đổi giỏ thì nạp lại, để tab này không ghi đè giỏ của tab kia.
 *  Chỉ localStorage (đã đăng nhập) mới chung giữa các tab; sessionStorage của khách là riêng từng tab. */
export function listenOtherTabs(): () => void {
  function onStorage(e: StorageEvent) {
    if (e.key === keyOf(owner) && useShop.persist.hasHydrated()) void useShop.persist.rehydrate();
  }
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

/** Đổi chủ sở hữu khi đăng nhập/đăng xuất.
 *  Khách → tài khoản: gộp danh sách của khách vào tài khoản.
 *  Tài khoản → khách (đã đăng xuất xong): xóa giỏ của tài khoản khỏi máy này, máy dùng chung không lộ cho người sau.
 *  TODO: lưu giỏ vào bảng carts trên Supabase để đăng xuất không mất giỏ. */
export async function switchOwner(next: string | null) {
  if (next === owner && useShop.persist.hasHydrated()) return;
  if (owner && !next) drop(owner);
  if (next && !owner) {
    const guest = parse(read(null));
    if (guest.cart.length || guest.wish.length || guest.compare.length) {
      const merged = mergeShop(parse(read(next)), guest);
      write(next, JSON.stringify({ state: merged, version: 0 }));
      drop(null);
    }
  }
  owner = next;
  paused = true;
  useShop.setState({ ...empty });
  await useShop.persist.rehydrate();
  paused = false;
}
