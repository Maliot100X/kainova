"use client";

import { useEffect, useState } from "react";

type StatsPayload = { ok: boolean; onlineNow: number; monthlyActive: number };

export function Stats() {
  const [stats, setStats] = useState<StatsPayload | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/site/stats", { cache: "no-store" });
        const json = (await res.json()) as StatsPayload;
        if (active) setStats(json);
      } catch {
        // ignore
      }
    }
    load();
    const id = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <span className="live-dot" />
        <span className="text-[var(--ink-1)]">
          <span className="text-white font-semibold tabular-nums">
            {stats?.onlineNow ?? "—"}
          </span>{" "}
          online
        </span>
      </div>
      <div className="text-[var(--ink-2)]">
        <span className="text-[var(--ink-1)] tabular-nums">
          {stats?.monthlyActive?.toLocaleString() ?? "—"}
        </span>{" "}
        monthly
      </div>
    </div>
  );
}
