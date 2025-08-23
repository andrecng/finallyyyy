import { toBackend } from "@/app/api/_lib/toBackend";

// app/api/simulate_mc/route.ts

export async function POST(req: Request) {
  try {
    const raw = await req.json(); // attendu: { payload: <library|plat>, n, base_seed }
    const payload = toBackend(raw.payload ?? raw);

    const body = {
      payload,
      n: Number(raw.n ?? 100),
      base_seed: Number(raw.base_seed ?? 12345),
    };

    console.log("proxy /simulate_mc payload →", body.payload, "n=", body.n);

    const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE;
    const r = await fetch(`${base}/simulate_mc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await r.json();
    return Response.json(data, { status: r.status });
  } catch (e: any) {
    console.error("proxy /simulate_mc error:", e?.message || e);
    return Response.json({ error: "proxy_fail", detail: String(e) }, { status: 502 });
  }
}
