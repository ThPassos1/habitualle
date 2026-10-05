"use server";

import { headers } from "next/headers";

import { clientKey, rateLimit } from "@/lib/rate-limit";
import { lookupTrackedOrders } from "@/lib/orders/queries";

export async function lookupOrders(input: { orderId?: string; email?: string; cpf?: string }) {
  if (!rateLimit(`lookup:${clientKey(headers())}`, 20, 15 * 60 * 1000)) {
    return { ok: false as const, message: "Muitas consultas. Espere um pouco e tente de novo." };
  }
  return lookupTrackedOrders(input, { ownerCheck: true });
}
