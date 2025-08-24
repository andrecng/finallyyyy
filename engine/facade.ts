export type PresetV1 = {
  name?: string;
  schema_version: "1.0";
  seed: number;
  total_steps: number;
  mu: number;
  fees_per_trade: number;
  sigma?: number;           // volatilité du marché
  steps_per_day?: number;   // pas par jour pour l'agrégation
  target_profit?: number;   // objectif de profit (ex: 0.10 = 10%)
  max_days?: number;        // délai maximum pour atteindre l'objectif
  daily_limit?: number;     // limite de drawdown quotidien
  total_limit?: number;     // limite de drawdown total
  modules: {
    VolatilityTarget?: { vt_target_vol: number; vt_halflife: number };
    CPPIFreeze?: { alpha: number; freeze_frac: number };
    KellyCap?: { cap_mult: number };
    SoftBarrier?: { enabled: boolean; steps: number[]; haircuts: number[] };
    FTMOGate?: {
      enabled: boolean;
      daily_limit: number;   // ex: 0.02
      total_limit: number;   // ex: 0.10
      spend_rate: number;    // ex: 0.35
      lmax_vol_aware: string;// ex: "p50"
    };
  };
};

export type SimulationOutput = {
  max_dd_total?: number;
  max_dd_daily?: number;
  violations_daily?: number;
  violations_total?: number;
  kpis?: {
    pass_rate?: number;
    days_to_target?: number;
    mar?: number;
    sortino?: number;
    omega?: number;
    cagr?: number;
    vol_realized?: number;
    sharpe?: number;
    profit_factor?: number;
    win_rate?: number;
    best_day_return?: number;
    worst_day_return?: number;
    max_consecutive_losses?: number;
    recovery_days_maxdd?: number;
    target_profit?: number;
    max_days?: number;
    target_pass?: boolean;
  };
  series?: {
    equity?: number[];
    risk_effective?: number[];
    cushion?: number[];
    budget_daily?: number[];
  };
  diag?: {
    vt_realized_vol?: number;
    vt_target_vol_echo?: number;
    cppi_freeze_events?: number;
    time_frozen_steps?: number;
    kelly_cap_hits?: number;
    softbarrier_level_hits?: number[];
    ftmo_gate_events?: number;
    no_upsize_after_loss?: boolean;
    risk_final_is_min?: boolean;
    cushion_breaches?: number;
  };
  logs?: Array<{ t: number; module: string; decision: string; note?: string }>;
  modules_active?: string[];
  notes?: string;
};

export interface EngineFacade { 
  simulate(p: PresetV1): Promise<SimulationOutput>; 
}

function isForceMock(): boolean {
  if (typeof window === 'undefined') return false; // côté serveur
  const flag = (process.env.NEXT_PUBLIC_FORCE_MOCK ?? "0").toString().trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes" || flag === "on";
}

async function simulateRemote(preset: PresetV1): Promise<SimulationOutput> {
  const res = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preset),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`simulate proxy HTTP ${res.status} ${txt}`);
  }
  return res.json();
}

async function simulateMock(preset: PresetV1): Promise<SimulationOutput> {
  // Mock simple pour les tests
  const steps = Math.max(2, preset.total_steps || 200);
  return {
    max_dd_total: 0.45,
    max_dd_daily: 0.01,
    violations_daily: 0,
    violations_total: 1,
    series: { 
      equity: Array.from({ length: steps }, (_, i) => 1 + 0.0005 * i) 
    },
    kpis: {
      pass_rate: 0.0,
      days_to_target: undefined,
      cagr: 0.12,
      vol_realized: 0.15,
      sharpe: 0.8,
      sortino: 1.2,
      profit_factor: 0.95,
      win_rate: 0.48,
      best_day_return: 0.025,
      worst_day_return: -0.018,
      max_consecutive_losses: 6,
      recovery_days_maxdd: 45
    },
    diag: {
      vt_realized_vol: 0.15,
      vt_target_vol_echo: 0.20,
      cppi_freeze_events: 0,
      time_frozen_steps: 0,
      kelly_cap_hits: 0,
      softbarrier_level_hits: [],
      ftmo_gate_events: 0,
      no_upsize_after_loss: true,
      risk_final_is_min: true,
      cushion_breaches: 0
    }
  };
}

export const engine: EngineFacade = {
  async simulate(preset: PresetV1): Promise<SimulationOutput> {
    if (isForceMock()) return simulateMock(preset);
    return simulateRemote(preset);
  },
};
