import type { Customer } from "@/lib/types";

export const FREE_SHIPPING_FROM = 299;
export const SHIPPING_FEE = 29;

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function shippingCost(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function maskCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatShippingBlock(customer: Customer) {
  const lines = [
    `Nome: ${customer.name}`,
    `CPF: ${customer.cpf}`,
    `Endereço: ${customer.street}`,
    `Número: ${customer.number}`,
  ];

  if (customer.complement.trim()) {
    lines.push(`Complemento: ${customer.complement}`);
  }

  lines.push(
    `Bairro: ${customer.neighborhood}`,
    `Cidade: ${customer.city}`,
    `Estado: ${customer.state}`,
    `CEP: ${customer.zip}`,
    `Telefone: ${customer.phone}`,
  );

  return lines.join("\n");
}
