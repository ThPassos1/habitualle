"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { StoreImage } from "@/components/store/store-image";
import { Button } from "@/components/ui/button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2400&q=80";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative h-[88vh] min-h-[640px] overflow-hidden bg-sand-200">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      >
        <StoreImage
          src={HERO_IMAGE}
          alt="Sala de estar com sofá de linho, luz natural e mesa de madeira"
          priority
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 via-stone-900/25 to-stone-900/10" />
      <motion.div
        className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-6 pb-16 md:items-center md:px-8 md:pb-0"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeInOut", delay: 0.25 }}
      >
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-100/90">Nova coleção</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.08] text-stone-50 md:text-6xl">
            Inteligência e <span className="italic">conforto</span> para o seu lar
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-stone-100/90 md:text-lg">
            Objetos simples para cozinha, ordem e descanso. Escolhidos para deixar a rotina mais leve.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="light">
              <Link href="/colecao">Explorar a coleção</Link>
            </Button>
            <Link
              href="/#favoritos"
              className="text-sm text-stone-50 underline decoration-stone-200/70 underline-offset-4"
            >
              Ver favoritos da semana
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
