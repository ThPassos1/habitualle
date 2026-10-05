"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  updateQty: (productId: string, color: string, size: string, qty: number) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "habitualle-cart";

function itemKey(item: Pick<CartItem, "productId" | "color" | "size">) {
  return `${item.productId}::${item.color}::${item.size}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    return {
      items,
      count,
      subtotal,
      ready,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (incoming) => {
        setItems((current) => {
          const key = itemKey(incoming);
          const existing = current.find((item) => itemKey(item) === key);
          if (!existing) {
            return [...current, { ...incoming, qty: Math.min(10, incoming.qty) }];
          }
          return current.map((item) =>
            itemKey(item) === key
              ? { ...item, qty: Math.min(10, item.qty + incoming.qty) }
              : item,
          );
        });
      },
      updateQty: (productId, color, size, qty) => {
        setItems((current) => {
          if (qty < 1) {
            return current.filter((item) => itemKey(item) !== itemKey({ productId, color, size }));
          }
          return current.map((item) =>
            itemKey(item) === itemKey({ productId, color, size })
              ? { ...item, qty: Math.min(10, qty) }
              : item,
          );
        });
      },
      removeItem: (productId, color, size) => {
        setItems((current) =>
          current.filter((item) => itemKey(item) !== itemKey({ productId, color, size })),
        );
      },
      clearCart: () => setItems([]),
    };
  }, [items, ready, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart precisa estar dentro de CartProvider");
  }
  return context;
}
