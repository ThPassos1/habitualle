import { NextResponse } from "next/server";

import { adminCredentialsValid, adminConfigured } from "@/lib/admin-credentials";
import { adminCookieBase, signAdminSession } from "@/lib/admin-session";
import { ADMIN_COOKIE } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`login:${clientKey(request.headers)}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json({ message: "Muitas tentativas. Espere um pouco e tente de novo." }, { status: 429 });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ message: "O acesso da equipe não está configurado." }, { status: 503 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (email.length > 160 || password.length > 200 || !(await adminCredentialsValid(email, password))) {
    return NextResponse.json({ message: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const token = await signAdminSession();
  if (!token) {
    return NextResponse.json({ message: "O acesso da equipe não está configurado." }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, { ...adminCookieBase, maxAge: 60 * 60 * 12 });
  return response;
}
