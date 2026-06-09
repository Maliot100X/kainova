import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";

export const runtime = "nodejs";

const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  if (!wallet || !WALLET_RE.test(wallet))
    return NextResponse.json({ equipped: [] });
  await ensureSchema();
  const rows = await sql`
    SELECT item_slug FROM player_items WHERE wallet = ${wallet} AND equipped = TRUE
  `;
  return NextResponse.json({ equipped: rows.map((r) => r.item_slug as string) });
}
