export type LocalPaymentState = {
  status: "pendente" | "confirmado" | "cancelado";
  totalCents: number;
  paymentId: string | null;
};

export type RemotePaymentState = {
  id: string;
  orderId: string;
  amountCents: number | null;
  currency: string | null;
  outcome: "approved" | "pending" | "rejected" | "unknown";
};

export type PaymentDecision = "ignore" | "mark_paid" | "remember" | "release";

export function decidePaymentSync(local: LocalPaymentState, remote: RemotePaymentState, expectedOrderId: string): PaymentDecision {
  if (remote.orderId !== expectedOrderId) return "ignore";
  if (!remote.id || (local.paymentId && local.paymentId !== remote.id)) return "ignore";
  if (remote.amountCents == null || remote.amountCents !== local.totalCents) return "ignore";
  if (remote.currency && remote.currency.toUpperCase() !== "BRL") return "ignore";
  if (local.status !== "pendente") return "ignore";
  if (remote.outcome === "approved") return "mark_paid";
  if (remote.outcome === "rejected") return "release";
  if (remote.outcome === "pending") return "remember";
  return "ignore";
}
