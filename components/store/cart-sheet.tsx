"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { StoreImage } from "@/components/store/store-image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatBRL, shippingCost } from "@/lib/format";

export function CartSheet() {
  const { items, isOpen, openCart, closeCart, subtotal, count, updateQty, removeItem } = useCart();
  const shipping = shippingCost(subtotal);
  const total = subtotal + shipping;
  const missingForFreeShipping = Math.max(0, 299 - subtotal);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <SheetContent className="gap-0 p-0">
        <div className="border-b border-stone-200 px-6 py-5 pr-14">
          <SheetHeader>
            <SheetTitle>Carrinho</SheetTitle>
            <SheetDescription>
              {count === 0 ? "Sua sacola está vazia." : `${count} ${count === 1 ? "peça" : "peças"}`}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-start justify-center">
              <p className="font-serif text-2xl text-stone-800">Nada por aqui ainda.</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                A coleção está aberta quando você quiser escolher a primeira peça.
              </p>
              <Button asChild className="mt-6" onClick={closeCart}>
                <Link href="/colecao">Ver a coleção</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-4">
                  <Link
                    href={`/product/${item.productId}`}
                    onClick={closeCart}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-sand-100"
                  >
                    <StoreImage src={item.image} alt={item.name} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/product/${item.productId}`}
                          onClick={closeCart}
                          className="font-serif text-lg leading-tight text-stone-800"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-xs text-stone-500">
                          {item.color} · {item.size}
                        </p>
                      </div>
                      <p className="text-sm text-stone-800">{formatBRL(item.price * item.qty)}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-stone-300">
                        <button
                          type="button"
                          className="px-2 py-1 text-stone-600"
                          aria-label={`Diminuir ${item.name}`}
                          onClick={() => updateQty(item.productId, item.color, item.size, item.qty - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.qty}</span>
                        <button
                          type="button"
                          className="px-2 py-1 text-stone-600"
                          aria-label={`Aumentar ${item.name}`}
                          onClick={() => updateQty(item.productId, item.color, item.size, item.qty + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-stone-400 transition-colors duration-300 hover:text-stone-800"
                        aria-label={`Remover ${item.name}`}
                        onClick={() => removeItem(item.productId, item.color, item.size)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-200 px-6 py-5">
            <div className="space-y-2 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-800">{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="text-stone-800">{shipping === 0 ? "Grátis" : formatBRL(shipping)}</span>
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-sm text-stone-600">Total</span>
              <span className="font-serif text-3xl text-stone-800">{formatBRL(total)}</span>
            </div>
            {missingForFreeShipping > 0 && (
              <p className="mt-2 text-xs leading-relaxed text-stone-500">
                Faltam {formatBRL(missingForFreeShipping)} para o frete grátis.
              </p>
            )}
            <Button asChild size="lg" className="mt-4 w-full" onClick={closeCart}>
              <Link href="/checkout">Ir para o checkout</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
