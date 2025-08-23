export const BACKEND_URL = "http://127.0.0.1:8001"; // centralisé

export async function callBackend(path: string, init?: RequestInit) {
  const url = `${BACKEND_URL}${path}`;
  try {
    const r = await fetch(url, { cache: "no-store", ...init });
    // Retourner la réponse directement, même si elle n'est pas OK
    // Next.js s'occupera de la gestion des statuts
    return r;
  } catch (e: any) {
    console.error("Proxy fail →", url, e?.message);
    return new Response(
      JSON.stringify({ error: "proxy_fail", detail: String(e?.message || e) }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
