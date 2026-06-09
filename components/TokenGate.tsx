"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@/lib/wallet";
import { ADMIN_WALLET, HOLD_REQUIREMENT_UI, SITE } from "@/lib/constants";
import { WalletButton } from "./WalletButton";

type GateResp = {
  ok: boolean;
  allowed: boolean;
  reason:
    | "admin"
    | "sufficient"
    | "insufficient"
    | "no_account"
    | "invalid_wallet"
    | "rpc_error";
  balanceUi: number;
  threshold: number;
};

export function TokenGate({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const [check, setCheck] = useState<GateResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setCheck(null);
      return;
    }
    setLoading(true);
    setErr(null);
    fetch(`/api/token/balance?wallet=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((j: GateResp) => setCheck(j))
      .catch((e) => setErr(e instanceof Error ? e.message : "Lookup failed"))
      .finally(() => setLoading(false));
  }, [address]);

  if (!address) {
    return (
      <GateShell title="Connect a wallet to enter">
        <p className="text-[var(--ink-1)] mb-4">
          Connect any Solana wallet (Phantom, Solflare, Backpack). The realm checks for{" "}
          <b>{HOLD_REQUIREMENT_UI.toLocaleString()} {SITE.ticker}</b> before opening the gates.
        </p>
        <WalletButton />
      </GateShell>
    );
  }
  if (loading || !check) {
    return (
      <GateShell title="Verifying balance…">
        <p className="text-[var(--ink-1)] text-sm">Reading your KAINOVA balance from the Solana mainnet.</p>
      </GateShell>
    );
  }
  if (err) {
    return (
      <GateShell title="Gate error">
        <p className="text-[var(--rust)] text-sm">{err}</p>
      </GateShell>
    );
  }
  if (check.allowed) {
    return <>{children}</>;
  }

  // not allowed
  const isAdminWallet = address === ADMIN_WALLET;
  return (
    <GateShell title={`The realm gates are closed`}>
      <p className="text-[var(--ink-1)] mb-3">
        Detected wallet:{" "}
        <span className="font-mono text-white">
          {address.slice(0, 6)}…{address.slice(-6)}
        </span>
      </p>
      <p className="text-[var(--ink-1)] mb-3">
        Balance:{" "}
        <span className="text-white font-semibold tabular-nums">
          {check.balanceUi.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>{" "}
        {SITE.ticker}
      </p>
      <p className="text-[var(--ink-1)] mb-6">
        Required:{" "}
        <span className="text-white font-semibold">
          {HOLD_REQUIREMENT_UI.toLocaleString()} {SITE.ticker}
        </span>
      </p>
      {check.reason === "no_account" && (
        <p className="text-sm text-[var(--ink-2)] mb-4">
          No KAINOVA token account found on this wallet — buy or receive any amount to create the
          ATA, then refresh.
        </p>
      )}
      {check.reason === "rpc_error" && (
        <p className="text-sm text-[var(--rust)] mb-4">
          The Solana RPC failed to answer. Try again in a moment.
        </p>
      )}
      {!isAdminWallet && (
        <a
          href={SITE.pumpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Buy {SITE.ticker} on pump.fun ↗
        </a>
      )}
      <Link href="/" className="btn btn-ghost ml-2">
        ← Home
      </Link>
    </GateShell>
  );
}

function GateShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl mx-auto px-5 py-20">
      <Link href="/" className="text-sm text-[var(--ink-2)] hover:text-white">
        ← {SITE.name}
      </Link>
      <h1 className="headline text-3xl md:text-4xl font-bold mt-4 mb-4">{title}</h1>
      <div className="card p-6">{children}</div>
    </div>
  );
}
