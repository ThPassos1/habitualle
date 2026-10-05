"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, type ReactNode } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { StoreImage } from "@/components/store/store-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatBRL,
  maskCep,
  maskCpf,
  maskPhone,
  onlyDigits,
  shippingCost,
} from "@/lib/format";
import type { Customer } from "@/lib/types";

const PaymentStep = dynamic(
  () => import("@/components/store/payment-step").then((mod) => mod.PaymentStep),
  {
    ssr: false,
    loading: () => <p className="text-sm text-stone-500">Abrindo o pagamento seguro…</p>,
  },
);

const STORAGE_KEY = "habitualle-checkout-payment";

const emptyCustomer: Customer = {
  name: "",
  email: "",
  cpf: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
};

type PendingPayment = { orderId: string; paymentId: string; viewToken: string };

export function CheckoutView({ publicKey, paymentsReady }: { publicKey: string; paymentsReady: boolean }) {
  const router = useRouter();
  const { items, subtotal, ready, clearCart } = useCart();
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<"details" | "payment">("details");
  const [boot, setBoot] = useState<"loading" | "ready">("loading");
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const shipping = shippingCost(subtotal);
  const total = subtotal + shipping;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PendingPayment;
        if (parsed.orderId?.startsWith("HB-") && parsed.paymentId && parsed.viewToken) setPendingPayment(parsed);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setBoot("ready");
  }, []);

  function update(field: keyof Customer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (customer.name.trim().length < 3) next.name = "Informe o nome completo.";
    if (!customer.email.includes("@")) next.email = "Informe um e-mail válido.";
    if (onlyDigits(customer.cpf).length !== 11) next.cpf = "O CPF precisa ter 11 números.";
    if (onlyDigits(customer.phone).length < 10) next.phone = "Informe o telefone com DDD.";
    if (customer.street.trim().length < 3) next.street = "Informe o endereço.";
    if (!customer.number.trim()) next.number = "Informe o número.";
    if (customer.neighborhood.trim().length < 2) next.neighborhood = "Informe o bairro.";
    if (customer.city.trim().length < 2) next.city = "Informe a cidade.";
    if (customer.state.trim().length !== 2) next.state = "Use a sigla do estado.";
    if (onlyDigits(customer.zip).length !== 8) next.zip = "O CEP precisa ter 8 números.";
    return next;
  }

  function onContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0 || items.length === 0) return;
    setStep("payment");
  }

  function finish(orderId: string, viewToken: string) {
    sessionStorage.removeItem(STORAGE_KEY);
    clearCart();
    const token = viewToken ? `&t=${encodeURIComponent(viewToken)}` : "";
    router.push(`/checkout/sucesso?order=${encodeURIComponent(orderId)}${token}`);
  }

  function hold(orderId: string, paymentId: string, viewToken: string) {
    const value = { orderId, paymentId, viewToken };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    setPendingPayment(value);
    clearCart();
  }

  function expire() {
    sessionStorage.removeItem(STORAGE_KEY);
    setPendingPayment(null);
    setFormError("O pagamento não foi confirmado e a reserva foi cancelada. Você pode escolher as peças de novo.");
  }

  if (!ready || boot === "loading") {
    return <p className="px-6 py-20 text-center text-sm text-stone-500">Abrindo a sua sacola…</p>;
  }

  if (pendingPayment) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-8 md:py-16">
        <PaymentStep
          publicKey={publicKey}
          configured={paymentsReady}
          amount={0}
          customer={customer}
          lines={[]}
          pending={pendingPayment}
          onApproved={finish}
          onWaiting={hold}
          onExpired={expire}
          onBack={() => setStep("details")}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="font-serif text-4xl text-stone-800">Sua sacola está vazia</h1>
        <p className="mt-4 text-stone-600">
          {formError ?? "Escolha uma peça da coleção para seguir ao checkout."}
        </p>
        <Button asChild className="mt-8">
          <Link href="/colecao">Ver a coleção</Link>
        </Button>
      </div>
    );
  }

  const lines = items.map((item) => ({
    productId: item.productId,
    color: item.color,
    size: item.size,
    qty: item.qty,
  }));

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-16">
      <div className="space-y-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-sage-700">Checkout</p>
          <h1 className="mt-3 font-serif text-4xl text-stone-800">Onde a casa recebe</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-600">
            Os dados de entrega ficam neste passo. No seguinte, o pagamento acontece aqui na loja,
            pelo Mercado Pago. Depois, acompanhe pelo número HB em{" "}
            <Link href="/rastreio" className="underline underline-offset-4">
              Rastreio
            </Link>
            .
          </p>
        </div>

        {formError && step === "details" && (
          <p
            className="rounded-md border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-600"
            role="alert"
          >
            {formError}
          </p>
        )}

        {step === "details" ? (
          <form onSubmit={onContinue} className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" error={errors.name} className="sm:col-span-2">
                <Input
                  autoComplete="name"
                  value={customer.name}
                  onChange={(event) => update("name", event.target.value)}
                />
              </Field>
              <Field label="E-mail" error={errors.email}>
                <Input
                  type="email"
                  autoComplete="email"
                  value={customer.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </Field>
              <Field label="CPF" error={errors.cpf}>
                <Input
                  inputMode="numeric"
                  autoComplete="off"
                  value={customer.cpf}
                  onChange={(event) => update("cpf", maskCpf(event.target.value))}
                />
              </Field>
              <Field label="Telefone" error={errors.phone}>
                <Input
                  type="tel"
                  autoComplete="tel"
                  value={customer.phone}
                  onChange={(event) => update("phone", maskPhone(event.target.value))}
                />
              </Field>
              <Field label="CEP" error={errors.zip}>
                <Input
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={customer.zip}
                  onChange={(event) => update("zip", maskCep(event.target.value))}
                />
              </Field>
              <Field label="Endereço" error={errors.street} className="sm:col-span-2">
                <Input
                  autoComplete="street-address"
                  value={customer.street}
                  onChange={(event) => update("street", event.target.value)}
                />
              </Field>
              <Field label="Número" error={errors.number}>
                <Input value={customer.number} onChange={(event) => update("number", event.target.value)} />
              </Field>
              <Field label="Complemento">
                <Input
                  value={customer.complement}
                  onChange={(event) => update("complement", event.target.value)}
                />
              </Field>
              <Field label="Bairro" error={errors.neighborhood}>
                <Input
                  value={customer.neighborhood}
                  onChange={(event) => update("neighborhood", event.target.value)}
                />
              </Field>
              <Field label="Cidade" error={errors.city}>
                <Input
                  autoComplete="address-level2"
                  value={customer.city}
                  onChange={(event) => update("city", event.target.value)}
                />
              </Field>
              <Field label="Estado" error={errors.state}>
                <Input
                  autoComplete="address-level1"
                  value={customer.state}
                  maxLength={2}
                  onChange={(event) => update("state", event.target.value.toUpperCase())}
                />
              </Field>
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Continuar para o pagamento
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
              <p className="text-stone-800">{customer.name}</p>
              <p className="mt-1">
                {customer.street}, {customer.number}
                {customer.complement ? ` · ${customer.complement}` : ""} · {customer.neighborhood}
              </p>
              <p>
                {customer.city}/{customer.state} · {customer.zip}
              </p>
            </div>
            <PaymentStep
              publicKey={publicKey}
              configured={paymentsReady}
              amount={total}
              customer={customer}
              lines={lines}
              pending={null}
              onApproved={finish}
              onWaiting={hold}
              onExpired={expire}
              onBack={() => setStep("details")}
            />
          </div>
        )}
      </div>

      <aside className="h-fit rounded-lg border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-32">
        <h2 className="font-serif text-2xl text-stone-800">Seu pedido</h2>
        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-sand-100">
                <StoreImage src={item.image} alt="" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-stone-800">{item.name}</p>
                <p className="text-xs text-stone-500">
                  {item.color} · {item.size} · {item.qty}
                </p>
              </div>
              <p className="text-sm text-stone-800">{formatBRL(item.price * item.qty)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Frete</span>
            <span>{shipping === 0 ? "Grátis" : formatBRL(shipping)}</span>
          </div>
          <div className="flex items-end justify-between pt-2">
            <span>Total</span>
            <span className="font-serif text-3xl text-stone-800">{formatBRL(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-stone-500">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-terracotta-600">{error}</span>}
    </label>
  );
}
