export function mapToBackend(raw: any) {
  const m = raw?.modules ?? {};

  // --- KellyCap (robuste, même sans "enabled")
  const kcRaw = m.KellyCap ?? {};
  const kcEnabled = ("enabled" in kcRaw) ? !!kcRaw.enabled : (m.KellyCap != null);

  // --- VolTarget (tolère l'orthographe fautive)
  const vtRaw =
    m.VolatilityTarget ??
    m.VolatilittyTarget ??  // libellé de ton UI
    m.VolatitlityTarget ??  // autre variante
    m.volatilityTarget ?? m.vol_target ?? {};

  const vtEnabled = ("enabled" in vtRaw) ? !!vtRaw.enabled : (vtRaw && Object.keys(vtRaw).length > 0);

  // --- CPPI / Soft / FTMO
  const cfRaw = m.CPPIFreeze ?? {};
  const sbRaw = m.SoftBarrier ?? {};
  const fgRaw = m.FTMOGate ?? {};

  const num = (v: any, d: number) =>
    (typeof v === "number" && isFinite(v)) ? v :
    (typeof v === "string" && v.trim() !== "" && isFinite(Number(v))) ? Number(v) : d;

  return {
    // core
    seed: raw.seed ?? null,
    total_steps: num(raw.total_steps, 500),
    steps_per_day: num(raw.steps_per_day, 50),
    mu: num(raw.mu, 0.0),
    sigma: num(raw.sigma, 0.02),
    fees_per_trade: num(raw.fees_per_trade, 0),

    // KellyCap
    use_kelly_cap: kcEnabled,
    kelly_cap: num(kcRaw.cap_mult ?? kcRaw.cap ?? raw.kelly_cap, 0.10),

    // VolTarget
    use_vt: vtEnabled,
    vt_target_vol: num(vtRaw.target ?? vtRaw.target_vol, 0.10),
    vt_halflife: num(vtRaw.halflife, 20),

    // CPPI
    use_cppi: !!cfRaw.enabled,
    cppi_alpha: num(cfRaw.alpha, 0.10),
    cppi_freeze_frac: num(cfRaw.freeze, 0.05),

    // Soft barrier
    use_soft_barrier: !!sbRaw.enabled,
    soft_barrier: num(sbRaw.threshold, 0.02),

    // FTMO gate
    daily_limit: num(fgRaw.daily_limit, 0.05),
    total_limit: num(fgRaw.total_limit, 0.10),
    spend_rate: num(fgRaw.spend_rate, 1.0),

    // cible (si utilisée)
    target_profit: num(raw.target_profit, 0.10),
    max_days: num(raw.max_days, 30),

    // NestedCPPI
    use_nested_cppi: !!m.NestedCPPI?.use,
    nc_ema_half_life: num(m.NestedCPPI?.ema_half_life, 16),
    nc_floor_alpha: num(m.NestedCPPI?.floor_alpha, 0.10),
    nc_freeze_cushion_min: num(m.NestedCPPI?.freeze_cushion_min, 0.05),

    // Session/News Gate
    use_session_gate: !!m.SessionGate?.use,
    news_pre_blackout_min: num(m.SessionGate?.news_pre_blackout_min, 0),
    news_post_blackout_min: num(m.SessionGate?.news_post_blackout_min, 0),
    dd_daily_freeze_threshold: num(m.SessionGate?.dd_daily_freeze_threshold, 0.8),
  };
}
