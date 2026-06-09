import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureSchema();
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet");

  const items = await sql`
    SELECT slug, name, category, rarity, price, stat_key, stat_bonus, emoji, description
    FROM shop_items ORDER BY price ASC
  `;

  let owned: string[] = [];
  let credits = 0;
  if (wallet) {
    const pi = await sql`SELECT item_slug, equipped FROM player_items WHERE wallet = ${wallet}`;
    owned = pi.map((r) => r.item_slug as string);
    const cr = await sql`SELECT amount FROM credits WHERE wallet = ${wallet} LIMIT 1`;
    credits = Number(cr[0]?.amount ?? 0);
  }

  return NextResponse.json({ items, owned, credits });
}
