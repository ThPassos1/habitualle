"use server";

import { listAdminOrders, updateAdminOrder } from "@/lib/orders/queries";
import type { OrderStatus } from "@/lib/types";

export async function loadAdminOrders() {
  return listAdminOrders();
}

export async function saveAdminOrder(input: { id: string; status?: OrderStatus; trackingCode?: string }) {
  return updateAdminOrder(input);
}
