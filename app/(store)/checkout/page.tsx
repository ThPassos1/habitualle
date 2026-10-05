import type { Metadata } from "next";

import { CheckoutView } from "@/components/store/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize o pedido Habitualle com os dados de entrega.",
};

export default function CheckoutPage() {
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? "";
  const paymentsReady = Boolean(publicKey && process.env.MERCADO_PAGO_ACCESS_TOKEN);
  return <CheckoutView publicKey={publicKey} paymentsReady={paymentsReady} />;
}
