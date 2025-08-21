"use client";
import React from "react";

export type SimParams = {
  // Moteur
  desired_risk: number;
  total_steps: number;
  mu: number;

  // CPPI
  cppi_alpha: number;
  cppi_freeze_frac: number;

  // VolTarget
  vt_target_vol: number;
  vt_halflife: number;

  // FTMO
  daily_limit: number;
  total_limit: number;
  spend_rate: number;
  lmax: number;
  steps_per_day: number;
  freeze_after_loss: boolean;
  target_pct: number;
  max_days: number;
};

export const DEFAULT_PARAMS: SimParams = {
  desired_risk: 0.012,
  total_steps: 200,
  mu: 0.0,

  cppi_alpha: 0.10,
  cppi_freeze_frac: 0.05,

  vt_target_vol: 0.010,
  vt_halflife: 10,

  daily_limit: 0.02,
  total_limit: 0.10,
  spend_rate: 0.33,
  lmax: 0.02,
  steps_per_day: 1,
  freeze_after_loss: true,
  target_pct: 0.10,
  max_days: 30,
};

type Props = {
  params: SimParams;
  onChange: (next: SimParams) => void;
  onRun: () => void;
  loading?: boolean;
};

export default function ParamForm({ params, onChange, onRun, loading }: Props) {
  const Num = ({
    label, k, step = 0.001, min, max,
  }: { label: string; k: keyof SimParams; step?: number; min?: number; max?: number }) => (
    <label className="flex flex-col gap-1">
      <span className="text-xs opacity-70">{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={Number(params[k])}
        onChange={(e) => onChange({ ...params, [k]: Number(e.target.value) })}
        className="rounded-xl border px-3 py-2"
      />
    </label>
  );

  const Bool = ({ label, k }: { label: string; k: keyof SimParams }) => (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={Boolean(params[k])}
        onChange={(e) => onChange({ ...params, [k]: e.target.checked })}
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Paramètres</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...DEFAULT_PARAMS })}
            className="btn"
            type="button"
            disabled={loading}
          >
            Reset défauts
          </button>
          <button onClick={onRun} className="btn" disabled={loading} type="button">
            {loading ? "Simulation..." : "Lancer la simulation"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {/* Moteur */}
        <Num label="desired_risk (fraction eq)" k="desired_risk" step={0.001} min={0} />
        <Num label="total_steps" k="total_steps" step={1} min={1} />
        <Num label="mu (drift test)" k="mu" step={0.001} />

        {/* CPPI */}
        <Num label="cppi_alpha (DD autorisé)" k="cppi_alpha" step={0.01} min={0} max={1} />
        <Num label="cppi_freeze_frac (freeze seuil HWM)" k="cppi_freeze_frac" step={0.01} min={0} max={1} />

        {/* VolTarget */}
        <Num label="vt_target_vol (vol cible/step)" k="vt_target_vol" step={0.001} min={0} />
        <Num label="vt_halflife (pas EWMA)" k="vt_halflife" step={1} min={1} />

        {/* FTMO */}
        <Num label="daily_limit" k="daily_limit" step={0.001} min={0} max={1} />
        <Num label="total_limit" k="total_limit" step={0.001} min={0} max={1} />
        <Num label="spend_rate" k="spend_rate" step={0.01} min={0} max={1} />
        <Num label="lmax (cap par pas)" k="lmax" step={0.001} min={0} />
        <Num label="steps_per_day" k="steps_per_day" step={1} min={1} />
        <Bool label="freeze_after_loss (no upsize)" k="freeze_after_loss" />
        <Num label="target_pct (FTMO)" k="target_pct" step={0.01} min={0} />
        <Num label="max_days (FTMO)" k="max_days" step={1} min={1} />
      </div>
    </div>
  );
}
