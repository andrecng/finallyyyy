// Route handler Next.js — mock pour l'instant, proxy plus tard
export const runtime = "nodejs";

export async function POST(req: Request) {
  const preset = await req.json();
  
  // TODO: si BACKEND_URL défini, proxy:
  const url = process.env.BACKEND_URL;
  if (url) {
    try {
      const r = await fetch(`${url.replace(/\/$/, "")}/simulate`, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(preset),
      });
      const data = await r.json();
      return new Response(JSON.stringify(data), { 
        headers: {"content-type": "application/json"} 
      });
    } catch (error) {
      console.error("Backend proxy failed:", error);
      // Fallback to mock if backend fails
    }
  }
  
  // MOCK (permet de garder l'UI fonctionnelle)
  const equity = Array.from({length: 120}, (_, i) => i + Math.sin(i/6) * 5);
  return new Response(JSON.stringify({ 
    kpis: { max_dd_total: 0.05, max_dd_daily: 0.02 }, 
    series: { equity } 
  }), {
    headers: {"content-type": "application/json"}
  });
}
