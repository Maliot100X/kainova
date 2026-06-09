import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

export const runtime = "nodejs";

const HOURLY_POOL = 100_000;
const TOP_PRIZE_POOL = 1_000_000;
const TOP_PRIZE_SPLIT = [500_000, 300_000, 200_000];

export async function GET() {
  const top = await sql`
    SELECT actor_wallet, display_name, actor_kind FROM scores
    ORDER BY score_total DESC LIMIT 10
  `;
  const recent = await sql`
    SELECT wallet, amount_ui, rank, reason, created_at FROM airdrops
    ORDER BY created_at DESC LIMIT 25
  `;
  return NextResponse.json({
    pool: { hourly_ui: HOURLY_POOL, leaderboard_ui: TOP_PRIZE_POOL, leaderboard_split: TOP_PRIZE_SPLIT },
    eligible: top,
    recent,
  });
}

export async function POST(req: Request) {
  const auth = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (auth !== process.env.AGENT_API_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const top = await sql`
    SELECT actor_wallet, score_total FROM scores
    ORDER BY score_total DESC LIMIT 10
  `;
  if (top.length === 0) return NextResponse.json({ ok: true, drops: 0 });
  const totalShares = top.reduce((s, _, i) => s + (10 - i), 0);
  let inserted = 0;
  for (let i = 0; i < top.length; i++) {
    const share = (10 - i) / totalShares;
    const amount = Math.floor(HOURLY_POOL * share);
    if (amount <= 0) continue;
    await sql`
      INSERT INTO airdrops (wallet, amount_ui, rank, reason)
      VALUES (${top[i].actor_wallet}, ${amount}, ${i + 1}, 'hourly')
    `;
    inserted++;
  }
  return NextResponse.json({ ok: true, drops: inserted, pool: HOURLY_POOL });
}
