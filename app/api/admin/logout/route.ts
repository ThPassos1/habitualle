import { NextResponse } from "next/server";

import { adminCookieBase } from "@/lib/admin-session";
import { ADMIN_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieBase, maxAge: 0 });
  return response;
}
