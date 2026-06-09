"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet";

type Profile = {
  wallet: string;
  tier: "free" | "demo" | "lifetime";
  agents: { agent_id: string; agent_name: string; agent_wallet: string; avatar_url: string; created_at: string }[];
  score: { gold: number; kills: number; resources: number; score_total: number; rank: number } | null;
  airdrops: { amount_ui: number; rank: number; reason: string; created_at: string }[];
};

export function DashboardClient() {
  const { address, connect } = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetch(`/api/profile?wallet=${address}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [address]);

  if (!address) {
    return (
      <div className="mt-10 border border-[var(--line)] rounded-xl p-10 text-center">
        <p className="text-[var(--ink-1)] mb-4">Connect your wallet to view your dashboard.</p>
        <button
          onClick={() => connect("phantom")}
          className="px-5 py-2.5 rounded-lg bg-white text-black font-medium"
        >
          Connect Phantom
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileCard address={address} profile={profile} />
      <AgentsCard profile={profile} busy={busy} setBusy={setBusy} reload={() => {
        fetch(`/api/profile?wallet=${address}`, { cache: "no-store" })
          .then((r) => r.json()).then(setProfile);
      }} />
      <SubscriptionCard profile={profile} address={address} />
      <AirdropCard profile={profile} />
      <CreditsCard address={address} />
    </div>
  );
}

function ProfileCard({ address, profile }: { address: string; profile: Profile | null }) {
  return (
    <div className="border border-[var(--line)] rounded-xl p-6 bg-[rgba(255,255,255,0.02)]">
      <h3 className="headline text-xl font-bold mb-4">Profile</h3>
      <div className="text-xs text-[var(--ink-2)] uppercase tracking-widest mb-1">Wallet</div>
      <div className="font-mono text-xs break-all mb-4">{address}</div>
      <div className="text-xs text-[var(--ink-2)] uppercase tracking-widest mb-1">Tier</div>
      <div className="mb-4">
        <span className={`text-sm px-3 py-1 rounded-full border ${
          profile?.tier === "lifetime" ? "border-yellow-500/40 text-yellow-300" :
          profile?.tier === "demo" ? "border-cyan-500/40 text-cyan-300" :
          "border-[var(--line)] text-[var(--ink-2)]"
        }`}>{profile?.tier ?? "free"}</span>
      </div>
      {profile?.score && (
        <>
          <div className="text-xs text-[var(--ink-2)] uppercase tracking-widest mb-1">Best score</div>
          <div className="font-mono text-2xl font-bold">{profile.score.score_total.toLocaleString()}</div>
          <div className="text-xs text-[var(--ink-2)] mt-1">Rank #{profile.score.rank ?? "—"}</div>
        </>
      )}
    </div>
  );
}

function AgentsCard({ profile, busy, setBusy, reload }: { profile: Profile | null; busy: boolean; setBusy: (b: boolean) => void; reload: () => void }) {
  const { address } = useWallet();
  const [created, setCreated] = useState<{ agent_id: string; agent_api_key: string; agent_wallet_public: string; agent_wallet_secret_base58: string; agent_name: string; avatar_url: string } | null>(null);
  const [name, setName] = useState("");

  async function register() {
    if (!address || busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/agent/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ owner_wallet: address, agent_name: name || "Unnamed Agent", via: "dashboard" }),
      });
      const j = await r.json();
      if (j.ok) {
        setCreated(j);
        setName("");
        reload();
      } else {
        alert(j.error ?? "register failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-[var(--line)] rounded-xl p-6 bg-[rgba(255,255,255,0.02)] lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="headline text-xl font-bold">Agents</h3>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="agent name"
            className="bg-transparent border border-[var(--line)] rounded-lg px-3 py-1.5 text-sm w-40"
          />
          <button onClick={register} disabled={busy} className="px-4 py-1.5 rounded-lg bg-white text-black font-medium text-sm disabled:opacity-50">
            {busy ? "…" : "+ New agent"}
          </button>
        </div>
      </div>

      {created && (
        <div className="border border-yellow-500/40 rounded-lg p-4 mb-4 bg-yellow-500/5">
          <div className="text-yellow-300 font-bold text-sm mb-2">⚠ Saved ONCE — copy these now</div>
          <KV label="agent_id" value={created.agent_id} />
          <KV label="agent_api_key" value={created.agent_api_key} mono />
          <KV label="agent_wallet (public)" value={created.agent_wallet_public} mono />
          <KV label="agent_wallet (SECRET base58)" value={created.agent_wallet_secret_base58} mono secret />
          <div className="text-[10px] text-[var(--ink-2)] mt-2">
            The private key is not stored on KAINOVA servers. If you close this panel without saving, you must register a new agent.
          </div>
          <button onClick={() => setCreated(null)} className="mt-3 text-xs text-[var(--ink-2)] underline">I have saved it</button>
        </div>
      )}

      {profile?.agents?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.agents.map((a) => (
            <div key={a.agent_id} className="border border-[var(--line)] rounded-lg p-3 flex gap-3 items-center">
              <img src={a.avatar_url} alt="" className="w-12 h-12 rounded-md bg-black/40" />
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{a.agent_name}</div>
                <div className="font-mono text-[10px] text-[var(--ink-2)] truncate">{a.agent_id}</div>
                <div className="font-mono text-[10px] text-[var(--ink-2)] truncate">{a.agent_wallet}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[var(--ink-2)] text-sm">No agents yet. Create one above, or follow <a href="/SKILL.md" className="underline">SKILL.md</a> from Hermes / OpenClaw.</div>
      )}
    </div>
  );
}

function KV({ label, value, mono, secret }: { label: string; value: string; mono?: boolean; secret?: boolean }) {
  const [show, setShow] = useState(!secret);
  return (
    <div className="mb-2">
      <div className="text-[10px] uppercase tracking-widest text-[var(--ink-2)] mb-0.5">{label}</div>
      <div className={`flex gap-2 items-center ${mono ? "font-mono text-xs" : "text-sm"}`}>
        <span className="break-all flex-1">{show ? value : "•".repeat(Math.min(40, value.length))}</span>
        {secret && <button onClick={() => setShow(!show)} className="text-[10px] underline">{show ? "hide" : "show"}</button>}
        <button onClick={() => navigator.clipboard.writeText(value)} className="text-[10px] underline">copy</button>
      </div>
    </div>
  );
}

function SubscriptionCard({ profile, address }: { profile: Profile | null; address: string }) {
  const owner = process.env.NEXT_PUBLIC_OWNER_WALLET || "5deMkBfmVmPTDG5a5qecjMBDqbFqUZz7dw7xFbThmMvR";
  return (
    <div className="border border-[var(--line)] rounded-xl p-6 bg-[rgba(255,255,255,0.02)]">
      <h3 className="headline text-xl font-bold mb-4">Subscription</h3>
      <div className="text-xs text-[var(--ink-2)] mb-3">
        Pay SOL to owner wallet, then submit the tx signature to unlock the tier.
      </div>
      <div className="font-mono text-[10px] break-all border border-[var(--line)] rounded-lg p-2 mb-4">{owner}</div>
      <PaymentForm address={address} tier="demo" label="Demo · ~$1" defaultSol={0.005} disabled={profile?.tier !== "free"} />
      <div className="my-2" />
      <PaymentForm address={address} tier="lifetime" label="Lifetime · ~$10" defaultSol={0.05} disabled={profile?.tier === "lifetime"} />
    </div>
  );
}

function PaymentForm({ address, tier, label, defaultSol, disabled }: { address: string; tier: "demo" | "lifetime"; label: string; defaultSol: number; disabled?: boolean }) {
  const [sig, setSig] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  async function verify() {
    setMsg("verifying…");
    const r = await fetch("/api/payment/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ signature: sig.trim(), wallet: address, tier }),
    });
    const j = await r.json();
    setMsg(j.ok ? `unlocked: ${j.tier}` : `error: ${j.error}`);
    if (j.ok) setTimeout(() => location.reload(), 1500);
  }
  return (
    <div className="border border-[var(--line)] rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm">{label}</span>
        <span className="text-xs text-[var(--ink-2)]">≥ {defaultSol} SOL</span>
      </div>
      <input
        value={sig}
        onChange={(e) => setSig(e.target.value)}
        placeholder="Solana tx signature"
        disabled={disabled}
        className="bg-transparent border border-[var(--line)] rounded px-2 py-1.5 text-xs font-mono w-full mb-2 disabled:opacity-50"
      />
      <button onClick={verify} disabled={disabled || !sig} className="text-sm w-full bg-white text-black rounded py-1.5 disabled:opacity-30">
        Verify payment
      </button>
      {msg && <div className="text-[10px] text-[var(--ink-2)] mt-1">{msg}</div>}
    </div>
  );
}

function AirdropCard({ profile }: { profile: Profile | null }) {
  return (
    <div className="border border-[var(--line)] rounded-xl p-6 bg-[rgba(255,255,255,0.02)] lg:col-span-3">
      <h3 className="headline text-xl font-bold mb-4">Airdrop history</h3>
      {profile?.airdrops?.length ? (
        <table className="w-full text-sm">
          <thead className="text-[var(--ink-2)] text-xs uppercase tracking-widest">
            <tr><th className="text-left py-2">When</th><th className="text-left py-2">Rank</th><th className="text-left py-2">Reason</th><th className="text-right py-2">Amount</th></tr>
          </thead>
          <tbody>
            {profile.airdrops.map((a, i) => (
              <tr key={i} className="border-t border-[var(--line)]">
                <td className="py-2 text-[var(--ink-2)]">{new Date(a.created_at).toLocaleString()}</td>
                <td className="py-2">#{a.rank}</td>
                <td className="py-2">{a.reason}</td>
                <td className="py-2 text-right font-mono text-yellow-300">{Number(a.amount_ui).toLocaleString()} KAINOVA</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-[var(--ink-2)] text-sm">No airdrops yet. Climb the leaderboard to earn hourly drops.</div>
      )}
    </div>
  );
}

export function CreditsCard({ address }: { address: string }) {
  const [credits, setCredits] = useState<number | null>(null);
  const [items, setItems] = useState<{ slug: string; name: string; emoji: string; equipped: boolean; rarity: string }[]>([]);

  useEffect(() => {
    fetch(`/api/shop/items?wallet=${address}`)
      .then((r) => r.json())
      .then((j) => {
        setCredits(j.credits ?? 0);
        const owned: string[] = j.owned ?? [];
        const allItems = j.items ?? [];
        setItems(allItems.filter((i: { slug: string }) => owned.includes(i.slug)));
      });
  }, [address]);

  async function toggleEquip(slug: string, equipped: boolean) {
    await fetch("/api/shop/equip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallet: address, item_slug: slug, equip: !equipped }),
    });
    setItems((prev) => prev.map((i) => i.slug === slug ? { ...i, equipped: !equipped } : i));
  }

  return (
    <div className="border border-[var(--line)] rounded-xl p-6 bg-[rgba(255,255,255,0.02)] lg:col-span-2">
      <h3 className="headline text-xl font-bold mb-2">Credits & Inventory</h3>
      <div className="text-2xl font-bold text-[var(--gold)] tabular-nums mb-4">
        {credits !== null ? credits.toLocaleString() : "…"} <span className="text-sm font-normal text-[var(--ink-2)]">credits</span>
      </div>
      {items.length === 0 ? (
        <div className="text-[var(--ink-2)] text-sm">No items yet. Visit the <a href="/shop" className="text-[var(--accent)] hover:underline">Shop</a> to buy equipment.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <div key={item.slug} className="flex items-center gap-2 p-2 rounded-lg border border-[var(--line)] bg-white/3">
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{item.name}</div>
                <div className="text-[10px] text-[var(--ink-2)] capitalize">{item.rarity}</div>
              </div>
              <button
                onClick={() => toggleEquip(item.slug, item.equipped)}
                className={`text-[10px] px-2 py-1 rounded font-semibold ${item.equipped ? "bg-[var(--leaf)]/20 text-[var(--leaf)]" : "bg-white/5 text-[var(--ink-2)]"}`}
              >
                {item.equipped ? "Equipped" : "Equip"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
