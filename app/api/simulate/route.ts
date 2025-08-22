// app/api/simulate/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
export const runtime = "nodejs";       // évite Edge runtime
export const dynamic = "force-dynamic"; // pas de cache

export async function POST(req: NextRequest) {
  try {
    const preset = await req.json();

    const res = await fetch(`${BACKEND_URL}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preset),
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    let body: any;
    try {
      body = contentType.includes("application/json") ? JSON.parse(text) : { raw: text };
    } catch {
      body = { raw: text };
    }

    return NextResponse.json(body, { status: res.status });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Proxy error", message: e?.message ?? String(e) },
      { status: 502 }
    );
  }
}
