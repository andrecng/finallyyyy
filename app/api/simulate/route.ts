export const runtime = "nodejs";

export async function POST(req: Request) {
  const preset = await req.json();
  const FORCE_MOCK = process.env.FORCE_MOCK === "1";
  const url = process.env.BACKEND_URL?.replace(/\/$/, "");

  if (!FORCE_MOCK && url) {
    const r = await fetch(`${url}/simulate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(preset),
    });
    const data = await r.json();
    return new Response(JSON.stringify(data), { 
      headers: { "content-type": "application/json" } 
    });
  }

  // MOCK local (pour que le front soit incassable en dev)
  const equity = Array.from({ length: 120 }, (_, i) => i + Math.sin(i / 6) * 5);
  return new Response(JSON.stringify({ 
    kpis: { max_dd_total: 0.05 }, 
    series: { equity } 
  }), {
    headers: { "content-type": "application/json" }
  });
}
