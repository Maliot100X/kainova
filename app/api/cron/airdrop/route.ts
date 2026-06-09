import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.AGENT_API_SECRET}` && !req.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL("/api/airdrop", req.url);
  const r = await fetch(url, {
    method: "POST",
    headers: { "x-cron-secret": process.env.AGENT_API_SECRET ?? "" },
  });
  const j = await r.json();
  return NextResponse.json({ ok: true, downstream: j });
}
