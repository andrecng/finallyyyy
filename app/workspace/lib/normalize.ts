export function normalizePreset(raw: any) {
  const n: any = { ...raw };

  const num = (v: any, def: number) => {
    if (typeof v === "number" && isFinite(v)) return v;
    if (typeof v === "string") {
      const s = v.trim();
      if (!s) return def;
      if (s.endsWith("%")) {
        const x = parseFloat(s.slice(0, -1));
        return isFinite(x) ? x / 100 : def;
      }
      const x = parseFloat(s);
      return isFinite(x) ? x : def;
    }
    return def;
  };

  const bool = (v: any, def=false) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (s === "true") return true;
      if (s === "false") return false;
    }
    return def;
  };

  // Coercions critiques
  n.total_steps   = Math.max(1, Math.floor(num(n.total_steps, 500)));
  n.steps_per_day = Math.max(1, Math.floor(num(n.steps_per_day, 50)));
  n.mu            = num(n.mu, 0.0);
  n.sigma         = num(n.sigma, 0.02);

  n.daily_limit   = num(n.daily_limit, 0.05);
  n.total_limit   = num(n.total_limit, 0.10);
  n.vt_target_vol = num(n.vt_target_vol, 0.10);
  n.vt_halflife   = Math.max(1, Math.floor(num(n.vt_halflife, 20)));
  n.kelly_cap     = num(n.kelly_cap, 0.10);
  n.soft_barrier  = num(n.soft_barrier, 0.02);
  n.spend_rate    = num(n.spend_rate, 1.0);

  n.target_profit = num(n.target_profit, 0.10);
  n.max_days      = Math.max(1, Math.floor(num(n.max_days, 30)));

  n.use_cppi         = bool(n.use_cppi, false);
  n.use_vt           = bool(n.use_vt, false);
  n.use_kelly_cap    = bool(n.use_kelly_cap, false);
  n.use_soft_barrier = bool(n.use_soft_barrier, false);

  return n;
}
