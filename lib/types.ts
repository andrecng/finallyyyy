// Types principaux pour l'application
export interface CapitalConfig {
  initial: number;
  basis: 'balance' | 'equity' | 'risk_capital';
  fees: number;
  spread_bp: number;
  slippage_bp: number;
}

export interface EdgeConfig {
  win_rate: number;
  r_win: number;
  r_loss: number;
  source: 'fixed' | 'bayes';
}

export interface KellyConfig {
  enabled: boolean;
  fraction_cap: number;
  cap_global_pct: number;
}

export interface BayesConfig {
  enabled: boolean;
  prior_a: number;
  prior_b: number;
  window: number;
  decay: number;
}

export interface SequenceConfig {
  type: 'martingale' | 'anti_martingale' | 'anti_martingale_bornee';
  params: {
    step_up: number;
    step_down: number;
    cap_seq: number;
  };
}

export interface DDPaliersConfig {
  thresholds: number[];
  multipliers: number[];
  reset_on_hwm: boolean;
}

export interface CPPIConfig {
  enabled: boolean;
  alpha: number;
}

export interface VolTargetConfig {
  enabled: boolean;
  sigma_target: number;
}

export interface MarkovConfig {
  enabled: boolean;
  mode: 'risk_only' | 'edge_only' | 'both';
  matrix_params: {
    p_cc: number;
    p_ss: number;
    mu_c: number;
    mu_s: number;
  };
}

export interface PortfolioConfig {
  cap_global: number;
  cap_per_instr: Record<string, number>;
  rho: number[][];
  priority: 'pro_rata' | 'sequential';
}

export interface StopsConfig {
  dd_stop_pct: number;
  breach_behavior: 'halt' | 'reduce' | 'continue';
}

export interface StressFlags {
  wr_minus_10: boolean;
  wr_plus_10: boolean;
  vol_plus_50: boolean;
  costs_x2: boolean;
  costs_x3: boolean;
  corr_to_1: boolean;
  black_swan_5r: boolean;
}

export interface SimulationConfig {
  seed: number;
  n_trades: number;
  capital: CapitalConfig;
  edge: EdgeConfig;
  kelly: KellyConfig;
  bayes: BayesConfig;
  sequence: SequenceConfig;
  dd_paliers: DDPaliersConfig;
  cppi: CPPIConfig;
  vol_target: VolTargetConfig;
  markov: MarkovConfig;
  portfolio: PortfolioConfig;
  stops: StopsConfig;
  stress_flags: StressFlags;
}

export interface KPIs {
  CAGR: number;
  MaxDD: number;
  Sharpe: number;
  Sortino: number;
  WinRate: number;
  ProfitFactor: number;
  Expectancy_R: number;
  ruin_prob: {
    dd_10: number;
    dd_20: number;
    dd_30: number;
  };
  ES_95: number;
  Ulcer: number;
  time_in_dd: number;
  longest_loss_streak: number;
  trades_needed_mean: number;
  trades_needed_p95: number;
}

export interface Guardrails {
  palier_break_count: number[];
  prob_break_next_palier: number;
  floor_breaches: number;
  avg_dd_recovery_trades: number;
  peak_concurrent_pos: number;
  var_est: number;
  compliance_flags: string[];
}

export interface SimulationResult {
  kpis: KPIs;
  guardrails: Guardrails;
  series: {
    equity: [number, number][];
    dd: [number, number][];
    hwm: [number, number][];
  };
  trades: Array<{
    n: number;
    instrument: string;
    size_pct: number;
    kelly_cap: number;
    seq_mult: number;
    R: number;
    fees: number;
  }>;
  posteriors: {
    p_hat: [number, number][];
  };
  run_meta: {
    seed: number;
    duration_ms: number;
    engine_version: string;
  };
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: SimulationConfig;
  created_at: string;
  updated_at: string;
}