import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/store/product-card";
import { StoreImage } from "@/components/store/store-image";
import { getCategory } from "@/lib/categories";
import { listProductsByCategory } from "@/lib/catalog";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const category = getCategory(params.slug);
  if (!category) return { title: "Categoria" };
  return { title: category.name, description: category.description };
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: Props) {
  const category = getCategory(params.slug);
  if (!category) notFound();
  const items = await listProductsByCategory(category.slug);

  return (
    <div>
      <section className="relative h-72 overflow-hidden bg-sand-200 md:h-96">
        <StoreImage src={category.image} alt={category.imageAlt} priority />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-8 md:px-8 md:pb-12">
          <p className="text-[11px] uppercase tracking-[0.22em] text-stone-100/80">{category.eyebrow}</p>
          <h1 className="mt-2 font-serif text-4xl text-stone-50 md:text-5xl">{category.name}</h1>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <p className="max-w-xl text-base leading-relaxed text-stone-600">{category.description}</p>
        {items.length === 0 ? (
          <p className="mt-10 text-stone-600">Esta categoria ainda está sendo preparada.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {items.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
