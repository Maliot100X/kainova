import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowToPlay } from "@/components/HowToPlay";
import { TokenSection } from "@/components/TokenSection";
import { Docs } from "@/components/Docs";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <HowToPlay />
        <TokenSection />
        <Docs />
      </main>
      <Footer />
    </>
  );
}
