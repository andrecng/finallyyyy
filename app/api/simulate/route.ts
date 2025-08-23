import { toBackend } from "@/app/api/_lib/toBackend";
import { callBackend } from "@/lib/backend";

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const payload = toBackend(raw);
    console.log("proxy /simulate payload →", payload); // vérif côté serveur Next

    return callBackend("/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e: any) {
    console.error("proxy /simulate error:", e?.message || e);
    return Response.json({ error: "proxy_fail", detail: String(e) }, { status: 502 });
  }
}
