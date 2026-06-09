"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { ADMIN_WALLET } from "@/lib/constants";

function short(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WalletButton() {
  const { address, connect, disconnect, connecting } = useWallet();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (address) {
    const isAdmin = address === ADMIN_WALLET;
    return (
      <div className="relative">
        <button
          className="btn btn-ghost text-sm"
          onClick={() => setOpen((o) => !o)}
        >
          {isAdmin ? "👑 " : ""}
          {short(address)}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 panel min-w-[220px] p-2 z-50">
            <div className="px-3 py-2 text-xs text-[var(--ink-2)] font-mono break-all">
              {address}
            </div>
            <button
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/5"
              onClick={async () => {
                await navigator.clipboard.writeText(address);
                setOpen(false);
              }}
            >
              Copy address
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/5 text-[var(--rust)]"
              onClick={async () => {
                await disconnect();
                setOpen(false);
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        className="btn btn-primary text-sm"
        disabled={connecting}
        onClick={() => setOpen((o) => !o)}
      >
        {connecting ? "Connecting…" : "Connect Wallet"}
      </button>
      {open && !connecting && (
        <div className="absolute right-0 mt-2 panel min-w-[200px] p-2 z-50">
          {(["phantom", "solflare", "backpack"] as const).map((name) => (
            <button
              key={name}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/5 capitalize"
              onClick={async () => {
                setErr(null);
                try {
                  await connect(name);
                  setOpen(false);
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Failed");
                }
              }}
            >
              {name}
            </button>
          ))}
          {err && (
            <div className="px-3 py-2 text-xs text-[var(--rust)]">{err}</div>
          )}
        </div>
      )}
    </div>
  );
}
