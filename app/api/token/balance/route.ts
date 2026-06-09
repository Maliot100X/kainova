import { NextRequest, NextResponse } from "next/server";
import { checkGate } from "@/lib/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ ok: false, error: "missing wallet" }, { status: 400 });
  }
  const result = await checkGate(wallet);
  return NextResponse.json({ ok: true, ...result });
}
