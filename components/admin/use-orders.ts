"use client";

import { useEffect, useState } from "react";

import { loadAdminOrders, saveAdminOrder } from "@/app/actions/admin-orders";
import type { Order, OrderStatus } from "@/lib/types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadAdminOrders().then((result) => {
      if (!active) return;
      if (result.ok) {
        setOrders(result.orders);
        setError(null);
      } else {
        setError(result.message);
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    const result = await saveAdminOrder({ id, status });
    if (!result.ok) return result.message;
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
    return null;
  }

  async function saveTracking(id: string, trackingCode: string) {
    const result = await saveAdminOrder({ id, trackingCode });
    if (!result.ok) return result.message;
    const nextCode = trackingCode.trim().toUpperCase().replace(/\s+/g, "") || null;
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, trackingCode: nextCode } : order)),
    );
    return null;
  }

  return { orders, ready, error, updateStatus, saveTracking };
}
