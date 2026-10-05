"use client";

import { useMemo, useState } from "react";

import { AdminHeader } from "@/components/admin/admin-header";
import { CopyAddressButton } from "@/components/admin/copy-address-button";
import { useOrders } from "@/components/admin/use-orders";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL } from "@/lib/format";
import type { Customer, Order } from "@/lib/types";

type CustomerRow = Customer & {
  orders: number;
  total: number;
};

function groupCustomers(orders: Order[]): CustomerRow[] {
  const map = new Map<string, CustomerRow>();
  for (const order of orders) {
    const key = order.customer.cpf;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...order.customer, orders: 1, total: order.total });
    } else {
      existing.orders += 1;
      existing.total += order.total;
    }
  }
  return Array.from(map.values());
}

export function CustomersTable() {
  const { orders, ready, error } = useOrders();
  const [query, setQuery] = useState("");
  const customers = useMemo(() => groupCustomers(orders), [orders]);
  const filtered = customers.filter((customer) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return `${customer.name} ${customer.city} ${customer.cpf} ${customer.phone}`.toLowerCase().includes(term);
  });

  return (
    <>
      <AdminHeader
        title="Clientes"
        description="O endereço mais recente de cada cliente, pronto para copiar quando o pedido voltar."
      />
      <div className="space-y-5 px-4 py-6 md:px-10 md:py-8">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar nome, cidade ou CPF"
          className="max-w-sm"
          aria-label="Buscar clientes"
        />
        {error && (
          <p className="rounded-md border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-600" role="alert">
            {error}
          </p>
        )}
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Cidade</TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead className="hidden sm:table-cell">Total</TableHead>
                <TableHead>Endereço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!ready ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-stone-500">
                    Carregando clientes…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-stone-500">
                    Nenhum cliente com esse filtro.
                  </TableCell>
                </TableRow>
              ) : filtered.map((customer) => (
                <TableRow key={customer.cpf}>
                  <TableCell>
                    <span className="block font-medium text-stone-800">{customer.name}</span>
                    <span className="text-xs text-stone-500">{customer.cpf}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {customer.city} · {customer.state}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{customer.phone}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatBRL(customer.total)}</TableCell>
                  <TableCell>
                    <CopyAddressButton customer={customer} label="Copiar" />
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
