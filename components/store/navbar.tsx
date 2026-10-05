"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { useCart } from "@/components/providers/cart-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { categories } from "@/lib/categories";
import { cn } from "@/lib/utils";

const links = [
  { href: "/colecao", label: "Coleção" },
  ...categories.map((category) => ({
    href: `/categoria/${category.slug}`,
    label: category.nav,
  })),
];

export function Navbar() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-24 max-w-7xl items-center px-5 md:px-8">
        <Link href="/" aria-label="Habitualle, página inicial" className="z-10 shrink-0">
          <Logo priority className="h-16 md:h-20" />
        </Link>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "py-1 text-[12px] uppercase tracking-[0.18em] text-stone-500 transition-colors duration-300 ease-in-out hover:text-stone-800",
                  active && "text-stone-800",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="z-10 ml-auto flex items-center gap-1">
          <button
            type="button"
            className="rounded-md p-2 text-stone-700 transition-colors duration-300 ease-in-out hover:bg-sand-100 lg:hidden"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={openCart}
            className="relative rounded-md p-2 text-stone-700 transition-colors duration-300 ease-in-out hover:bg-sand-100"
            aria-label={
              count > 0
                ? `Abrir carrinho, ${count} ${count === 1 ? "peça" : "peças"}`
                : "Abrir carrinho"
            }
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta-500 px-1 text-[10px] text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="p-0">
          <div className="px-6 pb-6 pt-14">
            <SheetHeader>
              <SheetTitle>A casa</SheetTitle>
              <SheetDescription>Escolha um canto para explorar.</SheetDescription>
            </SheetHeader>
            <nav className="mt-8 flex flex-col">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-stone-200 py-4 font-serif text-2xl text-stone-800"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/ajuda"
                onClick={() => setMenuOpen(false)}
                className="border-b border-stone-200 py-4 font-serif text-2xl text-stone-800"
              >
                Ajuda
              </Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
