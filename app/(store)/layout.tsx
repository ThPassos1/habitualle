import { CartSheet } from "@/components/store/cart-sheet";
import { Footer } from "@/components/store/footer";
import { Navbar } from "@/components/store/navbar";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-sand-100 py-2.5 text-center text-[11px] uppercase tracking-[0.22em] text-stone-600">
        Peças para uma casa que funciona com calma
      </div>
      <Navbar />
      <main id="conteudo">{children}</main>
      <Footer />
      <CartSheet />
    </>
  );
}
