import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/routes";
import { getServerSupabase } from "@/lib/supabase/server";

/** Supabase quay về đây sau khi đăng nhập Google hoặc bấm liên kết xác nhận email: đổi mã lấy phiên. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("tiep"), "/tai-khoan");
  const supabase = await getServerSupabase();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/dang-nhap?loi=xac-thuc", url.origin));
}
