export function toBackend(payload: any) {
  if (!payload || typeof payload !== "object") return payload;
  if ("use_kelly_cap" in payload || "use_vt" in payload || "use_cppi" in payload) return payload;

  const m = payload.modules ?? {};
  const kcRaw = m.KellyCap ?? {};
  const kcEnabled = ("enabled" in kcRaw) ? !!kcRaw.enabled : (m.KellyCap != null);

  const vtRaw =
    m.VolatilityTarget ??
    m.VolatilittyTarget ??     // libellé fautif de l'UI
    m.VolatitlityTarget ??     // autre variante
    m.volatilityTarget ?? m.vol_target ?? {};
  const vtEnabled = ("enabled" in vtRaw) ? !!vtRaw.enabled : (vtRaw && Object.keys(vtRaw).length > 0);

  const cfRaw = m.CPPIFreeze ?? {};
  const sbRaw = m.SoftBarrier ?? {};
  const fgRaw = m.FTMOGate ?? {};

  const num = (v: any, d: number) =>
    (typeof v === "number" && isFinite(v)) ? v :
    (typeof v === "string" && v.trim() !== "" && isFinite(Number(v))) ? Number(v) : d;

  return {
    seed: payload.seed ?? null,
    total_steps: num(payload.total_steps, 500),
    steps_per_day: num(payload.steps_per_day, 50),
    mu: num(payload.mu, 0.0),
    sigma: num(payload.sigma, 0.02),
    fees_per_trade: num(payload.fees_per_trade, 0),

    use_kelly_cap: kcEnabled,
    kelly_cap: num(kcRaw.cap_mult ?? kcRaw.cap ?? payload.kelly_cap, 0.10),

    use_vt: vtEnabled,
    vt_target_vol: num(vtRaw.target ?? vtRaw.target_vol, 0.10),
    vt_halflife: num(vtRaw.halflife, 20),

    use_cppi: !!cfRaw.enabled,
    cppi_alpha: num(cfRaw.alpha, 0.10),
    cppi_freeze_frac: num(cfRaw.freeze, 0.05),

    use_soft_barrier: !!sbRaw.enabled,
    soft_barrier: num(sbRaw.threshold, 0.02),

    daily_limit: num(fgRaw.daily_limit, 0.05),
    total_limit: num(fgRaw.total_limit, 0.10),
    spend_rate: num(fgRaw.spend_rate, 1.0),

    target_profit: num(payload.target_profit, 0.10),
    max_days: num(payload.max_days, 30),
  };
}
