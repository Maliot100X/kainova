"use client";

import type { HUDSnapshot } from "@/lib/game/engine";
import type { ItemKind } from "@/lib/game/types";

const ITEM_EMOJI: Record<ItemKind, string> = {
  axe: "🪓",
  pickaxe: "⛏️",
  rod: "🎣",
  sword: "⚔️",
  hammer: "🔨",
  wood: "🪵",
  stone: "🪨",
  coal: "⬛",
  fish: "🐟",
  gold: "🪙",
};

export function HUD({
  snap,
  onSelectSlot,
  onReset,
}: {
  snap: HUDSnapshot;
  onSelectSlot: (i: number) => void;
  onReset: () => void;
}) {
  const hpPct = Math.max(0, Math.min(1, snap.hp / snap.maxHp));
  return (
    <>
      {/* Top-left: HP + gold */}
      <div className="absolute top-3 left-3 panel p-3 min-w-[220px] pointer-events-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-[var(--ink-2)] uppercase tracking-widest">
            {snap.realm}
          </div>
          <div className="text-xs text-[var(--ink-2)]">
            <span className="live-dot inline-block mr-1 align-middle" />
            {snap.online} online
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm mb-2">
          <span>❤️</span>
          <div className="flex-1 h-2 bg-black/40 rounded overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${hpPct * 100}%`,
                background:
                  hpPct > 0.5 ? "var(--leaf)" : hpPct > 0.25 ? "var(--gold)" : "var(--rust)",
                transition: "width 0.2s ease",
              }}
            />
          </div>
          <span className="tabular-nums w-12 text-right">
            {snap.hp}/{snap.maxHp}
          </span>
        </div>
        <div className="text-sm flex items-center gap-2">
          <span>🪙</span>
          <span className="tabular-nums font-semibold text-[var(--gold)]">
            {snap.gold.toLocaleString()}
          </span>
          <span className="text-[var(--ink-2)] text-xs">gold</span>
        </div>
      </div>

      {/* Top-right: Reset save (dev affordance) */}
      <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto">
        <button
          className="btn btn-ghost text-xs"
          onClick={onReset}
          title="Reset character & save"
        >
          ↻ Reset
        </button>
      </div>

      {/* Bottom: hotbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 panel p-2 flex gap-2 pointer-events-auto">
        {snap.hotbar.map((item, i) => {
          const selected = i === snap.selectedSlot;
          const count =
            item ? snap.inventory.find((s) => s.kind === item)?.count ?? 0 : 0;
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
                <span className="absolute bottom-0.5 right-1 text-[10px] font-mono tabular-nums text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Top-center inventory pill (collapsed) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-auto">
        {snap.inventory
          .filter((s) => !["axe", "pickaxe", "rod", "sword", "hammer"].includes(s.kind))
          .map((s) => (
            <div key={s.kind} className="chip">
              <span>{ITEM_EMOJI[s.kind]}</span>
              <span className="tabular-nums">{s.count}</span>
            </div>
          ))}
      </div>

      {/* Bottom-left tips */}
      <div className="absolute bottom-4 left-4 text-xs text-[var(--ink-2)] max-w-[280px] panel p-3 pointer-events-none">
        <div className="mb-1 text-white text-sm font-semibold">Controls</div>
        <div>Click → walk / harvest / attack</div>
        <div>
          <span className="kbd">1</span>–<span className="kbd">6</span> hotbar
        </div>
        <div>Scroll → zoom</div>
        <div className="mt-2 opacity-70">
          Right tool for the right job:
          <br />
          axe→trees · pickaxe→rocks/coal · rod→ponds · sword→mobs
        </div>
      </div>
    </>
  );
}
