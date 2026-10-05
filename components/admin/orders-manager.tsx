"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { ShippingCard } from "@/components/admin/shipping-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { useOrders } from "@/components/admin/use-orders";
import { StoreImage } from "@/components/store/store-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL, formatDate } from "@/lib/format";
import { paymentStatusLabel } from "@/lib/payments/copy";
import { orderStatuses, slugForStatus, statusFromSlug } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OrdersManager() {
  const { orders, ready, error, updateStatus, saveTracking } = useOrders();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [trackingDraft, setTrackingDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftFor, setDraftFor] = useState<string | null>(null);
  const statusFilter = statusFromSlug(searchParams.get("status"));
  const selectedId = searchParams.get("pedido");
  const selected = orders.find((order) => order.id === selectedId) ?? null;
  const openId = selected?.id ?? null;

  if (openId !== draftFor) {
    setDraftFor(openId);
    setTrackingDraft(selected?.trackingCode ?? "");
    setNotice(null);
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      const haystack = `${order.id} ${order.customer.name} ${order.customer.cpf}`.toLowerCase();
      const matchesQuery = term ? haystack.includes(term) : true;
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  function replaceParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const next = params.toString();
    router.replace(next ? `/admin/pedidos?${next}` : "/admin/pedidos", { scroll: false });
  }

  function openOrder(id: string) {
    replaceParams((params) => params.set("pedido", id));
  }

  function closeOrder() {
    replaceParams((params) => params.delete("pedido"));
  }

  return (
    <>
      <AdminHeader
        title="Pedidos"
        description="Abra um pedido, confira a variante e copie o endereço completo para o fornecedor."
      />
      <div className="space-y-5 px-4 py-6 md:px-10 md:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip active={!statusFilter} onClick={() => replaceParams((params) => params.delete("status"))}>
              Todos
            </FilterChip>
            {orderStatuses.map((status) => (
              <FilterChip
                key={status}
                active={statusFilter === status}
                onClick={() =>
                  replaceParams((params) => params.set("status", slugForStatus(status)))
                }
              >
                {status}
              </FilterChip>
            ))}
          </div>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar pedido, nome ou CPF"
            className="lg:max-w-xs"
            aria-label="Buscar pedidos"
          />
        </div>

        {error && (
          <p className="rounded-md border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-600" role="alert">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="hidden lg:table-cell">Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!ready ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-stone-500">
                    Carregando pedidos…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-stone-500">
                    {error ? "Os pedidos não carregaram." : "Nenhum pedido com esse filtro."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => openOrder(order.id)}>
                    <TableCell className="whitespace-nowrap font-medium text-stone-800">{order.id}</TableCell>
                    <TableCell>
                      <span className="block">{order.customer.name}</span>
                      <span className="text-xs text-stone-500">{order.customer.city}</span>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap md:table-cell">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {order.items.reduce((sum, item) => sum + item.qty, 0)}
                    </TableCell>
                    <TableCell>{formatBRL(order.total)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && closeOrder()}>
        <SheetContent side="detail" className="p-0">
          {selected && (
            <div className="space-y-6 px-6 pb-10 pt-14">
              <SheetHeader>
                <SheetTitle>{selected.id}</SheetTitle>
                <SheetDescription>
                  {formatDate(selected.createdAt)} · {selected.customer.email}
                </SheetDescription>
              </SheetHeader>
              <StatusBadge status={selected.status} />
              {selected.paymentStatus ? (
                <p className="text-sm text-stone-600">
                  Mercado Pago: {paymentStatusLabel(selected.paymentStatus)}
                  {selected.paymentId ? ` · ${selected.paymentId}` : ""}
                </p>
              ) : null}

              <ul className="space-y-4">
                {selected.items.map((item) => (
                  <li key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-sand-100">
                      <StoreImage src={item.image} alt={item.name} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-lg leading-tight text-stone-800">{item.name}</p>
                      <p className="mt-1 text-sm text-stone-600">
                        Cor: {item.color} · Tamanho: {item.size} · Qtd: {item.qty}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        SKU {item.sku} · {item.supplier}
                      </p>
                      <p className="mt-1 text-sm text-stone-800">{formatBRL(item.price * item.qty)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <ShippingCard customer={selected.customer} />

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-stone-500">
                  Atualizar status
                </span>
                <select
                  value={selected.status}
                  disabled={saving}
                  onChange={async (event) => {
                    setSaving(true);
                    setNotice(null);
                    const message = await updateStatus(selected.id, event.target.value as OrderStatus);
                    setSaving(false);
                    setNotice(message ?? "Status gravado no pedido.");
                  }}
                  className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-400"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <label htmlFor="tracking-code" className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-stone-500">
                  Código de rastreio
                </label>
                <div className="flex gap-2">
                  <Input
                    id="tracking-code"
                    value={trackingDraft}
                    onChange={(event) => setTrackingDraft(event.target.value.toUpperCase())}
                    placeholder="OJ458221739BR"
                    aria-label="Código de rastreio"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      setNotice(null);
                      const message = await saveTracking(selected.id, trackingDraft);
                      setSaving(false);
                      setNotice(message ?? "Código gravado. O cliente vê na página de rastreio.");
                    }}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
              {notice && <p className="text-xs text-stone-500">{notice}</p>}

              <div className="space-y-1 border-t border-stone-200 pt-4 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatBRL(selected.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>{selected.shipping === 0 ? "Grátis" : formatBRL(selected.shipping)}</span>
                </div>
                <div className="flex justify-between pt-1 text-stone-800">
                  <span>Total</span>
                  <span className="font-serif text-2xl">{formatBRL(selected.total)}</span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-xs transition-colors duration-300 ease-in-out",
        active
          ? "border-stone-800 bg-stone-800 text-stone-50"
          : "border-stone-300 bg-white text-stone-600 hover:border-stone-400",
      )}
    >
      {children}
    </button>
  );
}
