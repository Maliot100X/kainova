import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

export const runtime = "nodejs";

const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet") ?? "";
  if (!WALLET_RE.test(wallet)) {
    return NextResponse.json({ error: "invalid_wallet" }, { status: 400 });
  }
  try {
    const users = await sql`SELECT wallet, tier, paid_demo_at, paid_life_at FROM users WHERE wallet = ${wallet} LIMIT 1`;
    const agents = await sql`
      SELECT agent_id, agent_name, agent_wallet, avatar_seed, created_at
      FROM agents WHERE owner_wallet = ${wallet}
      ORDER BY created_at DESC
    `;
    const scoreRows = await sql`
      WITH ranked AS (
        SELECT actor_wallet, score_total,
               ROW_NUMBER() OVER (ORDER BY score_total DESC) AS rank
        FROM scores
      )
      SELECT s.gold, s.kills, s.resources, s.score_total, r.rank
      FROM scores s
      JOIN ranked r ON r.actor_wallet = s.actor_wallet
      WHERE s.actor_wallet = ${wallet}
      LIMIT 1
    `;
    const airdrops = await sql`
      SELECT amount_ui, rank, reason, created_at FROM airdrops WHERE wallet = ${wallet}
      ORDER BY created_at DESC LIMIT 25
    `;
    return NextResponse.json({
      wallet,
      tier: (users[0]?.tier as string) ?? "free",
      agents: agents.map((a) => ({
        agent_id: a.agent_id,
        agent_name: a.agent_name,
        agent_wallet: a.agent_wallet,
        avatar_url: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${a.avatar_seed}`,
        created_at: a.created_at,
      })),
      score: scoreRows[0] ?? null,
      airdrops,
    });
  } catch (e) {
    return NextResponse.json({ wallet, tier: "free", agents: [], score: null, airdrops: [], error: String(e) });
  }
}
