import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const styles: Record<OrderStatus, string> = {
  Pendente: "border-sand-200 bg-sand-100 text-sand-800",
  Pago: "border-sage-200 bg-sage-100 text-sage-700",
  "Processando (Fornecedor)": "border-terracotta-200 bg-terracotta-50 text-terracotta-600",
  Enviado: "border-stone-200 bg-stone-100 text-stone-700",
  Entregue: "border-sage-700 bg-sage-700 text-sage-50",
  Cancelado: "border-stone-300 bg-stone-100 text-stone-500",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
