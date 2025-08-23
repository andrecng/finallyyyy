// app/api/simulate_mc/route.ts
function toBackend(payload: any) {
  if (!payload || typeof payload !== "object") return payload;

  // Si déjà au format plat (flags), on ne touche pas
  if ("use_kelly_cap" in payload || "use_vt" in payload || "use_cppi" in payload) return payload;

  const m  = payload.modules || {};
  const kc = m.KellyCap || {};
  const vt = m.VolatilityTarget || {};
  const cf = m.CPPIFreeze || {};
  const sb = m.SoftBarrier || {};
  const fg = m.FTMOGate || {};

  const num = (v: any, d: number) =>
    typeof v === "number" && isFinite(v) ? v :
    typeof v === "string" ? Number(v) : d;

  return {
    // cœur
    seed: payload.seed ?? null,
    total_steps: num(payload.total_steps, 500),
    steps_per_day: num(payload.steps_per_day, 50),
    mu: num(payload.mu, 0.0),
    sigma: num(payload.sigma, 0.02),
    fees_per_trade: num(payload.fees_per_trade, 0),

    // modules (flags + params attendus par le back)
    use_kelly_cap: !!m.KellyCap, // bloc présent => ON (même sans "enabled")
    kelly_cap: num(kc.cap_mult ?? kc.cap, 0.10),

    use_vt: !!vt.enabled,
    vt_target_vol: num(vt.target, 0.10),
    vt_halflife: num(vt.halflife, 20),

    use_cppi: !!cf.enabled,
    cppi_alpha: num(cf.alpha, 0.10),
    cppi_freeze_frac: num(cf.freeze, 0.05),

    use_soft_barrier: !!sb.enabled,
    soft_barrier: num(sb.threshold, 0.02),

    // FTMO + pacing
    daily_limit: num(fg.daily_limit, 0.05),
    total_limit: num(fg.total_limit, 0.10),
    spend_rate: num(fg.spend_rate, 1.0),

    // cible (si déjà utilisée)
    target_profit: num(payload.target_profit, 0.10),
    max_days: num(payload.max_days, 30)
  };
}

export async function POST(req: Request) {
  const raw = await req.json();
  
  // Transformation du payload principal
  const transformedPayload = {
    ...raw,
    payload: toBackend(raw.payload)
  };
  
  console.log("proxy /simulate_mc payload →", transformedPayload); // vérif serveur Next

  const url = `${process.env.BACKEND_URL}/simulate_mc`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transformedPayload),
    cache: "no-store",
  });
  const data = await r.json();
  return Response.json(data);
}
