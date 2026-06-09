import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";

export const runtime = "nodejs";

const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// GET ?wallet=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet") ?? "";
  if (!WALLET_RE.test(wallet))
    return NextResponse.json({ error: "invalid_wallet" }, { status: 400 });
  await ensureSchema();
  const rows = await sql`SELECT amount FROM credits WHERE wallet = ${wallet} LIMIT 1`;
  return NextResponse.json({ wallet, credits: Number(rows[0]?.amount ?? 0) });
}

// POST — earn credits from gameplay (called by game engine on score submit)
export async function POST(req: Request) {
  const body: { wallet?: string; amount?: number } = await req.json().catch(() => ({}));
  if (!body.wallet || !WALLET_RE.test(body.wallet))
    return NextResponse.json({ error: "invalid_wallet" }, { status: 400 });
  const earn = Math.max(0, Math.min(10000, Math.floor(body.amount ?? 0)));
  if (earn === 0) return NextResponse.json({ ok: true });
  await ensureSchema();
  await sql`
    INSERT INTO credits (wallet, amount) VALUES (${body.wallet}, ${earn})
    ON CONFLICT (wallet) DO UPDATE SET amount = credits.amount + ${earn}, updated_at = NOW()
  `;
  const rows = await sql`SELECT amount FROM credits WHERE wallet = ${body.wallet}`;
  return NextResponse.json({ ok: true, credits: Number(rows[0]?.amount ?? 0) });
}
