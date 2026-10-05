"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { ProductCard } from "@/components/store/product-card";
import { Stars } from "@/components/store/stars";
import { StoreImage } from "@/components/store/store-image";
import { Button } from "@/components/ui/button";
import { colorSwatches } from "@/lib/colors";
import { FREE_SHIPPING_FROM, formatBRL } from "@/lib/format";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductDetail({
  product,
  categoryName,
  categoryHref,
  related,
}: {
  product: Product;
  categoryName: string;
  categoryHref: string;
  related: Product[];
}) {
  const { addItem, openCart } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [color, setColor] = useState(product.colors[0] ?? "Único");
  const [size, setSize] = useState(product.sizes[0] ?? "Único");
  const [qty, setQty] = useState(1);
  const activeImage = product.images[imageIndex] ?? product.images[0];

  function addToCart() {
    if (!activeImage) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.src ?? activeImage.src,
      color,
      size,
      qty,
      supplier: product.supplier,
      sku: product.sku,
    });
    openCart();
  }

  return (
    <div>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:px-8 lg:grid-cols-2 lg:gap-16 lg:py-14">
        <div className="grid gap-3 lg:grid-cols-[88px_1fr]">
          <div className="order-2 flex gap-3 lg:order-1 lg:flex-col">
            {product.images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setImageIndex(index)}
                className={cn(
                  "relative h-20 w-16 overflow-hidden rounded-md bg-sand-100 lg:h-24 lg:w-full",
                  index === imageIndex && "ring-2 ring-stone-800 ring-offset-2",
                )}
                aria-label={`Ver imagem ${index + 1} de ${product.name}`}
                aria-pressed={index === imageIndex}
              >
                <StoreImage src={image.src} alt="" />
              </button>
            ))}
          </div>
          <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-lg bg-sand-100 lg:order-2">
            <AnimatePresence mode="wait">
              {activeImage && (
                <motion.div
                  key={activeImage.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <StoreImage src={activeImage.src} alt={activeImage.alt} priority={imageIndex === 0} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <nav className="text-xs uppercase tracking-[0.16em] text-stone-500">
            <Link href="/" className="hover:text-stone-800">
              Início
            </Link>
            <span className="px-2">/</span>
            <Link href={categoryHref} className="hover:text-stone-800">
              {categoryName}
            </Link>
          </nav>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-stone-800 md:text-5xl">
            {product.name}
          </h1>
          {product.reviewCount > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <Stars rating={product.rating} />
              <p className="text-sm text-stone-500">
                {product.rating.toFixed(1)} · {product.reviewCount} avaliações
              </p>
            </div>
          )}
          <div className="mt-6 flex items-end gap-3">
            <p className="font-serif text-4xl text-stone-800">{formatBRL(product.price)}</p>
            {product.compareAtPrice && (
              <p className="mb-1 text-sm text-stone-400 line-through">
                {formatBRL(product.compareAtPrice)}
              </p>
            )}
          </div>
          <p className="mt-4 max-w-md text-base leading-relaxed text-stone-600">{product.description}</p>

          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">Cor · {color}</p>
            <div className="mt-3 flex gap-3">
              {product.colors.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Cor ${option}`}
                  aria-pressed={option === color}
                  onClick={() => setColor(option)}
                  className={cn(
                    "h-8 w-8 rounded-full border border-stone-300 shadow-sm",
                    option === color && "ring-2 ring-stone-800 ring-offset-2",
                  )}
                  style={{ backgroundColor: colorSwatches[option] ?? "#E6D5C3" }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">Tamanho</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={option === size}
                  onClick={() => setSize(option)}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm transition-colors duration-300 ease-in-out",
                    option === size
                      ? "border-stone-800 bg-stone-800 text-stone-50"
                      : "border-stone-300 text-stone-700 hover:border-stone-500",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex h-12 w-fit items-center rounded-md border border-stone-300">
            <button
              type="button"
              className="px-4 text-stone-600"
              aria-label="Diminuir quantidade"
              onClick={() => setQty((current) => Math.max(1, current - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button
              type="button"
              className="px-4 text-stone-600"
              aria-label="Aumentar quantidade"
              onClick={() => setQty((current) => Math.min(10, current + 1))}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button type="button" size="lg" className="mt-4 w-full" onClick={addToCart}>
            Adicionar ao carrinho
          </Button>
          <p className="mt-3 text-center text-xs leading-relaxed text-stone-500">
            Frete grátis a partir de {formatBRL(FREE_SHIPPING_FROM)}. Depois do checkout, acompanhe
            pelo número do pedido na página{" "}
            <Link href="/rastreio" className="underline underline-offset-4">
              Rastreio
            </Link>
            .
          </p>

          {product.reviews.length > 0 && (
          <div className="mt-8 space-y-4 border-t border-stone-200 pt-6">
            {product.reviews.map((review) => (
              <figure key={review.author} className="text-sm leading-relaxed text-stone-600">
                <Stars rating={review.rating} />
                <blockquote className="mt-2">“{review.text}”</blockquote>
                <figcaption className="mt-1 text-xs text-stone-500">
                  {review.author}, {review.city}
                </figcaption>
              </figure>
            ))}
          </div>
          )}
        </div>
      </div>

      {(product.solutionTitle || product.solution.length > 0 || product.details.length > 0) && (
      <section className="bg-sand-50">
        <div className={cn("mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:px-8 lg:py-24", product.images[1] && "lg:grid-cols-2")}>
          {product.images[1] && (
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand-100 lg:aspect-[5/4]">
              <StoreImage src={product.images[1].src} alt={product.images[1].alt} />
            </div>
          )}
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-sage-700">Solução do problema</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-stone-800">
              {product.solutionTitle}
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-stone-600">
              {product.solution.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ul className="mt-6 space-y-2 text-sm leading-relaxed text-stone-700">
              {product.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terracotta-400" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      )}

      {related.length > 0 && (
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <h2 className="font-serif text-4xl text-stone-800">Combina com o seu lar</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-600">
          Peças que entram na mesma rotina e não competem entre si.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
          {related.map((item, index) => (
            <ProductCard key={item.id} product={item} index={index} />
          ))}
        </div>
      </section>
      )}
    </div>
  );
}
