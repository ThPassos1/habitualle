"use client";

import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { useOrders } from "@/components/admin/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL, formatDate } from "@/lib/format";

export function DashboardHome() {
  const { orders, ready, error } = useOrders();
  const queue = orders.filter(
    (order) => order.status === "Pago" || order.status === "Processando (Fornecedor)",
  ).length;
  const waiting = orders.filter((order) => order.status === "Pendente").length;
  const shipped = orders.filter((order) => order.status === "Enviado").length;
  const revenue = orders
    .filter((order) => order.status !== "Pendente" && order.status !== "Cancelado")
    .reduce((sum, order) => sum + order.total, 0);
  const recent = orders.slice(0, 5);

  const cards = [
    { label: "Na fila do fornecedor", value: !ready ? "…" : error ? "—" : String(queue), href: "/admin/pedidos?status=processando" },
    { label: "Aguardando pagamento", value: !ready ? "…" : error ? "—" : String(waiting), href: "/admin/pedidos?status=pendente" },
    { label: "Enviados", value: !ready ? "…" : error ? "—" : String(shipped), href: "/admin/pedidos?status=enviado" },
    { label: "Receita confirmada", value: !ready ? "…" : error ? "—" : formatBRL(revenue), href: "/admin/pedidos" },
  ];

  return (
    <>
      <AdminHeader
        title="Visão geral"
        description="A fila que pede ação agora: pedidos pagos e os que já estão com o fornecedor."
      />
      <div className="space-y-8 px-4 py-6 md:px-10 md:py-8">
        {error && (
          <p className="rounded-md border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-600" role="alert">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition-colors duration-300 ease-in-out hover:bg-sand-50"
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">{card.label}</p>
              <p className="mt-3 font-serif text-4xl text-stone-800">{card.value}</p>
            </Link>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="font-serif text-2xl text-stone-800">Pedidos recentes</h2>
            <Link href="/admin/pedidos" className="text-sm text-stone-600 underline underline-offset-4">
              Ver todos
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-stone-500">
                    {ready ? "Nenhum pedido por aqui." : "Carregando pedidos…"}
                  </TableCell>
                </TableRow>
              ) : recent.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="whitespace-nowrap">
                    <Link href={`/admin/pedidos?pedido=${order.id}`} className="font-medium text-stone-800">
                      {order.id}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell className="hidden whitespace-nowrap md:table-cell">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>{formatBRL(order.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
