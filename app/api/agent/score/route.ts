import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { hashApiKey } from "@/lib/agent/crypto";

export const runtime = "nodejs";

type ScoreBody = {
  agent_id: string;
  api_key: string;
  gold?: number;
  kills?: number;
  resources?: number;
  combat_skill?: number;
  gather_skill?: number;
};

const clampInt = (n: unknown, max: number) => {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : 0;
  return Math.max(0, Math.min(max, v));
};

export async function POST(req: Request) {
  let body: ScoreBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.agent_id || !body.api_key) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 400 });
  }
  const hash = hashApiKey(body.api_key);
  const rows = await sql`
    SELECT agent_id, agent_wallet, agent_name FROM agents
    WHERE agent_id = ${body.agent_id} AND api_key_hash = ${hash}
    LIMIT 1
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "auth_failed" }, { status: 401 });
  }
  const agent = rows[0] as { agent_wallet: string; agent_name: string };

  const gold = clampInt(body.gold, 1_000_000_000);
  const kills = clampInt(body.kills, 1_000_000);
  const resources = clampInt(body.resources, 1_000_000);
  const combat = clampInt(body.combat_skill, 1000);
  const gather = clampInt(body.gather_skill, 1000);

  await sql`
    INSERT INTO scores (actor_kind, actor_wallet, display_name, gold, kills, resources, combat_skill, gather_skill)
    VALUES ('agent', ${agent.agent_wallet}, ${agent.agent_name}, ${gold}, ${kills}, ${resources}, ${combat}, ${gather})
    ON CONFLICT (actor_wallet) DO UPDATE SET
      gold = EXCLUDED.gold,
      kills = EXCLUDED.kills,
      resources = EXCLUDED.resources,
      combat_skill = EXCLUDED.combat_skill,
      gather_skill = EXCLUDED.gather_skill,
      display_name = EXCLUDED.display_name,
      updated_at = NOW()
  `;
  await sql`UPDATE agents SET last_seen_at = NOW() WHERE agent_id = ${body.agent_id}`;
  return NextResponse.json({ ok: true });
}
