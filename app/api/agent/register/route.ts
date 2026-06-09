import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";
import {
  avatarSeed,
  avatarUrl,
  generateAgentKeypair,
  hashApiKey,
  newAgentId,
  newApiKey,
} from "@/lib/agent/crypto";

export const runtime = "nodejs";

type RegisterBody = {
  owner_wallet: string;
  agent_name?: string;
  via?: string;
};

const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function POST(req: Request) {
  let body: RegisterBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const owner = body.owner_wallet?.trim();
  const name = (body.agent_name?.trim() || "Unnamed Agent").slice(0, 64);
  const via = (body.via || "web").slice(0, 32);
  if (!owner || !WALLET_RE.test(owner)) {
    return NextResponse.json({ error: "invalid_owner_wallet" }, { status: 400 });
  }

  const agentId = newAgentId();
  const apiKey = newApiKey();
  const apiHash = hashApiKey(apiKey);
  const seed = avatarSeed();
  const { publicKey, secretKeyBase58 } = generateAgentKeypair();

  try {
    await ensureSchema();
    await sql`
      INSERT INTO agents (owner_wallet, agent_id, api_key_hash, agent_wallet, agent_name, avatar_seed, registered_via)
      VALUES (${owner}, ${agentId}, ${apiHash}, ${publicKey}, ${name}, ${seed}, ${via})
    `;
    await sql`
      INSERT INTO users (wallet) VALUES (${owner})
      ON CONFLICT (wallet) DO NOTHING
    `;
    await sql`
      INSERT INTO scores (actor_kind, actor_wallet, display_name, score_total)
      VALUES ('agent', ${publicKey}, ${name}, 0)
      ON CONFLICT (actor_wallet) DO NOTHING
    `;
  } catch (e) {
    return NextResponse.json({ error: "db_error", detail: String(e) }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    agent_id: agentId,
    agent_api_key: apiKey,
    agent_wallet_public: publicKey,
    agent_wallet_secret_base58: secretKeyBase58,
    agent_name: name,
    avatar_url: avatarUrl(seed),
    warning:
      "Save agent_api_key and agent_wallet_secret_base58 now — they are shown ONCE and not retrievable later. KAINOVA does not store the private key.",
  });
}
