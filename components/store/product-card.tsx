"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { StoreImage } from "@/components/store/store-image";
import { categoryName } from "@/lib/categories";
import { formatBRL } from "@/lib/format";
import type { Product } from "@/lib/products";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const image = product.images[0];

  return (
    <motion.article
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeInOut", delay: index * 0.08 }}
    >
      <Link href={`/product/${product.id}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand-100">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {image && <StoreImage src={image.src} alt={image.alt} />}
          </motion.div>
        </div>
        <div className="mt-4">
          <h3 className="font-serif text-xl text-stone-800">{product.name}</h3>
          <p className="mt-1 text-sm text-stone-500">{categoryName(product.category)}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-sm text-stone-800">{formatBRL(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-xs text-stone-400 line-through">{formatBRL(product.compareAtPrice)}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
