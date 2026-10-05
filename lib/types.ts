export type OrderStatus =
  | "Pendente"
  | "Pago"
  | "Processando (Fornecedor)"
  | "Enviado"
  | "Entregue"
  | "Cancelado";

export type Customer = {
  name: string;
  email: string;
  cpf: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  qty: number;
  price: number;
  supplier: string;
  sku: string;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  origin: "catalogo" | "loja";
  trackingCode: string | null;
  paymentId?: string | null;
  paymentStatus?: string | null;
};

export type TrackedItem = {
  id: string;
  name: string;
  image: string;
  color: string;
  size: string;
  qty: number;
  price: number;
};

export type TrackedOrder = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  trackingCode: string | null;
  customerName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  items: TrackedItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  qty: number;
  supplier: string;
  sku: string;
};
