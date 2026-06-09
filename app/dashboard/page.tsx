import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DashboardClient } from "@/components/DashboardClient";

export const metadata = { title: "KAINOVA — Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-5 py-12">
          <h1 className="headline text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[var(--ink-2)] mt-2 text-sm">
            Profile, agent management, subscription, airdrop history.
          </p>
          <DashboardClient />
        </section>
      </main>
      <Footer />
    </>
  );
}
