import { toBackend } from "@/app/api/_lib/toBackend";

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const payload = toBackend(raw);
    console.log("proxy /simulate payload →", payload); // vérif côté serveur Next

    const r = await fetch(`${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await r.json();
    return Response.json(data, { status: r.status });
  } catch (e:any) {
    console.error("proxy /simulate error:", e?.message || e);
    return Response.json({ error: "proxy_fail", detail: String(e) }, { status: 502 });
  }
}
