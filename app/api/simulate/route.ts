import { toBackend } from "@/app/api/_lib/toBackend";
import { callBackend } from "@/lib/backend";

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const payload = toBackend(raw);
    
    // Test express: ajouter les flags SessionGate et NestedCPPI
    // pour vérifier qu'ils sont déjà câblés côté moteur
    payload.use_session_gate ??= true;
    payload.use_nested_cppi ??= true;
    
    // Option: valeurs par défaut sûres
    payload.news_pre_blackout_min ??= 0;
    payload.news_post_blackout_min ??= 0;
    payload.sess_windows ??= []; // si vide = pas de blocage
    
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
