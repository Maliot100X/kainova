import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";
import { hashApiKey } from "@/lib/agent/crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body: { agent_id?: string; api_key?: string; skin_emoji?: string; agent_title?: string } = await req.json().catch(() => ({}));
  if (!body.agent_id || !body.api_key)
    return NextResponse.json({ error: "missing_credentials" }, { status: 400 });
  const hash = hashApiKey(body.api_key);
  await ensureSchema();
  const rows = await sql`
    SELECT agent_id FROM agents WHERE agent_id = ${body.agent_id} AND api_key_hash = ${hash} LIMIT 1
  `;
  if (rows.length === 0) return NextResponse.json({ error: "auth_failed" }, { status: 401 });

  const skin = (body.skin_emoji ?? "").slice(0, 8) || null;
  const title = (body.agent_title ?? "").slice(0, 32) || null;
  if (skin) await sql`UPDATE agents SET skin_emoji = ${skin} WHERE agent_id = ${body.agent_id}`;
  if (title) await sql`UPDATE agents SET agent_title = ${title} WHERE agent_id = ${body.agent_id}`;
  return NextResponse.json({ ok: true });
}
