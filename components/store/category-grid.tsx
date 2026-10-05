"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { StoreImage } from "@/components/store/store-image";
import { categories } from "@/lib/categories";

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
      <div className="max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-sage-700">A casa por cômodo</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-stone-800 md:text-5xl">
          Para cada canto da rotina
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {categories.map((category, index) => (
          <motion.div
            key={category.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: index * 0.08 }}
          >
            <Link href={`/categoria/${category.slug}`} className="group block">
              <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-sand-100">
                <motion.div
                  className="absolute inset-0"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <StoreImage src={category.image} alt={category.imageAlt} />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/55 via-stone-900/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-stone-100/80">
                    {category.eyebrow}
                  </p>
                  <h3 className="mt-2 font-serif text-3xl text-stone-50">{category.name}</h3>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
