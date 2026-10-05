import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ajuda",
  description: "Envios, trocas e cuidados das peças Habitualle.",
};

const sections = [
  {
    title: "Envio",
    body: "Enviamos para todo o Brasil. Na página Rastreio, informe o número HB e o e-mail ou o CPF do pedido. Quando o pedido é postado, o código de rastreio aparece nessa mesma página.",
  },
  {
    title: "Frete",
    body: "Pedidos a partir de R$ 299 têm frete grátis. Abaixo disso, o frete fixo de R$ 29 aparece no carrinho e no checkout, antes de você confirmar.",
  },
  {
    title: "Trocas",
    body: "Você tem 7 dias depois do recebimento para pedir troca, com a peça sem uso e na embalagem. Escreva para o e-mail do pedido com o número HB e a gente orienta a devolução.",
  },
  {
    title: "Cuidados",
    body: "Cada produto traz material e lavagem na própria página. Linho e madeira pedem mão leve. Vidro pode ir à máquina. Quando houver dúvida, o cuidado escrito na ficha vale mais do que um palpite.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.22em] text-sage-700">Ajuda</p>
      <h1 className="mt-3 font-serif text-4xl text-stone-800 md:text-5xl">Envios, trocas e cuidados</h1>
      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif text-2xl text-stone-800">{section.title}</h2>
            <p className="mt-3 text-base leading-relaxed text-stone-600">
              {section.title === "Envio" ? (
                <>
                  Enviamos para todo o Brasil. Na página{" "}
                  <Link href="/rastreio" className="underline underline-offset-4">
                    Rastreio
                  </Link>
                  , informe o número HB e o e-mail ou o CPF do pedido. Quando o pedido é postado, o
                  código de rastreio aparece nessa mesma página.
                </>
              ) : (
                section.body
              )}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
