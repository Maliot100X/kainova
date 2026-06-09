"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet";
import { WalletButton } from "./WalletButton";

type ShopItem = {
  slug: string;
  name: string;
  category: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  price: number;
  stat_key: string | null;
  stat_bonus: number;
  emoji: string;
  description: string;
};

const RARITY_STYLE: Record<string, { border: string; glow: string; label: string; badge: string }> = {
  common:    { border: "border-gray-500/40",  glow: "",                              label: "text-gray-400",  badge: "bg-gray-700/50 text-gray-300" },
  uncommon:  { border: "border-green-500/50", glow: "",                              label: "text-green-400", badge: "bg-green-900/40 text-green-300" },
  rare:      { border: "border-blue-500/60",  glow: "shadow-[0_0_12px_rgba(59,130,246,0.25)]", label: "text-blue-400",  badge: "bg-blue-900/40 text-blue-200" },
  epic:      { border: "border-[var(--accent)]/70", glow: "shadow-[0_0_16px_rgba(124,92,255,0.35)]", label: "text-[var(--accent)]", badge: "bg-[rgba(124,92,255,0.2)] text-[var(--accent)]" },
  legendary: { border: "border-[var(--gold)]/80",  glow: "shadow-[0_0_20px_rgba(255,206,79,0.4)]",  label: "text-[var(--gold)]",  badge: "bg-[rgba(255,206,79,0.15)] text-[var(--gold)]" },
};

const CATEGORY_LABELS: Record<string, string> = {
  weapon: "⚔️ Weapons",
  armor:  "🛡️ Armor",
  tool:   "⛏️ Tools",
  skin:   "✨ Skins",
};

export function ShopClient() {
  const { address } = useWallet();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [credits, setCredits] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [buying, setBuying] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  function load() {
    const qs = address ? `?wallet=${address}` : "";
    fetch(`/api/shop/items${qs}`)
      .then((r) => r.json())
      .then((j) => {
        setItems(j.items ?? []);
        setOwned(j.owned ?? []);
        setCredits(j.credits ?? 0);
      });
  }

  useEffect(() => { load(); }, [address]);

  async function buy(slug: string) {
    if (!address) return;
    setBuying(slug);
    setMsg(null);
    try {
      const r = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: address, item_slug: slug }),
      });
      const j = await r.json();
      if (j.ok) {
        setMsg({ text: "Purchased! Item added to your inventory.", ok: true });
        load();
      } else {
        setMsg({ text: j.error === "insufficient_credits"
          ? `Not enough credits (need ${j.required.toLocaleString()}, have ${j.balance.toLocaleString()})`
          : j.error, ok: false });
      }
    } finally {
      setBuying(null);
    }
  }

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div>
      {/* Credits bar */}
      <div className="flex items-center justify-between mb-6 p-4 panel rounded-xl">
        <div>
          <div className="text-xs text-[var(--ink-2)] uppercase tracking-widest mb-1">Your Credits</div>
          {address ? (
            <div className="text-2xl font-bold tabular-nums text-[var(--gold)]">
              {credits.toLocaleString()} <span className="text-sm font-normal text-[var(--ink-2)]">credits</span>
            </div>
          ) : (
            <div className="text-sm text-[var(--ink-2)]">Connect wallet to view balance</div>
          )}
        </div>
        {!address && <WalletButton />}
        {address && (
          <div className="text-xs text-[var(--ink-2)] max-w-[280px] text-right">
            Credits are earned automatically as you play. Owner wallet receives 1,000,000 free credits.
          </div>
        )}
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.ok ? "bg-green-900/30 text-green-300 border border-green-500/30" : "bg-red-900/30 text-red-300 border border-red-500/30"}`}>
          {msg.text}
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              activeCategory === c
                ? "border-[var(--accent)] bg-[rgba(124,92,255,0.2)] text-white"
                : "border-[var(--line)] text-[var(--ink-2)] hover:text-white"
            }`}
          >
            {c === "all" ? "All Items" : CATEGORY_LABELS[c] ?? c}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const r = RARITY_STYLE[item.rarity] ?? RARITY_STYLE.common;
          const isOwned = owned.includes(item.slug);
          return (
            <div
              key={item.slug}
              className={`relative flex flex-col rounded-xl border p-4 bg-[rgba(255,255,255,0.02)] ${r.border} ${r.glow} transition hover:scale-[1.01]`}
            >
              {/* Rarity badge */}
              <span className={`absolute top-3 right-3 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-semibold ${r.badge}`}>
                {item.rarity}
              </span>

              {/* Emoji */}
              <div className="text-5xl mb-3 mt-1">{item.emoji}</div>

              {/* Name */}
              <div className={`text-base font-bold mb-1 ${r.label}`}>{item.name}</div>
              <div className="text-xs text-[var(--ink-2)] mb-3 flex-1">{item.description}</div>

              {/* Stat bonus */}
              {item.stat_key && item.stat_bonus > 0 && (
                <div className="text-xs text-[var(--leaf)] mb-3">
                  +{item.stat_bonus} {item.stat_key === "combat" ? "Combat" : item.stat_key === "maxHp" ? "Max HP" : "Gathering"}
                </div>
              )}

              {/* Price / action */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--line)]">
                <div className="text-sm font-semibold tabular-nums text-[var(--gold)]">
                  {item.price.toLocaleString()} cr
                </div>
                {isOwned ? (
                  <span className="text-xs text-[var(--leaf)] font-semibold">✓ Owned</span>
                ) : address ? (
                  <button
                    onClick={() => buy(item.slug)}
                    disabled={buying === item.slug || credits < item.price}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      credits >= item.price
                        ? "bg-[var(--accent)] hover:bg-[#6b4fff] text-white"
                        : "bg-white/5 text-[var(--ink-2)] cursor-not-allowed"
                    }`}
                  >
                    {buying === item.slug ? "Buying…" : "Buy"}
                  </button>
                ) : (
                  <span className="text-xs text-[var(--ink-2)]">Login to buy</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-[var(--ink-2)]">No items in this category yet.</div>
      )}
    </div>
  );
}
