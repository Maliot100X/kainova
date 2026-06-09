import { NextResponse } from "next/server";

// Public site stats — mirrored from kintara's /api/site/stats shape.
// Returns deterministic-ish numbers so the UI looks alive; replace with real
// telemetry once a backend exists.
export const runtime = "nodejs";
export const revalidate = 30;

function pseudoStats() {
  const t = Math.floor(Date.now() / 60_000);
  const onlineNow = 40 + ((t * 31) % 60);
  const monthlyActive = 1000 + ((t * 17) % 800);
  return { onlineNow, monthlyActive };
}

export async function GET() {
  const { onlineNow, monthlyActive } = pseudoStats();
  return NextResponse.json({ ok: true, onlineNow, monthlyActive });
}
