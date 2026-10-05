import { NextResponse } from "next/server";

import { fetchMercadoPagoOrder, fetchMercadoPagoPayment } from "@/lib/payments/mercadopago";
import { webhookSignatureValid } from "@/lib/payments/signature";
import { syncOrder, syncPayment } from "@/lib/payments/sync";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(`webhook:${clientKey(request.headers)}`, 60, 60 * 1000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  const url = new URL(request.url);
  const queryId = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "";
  let body: { type?: string; topic?: string; data?: { id?: string | number } } | null = null;
  try {
    body = (await request.json()) as { type?: string; topic?: string; data?: { id?: string | number } };
  } catch {
    body = null;
  }

  const topic = body?.type ?? body?.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";
  if (topic && topic !== "payment" && topic !== "order") return NextResponse.json({ ok: true });

  const dataId = String(queryId || body?.data?.id || "");
  if (!/^[\w-]{1,80}$/.test(dataId)) return NextResponse.json({ ok: true });
  if (!webhookSignatureValid(request, queryId || dataId)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (topic === "order" || !/^\d{1,40}$/.test(dataId)) {
    const order = await fetchMercadoPagoOrder(dataId);
    if (order) await syncOrder(order);
    return NextResponse.json({ ok: true });
  }

  const payment = await fetchMercadoPagoPayment(dataId);
  if (payment) await syncPayment(payment);
  return NextResponse.json({ ok: true });
}
