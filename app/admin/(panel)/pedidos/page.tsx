import { Suspense } from "react";

import { OrdersManager } from "@/components/admin/orders-manager";

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="px-10 py-16 text-sm text-stone-500">Carregando pedidos…</p>}>
      <OrdersManager />
    </Suspense>
  );
}
