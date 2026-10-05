import type { Metadata } from "next";

import { ProductCard } from "@/components/store/product-card";
import { listStoreProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Coleção",
  description: "Peças de uso diário para cozinha, organização, limpeza e descanso.",
};

export const dynamic = "force-dynamic";

export default async function CollectionPage() {
  const products = await listStoreProducts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.22em] text-sage-700">A coleção</p>
      <h1 className="mt-3 max-w-xl font-serif text-4xl leading-tight text-stone-800 md:text-5xl">
        Peças de uso diário, com cara de casa vivida.
      </h1>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
}
