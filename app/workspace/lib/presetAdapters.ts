import type { PresetV1 } from "@/engine/facade";

/** Normalise les pourcentages en décimaux et remplit les valeurs par défaut sûres. */
export function normalizePresetV1(p: PresetV1): PresetV1 {
  const pct = (x: number | undefined | null, d = 0) => {
    if (x == null || !Number.isFinite(x)) return d;
    return x > 1 ? x / 100 : x;
  };
  const num = (x: number | undefined | null, d = 0) =>
    x == null || !Number.isFinite(x) ? d : x;

  const q: PresetV1 = {
    schema_version: "1.0",
    name: p.name || "preset",
    seed: num(p.seed, 1337),
    total_steps: num(p.total_steps, 2000),
    mu: num(p.mu, 0),
    fees_per_trade: num(p.fees_per_trade, 0.0002),
    sigma: num(p.sigma, 0.02),
    steps_per_day: num(p.steps_per_day, 50),
    target_profit: pct(p.target_profit, 0), // optionnel
    max_days: num(p.max_days, 30),
    daily_limit: pct(p.daily_limit, 0.02),
    total_limit: pct(p.total_limit, 0.10),
    modules: {
      VolatilityTarget: p.modules?.VolatilityTarget
        ? {
            vt_target_vol: pct(p.modules.VolatilityTarget.vt_target_vol, 0.10),
            vt_halflife: num(p.modules.VolatilityTarget.vt_halflife, 16),
          }
        : undefined,
      CPPIFreeze: p.modules?.CPPIFreeze
        ? {
            alpha: pct(p.modules.CPPIFreeze.alpha, 0.20),
            freeze_frac: pct(p.modules.CPPIFreeze.freeze_frac, 0.05),
          }
        : undefined,
      KellyCap: p.modules?.KellyCap
        ? { cap_mult: pct(p.modules.KellyCap.cap_mult, 0.50) }
        : undefined,
      SoftBarrier: p.modules?.SoftBarrier
        ? {
            enabled: !!p.modules.SoftBarrier.enabled,
            steps: p.modules.SoftBarrier.steps?.length ? p.modules.SoftBarrier.steps : [1, 2, 3],
            haircuts: p.modules.SoftBarrier.haircuts?.length ? p.modules.SoftBarrier.haircuts : [0.7, 0.5, 0.3],
            // barrier est optionnel
            barrier: p.modules.SoftBarrier.barrier != null ? pct(p.modules.SoftBarrier.barrier) : undefined,
          }
        : undefined,
      FTMOGate: p.modules?.FTMOGate
        ? {
            enabled: !!p.modules.FTMOGate.enabled,
            daily_limit: pct(p.modules.FTMOGate.daily_limit, 0.02),
            total_limit: pct(p.modules.FTMOGate.total_limit, 0.10),
            spend_rate: pct(p.modules.FTMOGate.spend_rate, 0.35),
            lmax_vol_aware: p.modules.FTMOGate.lmax_vol_aware || "p50",
          }
        : undefined,
      NestedCPPI: p.modules?.NestedCPPI
        ? {
            // ✅ Canon: enabled + ema_halflife + floor_alpha + freeze_cushion
            enabled: !!(p.modules as any).NestedCPPI.enabled || !!(p.modules as any).NestedCPPI.use,
            ema_halflife:
              num(
                // tolère l'ancienne clé ema_half_life
                (p.modules as any).NestedCPPI.ema_halflife ?? (p.modules as any).NestedCPPI.ema_half_life,
                16
              ),
            floor_alpha: pct((p.modules as any).NestedCPPI.floor_alpha, 0.10),
            freeze_cushion: pct(
              (p.modules as any).NestedCPPI.freeze_cushion ??
                (p.modules as any).NestedCPPI.freeze_cushion_min,
              0.05
            ),
          }
        : undefined,
      SessionGate: p.modules?.SessionGate
        ? {
            enabled: !!(p.modules as any).SessionGate.enabled || !!(p.modules as any).SessionGate.use,
            news_pre_min: num(
              (p.modules as any).SessionGate.news_pre_min ??
                (p.modules as any).SessionGate.news_pre_blackout_min,
              0
            ),
            news_post_min: num(
              (p.modules as any).SessionGate.news_post_min ??
                (p.modules as any).SessionGate.news_post_blackout_min,
              0
            ),
            dd_daily_freeze_limit: pct(
              (p.modules as any).SessionGate.dd_daily_freeze_limit ??
                (p.modules as any).SessionGate.dd_daily_freeze_threshold,
              0.8
            ),
          }
        : undefined,
    },
  };

  return q;
}

/** Validation simple FTMO + bornes évidentes. Retourne la liste d'erreurs (vide si ok). */
export function validatePresetV1(p: PresetV1): string[] {
  const errs: string[] = [];
  if (p.total_steps <= 0) errs.push("total_steps must be > 0");
  if (p.max_days <= 0) errs.push("max_days must be > 0");
  if (p.daily_limit <= 0 || p.daily_limit > 0.05) errs.push("daily_limit out of FTMO bounds (0–5%)");
  if (p.total_limit <= 0 || p.total_limit > 0.10) errs.push("total_limit out of FTMO bounds (0–10%)");
  return errs;
}

/** Convertit un preset "librairie" (bibliothèque) en PresetV1 canon. */
export function fromLibraryPreset(libPreset: any): PresetV1 {
  // Supporte libPreset.payload ou libPreset directement
  const src = libPreset?.payload ? libPreset.payload : libPreset;
  const v: PresetV1 = {
    schema_version: "1.0",
    name: src.name || libPreset.name || "preset",
    seed: src.seed,
    total_steps: src.total_steps,
    mu: src.mu,
    fees_per_trade: src.fees_per_trade,
    sigma: src.sigma,
    steps_per_day: src.steps_per_day,
    target_profit: src.target_profit,
    max_days: src.max_days,
    daily_limit: src.daily_limit,
    total_limit: src.total_limit,
    modules: src.modules,
  };
  return normalizePresetV1(v);
}

/** Convertit PresetV1 vers un format "librairie" simple. */
export function toLibraryPreset(p: PresetV1) {
  return {
    name: p.name,
    payload: { ...p },
    meta: { source: "user", updated_at: new Date().toISOString() },
  };
}
