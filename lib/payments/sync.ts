import "server-only";

import type { OrderResponse } from "mercadopago/dist/clients/order/commonTypes";
import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";

import type { Order } from "@/lib/types";

import { decidePaymentSync, type PaymentDecision, type RemotePaymentState } from "./decision";
import { getCheckoutOrder, releasePendingOrder, saveOrderPayment } from "@/lib/orders/queries";

function cents(value: number | string | null | undefined) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export type PaymentOutcome = "approved" | "pending" | "rejected" | "ignored";

function localState(order: Order) {
  const status = order.status === "Pendente" ? "pendente" : order.status === "Cancelado" ? "cancelado" : "confirmado";
  return {
    status,
    totalCents: cents(order.total) ?? -1,
    paymentId: order.paymentId ?? null,
  } as const;
}

async function applyDecision(orderId: string, paymentId: string, paymentStatus: string, decision: PaymentDecision): Promise<PaymentOutcome> {
  if (decision === "ignore") return "ignored";
  if (decision === "mark_paid") {
    const saved = await saveOrderPayment({ orderId, paymentId, paymentStatus: "approved", markPaid: true });
    return saved.ok ? "approved" : "pending";
  }
  if (decision === "release") {
    await saveOrderPayment({ orderId, paymentId, paymentStatus, markPaid: false });
    await releasePendingOrder(orderId, paymentStatus);
    return "rejected";
  }
  await saveOrderPayment({ orderId, paymentId, paymentStatus, markPaid: false });
  return "pending";
}

export async function syncPayment(payment: PaymentResponse): Promise<PaymentOutcome> {
  const paymentId = payment.id == null ? "" : String(payment.id);
  const orderId = payment.external_reference?.trim().toUpperCase() ?? "";
  const status = payment.status ?? "";
  if (!/^\d{1,40}$/.test(paymentId) || !/^HB-\d{6}$/.test(orderId)) return "ignored";

  const order = await getCheckoutOrder(orderId);
  if (!order) return "ignored";

  const outcome: RemotePaymentState["outcome"] =
    status === "approved" ? "approved" : status === "rejected" || status === "cancelled" ? "rejected" : status === "pending" || status === "in_process" || status === "authorized" ? "pending" : "unknown";

  const decision = decidePaymentSync(
    localState(order),
    {
      id: paymentId,
      orderId,
      amountCents: cents(payment.transaction_amount),
      currency: payment.currency_id ?? null,
      outcome,
    },
    orderId,
  );
  return applyDecision(orderId, paymentId, status || "pending", decision);
}

function orderPaymentStatus(mpOrder: OrderResponse) {
  const payment = mpOrder.transactions?.payments?.[0];
  const raw = (payment?.status || mpOrder.status || "").toLowerCase();
  const detail = (payment?.status_detail || mpOrder.status_detail || "").toLowerCase();
  if (detail === "accredited" || raw === "approved") return "approved";
  if (raw === "processed" && !detail.startsWith("cc_rejected") && !detail.startsWith("rejected")) return "approved";
  if (raw === "action_required" || mpOrder.status === "action_required") return "pending";
  if (raw === "pending" || raw === "in_process" || raw === "authorized") return raw;
  if (
    raw === "failed" ||
    raw === "rejected" ||
    raw === "cancelled" ||
    raw === "canceled" ||
    raw === "expired" ||
    detail.startsWith("cc_rejected") ||
    detail.startsWith("rejected")
  ) {
    return "rejected";
  }
  return raw;
}

export async function syncOrder(mpOrder: OrderResponse): Promise<PaymentOutcome> {
  const mpOrderId = mpOrder.id?.trim() ?? "";
  const orderId = mpOrder.external_reference?.trim().toUpperCase() ?? "";
  const status = orderPaymentStatus(mpOrder);
  const payment = mpOrder.transactions?.payments?.[0];
  if (!/^[\w-]{8,80}$/.test(mpOrderId) || !/^HB-\d{6}$/.test(orderId)) return "ignored";

  const order = await getCheckoutOrder(orderId);
  if (!order) return "ignored";

  const outcome: RemotePaymentState["outcome"] =
    status === "approved" || status === "accredited"
      ? "approved"
      : status === "rejected"
        ? "rejected"
        : status === "pending" || status === "in_process" || status === "authorized" || status === "action_required"
          ? "pending"
          : "unknown";

  const decision = decidePaymentSync(
    localState(order),
    {
      id: mpOrderId,
      orderId,
      amountCents: cents(payment?.amount ?? mpOrder.total_amount),
      currency: mpOrder.currency ?? null,
      outcome,
    },
    orderId,
  );
  return applyDecision(orderId, mpOrderId, status || "pending", decision);
}
