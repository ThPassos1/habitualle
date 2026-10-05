import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { CartProvider } from "@/components/providers/cart-provider";

import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured;
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;
  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${preview}`;
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Habitualle — Inteligência e conforto para o seu lar",
    template: "%s | Habitualle",
  },
  description:
    "Peças de casa para cozinha, organização, limpeza e descanso. A Habitualle deixa a rotina mais leve.",
  openGraph: {
    title: "Habitualle",
    description: "Inteligência e conforto para o seu lar.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-stone-50 font-sans text-stone-800 antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
