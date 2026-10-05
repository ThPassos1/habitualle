"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function PaymentApproved({
  orderId,
  total,
  href,
}: {
  orderId: string;
  total: string;
  href: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#00a650] px-6 text-white">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <svg viewBox="0 0 80 80" className="size-28" aria-hidden>
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="white"
            strokeWidth="3"
            initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: "easeOut" }}
          />
          <motion.path
            d="M24 41.5 L35 52.5 L57 28"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.32, ease: "easeOut" }}
          />
        </svg>
        <p className="mt-8 text-4xl font-medium tracking-tight">Pronto!</p>
        <p className="mt-3 text-lg text-white/95">Seu pagamento foi aprovado</p>
        <p className="mt-6 font-serif text-2xl text-white">A casa já está no caminho.</p>
        <p className="mt-3 text-sm leading-relaxed text-white/90">
          Pedido {orderId}, no total de {total}. No rastreio, use esse número com o e-mail ou o CPF do pedido.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={href}
            className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-[#00a650] transition-colors hover:bg-white/90"
          >
            Acompanhar pedido
          </Link>
          <Link
            href="/colecao"
            className="inline-flex h-12 items-center justify-center rounded-md border border-white/80 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Continuar na coleção
          </Link>
        </div>
      </div>
    </div>
  );
}
