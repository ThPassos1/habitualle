"use client";

import { initMercadoPago, Payment, StatusScreen } from "@mercadopago/sdk-react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PaymentDeclined } from "@/components/store/payment-declined";
import { PaymentProcessing } from "@/components/store/payment-processing";
import { Button } from "@/components/ui/button";
import { isAttemptKey } from "@/lib/checkout/attempt-key";
import { onlyDigits } from "@/lib/format";
import type { Customer } from "@/lib/types";

type Line = { productId: string; color: string; size: string; qty: number };

const ATTEMPT_STORAGE = "habitualle-checkout-attempt";

type PendingPayment = { orderId: string; paymentId: string; viewToken: string };

function attemptStamp(customer: Customer, lines: Line[]) {
  return JSON.stringify({
    name: customer.name.trim().toLowerCase(),
    email: customer.email.trim().toLowerCase(),
    cpf: onlyDigits(customer.cpf),
    phone: onlyDigits(customer.phone),
    street: customer.street.trim().toLowerCase(),
    number: customer.number.trim().toLowerCase(),
    complement: customer.complement.trim().toLowerCase(),
    neighborhood: customer.neighborhood.trim().toLowerCase(),
    city: customer.city.trim().toLowerCase(),
    state: customer.state.trim().toUpperCase(),
    zip: onlyDigits(customer.zip),
    lines: lines.map((line) => ({ productId: line.productId, color: line.color, size: line.size, qty: line.qty })),
  });
}

function attemptIdFor(stamp: string) {
  try {
    const raw = sessionStorage.getItem(ATTEMPT_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw) as { id?: string; stamp?: string };
      if (parsed.stamp === stamp && parsed.id && isAttemptKey(parsed.id)) return parsed.id;
    }
  } catch {
    sessionStorage.removeItem(ATTEMPT_STORAGE);
  }
  const id = crypto.randomUUID();
  sessionStorage.setItem(ATTEMPT_STORAGE, JSON.stringify({ id, stamp }));
  return id;
}

function rotateAttempt() {
  sessionStorage.removeItem(ATTEMPT_STORAGE);
}

type PaymentStepProps = {
  publicKey: string;
  configured: boolean;
  amount: number;
  customer: Customer;
  lines: Line[];
  pending: PendingPayment | null;
  onApproved: (orderId: string, viewToken: string) => void;
  onWaiting: (orderId: string, paymentId: string, viewToken: string) => void;
  onExpired: () => void;
  onBack: () => void;
};

export function PaymentStep({
  publicKey,
  configured,
  amount,
  customer,
  lines,
  pending,
  onApproved,
  onWaiting,
  onExpired,
  onBack,
}: PaymentStepProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [settled, setSettled] = useState(false);
  const [declined, setDeclined] = useState<{ title: string; message: string } | null>(null);
  const finishGate = useRef<(() => void) | null>(null);
  const submitLock = useRef<Promise<void> | null>(null);
  const approvedRef = useRef(onApproved);
  const expiredRef = useRef(onExpired);
  approvedRef.current = onApproved;
  expiredRef.current = onExpired;

  useEffect(() => {
    if (!configured || !publicKey) return;
    initMercadoPago(publicKey, { locale: "pt-BR" });
    setSdkReady(true);
  }, [configured, publicKey]);

  useEffect(() => {
    if (!pending?.viewToken) return;
    const orderId = pending.orderId;
    const viewToken = pending.viewToken;
    let stop = false;

    async function tick() {
      try {
        const response = await fetch(
          `/api/payments/status?order=${encodeURIComponent(orderId)}&t=${encodeURIComponent(viewToken)}`,
        );
        const data = (await response.json()) as { status?: string | null };
        if (stop) return;
        if (data.status === "pago") approvedRef.current(orderId, viewToken);
        if (data.status === "cancelado") expiredRef.current();
      } catch {
        // A próxima consulta tenta de novo.
      }
    }

    void tick();
    const timer = window.setInterval(() => void tick(), 4000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [pending]);

  const names = customer.name.trim().split(/\s+/).filter(Boolean);
  const firstName = names[0] ?? "";
  const lastName = names.slice(1).join(" ");

  return (
    <div className="space-y-6">
      {processing && (
        <PaymentProcessing
          settled={settled}
          onComplete={() => {
            finishGate.current?.();
          }}
        />
      )}
      {declined && (
        <PaymentDeclined
          title={declined.title}
          message={declined.message}
          onRetry={() => setDeclined(null)}
        />
      )}
      <div className="flex gap-3 rounded-lg border border-stone-200 bg-sand-50 px-4 py-3 text-sm leading-relaxed text-stone-600">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sage-700" aria-hidden />
        <p>
          Pagamento processado pelo Mercado Pago. O número do cartão não fica na Habitualle. Pix,
          cartão e boleto.{" "}
          <Link href="/ajuda" className="underline underline-offset-4">
            Envios e trocas
          </Link>
          .
        </p>
      </div>

      {payError && (
        <p
          className="rounded-md border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-600"
          role="alert"
        >
          {payError}
        </p>
      )}

      {pending ? (
        <div className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">Pedido {pending.orderId}</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-800">Conclua o pagamento</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone-600">
              O pedido está reservado. Se escolheu Pix ou boleto, use o código abaixo. Esta página
              acompanha a confirmação sozinha.
            </p>
          </div>
          {configured ? (
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white p-2 shadow-sm md:p-4">
              {sdkReady ? (
                <StatusScreen initialization={{ paymentId: pending.paymentId }} locale="pt-BR" />
              ) : (
                <p className="px-4 py-8 text-sm text-stone-500">Abrindo a confirmação do pagamento…</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone-600">
              O pagamento está temporariamente indisponível. Guarde o número {pending.orderId} e acompanhe em Rastreio.
            </p>
          )}
          <Button asChild variant="outline">
            <Link href={`/rastreio?pedido=${encodeURIComponent(pending.orderId)}`}>Acompanhar pedido</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-800"
          >
            Voltar aos dados de entrega
          </button>
          {!configured ? (
            <p className="rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
              {process.env.NODE_ENV === "development"
                ? "Defina NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY e MERCADO_PAGO_ACCESS_TOKEN no .env.local e reinicie o servidor."
                : "O pagamento está temporariamente indisponível."}
            </p>
          ) : (
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white p-2 shadow-sm md:p-4">
            {sdkReady ? (
              <Payment
                key={amount}
                locale="pt-BR"
                initialization={{
                  amount,
                  payer: {
                    email: customer.email.trim(),
                    firstName,
                    lastName,
                    identification: { type: "CPF", number: onlyDigits(customer.cpf) },
                  },
                }}
                customization={{
                  paymentMethods: {
                    creditCard: "all",
                    debitCard: "all",
                    prepaidCard: "all",
                    ticket: "all",
                    bankTransfer: "all",
                    maxInstallments: 10,
                  },
                  visual: {
                    style: {
                      theme: "flat",
                      customVariables: {
                        textPrimaryColor: "#44403c",
                        textSecondaryColor: "#78716c",
                        inputBackgroundColor: "#ffffff",
                        formBackgroundColor: "#ffffff",
                        baseColor: "#6F5840",
                        buttonTextColor: "#F8F4EF",
                        borderRadiusMedium: "6px",
                      },
                    },
                  },
                }}
                onSubmit={async (param) => {
                  if (submitLock.current) return submitLock.current;
                  const run = (async () => {
                  setPayError(null);
                  setDeclined(null);
                  setSettled(false);
                  setProcessing(true);
                  let approvedId = "";
                  let approvedToken = "";
                  try {
                    const response = await fetch("/api/payments", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        attemptId: attemptIdFor(attemptStamp(customer, lines)),
                        customer,
                        lines,
                        paymentType: param.paymentType,
                        formData: param.formData,
                      }),
                    });
                    const data = (await response.json().catch(() => null)) as {
                      ok?: boolean;
                      message?: string;
                      orderId?: string;
                      paymentId?: string;
                      viewToken?: string;
                      status?: string;
                      closed?: boolean;
                    } | null;
                    if (!data?.ok || !data.orderId || !data.paymentId || !data.viewToken) {
                      if (data?.status === "rejected" || data?.closed) rotateAttempt();
                      const message = data?.message || "Não foi possível concluir o pagamento.";
                      const failure = new Error(message) as Error & { refused?: boolean };
                      failure.refused = data?.status === "rejected" || data?.closed === true;
                      throw failure;
                    }
                    if (data.status === "approved") {
                      const orderId = data.orderId;
                      await new Promise<void>((resolve) => {
                        finishGate.current = resolve;
                        setSettled(true);
                      });
                      approvedId = orderId;
                      approvedToken = data.viewToken;
                    } else {
                      setProcessing(false);
                      onWaiting(data.orderId, data.paymentId, data.viewToken);
                    }
                  } catch (error) {
                    const failure = error as Error & { refused?: boolean };
                    const message =
                      failure instanceof Error && failure.message
                        ? failure.message
                        : "Não foi possível concluir o pagamento.";
                    setProcessing(false);
                    setSettled(false);
                    setPayError(message);
                    setDeclined({
                      title: failure.refused ? "Pagamento não aprovado" : "Não deu para concluir",
                      message,
                    });
                    throw failure instanceof Error ? failure : new Error(message);
                  }
                  if (approvedId && approvedToken) {
                    rotateAttempt();
                    onApproved(approvedId, approvedToken);
                  }
                  })();
                  submitLock.current = run;
                  try {
                    await run;
                  } finally {
                    if (submitLock.current === run) submitLock.current = null;
                  }
                }}
                onError={(error) => {
                  if (error.type === "critical") {
                    setPayError("O pagamento seguro não abriu. Atualize a página e tente de novo.");
                  }
                }}
              />
            ) : (
              <p className="px-4 py-8 text-sm text-stone-500">Abrindo o pagamento seguro…</p>
            )}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
