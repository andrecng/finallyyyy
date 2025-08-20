import { useId } from "react";
import HourRangeInput from "./HourRangeInput";

const MODULES = [
  ["VolatilityTarget","VolTarget (vol cible)"],
  ["NestedCPPI","Nested CPPI (double airbag)"],
  ["KellyCap","Cap Kelly (borne)"],
  ["SoftBarrier","Paliers DD (SoftBarrier)"],
  ["FTMOGate","FTMO Gate (total+daily)"],
  ["SessionNewsGate","Sessions/News Gate"],
];

const PROFILES = [
  { key: "gaussian", label: "Marché calme (gaussien)" },
  { key: "student_t", label: "Queues épaisses (t-Student)" },
  { key: "student_t_jumps_ewma", label: "Crises (t + sauts + vol en grappes)" },
];

export type InputState = {
  profile: string;
  seed: number;
  steps_per_day: number;
  horizon_days: number;
  initial_equity: number;
  modules: string[];
  params: any;
};

export default function InputForm({
  state, onChange
}: { state: InputState; onChange:(s:InputState)=>void }) {
  const id = (name:string)=> useId() + name;

  function set<K extends keyof InputState>(k:K, v:InputState[K]) {
    onChange({ ...state, [k]: v });
  }
  function setParam(k:string, v:any) {
    onChange({ ...state, params: { ...state.params, [k]: v } });
  }
  function setGate(k:string, v:any) {
    const gates = { ...(state.params.gates||{}) , [k]: v };
    onChange({ ...state, params: { ...state.params, gates } });
  }

  const bannedHours: [number,number][] = state.params.banned_hours || [];

  return (
    <div className="space-y-6">
      {/* Scénario */}
      <section className="rounded-2xl border p-4 space-y-3">
        <h3 className="font-semibold">Scénario</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Profil marché</label>
            <select className="w-full rounded-md border p-2"
              value={state.profile}
              onChange={e=>set("profile", e.target.value)}>
              {PROFILES.map(p=> <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              "Crises" = t + sauts + vol en grappes (EWMA).
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Drift μ (optionnel)</label>
            <input type="number" step="0.0001" className="w-full rounded-md border p-2"
              placeholder="ex: 0 (FX sans edge)"
              value={state.params.mu_override ?? ""}
              onChange={e=> setParam("mu_override", e.target.value === "" ? undefined : Number(e.target.value))}/>
            <p className="text-xs text-neutral-500 mt-1">0 = edge nul ; >0 = biais haussier léger.</p>
          </div>
          <div>
            <label className="text-sm font-medium">Pas / jour</label>
            <input type="number" min={1} className="w-full rounded-md border p-2"
              value={state.steps_per_day}
              onChange={e=>set("steps_per_day", Number(e.target.value))}/>
            <p className="text-xs text-neutral-500 mt-1">Granularité temporelle.</p>
          </div>
          <div>
            <label className="text-sm font-medium">Horizon (jours)</label>
            <input type="number" min={1} className="w-full rounded-md border p-2"
              value={state.horizon_days}
              onChange={e=>set("horizon_days", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Seed</label>
            <input type="number" className="w-full rounded-md border p-2"
              value={state.seed}
              onChange={e=>set("seed", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Capital initial</label>
            <input type="number" className="w-full rounded-md border p-2"
              value={state.initial_equity}
              onChange={e=>set("initial_equity", Number(e.target.value))}/>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="rounded-2xl border p-4 space-y-3">
        <h3 className="font-semibold">Modules actifs</h3>
        <div className="grid md:grid-cols-3 gap-2">
          {MODULES.map(([k,label]) => {
            const checked = state.modules.includes(k);
            return (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={checked}
                  onChange={e=>{
                    const on = e.target.checked;
                    const next = on ? [...state.modules, k] : state.modules.filter(x=>x!==k);
                    set("modules", next);
                  }}/>
                {label}
              </label>
            );
          })}
        </div>
      </section>

      {/* Paramètres clés */}
      <section className="rounded-2xl border p-4 space-y-4">
        <h3 className="font-semibold">Paramètres</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Vol cible (ann.)</label>
            <input type="number" step="0.01" className="w-full rounded-md border p-2"
              value={state.params.vol_target}
              onChange={e=>setParam("vol_target", Number(e.target.value))}/>
            <p className="text-xs text-neutral-500 mt-1">Ex: 0.10 = 10 %</p>
          </div>
          <div>
            <label className="text-sm font-medium">Cap relatif vol-target</label>
            <input type="number" step="0.1" className="w-full rounded-md border p-2"
              value={state.params.cap_mult}
              onChange={e=>setParam("cap_mult", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Cap Kelly (borne)</label>
            <input type="number" step="0.001" className="w-full rounded-md border p-2"
              value={state.params.kelly_cap}
              onChange={e=>setParam("kelly_cap", Number(e.target.value))}/>
          </div>

          <div>
            <label className="text-sm font-medium">Plancher CPPI (α)</label>
            <input type="number" step="0.01" className="w-full rounded-md border p-2"
              value={state.params.alpha}
              onChange={e=>setParam("alpha", Number(e.target.value))}/>
            <p className="text-xs text-neutral-500 mt-1">floor = HWM·(1−α)</p>
          </div>
          <div>
            <label className="text-sm font-medium">Seuil freeze (cushion %)</label>
            <input type="number" step="0.01" className="w-full rounded-md border p-2"
              value={state.params.freeze_floor_pct}
              onChange={e=>setParam("freeze_floor_pct", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Seuil dé-freeze</label>
            <input type="number" step="0.01" className="w-full rounded-md border p-2"
              value={state.params.defreeze_pct}
              onChange={e=>setParam("defreeze_pct", Number(e.target.value))}/>
          </div>

          <div>
            <label className="text-sm font-medium">Lissage cushion (EMA β)</label>
            <input type="number" step="0.01" min={0} max={1} className="w-full rounded-md border p-2"
              value={state.params.nested_ema_beta}
              onChange={e=>setParam("nested_ema_beta", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Gain cushion (≤1)</label>
            <input type="number" step="0.01" min={0} max={1} className="w-full rounded-md border p-2"
              value={state.params.nested_cushion_gain}
              onChange={e=>setParam("nested_cushion_gain", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Cap interne (0..1)</label>
            <input type="number" step="0.01" min={0} max={1} className="w-full rounded-md border p-2"
              value={state.params.nested_hard_cap}
              onChange={e=>setParam("nested_hard_cap", Number(e.target.value))}/>
          </div>

          <div>
            <label className="text-sm font-medium">Perte-step plausible (Lmax)</label>
            <input type="number" step="0.001" className="w-full rounded-md border p-2"
              value={state.params.worst_step_loss_guess}
              onChange={e=>setParam("worst_step_loss_guess", Number(e.target.value))}/>
            <p className="text-xs text-neutral-500 mt-1">Ex: 0.02 = 2 %</p>
          </div>
          <div>
            <label className="text-sm font-medium">Marge sécurité (FTMO)</label>
            <input type="number" step="0.0005" className="w-full rounded-md border p-2"
              value={state.params.safety_buffer}
              onChange={e=>setParam("safety_buffer", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Perte totale max (FTMO)</label>
            <input type="number" step="0.01" className="w-full rounded-md border p-2"
              value={state.params.dd_total_limit}
              onChange={e=>setParam("dd_total_limit", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Perte journalière max (FTMO)</label>
            <input type="number" step="0.01" className="w-full rounded-md border p-2"
              value={state.params.dd_daily_limit}
              onChange={e=>setParam("dd_daily_limit", Number(e.target.value))}/>
          </div>

          <div className="md:col-span-2">
            <HourRangeInput
              value={bannedHours}
              onChange={v=> setParam("banned_hours", v)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Haircut sessions</label>
            <input type="number" step="0.05" min={0} max={1} className="w-full rounded-md border p-2"
              value={state.params.session_haircut}
              onChange={e=>setParam("session_haircut", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Frais par pas (bps)</label>
            <input type="number" step="0.5" min={0} className="w-full rounded-md border p-2"
              value={state.params.gates?.fee_bps_per_step ?? 0}
              onChange={e=> setGate("fee_bps_per_step", Number(e.target.value))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Objectif profit</label>
            <input type="number" step="0.01" className="w-full rounded-md border p-2"
              value={state.params.target}
              onChange={e=>setParam("target", Number(e.target.value))}/>
          </div>
        </div>
      </section>
    </div>
  );
}
