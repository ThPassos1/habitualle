import Link from "next/link";

import { CategoryGrid } from "@/components/store/category-grid";
import { Hero } from "@/components/store/hero";
import { ProductCard } from "@/components/store/product-card";
import { StoreImage } from "@/components/store/store-image";
import { listFeaturedProducts } from "@/lib/catalog";

const EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const favorites = await listFeaturedProducts();

  return (
    <>
      <Hero />
      <CategoryGrid />
      <section id="favoritos" className="scroll-mt-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-sage-700">Favoritos da semana</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-stone-800 md:text-5xl">
                O que a casa está pedindo agora
              </h2>
            </div>
            <Link
              href="/colecao"
              className="text-sm text-stone-600 underline decoration-sand-300 underline-offset-4"
            >
              Ver a coleção inteira
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {favorites.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:px-8 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-sage-700">A casa em ordem</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-stone-800">
              Menos coisa espalhada. Mais tempo para viver o cômodo.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-stone-600">
              A Habitualle escolhe peças de uso diário com forma calma: o que organiza a cozinha,
              fecha a gaveta e abaixa a luz no fim do dia.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-sand-100">
            <StoreImage
              src={EDITORIAL_IMAGE}
              alt="Sala com sofá claro, madeira e luz da tarde"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3 md:px-8">
          <div>
            <h3 className="font-serif text-2xl text-stone-800">Envio para todo o Brasil</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              O código de rastreio aparece na página{" "}
              <Link href="/rastreio" className="underline underline-offset-4">
                Rastreio
              </Link>{" "}
              quando o pedido é postado.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-stone-800">Troca em 7 dias</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Se a peça não couber na rotina, a troca começa pelo e-mail do pedido.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-stone-800">Cuidado em cada ficha</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Material e lavagem ficam escritos na página, antes de você decidir.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
