import type { Metadata } from "next";

import { OrderTracker } from "@/components/store/order-tracker";

export const metadata: Metadata = {
  title: "Acompanhar pedido",
  description: "Consulte o status e o código de rastreio do pedido Habitualle.",
};

export default function TrackingPage({ searchParams }: { searchParams: { pedido?: string } }) {
  return <OrderTracker initialOrderId={searchParams.pedido ?? ""} />;
}
