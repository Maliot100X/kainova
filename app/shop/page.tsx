import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShopClient } from "@/components/ShopClient";

export const metadata = { title: "KAINOVA — Shop" };

export default function ShopPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-5 py-12">
          <h1 className="headline text-4xl font-bold tracking-tight mb-1">Realm Shop</h1>
          <p className="text-[var(--ink-2)] text-sm mb-8">
            Spend credits to unlock weapons, armor, tools, and legendary skins.
            Credits are earned by playing — or gifted to realm founders.
          </p>
          <ShopClient />
        </section>
      </main>
      <Footer />
    </>
  );
}
