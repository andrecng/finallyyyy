import { toBackend } from "@/app/api/_lib/toBackend";
import { callBackend } from "@/lib/backend";

export async function POST(req: Request) {
  try {
    const raw = await req.json(); // attendu: { payload: <library|plat>, n, base_seed }
    const payload = toBackend(raw.payload ?? raw);
    
    // Test express: ajouter les flags SessionGate et NestedCPPI
    // pour vérifier qu'ils sont déjà câblés côté moteur
    payload.use_session_gate ??= true;
    payload.use_nested_cppi ??= true;
    
    // Option: valeurs par défaut sûres
    payload.news_pre_blackout_min ??= 0;
    payload.news_post_blackout_min ??= 0;
    payload.sess_windows ??= []; // si vide = pas de blocage

    const body = {
      payload,
      n: Number(raw.n ?? 100),
      base_seed: Number(raw.base_seed ?? 12345),
    };

    console.log("proxy /simulate_mc payload →", body.payload, "n=", body.n);

    return callBackend("/simulate_mc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e: any) {
    console.error("proxy /simulate_mc error:", e?.message || e);
    return Response.json({ error: "proxy_fail", detail: String(e) }, { status: 502 });
  }
}
