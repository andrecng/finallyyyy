export type SimInput = {
  initial_equity: number;
  returns: number[];            // simple returns per step
  steps_per_day?: number;       // ex: 20
  params?: {
    cppi?: { alpha?: number; m?: number; freeze_cushion_pct?: number };
    amplifier?: { gain?: number; cap?: number };
    kelly?: { enabled?: boolean; f_cap?: number; haircut?: number; source?: "external" | "internal" };
    gates?: { news_enabled?: boolean; news_blocked_steps?: number[]; fee_bps_per_step?: number };
  };
};

export type StepLog = {
  step: number;
  hwm: number;
  floor: number;
  equity_before: number;
  cushion: number;
  frozen: boolean;
  exposures_by_module: { cppi?: number; kelly?: number; min_pre_amp: number };
  amplified_exposure: number;
  gate_reasons?: string[];
  applied_return: number;
  equity_after: number;
};

export type SimOutput = {
  kpis: {
    steps: number;
    initial_equity: number;
    final_equity: number;
    max_dd_pct: number;
    max_daily_dd_pct?: number;
    success_flags?: Record<string, boolean>;
  };
  series: { equity: number[]; exposure: number[] };
  logs: StepLog[];
  modules: string[];
};
