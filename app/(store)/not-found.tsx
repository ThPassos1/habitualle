import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function StoreNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">404</p>
      <h1 className="mt-3 font-serif text-4xl text-stone-800">Esta página não está na casa</h1>
      <p className="mt-4 text-stone-600">O endereço pode ter mudado. A coleção continua no mesmo lugar.</p>
      <Button asChild className="mt-8">
        <Link href="/colecao">Voltar à coleção</Link>
      </Button>
    </div>
  );
}
