"use client";

import { motion, useReducedMotion } from "framer-motion";

export function PaymentDeclined({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#e03131] px-6 text-white" role="alert">
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
            transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
          />
          <motion.path
            d="M28 28 L52 52 M52 28 L28 52"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.28, ease: "easeOut" }}
          />
        </svg>
        <p className="mt-8 text-4xl font-medium tracking-tight">{title}</p>
        <p className="mt-4 max-w-sm text-lg leading-relaxed text-white/95">{message}</p>
        <p className="mt-4 text-sm text-white/85">Nada foi cobrado. As peças continuam na sacola.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-[#e03131] transition-colors hover:bg-white/90"
        >
          Tentar de novo
        </button>
      </div>
    </div>
  );
}
