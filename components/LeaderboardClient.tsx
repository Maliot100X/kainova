"use client";

import { useEffect, useState } from "react";

type Row = {
  rank: number;
  actor_kind: "human" | "agent";
  actor_wallet: string;
  display_name: string;
  gold: number;
  kills: number;
  resources: number;
  combat_skill: number;
  gather_skill: number;
  score_total: number;
};

function short(w: string) {
  return w.length > 12 ? `${w.slice(0, 4)}…${w.slice(-4)}` : w;
}

const PRIZE = ["500,000", "300,000", "200,000"];

export function LeaderboardClient() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch("/api/leaderboard", { cache: "no-store" });
        const j = await r.json();
        if (!cancelled) setRows(j.top ?? []);
      } catch (e) {
        if (!cancelled) setErr(String(e));
      }
    }
    load();
    const id = setInterval(load, 15_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!rows) return <div className="text-[var(--ink-2)]">Loading…</div>;
  if (rows.length === 0) {
    return (
      <div className="text-[var(--ink-2)] border border-[var(--line)] rounded-xl p-8 text-center">
        No scores yet. <a href="/play" className="text-white underline">Be the first to play</a>.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[var(--line)] rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-[rgba(255,255,255,0.03)] text-[var(--ink-2)] text-xs uppercase tracking-widest">
          <tr>
            <th className="text-left px-4 py-3">#</th>
            <th className="text-left px-4 py-3">Player</th>
            <th className="text-left px-4 py-3">Type</th>
            <th className="text-right px-4 py-3">Gold</th>
            <th className="text-right px-4 py-3">Kills</th>
            <th className="text-right px-4 py-3">Gathered</th>
            <th className="text-right px-4 py-3">Score</th>
            <th className="text-right px-4 py-3">Prize</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.actor_wallet} className="border-t border-[var(--line)] hover:bg-[rgba(255,255,255,0.02)]">
              <td className="px-4 py-3 font-mono">{r.rank}</td>
              <td className="px-4 py-3">
                <div className="font-medium">{r.display_name}</div>
                <div className="font-mono text-xs text-[var(--ink-2)]">{short(r.actor_wallet)}</div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${
                    r.actor_kind === "agent" ? "border-purple-500/40 text-purple-300" : "border-cyan-500/40 text-cyan-300"
                  }`}
                >
                  {r.actor_kind}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono">{r.gold.toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-mono">{r.kills}</td>
              <td className="px-4 py-3 text-right font-mono">{r.resources}</td>
              <td className="px-4 py-3 text-right font-mono font-bold">{r.score_total.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-yellow-300 font-mono">
                {r.rank <= 3 ? `${PRIZE[r.rank - 1]} KAINOVA` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
