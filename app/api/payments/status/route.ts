import { NextResponse } from "next/server";

import { orderViewValid } from "@/lib/admin-session";
import { slugForStatus } from "@/lib/orders";
import { getCheckoutOrder } from "@/lib/orders/queries";
import { fetchMercadoPagoOrder, fetchMercadoPagoPayment } from "@/lib/payments/mercadopago";
import { syncOrder, syncPayment } from "@/lib/payments/sync";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!rateLimit(`status:${clientKey(request.headers)}`, 240, 10 * 60 * 1000)) {
    return NextResponse.json({ status: null }, { status: 429 });
  }
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order") ?? "";
  if (!(await orderViewValid(orderId, url.searchParams.get("t") ?? ""))) {
    return NextResponse.json({ status: null }, { status: 404 });
  }
  const order = await getCheckoutOrder(orderId);
  if (!order) return NextResponse.json({ status: null }, { status: 404 });

  if (order.status === "Pendente" && order.paymentId) {
    if (/^\d{1,40}$/.test(order.paymentId)) {
      const payment = await fetchMercadoPagoPayment(order.paymentId);
      if (payment) await syncPayment(payment);
    } else {
      const mpOrder = await fetchMercadoPagoOrder(order.paymentId);
      if (mpOrder) await syncOrder(mpOrder);
    }
    const fresh = await getCheckoutOrder(order.id);
    return NextResponse.json({ status: fresh ? slugForStatus(fresh.status) : slugForStatus(order.status) });
  }

  return NextResponse.json({ status: slugForStatus(order.status) });
}
