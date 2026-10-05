"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, LayoutDashboard, LogOut, Package, Store, Users } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="md:grid md:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-b border-stone-200 bg-white md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r">
          <div className="flex items-center justify-between px-5 py-5">
            <Link href="/admin" aria-label="Painel Habitualle">
              <Logo className="h-24" />
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:px-3">
            {items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-stone-600 transition-colors duration-300 ease-in-out hover:bg-sand-50 hover:text-stone-800",
                    active && "bg-sand-100 text-stone-800",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden gap-1 px-3 py-4 md:flex md:flex-col">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-stone-600 transition-colors duration-300 hover:bg-sand-50 hover:text-stone-800"
            >
              <Store className="h-4 w-4" />
              Ver loja
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-stone-600 transition-colors duration-300 hover:bg-sand-50 hover:text-stone-800"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
