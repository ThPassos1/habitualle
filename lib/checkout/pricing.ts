import { shippingCost } from "../format.ts";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function chargedUnit(catalogPrice: number, clientPrice: unknown) {
  void clientPrice;
  if (!Number.isFinite(catalogPrice) || catalogPrice <= 0 || catalogPrice > 99_999) return null;
  return roundMoney(catalogPrice);
}

export function checkoutTotals(unitTotals: number[], clientShipping?: unknown, clientDiscount?: unknown) {
  void clientShipping;
  void clientDiscount;
  if (unitTotals.some((value) => !Number.isFinite(value) || value <= 0)) return null;
  const subtotal = roundMoney(unitTotals.reduce((sum, value) => sum + value, 0));
  const shipping = shippingCost(subtotal);
  return { subtotal, shipping, total: roundMoney(subtotal + shipping) };
}
