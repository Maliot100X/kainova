import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { CREATE_TABLES_SQL } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = req.headers.get("x-init-secret");
  if (auth !== process.env.AGENT_API_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const statements = CREATE_TABLES_SQL.split(";").map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await sql.query(stmt);
    }
    return NextResponse.json({ ok: true, tables: statements.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
