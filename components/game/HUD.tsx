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
  onToggleAgent,
}: {
  snap: HUDSnapshot;
  onSelectSlot: (i: number) => void;
  onReset: () => void;
  onToggleAgent: () => void;
}) {
  const hpPct = Math.max(0, Math.min(1, snap.hp / snap.maxHp));
  const score = snap.gold + snap.kills * 25 + snap.resources * 5;
  return (
    <>
      {/* Top-left: HP + stats */}
      <div className="absolute top-3 left-3 panel p-3 min-w-[230px] pointer-events-auto">
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
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${hpPct * 100}%`,
                background: hpPct > 0.5 ? "var(--leaf)" : hpPct > 0.25 ? "var(--gold)" : "var(--rust)",
              }}
            />
          </div>
          <span className="tabular-nums w-14 text-right text-xs">{snap.hp}/{snap.maxHp}</span>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-1 text-xs mb-2">
          <div className="flex items-center gap-1">
            <span>🪙</span>
            <span className="tabular-nums font-semibold text-[var(--gold)]">{snap.gold.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⚔️</span>
            <span className="tabular-nums text-[var(--ink-1)]">{snap.kills} kills</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🌿</span>
            <span className="tabular-nums text-[var(--ink-1)]">{snap.resources} res</span>
          </div>
        </div>
        {/* Score */}
        <div className="text-xs text-[var(--ink-2)]">
          Score: <span className="text-white font-bold tabular-nums">{score.toLocaleString()}</span>
        </div>
        {/* Skills */}
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-[var(--ink-2)]">
          <div>⚔ Combat <span className="text-white">{snap.skills.combat}</span></div>
          <div>🌿 Gather <span className="text-white">{snap.skills.gathering}</span></div>
        </div>
      </div>

      {/* Top-right: Agent mode + Reset */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2 pointer-events-auto">
        <button
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
            snap.agentMode
              ? "border-[var(--accent)] bg-[rgba(124,92,255,0.25)] text-[var(--accent)]"
              : "border-[var(--line)] bg-white/5 text-[var(--ink-2)] hover:bg-white/10"
          }`}
          onClick={onToggleAgent}
          title="Toggle AI auto-play"
        >
          {snap.agentMode ? "🤖 Agent ON" : "🤖 Agent OFF"}
        </button>
        <button className="btn btn-ghost text-xs" onClick={onReset} title="Reset character & save">
          ↻ Reset
        </button>
      </div>

      {/* Bottom: hotbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 panel p-2 flex gap-2 pointer-events-auto">
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
                <span className="absolute bottom-0.5 right-1 text-[10px] font-mono tabular-nums text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Top-center: resource inventory pills */}
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

      {/* Bottom-left: controls */}
      <div className="absolute bottom-4 left-4 text-xs text-[var(--ink-2)] max-w-[240px] panel p-3 pointer-events-none">
        <div className="mb-1 text-white text-sm font-semibold">Controls</div>
        <div>Click → walk / harvest / attack</div>
        <div><span className="kbd">1</span>–<span className="kbd">6</span> hotbar · <span className="kbd">A</span> agent</div>
        <div>Scroll → zoom</div>
        <div className="mt-1 opacity-60">axe→trees · pickaxe→rocks/coal · rod→ponds · sword→mobs</div>
      </div>
    </>
  );
}
