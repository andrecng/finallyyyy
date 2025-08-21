// stores/workspace.ts
import { create } from "zustand";

export type InputState = {
  profile: "gaussian" | "student_t" | "student_t_jumps_ewma";
  seed: number;
  steps_per_day: number;
  horizon_days: number;
  initial_equity: number;
  modules: string[];
  params: any;
};

type WorkspaceStore = {
  state: InputState;
  setState: (s: Partial<InputState>) => void;
  setParam: (k: string, v: any) => void;
  setGate: (k: string, v: any) => void;
  loadPolicy: (policy: { modules: string[]; params: any }) => void;
};

const DEFAULT: InputState = {
  profile: "student_t_jumps_ewma",
  seed: 123,
  steps_per_day: 24,
  horizon_days: 20,
  initial_equity: 100000,
  modules: ["VolatilityTarget","NestedCPPI","KellyCap","SoftBarrier","FTMOGate","SessionNewsGate"],
  params: {
    mu_override: 0.0,
    vol_target: 0.10, cap_mult: 2.0,
    alpha: 0.10, freeze_floor_pct: 0.05, defreeze_pct: 0.08,
    nested_ema_beta: 0.85, nested_cushion_gain: 1.0, nested_hard_cap: 1.0,
    kelly_cap: 0.012,
    dd_total_limit: 0.10, dd_daily_limit: 0.05,
    lmax_mode: "vol", z_var: 2.8, spend_rate: 0.25, safety_buffer: 0.002,
    banned_hours: [[22,23],[0,1]],
    session_haircut: 0.0,
    gates: { fee_bps_per_step: 0 },
    target: 0.10
  }
};

export const useWorkspace = create<WorkspaceStore>((set, get) => ({
  state: DEFAULT,
  setState: (s) => set({ state: { ...get().state, ...s } }),
  setParam: (k, v) => {
    const st = get().state;
    set({ state: { ...st, params: { ...st.params, [k]: v } } });
  },
  setGate: (k, v) => {
    const st = get().state;
    const gates = { ...(st.params.gates || {}), [k]: v };
    set({ state: { ...st, params: { ...st.params, gates } } });
  },
  loadPolicy: (policy) => {
    const st = get().state;
    set({
      state: {
        ...st,
        modules: policy.modules,
        params: { ...st.params, ...policy.params }
      }
    });
  }
}));
