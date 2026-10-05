import Link from "next/link";

import { Logo } from "@/components/logo";
import { categories } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-sand-50">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <Logo className="h-28" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-600">
            Peças de uso diário para uma casa que funciona com calma. Cozinha, ordem, limpeza e
            descanso.
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">A casa</p>
          <ul className="mt-4 space-y-2 text-sm text-stone-700">
            <li>
              <Link href="/colecao" className="hover:text-stone-800">
                Coleção
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/categoria/${category.slug}`} className="hover:text-stone-800">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Depois da compra</p>
          <ul className="mt-4 space-y-2 text-sm text-stone-700">
            <li>
              <Link href="/rastreio" className="hover:text-stone-800">
                Acompanhar pedido
              </Link>
            </li>
            <li>
              <Link href="/ajuda" className="hover:text-stone-800">
                Envios, trocas e cuidados
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-stone-800">
                Área da equipe
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-200/80">
        <p className="mx-auto max-w-7xl px-6 py-5 text-xs text-stone-500 md:px-8">
          © {new Date().getFullYear()} Habitualle. Casa, rotina e conforto.
        </p>
      </div>
    </footer>
  );
}
