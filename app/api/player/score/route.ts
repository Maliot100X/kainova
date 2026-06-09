import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";

export const runtime = "nodejs";

const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function POST(req: Request) {
  let body: { wallet?: string; gold?: number; kills?: number; resources?: number; combat_skill?: number; gather_skill?: number; display_name?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  if (!body.wallet || !WALLET_RE.test(body.wallet)) {
    return NextResponse.json({ error: "invalid_wallet" }, { status: 400 });
  }
  const name = (body.display_name || `${body.wallet.slice(0, 4)}…${body.wallet.slice(-4)}`).slice(0, 64);
  const gold = Math.max(0, Math.floor(body.gold ?? 0));
  const kills = Math.max(0, Math.floor(body.kills ?? 0));
  const resources = Math.max(0, Math.floor(body.resources ?? 0));
  const combat = Math.max(0, Math.floor(body.combat_skill ?? 0));
  const gather = Math.max(0, Math.floor(body.gather_skill ?? 0));
  await ensureSchema();
  await sql`
    INSERT INTO users (wallet) VALUES (${body.wallet})
    ON CONFLICT (wallet) DO NOTHING
  `;
  const scoreTotal = gold + kills * 25 + resources * 5;
  await sql`
    INSERT INTO scores (actor_kind, actor_wallet, display_name, gold, kills, resources, combat_skill, gather_skill, score_total)
    VALUES ('human', ${body.wallet}, ${name}, ${gold}, ${kills}, ${resources}, ${combat}, ${gather}, ${scoreTotal})
    ON CONFLICT (actor_wallet) DO UPDATE SET
      gold = GREATEST(scores.gold, EXCLUDED.gold),
      kills = GREATEST(scores.kills, EXCLUDED.kills),
      resources = GREATEST(scores.resources, EXCLUDED.resources),
      combat_skill = GREATEST(scores.combat_skill, EXCLUDED.combat_skill),
      gather_skill = GREATEST(scores.gather_skill, EXCLUDED.gather_skill),
      display_name = EXCLUDED.display_name,
      score_total = GREATEST(scores.score_total, EXCLUDED.score_total),
      updated_at = NOW()
  `;
  return NextResponse.json({ ok: true });
}
