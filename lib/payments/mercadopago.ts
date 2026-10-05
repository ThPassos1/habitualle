import "server-only";

import { MercadoPagoConfig, Order, Payment } from "mercadopago";
import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import type { PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";
import type { CreateOrderRequest } from "mercadopago/dist/clients/order/create/types";
import type { OrderResponse } from "mercadopago/dist/clients/order/commonTypes";

export function mercadoPagoConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY && process.env.MERCADO_PAGO_ACCESS_TOKEN);
}

function client() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) return null;
  return new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
}

export async function createMercadoPagoPayment(
  body: PaymentCreateRequest,
  idempotencyKey: string,
): Promise<PaymentResponse> {
  const config = client();
  if (!config) throw new Error("Mercado Pago sem access token.");
  const payment = new Payment(config);
  return payment.create({ body, requestOptions: { idempotencyKey } });
}

export class MercadoPagoUnavailable extends Error {}

export async function createMercadoPagoOrder(body: CreateOrderRequest, idempotencyKey: string): Promise<OrderResponse> {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Mercado Pago sem access token.");
  let response: Response;
  try {
    response = await fetch("https://api.mercadopago.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
    });
  } catch {
    throw new MercadoPagoUnavailable("Mercado Pago indisponível");
  }
  const payload = (await response.json().catch(() => ({}))) as OrderResponse & {
    message?: string;
    errors?: { code?: string; message?: string; details?: string[] }[];
  };
  if (!response.ok) {
    const details = (payload.errors ?? []).flatMap((item) => {
      const head = [item.code, item.message].filter(Boolean).join(" ");
      return [head, ...(item.details ?? [])].filter(Boolean);
    });
    console.error("Mercado Pago order", response.status, details.join(" | ") || payload.message || "erro");
    if (payload.id) return payload;
    if (response.status === 408 || response.status === 409 || response.status === 423 || response.status === 429 || response.status >= 500) {
      throw new MercadoPagoUnavailable("Mercado Pago indisponível");
    }
    throw new Error(details.join(" | ") || payload.message || "Mercado Pago");
  }
  return payload;
}

export async function fetchMercadoPagoOrder(id: string): Promise<OrderResponse | null> {
  const config = client();
  if (!config || !/^[\w-]{8,80}$/.test(id)) return null;
  const order = new Order(config);
  return order.get({ id });
}

export async function fetchMercadoPagoPayment(id: string): Promise<PaymentResponse | null> {
  const config = client();
  if (!config || !/^\d{1,40}$/.test(id)) return null;
  const payment = new Payment(config);
  return payment.get({ id });
}

export { webhookUrl } from "./webhook-url";
