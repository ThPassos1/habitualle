"use client";

import { CopyAddressButton } from "@/components/admin/copy-address-button";
import { formatShippingBlock } from "@/lib/format";
import type { Customer } from "@/lib/types";

export function ShippingCard({ customer }: { customer: Customer }) {
  const text = formatShippingBlock(customer);

  return (
    <section className="rounded-lg border border-terracotta-200 bg-sand-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-terracotta-600">Fulfillment</p>
          <h3 className="mt-1 font-serif text-2xl text-stone-800">Dados de entrega do cliente</h3>
        </div>
        <CopyAddressButton customer={customer} />
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-stone-800">{text}</p>
      <p className="mt-3 text-xs leading-relaxed text-stone-500">
        Pronto para colar no AliExpress ou no CJ Dropshipping.
      </p>
    </section>
  );
}
