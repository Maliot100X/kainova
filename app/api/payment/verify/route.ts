import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";

export const runtime = "nodejs";

const OWNER = process.env.NEXT_PUBLIC_OWNER_WALLET!;
const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const DEMO_SOL = Number(process.env.DEMO_PAYMENT_SOL || "0.005");
const LIFE_SOL = Number(process.env.LIFETIME_PAYMENT_SOL || "0.05");
const LAMPORTS_PER_SOL = 1_000_000_000;

type Body = { signature: string; wallet: string; tier: "demo" | "lifetime" };
const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SIG_RE = /^[1-9A-HJ-NP-Za-km-z]{43,88}$/;

export async function POST(req: Request) {
  let body: Body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  if (!body.signature || !SIG_RE.test(body.signature)) return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  if (!body.wallet || !WALLET_RE.test(body.wallet)) return NextResponse.json({ error: "invalid_wallet" }, { status: 400 });
  if (body.tier !== "demo" && body.tier !== "lifetime") return NextResponse.json({ error: "invalid_tier" }, { status: 400 });

  await ensureSchema();
  const seen = await sql`SELECT 1 FROM payments WHERE tx_signature = ${body.signature}`;
  if (seen.length > 0) return NextResponse.json({ error: "already_claimed" }, { status: 409 });

  const conn = new Connection(RPC, "confirmed");
  const tx = await conn.getParsedTransaction(body.signature, { maxSupportedTransactionVersion: 0 });
  if (!tx || tx.meta?.err) return NextResponse.json({ error: "tx_not_found_or_failed" }, { status: 404 });

  const owner = new PublicKey(OWNER).toBase58();
  const payer = new PublicKey(body.wallet).toBase58();
  const accs = tx.transaction.message.accountKeys.map((k) => k.pubkey.toBase58());
  const pre = tx.meta?.preBalances ?? [];
  const post = tx.meta?.postBalances ?? [];

  const ownerIdx = accs.indexOf(owner);
  const payerIdx = accs.indexOf(payer);
  if (ownerIdx < 0 || payerIdx < 0) return NextResponse.json({ error: "tx_does_not_involve_wallets" }, { status: 400 });

  const ownerDelta = (post[ownerIdx] - pre[ownerIdx]) / LAMPORTS_PER_SOL;
  const required = body.tier === "demo" ? DEMO_SOL : LIFE_SOL;
  if (ownerDelta + 1e-9 < required) {
    return NextResponse.json({ error: "insufficient_amount", required, received: ownerDelta }, { status: 400 });
  }

  await sql`
    INSERT INTO payments (wallet, tx_signature, amount_sol, tier)
    VALUES (${body.wallet}, ${body.signature}, ${ownerDelta}, ${body.tier})
  `;
  const tierCol = body.tier === "demo" ? "paid_demo_at" : "paid_life_at";
  const newTier = body.tier === "lifetime" ? "lifetime" : "demo";
  if (body.tier === "lifetime") {
    await sql`
      INSERT INTO users (wallet, tier, paid_life_at) VALUES (${body.wallet}, 'lifetime', NOW())
      ON CONFLICT (wallet) DO UPDATE SET
        tier = 'lifetime', paid_life_at = NOW(), updated_at = NOW()
    `;
  } else {
    await sql`
      INSERT INTO users (wallet, tier, paid_demo_at) VALUES (${body.wallet}, 'demo', NOW())
      ON CONFLICT (wallet) DO UPDATE SET
        tier = CASE WHEN users.tier = 'lifetime' THEN 'lifetime' ELSE 'demo' END,
        paid_demo_at = NOW(), updated_at = NOW()
    `;
  }
  return NextResponse.json({ ok: true, tier: newTier, amount_sol: ownerDelta });
}
