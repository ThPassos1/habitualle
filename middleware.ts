import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { adminSessionValid } from "@/lib/admin-session";
import { ADMIN_COOKIE } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = await adminSessionValid(request.cookies.get(ADMIN_COOKIE)?.value);
  const isLogin = pathname === "/admin/login";

  if (pathname.startsWith("/admin") && !isLogin && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isLogin && isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
