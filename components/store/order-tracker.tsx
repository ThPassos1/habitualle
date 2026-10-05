"use client";

import { FormEvent, useState } from "react";

import { lookupOrders } from "@/app/actions/tracking";
import { StatusBadge } from "@/components/admin/status-badge";
import { StoreImage } from "@/components/store/store-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL, formatDate, maskCpf } from "@/lib/format";
import { slugForStatus } from "@/lib/orders";
import type { TrackedOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

const steps = [
  { slug: "pendente", label: "Pedido recebido" },
  { slug: "pago", label: "Pagamento aprovado" },
  { slug: "processando", label: "Em separação" },
  { slug: "enviado", label: "Enviado" },
  { slug: "entregue", label: "Entregue" },
] as const;

export function OrderTracker({ initialOrderId = "" }: { initialOrderId?: string }) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [pending, setPending] = useState(false);

  async function search(values: { orderId: string; email: string; cpf: string }) {
    setPending(true);
    setMessage(null);
    const result = await lookupOrders({
      orderId: values.orderId,
      email: values.email,
      cpf: values.cpf,
    });
    setPending(false);
    setSearched(true);
    if (!result.ok) {
      setOrders([]);
      setActiveId(null);
      setMessage(result.message);
      return;
    }
    setOrders(result.orders);
    setActiveId(result.orders[0]?.id ?? null);
    if (result.orders.length === 0) {
      setMessage("Não encontramos pedido com esses dados. Confira o número HB, o e-mail ou o CPF.");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search({ orderId, email, cpf });
  }

  const active = orders.find((order) => order.id === activeId) ?? null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.22em] text-sage-700">Rastreio</p>
      <h1 className="mt-3 font-serif text-4xl text-stone-800 md:text-5xl">Onde está a sua casa</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600">
        Informe o número do pedido e o e-mail ou o CPF usados no checkout. Se houver código de
        rastreio, ele aparece junto com o status.
      </p>

      <form onSubmit={onSubmit} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <label>
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-stone-500">
            Número do pedido
          </span>
          <Input
            value={orderId}
            onChange={(event) => setOrderId(event.target.value.toUpperCase())}
            placeholder="HB-123456"
            aria-label="Número do pedido"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-stone-500">E-mail</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            aria-label="E-mail do pedido"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-stone-500">CPF</span>
          <Input
            value={cpf}
            onChange={(event) => setCpf(maskCpf(event.target.value))}
            placeholder="000.000.000-00"
            aria-label="CPF do pedido"
          />
        </label>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Consultando…" : "Consultar"}
        </Button>
      </form>

      {message && (
        <p className="mt-6 text-sm leading-relaxed text-stone-600" role="status">
          {message}
        </p>
      )}

      {orders.length > 1 && (
        <ul className="mt-8 space-y-2">
          {orders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => setActiveId(order.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors duration-300 ease-in-out",
                  order.id === activeId
                    ? "border-stone-800 bg-white text-stone-800"
                    : "border-stone-200 bg-white/60 text-stone-600 hover:border-stone-300",
                )}
              >
                <span>
                  {order.id} · {order.address.city}
                </span>
                <span>{formatDate(order.createdAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {active && <OrderDetail order={active} />}
      {searched && !pending && orders.length === 0 && !message && (
        <p className="mt-6 text-sm text-stone-600">Nenhum pedido encontrado.</p>
      )}
    </div>
  );
}

function OrderDetail({ order }: { order: TrackedOrder }) {
  const current = steps.findIndex((step) => step.slug === slugForStatus(order.status));
  const cancelled = order.status === "Cancelado";
  const posted = order.status === "Enviado" || order.status === "Entregue";

  return (
    <article className="mt-12 border-t border-stone-200 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{formatDate(order.createdAt)}</p>
          <h2 className="mt-2 font-serif text-3xl text-stone-800">{order.id}</h2>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {cancelled ? (
        <p className="mt-8 rounded-lg border border-stone-200 bg-white px-5 py-4 text-sm leading-relaxed text-stone-600">
          Este pedido foi cancelado. Se o pagamento chegou a ser feito, a equipe escreve no e-mail informado.
        </p>
      ) : (
        <ol className="mt-8">
          {steps.map((step, index) => {
            const done = current > index;
            const now = current === index;
            return (
              <li key={step.slug} className="relative flex gap-4 pb-7 last:pb-0">
                {index < steps.length - 1 && (
                  <span className={cn("absolute left-[7px] top-4 h-full w-px", done ? "bg-sage-700" : "bg-stone-200")} />
                )}
                <span
                  className={cn(
                    "relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border",
                    done && "border-sage-700 bg-sage-700",
                    now && "border-terracotta-500 bg-terracotta-500",
                    !done && !now && "border-stone-300 bg-white",
                  )}
                  aria-hidden
                />
                <p className={cn("text-sm", now ? "font-medium text-stone-800" : done ? "text-stone-700" : "text-stone-400")}>
                  {step.label}
                  {now && <span className="sr-only">, etapa atual</span>}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      <section className="mt-8 rounded-lg border border-sage-200 bg-sage-50 p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-sage-700">Código de rastreamento</p>
        {order.trackingCode ? (
          <p className="mt-2 font-serif text-3xl text-stone-800">{order.trackingCode}</p>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {posted
              ? "O pedido já foi postado. O código ainda não foi registrado."
              : "O código aparece aqui quando o pedido for postado."}
          </p>
        )}
      </section>

      <section className="mt-8">
        <h3 className="font-serif text-2xl text-stone-800">Peças</h3>
        <ul className="mt-4 space-y-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-sand-100">
                <StoreImage src={item.image} alt="" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg leading-tight text-stone-800">{item.name}</p>
                <p className="mt-1 text-sm text-stone-600">
                  {item.color} · {item.size} · {item.qty}
                </p>
              </div>
              <p className="text-sm text-stone-800">{formatBRL(item.price * item.qty)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid gap-8 border-t border-stone-200 pt-8 sm:grid-cols-2">
        <div>
          <h3 className="font-serif text-2xl text-stone-800">Entrega</h3>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            {order.customerName}
            <br />
            {order.address.street}, {order.address.number}
            {order.address.complement ? ` · ${order.address.complement}` : ""}
            <br />
            {order.address.neighborhood} · {order.address.city}/{order.address.state}
            <br />
            CEP {order.address.zip}
            <br />
            {order.phone}
          </p>
        </div>
        <div className="space-y-2 text-sm text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatBRL(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Frete</span>
            <span>{order.shipping === 0 ? "Grátis" : formatBRL(order.shipping)}</span>
          </div>
          <div className="flex items-end justify-between pt-2 text-stone-800">
            <span>Total</span>
            <span className="font-serif text-3xl">{formatBRL(order.total)}</span>
          </div>
        </div>
      </section>
    </article>
  );
}
