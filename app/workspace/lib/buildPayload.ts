export function mapToBackend(raw: any) {
  const m = raw.modules ?? {};
  const n = (v: any, d: number) => (typeof v === "number" && isFinite(v)) ? v : d;

  return {
    // core
    seed: raw.seed ?? null,
    total_steps: n(raw.total_steps, 500),
    steps_per_day: n(raw.steps_per_day, 50),
    mu: n(raw.mu, 0.0),
    sigma: n(raw.sigma, 0.02),
    fees_per_trade: n(raw.fees_per_trade, 0),

    // modules (flags + params attendus par l'API)
    use_kelly_cap: !!m.KellyCap?.enabled,                 // <- flag basé sur enabled
    kelly_cap: n(m.KellyCap?.cap_mult ?? m.KellyCap?.cap, 0.10),

    use_vt: !!m.VolatilityTarget?.enabled,
    vt_target_vol: n(m.VolatilityTarget?.target, 0.10),
    vt_halflife: n(m.VolatilityTarget?.halflife, 20),

    use_cppi: !!m.CPPIFreeze?.enabled,
    cppi_alpha: n(m.CPPIFreeze?.alpha, 0.10),
    cppi_freeze_frac: n(m.CPPIFreeze?.freeze, 0.05),

    use_soft_barrier: !!m.SoftBarrier?.enabled,
    soft_barrier: n(m.SoftBarrier?.threshold, 0.02),

    // FTMO gate
    daily_limit: n(m.FTMOGate?.daily_limit, 0.05),
    total_limit: n(m.FTMOGate?.total_limit, 0.10),
    spend_rate: n(m.FTMOGate?.spend_rate, 1.0),

    // cible (si tu l'utilises)
    target_profit: n(raw.target_profit, 0.10),
    max_days: n(raw.max_days, 30),
  };
}
