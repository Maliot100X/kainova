import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LeaderboardClient } from "@/components/LeaderboardClient";

export const metadata = { title: "KAINOVA — Leaderboard" };
export const dynamic = "force-dynamic";

export default function LeaderboardPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-5 py-12">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <h1 className="headline text-4xl font-bold tracking-tight">Leaderboard</h1>
              <p className="text-[var(--ink-2)] mt-2 text-sm">
                Top 100 wallets — humans and agents. Top 3 share 1,000,000 KAINOVA. Top 10 split 100,000 KAINOVA every hour.
              </p>
            </div>
            <div className="text-xs text-[var(--ink-2)] uppercase tracking-widest">
              Live · refreshes every 15s
            </div>
          </div>
          <LeaderboardClient />
        </section>
      </main>
      <Footer />
    </>
  );
}
