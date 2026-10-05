import { shippingCost } from "@/lib/format";
import { getProduct } from "@/lib/products";
import type { Customer, Order, OrderItem, OrderStatus } from "@/lib/types";

export const orderStatuses: OrderStatus[] = [
  "Pendente",
  "Pago",
  "Processando (Fornecedor)",
  "Enviado",
  "Entregue",
  "Cancelado",
];

const statusSlugs: Record<string, OrderStatus> = {
  pendente: "Pendente",
  pago: "Pago",
  processando: "Processando (Fornecedor)",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function statusFromSlug(slug: string | null) {
  if (!slug) return null;
  return statusSlugs[slug] ?? null;
}

export function slugForStatus(status: OrderStatus) {
  const entry = Object.entries(statusSlugs).find(([, value]) => value === status);
  return entry?.[0] ?? "pendente";
}

function item(productId: string, qty: number, color: string, size = "Único"): OrderItem {
  const product = getProduct(productId);
  if (!product) {
    throw new Error(`Produto ausente no catálogo: ${productId}`);
  }

  return {
    productId,
    name: product.name,
    image: product.images[0]?.src ?? "",
    color,
    size,
    qty,
    price: product.price,
    supplier: product.supplier,
    sku: product.sku,
  };
}

function createOrder(
  input: Omit<Order, "subtotal" | "shipping" | "total" | "trackingCode"> & {
    trackingCode?: string | null;
  },
): Order {
  const subtotal = input.items.reduce((sum, line) => sum + line.price * line.qty, 0);
  const shipping = shippingCost(subtotal);
  return {
    ...input,
    trackingCode: input.trackingCode ?? null,
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

const ana: Customer = {
  name: "Ana Clara Mendonça",
  email: "ana.mendonca@exemplo.com",
  cpf: "412.558.390-28",
  street: "Rua Harmonia",
  number: "418",
  complement: "Apto 32",
  neighborhood: "Vila Madalena",
  city: "São Paulo",
  state: "SP",
  zip: "05435-000",
  phone: "(11) 98821-4402",
};

const ricardo: Customer = {
  name: "Ricardo Alves Prado",
  email: "ricardo.prado@exemplo.com",
  cpf: "305.112.748-10",
  street: "Rua Padre Anchieta",
  number: "1260",
  complement: "",
  neighborhood: "Mercês",
  city: "Curitiba",
  state: "PR",
  zip: "80410-030",
  phone: "(41) 99120-3381",
};

const juliana: Customer = {
  name: "Juliana Pires",
  email: "juliana.pires@exemplo.com",
  cpf: "198.667.234-55",
  street: "Rua Fernandes Tourinho",
  number: "88",
  complement: "Apto 701",
  neighborhood: "Savassi",
  city: "Belo Horizonte",
  state: "MG",
  zip: "30112-000",
  phone: "(31) 98455-2190",
};

const camila: Customer = {
  name: "Camila Duarte Nunes",
  email: "camila.nunes@exemplo.com",
  cpf: "276.441.908-33",
  street: "Rua Barão de Jaguaribe",
  number: "215",
  complement: "",
  neighborhood: "Ipanema",
  city: "Rio de Janeiro",
  state: "RJ",
  zip: "22421-000",
  phone: "(21) 99710-6624",
};

const fernando: Customer = {
  name: "Fernando Rocha",
  email: "fernando.rocha@exemplo.com",
  cpf: "523.778.160-90",
  street: "Rua Padre Chagas",
  number: "79",
  complement: "Casa",
  neighborhood: "Moinhos de Vento",
  city: "Porto Alegre",
  state: "RS",
  zip: "90570-080",
  phone: "(51) 99208-1143",
};

const beatriz: Customer = {
  name: "Beatriz Nogueira",
  email: "beatriz.nogueira@exemplo.com",
  cpf: "641.903.557-21",
  street: "SQS 308 Bloco C",
  number: "102",
  complement: "",
  neighborhood: "Asa Sul",
  city: "Brasília",
  state: "DF",
  zip: "70355-030",
  phone: "(61) 98144-7702",
};

const lucas: Customer = {
  name: "Lucas Ferreira",
  email: "lucas.ferreira@exemplo.com",
  cpf: "387.220.814-66",
  street: "Rua Chile",
  number: "44",
  complement: "Loja 2",
  neighborhood: "Comércio",
  city: "Salvador",
  state: "BA",
  zip: "40020-000",
  phone: "(71) 99330-5581",
};

const marina: Customer = {
  name: "Marina Costa",
  email: "marina.costa@exemplo.com",
  cpf: "159.334.672-04",
  street: "Rua da Aurora",
  number: "590",
  complement: "Casa 2",
  neighborhood: "Boa Vista",
  city: "Recife",
  state: "PE",
  zip: "50060-010",
  phone: "(81) 98876-2209",
};

export const catalogOrders: Order[] = [
  createOrder({
    id: "HB-1048",
    createdAt: "2026-09-28T15:10:00.000Z",
    status: "Pago",
    customer: ana,
    items: [item("potes-aurora", 1, "Areia")],
    origin: "catalogo",
  }),
  createOrder({
    id: "HB-1047",
    createdAt: "2026-09-28T11:40:00.000Z",
    status: "Processando (Fornecedor)",
    customer: ricardo,
    items: [item("difusor-serra", 1, "Terracota"), item("luminaria-linho", 1, "Areia")],
    origin: "catalogo",
  }),
  createOrder({
    id: "HB-1046",
    createdAt: "2026-09-27T18:05:00.000Z",
    status: "Pendente",
    customer: juliana,
    items: [item("organizador-nido", 1, "Sálvia")],
    origin: "catalogo",
  }),
  createOrder({
    id: "HB-1045",
    createdAt: "2026-09-26T13:22:00.000Z",
    status: "Enviado",
    customer: camila,
    items: [item("toalhas-areia", 1, "Areia", "Banho")],
    origin: "catalogo",
  }),
  createOrder({
    id: "HB-1044",
    createdAt: "2026-09-24T09:15:00.000Z",
    status: "Entregue",
    customer: fernando,
    items: [item("cesto-bruma", 1, "Carvalho")],
    origin: "catalogo",
  }),
  createOrder({
    id: "HB-1043",
    createdAt: "2026-09-23T16:48:00.000Z",
    status: "Pago",
    customer: beatriz,
    items: [item("panos-linho", 1, "Off-white"), item("tabua-carvalho", 1, "Carvalho")],
    origin: "catalogo",
  }),
  createOrder({
    id: "HB-1042",
    createdAt: "2026-09-22T12:03:00.000Z",
    status: "Processando (Fornecedor)",
    customer: lucas,
    items: [item("luminaria-linho", 1, "Terracota")],
    origin: "catalogo",
  }),
  createOrder({
    id: "HB-1041",
    createdAt: "2026-09-20T19:30:00.000Z",
    status: "Enviado",
    customer: marina,
    items: [item("potes-aurora", 2, "Off-white")],
    origin: "catalogo",
  }),
];
