import { NextResponse } from "next/server";

import { chargeCheckout } from "@/lib/payments/charge";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(`pay:${clientKey(request.headers)}`, 30, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: false, message: "Muitas tentativas de pagamento. Espere um pouco." }, { status: 429 });
  }
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Não foi possível ler o pagamento." }, { status: 400 });
  }

  const result = await chargeCheckout(body);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
