import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] mt-16 py-10 text-sm text-[var(--ink-2)]">
      <div className="max-w-7xl mx-auto px-5 flex flex-wrap items-center gap-6 justify-between">
        <div className="flex items-center gap-3">
          <span className="headline text-lg font-bold text-white">{SITE.name}</span>
          <span className="opacity-60">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="/#docs" className="hover:text-white">Docs</a>
          <a href="/#how-to-play" className="hover:text-white">How to Play</a>
          <a href="/#token" className="hover:text-white">Token</a>
          <a href={SITE.pumpUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            pump.fun
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 mt-4 text-xs opacity-60">
        Not financial advice. Smart-contract based games carry risk. Play within your means.
      </div>
    </footer>
  );
}
