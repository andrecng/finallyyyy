// lib/policies.ts
export type Policy = { label: string; modules: string[]; params: any; };

export const POLICIES: Record<string, Policy> = {
  "ftmo-daily-first": {
    label: "FTMO — Daily-first (conservateur)",
    modules: ["VolatilityTarget","NestedCPPI","KellyCap","SoftBarrier","FTMOGate","SessionNewsGate"],
    params: {
      mu_override: 0.0,
      vol_target: 0.10, cap_mult: 2.0,
      alpha: 0.10, freeze_floor_pct: 0.05, defreeze_pct: 0.08,
      nested_ema_beta: 0.85, nested_cushion_gain: 1.0, nested_hard_cap: 1.0,
      kelly_cap: 0.012,
      dd_total_limit: 0.10, dd_daily_limit: 0.05,
      lmax_mode: "vol", z_var: 2.8, spend_rate: 0.25, safety_buffer: 0.002,
      banned_hours: [[22,23],[0,1]], session_haircut: 0.0,
      gates: { fee_bps_per_step: 0 },
      target: 0.10
    }
  },
  "ftmo-total-first": {
    label: "FTMO — Total-first (daily souple)",
    modules: ["VolatilityTarget","NestedCPPI","KellyCap","SoftBarrier","FTMOGate","SessionNewsGate"],
    params: {
      mu_override: 0.0,
      vol_target: 0.12, cap_mult: 2.5,
      alpha: 0.12, freeze_floor_pct: 0.04, defreeze_pct: 0.07,
      nested_ema_beta: 0.80, nested_cushion_gain: 1.0, nested_hard_cap: 1.0,
      kelly_cap: 0.014,
      dd_total_limit: 0.10, dd_daily_limit: 0.05,
      lmax_mode: "vol", z_var: 2.5, spend_rate: 0.10, safety_buffer: 0.0015,
      banned_hours: [[22,23],[0,1]], session_haircut: 0.0,
      gates: { fee_bps_per_step: 0 },
      target: 0.10
    }
  },
  "ftmo-mix": {
    label: "FTMO — Mix (équilibré)",
    modules: ["VolatilityTarget","NestedCPPI","KellyCap","SoftBarrier","FTMOGate","SessionNewsGate"],
    params: {
      mu_override: 0.0,
      vol_target: 0.11, cap_mult: 2.2,
      alpha: 0.11, freeze_floor_pct: 0.05, defreeze_pct: 0.08,
      nested_ema_beta: 0.82, nested_cushion_gain: 1.0, nested_hard_cap: 1.0,
      kelly_cap: 0.013,
      dd_total_limit: 0.10, dd_daily_limit: 0.05,
      lmax_mode: "vol", z_var: 2.7, spend_rate: 0.18, safety_buffer: 0.002,
      banned_hours: [[22,23],[0,1]], session_haircut: 0.0,
      gates: { fee_bps_per_step: 0 },
      target: 0.10
    }
  }
};
