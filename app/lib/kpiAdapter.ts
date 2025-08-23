// kpiAdapter.ts
export function adaptKpis(resp: any) {
  const K = (resp?.kpis ?? resp ?? {}) as Record<string, any>;
  const pick = (...keys: string[]) => {
    for (const k of keys) if (K[k] != null) return K[k];
    return null;
  };
  return {
    // basiques (déjà OK mais on sécurise)
    vol_realized: pick("vol_realized", "volRealized"),
    win_rate:     pick("win_rate", "winRate"),
    profit_factor:pick("profit_factor", "profitFactor"),

    // étendus (tous les alias possibles)
    cagr:               pick("cagr", "CAGR", "cagr_annual"),
    sharpe:             pick("sharpe", "sharpe_ratio", "sharpeAnnual"),
    sortino:            pick("sortino", "sortino_ratio"),
    best_day:           pick("best_day", "bestDay"),
    worst_day:          pick("worst_day", "worstDay"),
    max_consec_losses:  pick("max_consec_losses", "maxConsecLosses"),
    days_to_recover:    pick("days_to_recover", "daysToRecover"),

    // target profit KPIs
    target_profit:      pick("target_profit", "targetProfit"),
    max_days:           pick("max_days", "maxDays"),
    days_to_target:     pick("days_to_target", "daysToTarget"),
    target_pass:        pick("target_pass", "targetPass"),
  };
}
