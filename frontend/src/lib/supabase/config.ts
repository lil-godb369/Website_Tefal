/** Supabase riêng của Tefal Web. Chưa điền .env.local thì web vẫn chạy, chỉ tắt đăng nhập và đặt hàng. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
