import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 text-center">
      <Link href="/" aria-label="Habitualle, página inicial">
        <Logo className="mx-auto h-28" />
      </Link>
      <h1 className="mt-8 font-serif text-4xl text-stone-800">Esta página não está na casa</h1>
      <p className="mt-4 max-w-md text-stone-600">
        O endereço pode ter mudado. A coleção continua no mesmo lugar.
      </p>
      <Button asChild className="mt-8">
        <Link href="/colecao">Voltar à coleção</Link>
      </Button>
    </div>
  );
}
