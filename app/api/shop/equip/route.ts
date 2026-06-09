import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";

export const runtime = "nodejs";
const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function POST(req: Request) {
  const body: { wallet?: string; item_slug?: string; equip?: boolean } = await req.json().catch(() => ({}));
  if (!body.wallet || !WALLET_RE.test(body.wallet))
    return NextResponse.json({ error: "invalid_wallet" }, { status: 400 });
  await ensureSchema();

  // Get the item category to unequip others of same type
  const items = await sql`SELECT category FROM shop_items WHERE slug = ${body.item_slug ?? ""} LIMIT 1`;
  if (items.length === 0) return NextResponse.json({ error: "item_not_found" }, { status: 404 });
  const category = items[0].category as string;

  if (body.equip !== false) {
    // Unequip all same-category items first
    const cat_slugs = await sql`SELECT slug FROM shop_items WHERE category = ${category}`;
    const slugs = cat_slugs.map((r) => r.slug as string);
    if (slugs.length > 0) {
      for (const s of slugs) {
        await sql`UPDATE player_items SET equipped = FALSE WHERE wallet = ${body.wallet!} AND item_slug = ${s}`;
      }
    }
    // Equip the chosen item
    await sql`UPDATE player_items SET equipped = TRUE WHERE wallet = ${body.wallet!} AND item_slug = ${body.item_slug!}`;
  } else {
    await sql`UPDATE player_items SET equipped = FALSE WHERE wallet = ${body.wallet!} AND item_slug = ${body.item_slug!}`;
  }
  return NextResponse.json({ ok: true });
}
