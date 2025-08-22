// app/api/health/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: "no-store" });
    const text = await res.text();
    let body: any;
    try { body = JSON.parse(text); } catch { body = { raw: text }; }
    return NextResponse.json(body, { status: res.status });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Proxy error", message: e?.message ?? String(e) },
      { status: 502 }
    );
  }
}
