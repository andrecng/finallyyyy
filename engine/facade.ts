export type PresetV1 = {
  schema_version: "1.0";
  seed: number;
  total_steps: number;
  mu: number;
  fees_per_trade: number;
  modules: {
    VolatilityTarget?: { vt_target_vol: number; vt_halflife: number };
    CPPIFreeze?: { alpha: number; freeze_frac: number };
    KellyCap?: { cap_mult: number };
    SoftBarrier?: { enabled: boolean; steps: number[]; haircuts: number[] };
    FTMOGate?: {
      enabled: boolean;
      daily_limit: number;
      total_limit: number;
      spend_rate: number;
      lmax_vol_aware: string;
    };
  };
};

export type SimulationOutput = {
  kpis: {
    pass_rate?: number;
    days_to_target?: number;
    max_dd_total?: number;
    max_dd_daily?: number;
    mar?: number;
    sortino?: number;
    omega?: number;
  };
  series?: {
    equity?: number[];
    risk_effective?: number[];
    cushion?: number[];
    budget_daily?: number[];
  };
  logs?: Array<{ t: number; module: string; decision: string; note?: string }>;
  modules_active?: string[];
};

export interface EngineFacade {
  simulate(p: PresetV1): Promise<SimulationOutput>;
}

// Appelle l'API Next (mock/proxy selon env). Pas d'appel direct backend ici.
export const engine: EngineFacade = {
  async simulate(preset) {
    const r = await fetch("/api/simulate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(preset),
    });
    if (!r.ok) throw new Error(`simulate failed: ${r.status}`);
    return r.json();
  },
};
