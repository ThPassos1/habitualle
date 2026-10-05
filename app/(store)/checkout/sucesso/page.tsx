import type { Metadata } from "next";
import Link from "next/link";

import { PaymentApproved } from "@/components/store/payment-approved";
import { Button } from "@/components/ui/button";
import { orderViewValid } from "@/lib/admin-session";
import { formatBRL } from "@/lib/format";
import { getTrackedOrder } from "@/lib/orders/queries";

export const metadata: Metadata = {
  title: "Pedido recebido",
  description: "O pedido Habitualle foi registrado.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; t?: string };
}) {
  const orderId = searchParams.order?.trim() ?? "";
  const allowed = orderId ? await orderViewValid(orderId, searchParams.t ?? "") : false;
  const result = allowed ? await getTrackedOrder(orderId) : null;
  const order = result && result.ok ? result.order : null;
  const href = orderId ? `/rastreio?pedido=${encodeURIComponent(order?.id ?? orderId)}` : "/rastreio";
  const paid = order?.status === "Pago";
  const waiting = order?.status === "Pendente";

  if (order && paid) {
    return <PaymentApproved orderId={order.id} total={formatBRL(order.total)} href={href} />;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-[11px] uppercase tracking-[0.22em] text-sage-700">
        {waiting ? "Pagamento em confirmação" : order ? "Pedido recebido" : "Rastreio"}
      </p>
      <h1 className="mt-3 font-serif text-4xl text-stone-800 md:text-5xl">
        {waiting ? "Estamos confirmando o pagamento." : order ? "A casa já está no caminho." : "Acompanhe com o e-mail ou o CPF."}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-stone-600">
        {order && waiting
          ? `O pedido ${order.id} está reservado, no total de ${formatBRL(order.total)}. Assim que o Pix ou o boleto compensar, o status muda para pago.`
          : order
            ? `O pedido ${order.id} está como ${order.status.toLowerCase()}, no total de ${formatBRL(order.total)}.`
            : orderId
              ? `O número informado é ${orderId}. No rastreio, use esse número junto com o e-mail ou o CPF do pedido.`
              : "Quando o checkout terminar, o número HB fica nesta página para você acompanhar."}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={href}>Acompanhar pedido</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/colecao">Continuar na coleção</Link>
        </Button>
      </div>
    </div>
  );
}
