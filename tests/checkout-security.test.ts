import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { isAttemptKey, normalizeAttemptKey } from "../lib/checkout/attempt-key.ts";
import { checkoutFingerprint } from "../lib/checkout/fingerprint.ts";
import { chargedUnit, checkoutTotals } from "../lib/checkout/pricing.ts";
import { decidePaymentSync } from "../lib/payments/decision.ts";
import { webhookUrl } from "../lib/payments/webhook-url.ts";
import { webhookSignatureValid } from "../lib/payments/signature.ts";
import type { Customer } from "../lib/types.ts";

const customer: Customer = {
  name: "Ana Teste",
  email: "teste@habitualle.com",
  cpf: "123.456.789-09",
  phone: "(11) 98888-7777",
  street: "Avenida Paulista",
  number: "1000",
  complement: "",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
  zip: "01310-100",
};

test("preço do cliente é ignorado", () => {
  assert.equal(chargedUnit(189, 0.01), 189);
  assert.equal(chargedUnit(189, 999999), 189);
  assert.equal(chargedUnit(189, -100), 189);
  assert.equal(chargedUnit(0, 189), null);
  assert.equal(chargedUnit(-1, 1), null);
});

test("frete e desconto do cliente não entram no total", () => {
  const totals = checkoutTotals([189], 0, -100);
  assert.deepEqual(totals, { subtotal: 189, shipping: 29, total: 218 });
  assert.deepEqual(checkoutTotals([189, 189], 999999, 50), { subtotal: 378, shipping: 0, total: 378 });
  assert.equal(checkoutTotals([-10]), null);
});

test("chave de tentativa precisa ser um uuid da versão 4", () => {
  assert.equal(isAttemptKey("hb-332210"), false);
  assert.equal(normalizeAttemptKey(" 550E8400-E29B-41D4-A716-446655440000 "), "550e8400-e29b-41d4-a716-446655440000");
  assert.equal(normalizeAttemptKey("550e8400-e29b-11d4-a716-446655440000"), null);
});

test("a mesma sacola gera a mesma impressão e outra sacola não", () => {
  const lines = [{ productId: "tabua-carvalho", color: "Carvalho", size: "Único", qty: 1 }];
  const again = checkoutFingerprint(customer, lines);
  assert.equal(checkoutFingerprint(customer, lines), again);
  assert.notEqual(checkoutFingerprint(customer, [{ ...lines[0], qty: 2 }]), again);
});

test("pagamento de outro valor, outra moeda ou outro pedido não confirma", () => {
  const local = { status: "pendente" as const, totalCents: 21800, paymentId: null };
  assert.equal(
    decidePaymentSync(local, { id: "ORD01", orderId: "HB-332210", amountCents: 100, currency: "BRL", outcome: "approved" }, "HB-332210"),
    "ignore",
  );
  assert.equal(
    decidePaymentSync(local, { id: "ORD01", orderId: "HB-999999", amountCents: 21800, currency: "BRL", outcome: "approved" }, "HB-332210"),
    "ignore",
  );
  assert.equal(
    decidePaymentSync(local, { id: "ORD01", orderId: "HB-332210", amountCents: 21800, currency: "ARS", outcome: "approved" }, "HB-332210"),
    "ignore",
  );
  assert.equal(
    decidePaymentSync(local, { id: "ORD01", orderId: "HB-332210", amountCents: 21800, currency: "BRL", outcome: "approved" }, "HB-332210"),
    "mark_paid",
  );
});

test("webhook repetido ou atrasado não regride um pedido confirmado", () => {
  const paid = { status: "confirmado" as const, totalCents: 21800, paymentId: "ORD01" };
  assert.equal(
    decidePaymentSync(paid, { id: "ORD01", orderId: "HB-332210", amountCents: 21800, currency: "BRL", outcome: "approved" }, "HB-332210"),
    "ignore",
  );
  assert.equal(
    decidePaymentSync(paid, { id: "ORD01", orderId: "HB-332210", amountCents: 21800, currency: "BRL", outcome: "pending" }, "HB-332210"),
    "ignore",
  );
  assert.equal(
    decidePaymentSync(paid, { id: "ORD01", orderId: "HB-332210", amountCents: 21800, currency: "BRL", outcome: "rejected" }, "HB-332210"),
    "ignore",
  );
});

test("o mesmo pagamento só libera estoque enquanto o pedido está pendente", () => {
  const local = { status: "pendente" as const, totalCents: 21800, paymentId: "ORD01" };
  assert.equal(
    decidePaymentSync(local, { id: "ORD01", orderId: "HB-332210", amountCents: 21800, currency: "BRL", outcome: "rejected" }, "HB-332210"),
    "release",
  );
  assert.equal(
    decidePaymentSync(
      { ...local, paymentId: "ORD01" },
      { id: "ORD02", orderId: "HB-332210", amountCents: 21800, currency: "BRL", outcome: "approved" },
      "HB-332210",
    ),
    "ignore",
  );
});

test("assinatura ausente ou errada não passa, e a certa passa", () => {
  const previous = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  process.env.MERCADO_PAGO_WEBHOOK_SECRET = "";
  assert.equal(webhookSignatureValid(new Request("https://loja.test/api/payments/webhook"), "ord01"), false);

  const secret = "segredo-de-teste-com-32-caracteres";
  process.env.MERCADO_PAGO_WEBHOOK_SECRET = secret;
  const id = "ORD01ABC";
  const ts = String(Math.floor(Date.now() / 1000));
  const requestId = "req-teste";
  const manifest = `id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", secret).update(manifest).digest("hex");
  const valid = new Request("https://loja.test/api/payments/webhook", {
    headers: { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": requestId },
  });
  const invalid = new Request("https://loja.test/api/payments/webhook", {
    headers: { "x-signature": `ts=${ts},v1=${"0".repeat(64)}`, "x-request-id": requestId },
  });
  assert.equal(webhookSignatureValid(valid, id), true);
  assert.equal(webhookSignatureValid(invalid, id), false);
  process.env.MERCADO_PAGO_WEBHOOK_SECRET = previous;
});

test("o aviso de pagamento só sai de uma origem https", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3001";
  assert.equal(webhookUrl(), undefined);
  process.env.NEXT_PUBLIC_SITE_URL = "https://habitualle.com.br/admin";
  assert.equal(webhookUrl(), undefined);
  process.env.NEXT_PUBLIC_SITE_URL = "https://user:pass@habitualle.com.br";
  assert.equal(webhookUrl(), undefined);
  process.env.NEXT_PUBLIC_SITE_URL = "https://habitualle.com.br";
  assert.equal(webhookUrl(), "https://habitualle.com.br/api/payments/webhook");
  process.env.NEXT_PUBLIC_SITE_URL = previous;
});

test("duas requisições simultâneas com a mesma chave criam um pedido", async () => {
  const ledger = new Map<string, { fingerprint: string; orderId: string | null }>();
  const queues = new Map<string, Promise<void>>();
  let created = 0;

  function claim(key: string, fingerprint: string) {
    const previous = queues.get(key) ?? Promise.resolve();
    const run = previous.then(async () => {
      const current = ledger.get(key);
      if (!current) {
        ledger.set(key, { fingerprint, orderId: null });
      } else if (current.fingerprint !== fingerprint) {
        throw new Error("Tentativa reutilizada");
      } else if (current.orderId) {
        return current.orderId;
      }
      const row = ledger.get(key);
      if (!row) throw new Error("ausente");
      if (row.orderId) return row.orderId;
      created += 1;
      row.orderId = `HB-${100000 + created}`;
      return row.orderId;
    });
    queues.set(
      key,
      run.then(
        () => undefined,
        () => undefined,
      ),
    );
    return run;
  }

  const [first, second] = await Promise.all([claim("chave-a", "abc"), claim("chave-a", "abc")]);
  const third = await claim("chave-b", "abc");
  assert.equal(first, second);
  assert.notEqual(third, first);
  assert.equal(created, 2);
  await assert.rejects(() => claim("chave-a", "outra"), /Tentativa reutilizada/);
  assert.equal(created, 2);
});
