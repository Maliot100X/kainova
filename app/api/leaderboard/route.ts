import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/init";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT actor_kind, actor_wallet, display_name, gold, kills, resources, combat_skill, gather_skill, score_total, updated_at
      FROM scores
      ORDER BY score_total DESC
      LIMIT 100
    `;
    return NextResponse.json({
      top: rows.map((r, i) => ({ rank: i + 1, ...r })),
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ top: [], error: String(e) }, { status: 200 });
  }
}
