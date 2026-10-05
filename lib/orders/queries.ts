import "server-only";

import { cookies } from "next/headers";

import { adminSessionValid } from "@/lib/admin-session";
import { ADMIN_COOKIE } from "@/lib/auth";
import { checkoutFingerprint } from "@/lib/checkout/fingerprint";
import { chargedUnit, checkoutTotals } from "@/lib/checkout/pricing";
import { maskCpf, maskPhone, onlyDigits } from "@/lib/format";
import { slugForStatus, statusFromSlug } from "@/lib/orders";
import { getSellableProduct } from "@/lib/catalog";
import { getProduct } from "@/lib/products";
import { supabaseAdmin, supabaseSetupMessage } from "@/lib/supabase/admin";
import type { Customer, Order, OrderItem, OrderStatus, TrackedOrder } from "@/lib/types";

const ORDER_SELECT = `
  id,
  customer_name,
  customer_email,
  customer_cpf,
  customer_phone,
  shipping_address,
  total_amount,
  shipping_cost,
  status,
  tracking_code,
  payment_id,
  payment_status,
  created_at,
  order_items (
    id,
    product_id,
    quantity,
    price,
    variant_color,
    variant_size,
    products ( title, images, sku, supplier )
  )
`;

type ProductEmbed = { title: string; images: string[] | null; sku: string | null; supplier: string | null };

type ItemRow = {
  id: string;
  product_id: string;
  quantity: number;
  price: number | string;
  variant_color: string;
  variant_size: string;
  products: ProductEmbed | ProductEmbed[] | null;
};

type AddressJson = {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type OrderRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_cpf: string;
  customer_phone: string;
  shipping_address: AddressJson | null;
  total_amount: number | string;
  shipping_cost: number | string;
  status: string;
  tracking_code: string | null;
  payment_id: string | null;
  payment_status: string | null;
  created_at: string;
  order_items: ItemRow[] | null;
};

export type CheckoutLineInput = {
  productId: string;
  color: string;
  size: string;
  qty: number;
};

type Ok<T> = { ok: true } & T;
type Err = { ok: false; message: string };

function money(value: number | string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function embedProduct(value: ItemRow["products"]) {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeOrderId(value: string) {
  const compact = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!compact) return null;
  const digits = compact.replace(/^HB-?/, "");
  if (!/^\d{4,6}$/.test(digits)) return null;
  return `HB-${digits}`;
}

async function isAdmin() {
  return adminSessionValid(cookies().get(ADMIN_COOKIE)?.value);
}

function lineToItem(row: ItemRow): OrderItem {
  const catalog = getProduct(row.product_id);
  const stored = embedProduct(row.products);
  return {
    productId: row.product_id,
    name: stored?.title || catalog?.name || row.product_id,
    image: stored?.images?.[0] || catalog?.images[0]?.src || "",
    color: row.variant_color,
    size: row.variant_size,
    qty: row.quantity,
    price: money(row.price),
    supplier: stored?.supplier || catalog?.supplier || "",
    sku: stored?.sku || catalog?.sku || "",
  };
}

function toOrder(row: OrderRow): Order {
  const address = row.shipping_address ?? {};
  const total = money(row.total_amount);
  const shipping = money(row.shipping_cost);
  const items = (row.order_items ?? []).map(lineToItem);
  return {
    id: row.id,
    createdAt: row.created_at,
    status: statusFromSlug(row.status) ?? "Pendente",
    trackingCode: row.tracking_code,
    origin: "loja",
    paymentId: row.payment_id,
    paymentStatus: row.payment_status,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      cpf: row.customer_cpf,
      phone: row.customer_phone,
      street: text(address.street),
      number: text(address.number),
      complement: text(address.complement),
      neighborhood: text(address.neighborhood),
      city: text(address.city),
      state: text(address.state),
      zip: text(address.zip),
    },
    items,
    shipping,
    total,
    subtotal: money(total - shipping),
  };
}

function toTracked(order: Order): TrackedOrder {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    trackingCode: order.trackingCode,
    customerName: order.customer.name,
    email: order.customer.email,
    phone: order.customer.phone,
    address: {
      street: order.customer.street,
      number: order.customer.number,
      complement: order.customer.complement,
      neighborhood: order.customer.neighborhood,
      city: order.customer.city,
      state: order.customer.state,
      zip: order.customer.zip,
    },
    items: order.items.map((item) => ({
      id: `${item.productId}-${item.color}-${item.size}`,
      name: item.name,
      image: item.image,
      color: item.color,
      size: item.size,
      qty: item.qty,
      price: item.price,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
  };
}

function bounded(value: string, max: number) {
  const text = value.trim();
  return text.length > 0 && text.length <= max;
}

function customerError(customer: Customer) {
  if (!bounded(customer.name, 120) || customer.name.trim().length < 3) return "Informe o nome completo.";
  if (!customer.email.includes("@") || !bounded(customer.email, 160)) return "Informe um e-mail válido.";
  if (onlyDigits(customer.cpf).length !== 11) return "O CPF precisa ter 11 números.";
  const phone = onlyDigits(customer.phone);
  if (phone.length < 10 || phone.length > 13) return "Informe o telefone com DDD.";
  if (!bounded(customer.street, 160) || customer.street.trim().length < 3) return "Informe o endereço.";
  if (!bounded(customer.number, 20)) return "Informe o número.";
  if (customer.complement.trim().length > 80) return "O complemento está longo demais.";
  if (!bounded(customer.neighborhood, 80) || customer.neighborhood.trim().length < 2) return "Informe o bairro.";
  if (!bounded(customer.city, 80) || customer.city.trim().length < 2) return "Informe a cidade.";
  if (!/^[A-Za-z]{2}$/.test(customer.state.trim())) return "Use a sigla do estado.";
  if (onlyDigits(customer.zip).length !== 8) return "O CEP precisa ter 8 números.";
  return null;
}

function readableError(error: { message?: string; code?: string }) {
  const message = error.message ?? "";
  if (message.includes("Estoque insuficiente") || message.includes("Produto indisponível")) {
    return "Uma das peças não está mais disponível. Atualize a sacola e tente de novo.";
  }
  if (message.includes("payment_id") || message.includes("release_pending_order")) {
    return "Falta a migração de pagamento no Supabase.";
  }
  if (message.includes("Tentativa reutilizada")) {
    return "Essa tentativa já foi usada com outros dados. Atualize a página e tente de novo.";
  }
  if (message.includes("claim_store_order") || message.includes("checkout_attempts")) {
    return "Falta a migração de idempotência no Supabase. Rode supabase/migrations/20261002200000_checkout_idempotency.sql no projeto habitualle.";
  }
  if (message.includes("schema cache") || message.includes("create_store_order") || error.code === "PGRST202") {
    return "O banco ainda não tem as tabelas da loja. Rode a migração SQL no Supabase.";
  }
  return "Não foi possível concluir agora. Tente de novo em instantes.";
}

export async function listAdminOrders(): Promise<Ok<{ orders: Order[] }> | Err> {
  if (!(await isAdmin())) return { ok: false, message: "Sua sessão de admin expirou. Entre de novo." };

  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false, message: supabaseSetupMessage("admin") };

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return { ok: false, message: readableError(error) };
  return { ok: true, orders: ((data ?? []) as unknown as OrderRow[]).map(toOrder) };
}

export async function updateAdminOrder(input: {
  id: string;
  status?: OrderStatus;
  trackingCode?: string;
}): Promise<Ok<{ orderId: string }> | Err> {
  if (!(await isAdmin())) return { ok: false, message: "Sua sessão de admin expirou. Entre de novo." };

  const id = normalizeOrderId(input.id);
  if (!id) return { ok: false, message: "Número de pedido inválido." };

  const patch: { status?: string; tracking_code?: string | null } = {};

  if (input.status) {
    const slug = slugForStatus(input.status);
    if (!statusFromSlug(slug)) return { ok: false, message: "Status inválido." };
    patch.status = slug;
  }

  if (typeof input.trackingCode === "string") {
    const code = input.trackingCode.trim().toUpperCase().replace(/\s+/g, "");
    if (code.length > 40 || !/^[A-Z0-9-]*$/.test(code)) {
      return { ok: false, message: "Use só letras, números e hífen no código de rastreio." };
    }
    patch.tracking_code = code || null;
  }

  if (!patch.status && patch.tracking_code === undefined) {
    return { ok: false, message: "Nada para atualizar." };
  }

  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false, message: supabaseSetupMessage("admin") };

  const { data, error } = await supabase.from("orders").update(patch).eq("id", id).select("id").maybeSingle();
  if (error) return { ok: false, message: readableError(error) };
  if (!data) return { ok: false, message: "Pedido não encontrado." };
  return { ok: true, orderId: id };
}

export async function lookupTrackedOrders(
  input: {
    orderId?: string;
    email?: string;
    cpf?: string;
  },
  options?: { ownerCheck?: boolean },
): Promise<Ok<{ orders: TrackedOrder[] }> | Err> {
  const id = input.orderId?.trim() ? normalizeOrderId(input.orderId) : null;
  if (!id) return { ok: false, message: "Use o número no formato HB-123456." };

  const email = input.email?.trim().toLowerCase() ?? "";
  const cpfDigits = onlyDigits(input.cpf ?? "");
  if (email && (email.length > 160 || !email.includes("@"))) return { ok: false, message: "Informe um e-mail válido." };
  if (cpfDigits && cpfDigits.length !== 11) return { ok: false, message: "O CPF precisa ter 11 números." };
  if (options?.ownerCheck && !email && cpfDigits.length !== 11) {
    return { ok: false, message: "Informe o e-mail ou o CPF usados nesse pedido." };
  }

  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false, message: supabaseSetupMessage("loja") };

  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
  if (error) return { ok: false, message: readableError(error) };
  if (!data) return { ok: true, orders: [] };

  const order = toOrder(data as unknown as OrderRow);
  if (options?.ownerCheck) {
    const emailMatches = email ? order.customer.email.trim().toLowerCase() === email : true;
    const cpfMatches = cpfDigits.length === 11 ? onlyDigits(order.customer.cpf) === cpfDigits : true;
    if (!emailMatches || !cpfMatches) return { ok: true, orders: [] };
  }

  return { ok: true, orders: [toTracked(order)] };
}

export async function getTrackedOrder(orderId: string): Promise<Ok<{ order: TrackedOrder | null }> | Err> {
  const id = normalizeOrderId(orderId);
  if (!id) return { ok: true, order: null };
  const result = await lookupTrackedOrders({ orderId: id });
  if (!result.ok) return result;
  return { ok: true, order: result.orders[0] ?? null };
}

function newOrderId() {
  const n = 100000 + Math.floor(Math.random() * 900000);
  return `HB-${n}`;
}

export async function placeOrder(input: {
  customer: Customer;
  lines: CheckoutLineInput[];
  attemptKey: string;
}): Promise<Ok<{ orderId: string }> | Err> {
  const problem = customerError(input.customer);
  if (problem) return { ok: false, message: problem };
  if (!Array.isArray(input.lines) || input.lines.length === 0 || input.lines.length > 20) {
    return { ok: false, message: "A sacola está vazia." };
  }

  const priced: OrderItem[] = [];
  for (const line of input.lines) {
    const product = await getSellableProduct(line.productId);
    const qty = Math.floor(Number(line.qty));
    if (!product || qty < 1 || qty > 10) {
      return { ok: false, message: "Uma peça da sacola não está mais disponível." };
    }
    if (!product.colors.includes(line.color) || !product.sizes.includes(line.size)) {
      return { ok: false, message: "Confira cor e tamanho antes de finalizar." };
    }
    const unit = chargedUnit(product.price, undefined);
    if (unit == null) return { ok: false, message: "Uma peça da sacola não está mais disponível." };
    priced.push({
      productId: product.id,
      name: product.name,
      image: product.images[0]?.src ?? "",
      color: line.color,
      size: line.size,
      qty,
      price: unit,
      supplier: product.supplier,
      sku: product.sku,
    });
  }

  const totals = checkoutTotals(priced.map((item) => item.price * item.qty));
  if (!totals) return { ok: false, message: "Uma peça da sacola não está mais disponível." };
  const { shipping, total } = totals;
  const customer = input.customer;

  const payload = {
    p_customer_name: customer.name.trim(),
    p_customer_email: customer.email.trim().toLowerCase(),
    p_customer_cpf: maskCpf(customer.cpf),
    p_customer_phone: maskPhone(customer.phone),
    p_shipping_address: {
      street: customer.street.trim(),
      number: customer.number.trim(),
      complement: customer.complement.trim(),
      neighborhood: customer.neighborhood.trim(),
      city: customer.city.trim(),
      state: customer.state.trim().toUpperCase(),
      zip: customer.zip.trim(),
    },
    p_total_amount: total,
    p_shipping_cost: shipping,
    p_items: priced.map((item) => ({
      product_id: item.productId,
      quantity: item.qty,
      price: item.price,
      variant_color: item.color,
      variant_size: item.size,
    })),
  };

  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false, message: supabaseSetupMessage("loja") };

  const fingerprint = checkoutFingerprint(customer, priced);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderId = newOrderId();
    const { data, error } = await supabase.rpc("claim_store_order", {
      p_key: input.attemptKey,
      p_fingerprint: fingerprint,
      p_id: orderId,
      ...payload,
    });
    if (!error && typeof data === "string" && /^HB-\d{6}$/.test(data)) return { ok: true, orderId: data };
    if (error?.code === "23505" || error?.message.includes("orders_pkey")) continue;
    return { ok: false, message: readableError(error ?? { message: "" }) };
  }

  return { ok: false, message: "Não foi possível gerar o número do pedido. Tente de novo." };
}

export async function getCheckoutOrder(orderId: string): Promise<Order | null> {
  const id = normalizeOrderId(orderId);
  if (!id) return null;
  const supabase = supabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return toOrder(data as unknown as OrderRow);
}

export async function saveOrderPayment(input: {
  orderId: string;
  paymentId: string;
  paymentStatus: string;
  markPaid: boolean;
}): Promise<Ok<{ orderId: string }> | Err> {
  const id = normalizeOrderId(input.orderId);
  const paymentId = input.paymentId.trim();
  const paymentStatus = input.paymentStatus.trim().slice(0, 40);
  if (!id || !/^[\w-]{6,80}$/.test(paymentId) || !paymentStatus) {
    return { ok: false, message: "Não foi possível gravar o pagamento neste pedido." };
  }

  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false, message: supabaseSetupMessage("loja") };

  if (input.markPaid) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "pago", payment_id: paymentId, payment_status: paymentStatus })
      .eq("id", id)
      .eq("status", "pendente")
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, message: readableError(error) };
    if (data) return { ok: true, orderId: id };
  }

  const patch = { payment_id: paymentId, payment_status: paymentStatus };
  const first = await supabase
    .from("orders")
    .update(patch)
    .eq("id", id)
    .is("payment_id", null)
    .select("id")
    .maybeSingle();
  if (first.error) return { ok: false, message: readableError(first.error) };
  if (first.data) return { ok: true, orderId: id };

  const second = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", id)
    .eq("payment_id", paymentId)
    .select("id")
    .maybeSingle();
  if (second.error) return { ok: false, message: readableError(second.error) };
  if (second.data) return { ok: true, orderId: id };

  const current = await getCheckoutOrder(id);
  if (current?.paymentId === paymentId) return { ok: true, orderId: id };
  return { ok: false, message: "Não foi possível gravar o pagamento neste pedido." };
}

export async function releasePendingOrder(orderId: string, paymentStatus: string): Promise<Ok<{ orderId: string }> | Err> {
  const id = normalizeOrderId(orderId);
  if (!id || !/^HB-\d{6}$/.test(id)) {
    return { ok: false, message: "Número de pedido inválido." };
  }

  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false, message: supabaseSetupMessage("loja") };

  const { error } = await supabase.rpc("release_pending_order", {
    p_id: id,
    p_payment_status: paymentStatus.slice(0, 40),
  });
  if (error) return { ok: false, message: readableError(error) };
  return { ok: true, orderId: id };
}
