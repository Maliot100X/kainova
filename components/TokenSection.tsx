import { HOLD_REQUIREMENT_UI, SITE } from "@/lib/constants";
import { ContractAddress } from "./ContractAddress";

export function TokenSection() {
  return (
    <section id="token" className="max-w-7xl mx-auto px-5 py-16 md:py-24">
      <div className="card p-8 md:p-12">
        <div className="chip mb-4">Tokenomics</div>
        <h2 className="headline text-4xl md:text-5xl font-bold mb-4">
          {SITE.ticker} powers the realm
        </h2>
        <p className="text-[var(--ink-1)] mb-8 max-w-2xl text-lg">
          Hold at least{" "}
          <span className="text-white font-semibold">
            {HOLD_REQUIREMENT_UI.toLocaleString()} {SITE.ticker}
          </span>{" "}
          in your Solana wallet to unlock Play. Holding gates access — every Marketplace,
          every spinner spin, every realm chat seat is for holders only.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="panel p-5">
            <div className="text-[var(--ink-2)] text-xs uppercase tracking-widest mb-2">
              Gate threshold
            </div>
            <div className="headline text-2xl font-bold">
              {HOLD_REQUIREMENT_UI.toLocaleString()}
            </div>
            <div className="text-sm text-[var(--ink-1)]">{SITE.ticker} minimum hold</div>
          </div>
          <div className="panel p-5">
            <div className="text-[var(--ink-2)] text-xs uppercase tracking-widest mb-2">
              Marketplace fee
            </div>
            <div className="headline text-2xl font-bold">5%</div>
            <div className="text-sm text-[var(--ink-1)]">to realm treasury</div>
          </div>
          <div className="panel p-5">
            <div className="text-[var(--ink-2)] text-xs uppercase tracking-widest mb-2">
              Spinner burn
            </div>
            <div className="headline text-2xl font-bold">50%</div>
            <div className="text-sm text-[var(--ink-1)]">of paid spins burned</div>
          </div>
        </div>
        <ContractAddress />
      </div>
    </section>
  );
}
