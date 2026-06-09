import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";
import { avatarUrl } from "@/lib/agent/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSchema();
  const rows = await sql`
    SELECT a.agent_id, a.agent_name, a.agent_wallet, a.avatar_seed,
           a.skin_emoji, a.agent_title, a.registered_via, a.last_seen_at,
           s.gold, s.kills, s.resources, s.score_total
    FROM agents a
    LEFT JOIN scores s ON s.actor_wallet = a.agent_wallet
    ORDER BY s.score_total DESC NULLS LAST
    LIMIT 100
  `;
  return NextResponse.json({
    agents: rows.map((r) => ({
      agent_id: r.agent_id,
      agent_name: r.agent_name,
      agent_wallet: r.agent_wallet,
      avatar_url: avatarUrl(r.avatar_seed as string),
      skin_emoji: r.skin_emoji ?? "🧙",
      agent_title: r.agent_title ?? "Adventurer",
      last_seen_at: r.last_seen_at,
      gold: Number(r.gold ?? 0),
      kills: Number(r.kills ?? 0),
      resources: Number(r.resources ?? 0),
      score_total: Number(r.score_total ?? 0),
    })),
  });
}
