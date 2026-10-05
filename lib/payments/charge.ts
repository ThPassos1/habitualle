import "server-only";

import type { CreateOrderRequest, PaymentMethodRequest } from "mercadopago/dist/clients/order/create/types";

import { normalizeAttemptKey } from "@/lib/checkout/attempt-key";
import { onlyDigits } from "@/lib/format";
import { getCheckoutOrder, placeOrder, releasePendingOrder, type CheckoutLineInput } from "@/lib/orders/queries";
import type { Customer, Order } from "@/lib/types";

import { adminConfigured } from "@/lib/admin-credentials";
import { signOrderView } from "@/lib/admin-session";

import { paymentFailureMessage } from "./copy";
import { MercadoPagoUnavailable, createMercadoPagoOrder, mercadoPagoConfigured, webhookUrl } from "./mercadopago";
import { syncOrder } from "./sync";

type BrickForm = {
  token?: string;
  paymentMethodId: string;
  paymentType: string;
  transactionAmount: number;
  installments: number;
  identification?: string;
};

type ChargeResult =
  | { ok: true; orderId: string; paymentId: string; viewToken: string; status: "approved" | "pending" }
  | { ok: false; message: string; status?: "rejected" | "error"; closed?: boolean };

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readCustomer(value: unknown): Customer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  return {
    name: text(row.name),
    email: text(row.email),
    cpf: text(row.cpf),
    street: text(row.street),
    number: text(row.number),
    complement: text(row.complement),
    neighborhood: text(row.neighborhood),
    city: text(row.city),
    state: text(row.state),
    zip: text(row.zip),
    phone: text(row.phone),
  };
}

function readLines(value: unknown): CheckoutLineInput[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 20) return null;
  const lines: CheckoutLineInput[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const row = entry as Record<string, unknown>;
    const qty = typeof row.qty === "number" ? row.qty : Number(row.qty);
    const productId = text(row.productId);
    const color = text(row.color);
    const size = text(row.size);
    if (!productId || !color || !size || !Number.isFinite(qty)) return null;
    lines.push({ productId, color, size, qty });
  }
  return lines;
}

function readBrick(value: unknown): BrickForm | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const paymentMethodId = text(row.payment_method_id).toLowerCase();
  const transactionAmount = Number(row.transaction_amount);
  const installments = row.installments == null ? 1 : Number(row.installments);
  if (!/^[a-z0-9_]{1,30}$/.test(paymentMethodId)) return null;
  if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) return null;
  if (!Number.isInteger(installments) || installments < 1 || installments > 10) return null;

  const token = text(row.token).trim();
  const offline = paymentMethodId === "pix" || paymentMethodId === "pec" || paymentMethodId.startsWith("bol");
  if (!offline && !/^[A-Za-z0-9_-]{8,256}$/.test(token)) return null;

  const payer = row.payer;
  let identification: string | undefined;
  if (payer && typeof payer === "object") {
    const document = (payer as { identification?: { number?: unknown } }).identification?.number;
    const digits = onlyDigits(text(document));
    if (digits.length === 11) identification = digits;
  }

  return {
    token: token || undefined,
    paymentMethodId,
    paymentType: "",
    transactionAmount,
    installments,
    identification,
  };
}

function methodType(id: string, hinted: string) {
  if (hinted === "creditcard") return "credit_card";
  if (hinted === "debitcard") return "debit_card";
  if (hinted === "prepaidcard") return "prepaid_card";
  if (hinted === "ticket" || hinted === "bank_transfer") return hinted;
  if (id === "pix") return "bank_transfer";
  if (id === "pec" || id.startsWith("bol")) return "ticket";
  if (id.startsWith("deb")) return "debit_card";
  return "credit_card";
}

function mercadoPagoCause(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const row = error as { message?: string; causes?: { code?: string | number; description?: string }[] };
  const causes = (row.causes ?? []).map((cause) => `${cause.code ?? ""}:${cause.description ?? ""}`).join("; ");
  console.error("Mercado Pago", row.message ?? "erro", causes);
  return `${row.message ?? ""} ${causes}`;
}

function buyerMessage(error: unknown) {
  const detail = mercadoPagoCause(error);
  if (/invalid_card_token|invalid_token/i.test(detail)) {
    return "O cartão não foi aceito. Confira o número, a validade, o CVV e o nome do titular.";
  }
  return "Não foi possível falar com o Mercado Pago. Tente de novo.";
}

function cents(value: number) {
  return Math.round(value * 100);
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "Cliente";
  const last = parts.slice(1).join(" ") || first;
  return { first, last };
}

export async function chargeCheckout(body: unknown): Promise<ChargeResult> {
  if (!mercadoPagoConfigured() || !adminConfigured()) {
    return { ok: false, message: "O pagamento está temporariamente indisponível." };
  }
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Não foi possível ler o pagamento." };
  }

  const payload = body as Record<string, unknown>;
  const attemptKey = normalizeAttemptKey(payload.attemptId);
  if (!attemptKey) return { ok: false, message: "Atualize a página e tente o pagamento de novo." };
  const customer = readCustomer(payload.customer);
  const lines = readLines(payload.lines);
  const brick = readBrick(payload.formData);
  if (brick) brick.paymentType = text(payload.paymentType).toLowerCase();
  if (!customer || !lines || !brick) {
    return { ok: false, message: "Confira os dados do pagamento e tente de novo." };
  }

  const placed = await placeOrder({ customer, lines, attemptKey });
  if (!placed.ok) return placed;

  const order = await getCheckoutOrder(placed.orderId);
  if (!order) {
    return { ok: false, message: "Não foi possível abrir o pedido. Tente de novo." };
  }

  const resumed = await resumeAttempt(order);
  if (resumed) return resumed;

  if (cents(order.total) !== cents(brick.transactionAmount)) {
    if (!order.paymentId) {
      await releasePendingOrder(order.id, "amount_mismatch");
      return { ok: false, status: "rejected", closed: true, message: "Atualize a página. O valor do pedido mudou." };
    }
    return { ok: false, message: "Atualize a página. O valor do pedido mudou." };
  }

  const { first, last } = splitName(order.customer.name);
  const phoneDigits = onlyDigits(order.customer.phone);
  const cpf = brick.identification ?? onlyDigits(order.customer.cpf);
  const items = order.items.map((item) => ({
    id: item.productId,
    title: item.name.slice(0, 120),
    description: `${item.color} · ${item.size}`.slice(0, 180),
    quantity: item.qty,
    unit_price: item.price,
    currency_id: "BRL",
  }));
  if (order.shipping > 0) {
    items.push({
      id: "frete",
      title: "Frete",
      description: "Entrega",
      quantity: 1,
      unit_price: order.shipping,
      currency_id: "BRL",
    });
  }

  const notification = webhookUrl();
  const type = methodType(brick.paymentMethodId, brick.paymentType);
  const offline = type === "bank_transfer" || type === "ticket";
  const card = type === "credit_card" || type === "debit_card" || type === "prepaid_card";
  const paymentMethod: PaymentMethodRequest = {
    id: brick.paymentMethodId,
    type,
    token: offline ? undefined : brick.token,
    installments: type === "credit_card" ? brick.installments : undefined,
    statement_descriptor: card ? "HABITUALLE" : undefined,
  };
  const requestBody: CreateOrderRequest = {
    type: "online",
    processing_mode: "automatic",
    capture_mode: card ? "automatic" : undefined,
    currency: "BRL",
    total_amount: order.total.toFixed(2),
    external_reference: order.id,
    description: `Habitualle ${order.id}`,
    payer: {
      email: order.customer.email,
      first_name: first,
      last_name: last,
      identification: { type: "CPF", number: cpf },
      phone: phoneDigits.length >= 10 ? { area_code: phoneDigits.slice(0, 2), number: phoneDigits.slice(2) } : undefined,
      address: {
        zip_code: onlyDigits(order.customer.zip),
        street_name: order.customer.street,
        street_number: order.customer.number,
        neighborhood: order.customer.neighborhood,
        city: order.customer.city,
        state: order.customer.state,
      },
    },
    items: items.map((item) => ({
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price.toFixed(2),
      external_code: item.id,
    })),
    transactions: {
      payments: [
        {
          amount: order.total.toFixed(2),
          expiration_time: brick.paymentMethodId === "pix" ? "PT30M" : offline ? "P3D" : undefined,
          payment_method: paymentMethod,
        },
      ],
    },
    config: notification ? { online: { callback_url: notification } } : undefined,
  };

  try {
    const created = await createMercadoPagoOrder(requestBody, attemptKey);
    const outcome = await syncOrder(created);
    const screenId = created.transactions?.payments?.[0]?.id || created.id || "";
    if (!created.id || outcome === "ignored") {
      return {
        ok: false,
        status: "error",
        message: "Não foi possível confirmar o pagamento. Toque em pagar de novo, sem mudar os dados.",
      };
    }
    const viewToken = await signOrderView(order.id);
    if (outcome === "approved") return { ok: true, orderId: order.id, paymentId: screenId, viewToken, status: "approved" };
    if (outcome === "pending") return { ok: true, orderId: order.id, paymentId: screenId, viewToken, status: "pending" };
    return {
      ok: false,
      status: "rejected",
      message: paymentFailureMessage(created.transactions?.payments?.[0]?.status_detail),
    };
  } catch (error) {
    if (error instanceof MercadoPagoUnavailable) {
      return {
        ok: false,
        status: "error",
        message: "Não foi possível confirmar com o Mercado Pago. Toque em pagar de novo, sem mudar os dados.",
      };
    }
    await releasePendingOrder(order.id, "error");
    return { ok: false, message: buyerMessage(error) };
  }
}

async function resumeAttempt(order: Order): Promise<ChargeResult | null> {
  const viewToken = await signOrderView(order.id);
  if (order.status !== "Pendente" && order.status !== "Cancelado") {
    if (!viewToken || !order.paymentId) return { ok: false, message: "Esse pedido já foi pago." };
    return { ok: true, orderId: order.id, paymentId: order.paymentId, viewToken, status: "approved" };
  }
  if (!viewToken || !order.paymentId) {
    if (order.status === "Cancelado") {
      return {
        ok: false,
        status: "rejected",
        closed: true,
        message: "Essa tentativa já foi encerrada. Toque em pagar de novo.",
      };
    }
    return null;
  }

  if (order.paymentStatus === "approved") {
    return { ok: true, orderId: order.id, paymentId: order.paymentId, viewToken, status: "approved" };
  }
  if (order.status === "Cancelado" || ["rejected", "cancelled", "canceled", "failed"].includes(order.paymentStatus ?? "")) {
    if (order.status !== "Cancelado") await releasePendingOrder(order.id, order.paymentStatus ?? "rejected");
    return {
      ok: false,
      status: "rejected",
      closed: true,
      message: "Essa tentativa já foi encerrada. Toque em pagar de novo.",
    };
  }
  if (order.status === "Pendente") {
    return { ok: true, orderId: order.id, paymentId: order.paymentId, viewToken, status: "pending" };
  }
  return { ok: true, orderId: order.id, paymentId: order.paymentId, viewToken, status: "approved" };
}
