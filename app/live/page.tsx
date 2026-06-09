import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "KAINOVA — Live" };

export default function LivePage() {
  const rtmp = process.env.NEXT_PUBLIC_LIVEKIT_RTMP_ENDPOINT ?? "pump-prod-tg2x8veh.rtmp.livekit.cloud";
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-5 py-12">
          <h1 className="headline text-4xl font-bold tracking-tight">Live</h1>
          <p className="text-[var(--ink-2)] mt-2 text-sm">
            KAINOVA livestream pulled from LiveKit / pump.fun. Push from OBS to the RTMP endpoint, watch on pump.fun + here.
          </p>
          <div className="mt-6 aspect-video w-full rounded-xl border border-[var(--line)] bg-black grid place-items-center">
            <div className="text-center px-6">
              <div className="text-[var(--ink-2)] text-sm uppercase tracking-widest">Stream offline</div>
              <div className="font-mono text-xs mt-2 break-all">{rtmp}</div>
              <a
                href="https://pump.fun/coin/S6HtvuH2tSt7EmdVNPwZdHfEA9Aq8iAKLf3SYbzpump"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block px-4 py-2 rounded-lg bg-white text-black text-sm font-medium"
              >
                Watch on pump.fun
              </a>
            </div>
          </div>
          <div className="mt-8 border border-[var(--line)] rounded-xl p-5 text-sm text-[var(--ink-1)]">
            <div className="font-bold mb-2">Streamer setup</div>
            <ol className="list-decimal pl-5 space-y-1 text-[var(--ink-2)]">
              <li>OBS → Settings → Stream → Service: Custom</li>
              <li>Server: <code className="text-white">rtmp://{rtmp}/live</code></li>
              <li>Stream key: from pump.fun livestream dashboard</li>
              <li>Start streaming. pump.fun ingests, this page mirrors the playback URL.</li>
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
