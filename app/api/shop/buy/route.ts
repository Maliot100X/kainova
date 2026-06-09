import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";

export const runtime = "nodejs";

const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function POST(req: Request) {
  const body: { wallet?: string; item_slug?: string } = await req.json().catch(() => ({}));
  if (!body.wallet || !WALLET_RE.test(body.wallet))
    return NextResponse.json({ error: "invalid_wallet" }, { status: 400 });
  if (!body.item_slug)
    return NextResponse.json({ error: "missing_item_slug" }, { status: 400 });

  await ensureSchema();

  const items = await sql`SELECT slug, price FROM shop_items WHERE slug = ${body.item_slug} LIMIT 1`;
  if (items.length === 0)
    return NextResponse.json({ error: "item_not_found" }, { status: 404 });
  const item = items[0] as { slug: string; price: number };

  // Check already owned
  const owned = await sql`
    SELECT 1 FROM player_items WHERE wallet = ${body.wallet} AND item_slug = ${item.slug} LIMIT 1
  `;
  if (owned.length > 0)
    return NextResponse.json({ error: "already_owned" }, { status: 409 });

  // Get/check credits
  const cr = await sql`SELECT amount FROM credits WHERE wallet = ${body.wallet} LIMIT 1`;
  const balance = Number(cr[0]?.amount ?? 0);
  if (balance < item.price)
    return NextResponse.json({ error: "insufficient_credits", balance, required: item.price }, { status: 402 });

  // Deduct + grant
  await sql`
    UPDATE credits SET amount = amount - ${item.price}, updated_at = NOW()
    WHERE wallet = ${body.wallet}
  `;
  await sql`
    INSERT INTO player_items (wallet, item_slug) VALUES (${body.wallet}, ${item.slug})
    ON CONFLICT (wallet, item_slug) DO NOTHING
  `;

  const newBalance = balance - item.price;
  return NextResponse.json({ ok: true, credits_remaining: newBalance });
}
