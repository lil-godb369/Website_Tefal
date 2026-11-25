import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/** Làm mới phiên đăng nhập Supabase ở mỗi yêu cầu (cookie hết hạn thì đổi token mới). */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;
  // Khách chưa đăng nhập (không có cookie phiên sb-…): không gọi Supabase Auth, trang dựng sẵn trả ngay
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });
  // Không chèn mã giữa createServerClient và getUser: dễ làm người dùng bị đăng xuất ngẫu nhiên
  await supabase.auth.getUser();
  return response;
}
