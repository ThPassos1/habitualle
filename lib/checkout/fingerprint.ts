import { createHash } from "node:crypto";

import { onlyDigits } from "../format.ts";
import type { Customer } from "../types.ts";

export type FingerprintLine = { productId: string; color: string; size: string; qty: number };

export function checkoutFingerprint(customer: Customer, lines: FingerprintLine[]) {
  const normalized = {
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
    lines: lines
      .map((line) => ({
        productId: line.productId.trim(),
        color: line.color.trim(),
        size: line.size.trim(),
        qty: line.qty,
      }))
      .sort((left, right) =>
        `${left.productId}|${left.color}|${left.size}`.localeCompare(`${right.productId}|${right.color}|${right.size}`),
      ),
  };
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}
