"use client";

import { useEffect, useState } from "react";
import type { HUDSnapshot } from "@/lib/game/engine";
import type { ItemKind } from "@/lib/game/types";

const ITEM_EMOJI: Record<ItemKind, string> = {
  axe: "🪓", pickaxe: "⛏️", rod: "🎣", sword: "⚔️", hammer: "🔨",
  wood: "🪵", stone: "🪨", coal: "⬛", fish: "🐟", gold: "🪙",
};

const RARITY_COLOR: Record<string, string> = {
  common: "text-gray-400", uncommon: "text-green-400",
  rare: "text-blue-400", epic: "text-[var(--accent)]", legendary: "text-[var(--gold)]",
};
const RARITY_BORDER: Record<string, string> = {
  common: "border-gray-500/40", uncommon: "border-green-500/50",
  rare: "border-blue-500/60", epic: "border-[var(--accent)]/70", legendary: "border-[var(--gold)]/80",
};

type ShopItem = {
  slug: string; name: string; category: string; rarity: string;
  price: number; stat_key: string | null; stat_bonus: number;
  emoji: string; description: string;
};

export function HUD({
  snap, wallet, onSelectSlot, onReset, onToggleAgent,
  onEquipSkin, onEquipStats,
}: {
  snap: HUDSnapshot;
  wallet: string | null;
  onSelectSlot: (i: number) => void;
  onReset: () => void;
  onToggleAgent: () => void;
  onEquipSkin: (emoji: string) => void;
  onEquipStats: (bonuses: { combat: number; maxHp: number; gathering: number }) => void;
}) {
  const [showEquip, setShowEquip] = useState(false);
  const [allItems, setAllItems] = useState<ShopItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<string[]>([]);
  const [credits, setCredits] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  function loadInventory() {
    if (!wallet) return;
    fetch(`/api/shop/items?wallet=${wallet}`)
      .then((r) => r.json())
      .then((j) => {
        setAllItems(j.items ?? []);
        setOwned(j.owned ?? []);
        setCredits(j.credits ?? 0);
        // Figure out which are equipped
        const equippedSlugs: string[] = [];
        fetch(`/api/shop/equipped?wallet=${wallet}`)
          .then((r) => r.json())
          .then((e) => {
            const slugs: string[] = e.equipped ?? [];
            setEquipped(slugs);
            // Apply skin from equipped skin items
            const skin = (j.items as ShopItem[])
              .filter((i: ShopItem) => slugs.includes(i.slug) && i.category === "skin")
              .map((i: ShopItem) => i.emoji)[0];
            if (skin) onEquipSkin(skin);
            // Apply stat bonuses
            const bonuses = { combat: 0, maxHp: 0, gathering: 0 };
            (j.items as ShopItem[])
              .filter((i: ShopItem) => slugs.includes(i.slug) && i.stat_key)
              .forEach((i: ShopItem) => {
                if (i.stat_key === "combat") bonuses.combat += i.stat_bonus;
                if (i.stat_key === "maxHp") bonuses.maxHp += i.stat_bonus;
                if (i.stat_key === "gathering") bonuses.gathering += i.stat_bonus;
              });
            onEquipStats(bonuses);
          })
          .catch(() => setEquipped([]));
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadInventory();
  }, [wallet]);

  async function toggleEquip(item: ShopItem) {
    if (!wallet || !owned.includes(item.slug)) return;
    setBusy(item.slug);
    const isEquipped = equipped.includes(item.slug);
    await fetch("/api/shop/equip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallet, item_slug: item.slug, equip: !isEquipped }),
    });
    setBusy(null);
    loadInventory();
  }

  const hpPct = Math.max(0, Math.min(1, snap.hp / snap.maxHp));
  const score = snap.gold + snap.kills * 25 + snap.resources * 5;
  const ownedItems = allItems.filter((i) => owned.includes(i.slug));

  return (
    <>
      {/* ── TOP-LEFT: stats panel ─────────────────────── */}
      <div className="absolute top-3 left-3 panel p-3 min-w-[230px] pointer-events-auto z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-[var(--ink-2)] uppercase tracking-widest">{snap.realm}</div>
          <div className="text-xs text-[var(--ink-2)]">
            <span className="live-dot inline-block mr-1 align-middle" />
            {snap.online} online
          </div>
        </div>
        {/* HP bar */}
        <div className="flex items-center gap-2 text-sm mb-2">
          <span>❤️</span>
          <div className="flex-1 h-2 bg-black/40 rounded overflow-hidden">
            <div className="h-full transition-all duration-200" style={{
              width: `${hpPct * 100}%`,
              background: hpPct > 0.5 ? "var(--leaf)" : hpPct > 0.25 ? "var(--gold)" : "var(--rust)",
            }} />
          </div>
          <span className="tabular-nums w-14 text-right text-xs">{snap.hp}/{snap.maxHp}</span>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 text-xs mb-2">
          <div className="flex items-center gap-1"><span>🪙</span><span className="tabular-nums font-semibold text-[var(--gold)]">{snap.gold.toLocaleString()}</span></div>
          <div className="flex items-center gap-1"><span>⚔️</span><span className="tabular-nums text-[var(--ink-1)]">{snap.kills}k</span></div>
          <div className="flex items-center gap-1"><span>🌿</span><span className="tabular-nums text-[var(--ink-1)]">{snap.resources}r</span></div>
        </div>
        <div className="text-xs text-[var(--ink-2)]">
          Score: <span className="text-white font-bold tabular-nums">{score.toLocaleString()}</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-[var(--ink-2)]">
          <div>⚔ Cmbt <span className="text-white">{snap.skills.combat}</span></div>
          <div>🌿 Gthr <span className="text-white">{snap.skills.gathering}</span></div>
        </div>
        {wallet && (
          <div className="mt-2 text-[10px] text-[var(--ink-2)] flex items-center gap-1">
            💎 <span className="text-[var(--gold)] tabular-nums">{credits.toLocaleString()}</span> credits
          </div>
        )}
      </div>

      {/* ── TOP-RIGHT: buttons ─────────────────────────── */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2 pointer-events-auto z-10">
        <button
          onClick={() => { setShowEquip((v) => !v); if (!showEquip) loadInventory(); }}
          className="px-3 py-1.5 rounded-lg border border-[var(--gold)]/50 bg-[rgba(255,206,79,0.1)] text-[var(--gold)] text-xs font-semibold hover:bg-[rgba(255,206,79,0.2)] transition"
        >
          ⚔ Equipment
        </button>
        <button
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
            snap.agentMode
              ? "border-[var(--accent)] bg-[rgba(124,92,255,0.25)] text-[var(--accent)]"
              : "border-[var(--line)] bg-white/5 text-[var(--ink-2)] hover:bg-white/10"
          }`}
          onClick={onToggleAgent}
        >
          {snap.agentMode ? "🤖 Agent ON" : "🤖 Agent OFF"}
        </button>
        <button className="btn btn-ghost text-xs" onClick={onReset}>↻ Reset</button>
      </div>

      {/* ── EQUIPMENT PANEL (slide-in) ─────────────────── */}
      {showEquip && (
        <div className="absolute top-0 right-0 h-full w-80 bg-[rgba(6,6,17,0.96)] border-l border-[var(--line)] overflow-y-auto pointer-events-auto z-20 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
            <div>
              <div className="font-bold text-sm">Equipment</div>
              {wallet && <div className="text-[10px] text-[var(--ink-2)] mt-0.5">💎 {credits.toLocaleString()} credits</div>}
            </div>
            <button onClick={() => setShowEquip(false)} className="text-[var(--ink-2)] hover:text-white text-lg">✕</button>
          </div>

          {!wallet ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-[var(--ink-2)] text-sm">
              Connect wallet to view your equipment.
            </div>
          ) : ownedItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="text-4xl mb-3">🛍️</div>
              <div className="text-[var(--ink-2)] text-sm mb-3">No items yet.</div>
              <a href="/shop" target="_blank" className="text-xs text-[var(--accent)] hover:underline">
                Visit Shop to buy equipment →
              </a>
            </div>
          ) : (
            <div className="p-3 space-y-2 flex-1">
              {/* Group by category */}
              {["weapon","armor","tool","skin"].map((cat) => {
                const catItems = ownedItems.filter((i) => i.category === cat);
                if (catItems.length === 0) return null;
                const catLabel: Record<string,string> = { weapon:"⚔️ Weapons", armor:"🛡️ Armor", tool:"⛏️ Tools", skin:"✨ Skins" };
                return (
                  <div key={cat}>
                    <div className="text-[10px] uppercase tracking-widest text-[var(--ink-2)] px-1 mb-1">{catLabel[cat]}</div>
                    {catItems.map((item) => {
                      const isEquipped = equipped.includes(item.slug);
                      return (
                        <div
                          key={item.slug}
                          className={`flex items-center gap-3 p-2 rounded-lg border mb-1 transition ${
                            isEquipped ? RARITY_BORDER[item.rarity] + " bg-[rgba(255,255,255,0.04)]" : "border-transparent hover:border-[var(--line)]"
                          }`}
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold ${RARITY_COLOR[item.rarity]}`}>{item.name}</div>
                            {item.stat_key && item.stat_bonus > 0 && (
                              <div className="text-[10px] text-[var(--leaf)]">
                                +{item.stat_bonus} {item.stat_key === "combat" ? "combat" : item.stat_key === "maxHp" ? "max HP" : "gathering"}
                              </div>
                            )}
                            {item.category === "skin" && <div className="text-[10px] text-[var(--ink-2)]">Changes your avatar</div>}
                          </div>
                          <button
                            onClick={() => toggleEquip(item)}
                            disabled={busy === item.slug}
                            className={`text-[10px] px-2 py-1 rounded font-semibold transition flex-shrink-0 ${
                              isEquipped
                                ? "bg-[var(--leaf)]/20 text-[var(--leaf)] hover:bg-[var(--leaf)]/30"
                                : "bg-white/10 text-[var(--ink-1)] hover:bg-white/20"
                            }`}
                          >
                            {busy === item.slug ? "…" : isEquipped ? "✓ On" : "Equip"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              <div className="pt-2 border-t border-[var(--line)]">
                <a href="/shop" target="_blank" className="block text-center text-xs text-[var(--accent)] hover:underline py-2">
                  Shop for more items →
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HOTBAR ──────────────────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 panel p-2 flex gap-2 pointer-events-auto z-10">
        {snap.hotbar.map((item, i) => {
          const selected = i === snap.selectedSlot;
          const count = item ? snap.inventory.find((s) => s.kind === item)?.count ?? 0 : 0;
          return (
            <button
              key={i}
              onClick={() => onSelectSlot(i)}
              className={`relative w-14 h-14 rounded-md border text-3xl flex items-center justify-center transition ${
                selected
                  ? "border-[var(--accent)] bg-[rgba(124,92,255,0.18)]"
                  : "border-[var(--line)] bg-white/5 hover:bg-white/10"
              }`}
            >
              <span>{item ? ITEM_EMOJI[item] : ""}</span>
              <span className="absolute top-0.5 left-1 kbd">{i + 1}</span>
              {item && count > 1 && (
                <span className="absolute bottom-0.5 right-1 text-[10px] font-mono tabular-nums text-white">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Resource inventory pills ─────────────────────── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-auto z-10">
        {snap.inventory
          .filter((s) => !["axe","pickaxe","rod","sword","hammer"].includes(s.kind))
          .map((s) => (
            <div key={s.kind} className="chip">
              <span>{ITEM_EMOJI[s.kind]}</span>
              <span className="tabular-nums">{s.count}</span>
            </div>
          ))}
      </div>

      {/* ── Controls tip ─────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 text-xs text-[var(--ink-2)] max-w-[240px] panel p-3 pointer-events-none z-10">
        <div className="mb-1 text-white text-sm font-semibold">Controls</div>
        <div>Click → walk / harvest / attack</div>
        <div><span className="kbd">1</span>–<span className="kbd">6</span> hotbar · <span className="kbd">A</span> agent</div>
        <div>Scroll → zoom · <span className="kbd">E</span> equipment</div>
        <div className="mt-1 opacity-60">axe→trees · pick→rocks/coal · rod→ponds · sword→mobs</div>
      </div>
    </>
  );
}
