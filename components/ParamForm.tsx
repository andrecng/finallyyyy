"use client";
import React from "react";
import NumberField from "@/components/NumberField";

export type SimParams = {
  desired_risk: number; total_steps: number; mu: number;
  cppi_alpha: number; cppi_freeze_frac: number;
  vt_target_vol: number; vt_halflife: number;
  daily_limit: number; total_limit: number; spend_rate: number;
  lmax: number; steps_per_day: number; freeze_after_loss: boolean;
  target_pct: number; max_days: number;
};

export const DEFAULT_PARAMS: SimParams = {
  desired_risk: 0.012, total_steps: 200, mu: 0.0,
  cppi_alpha: 0.10, cppi_freeze_frac: 0.05,
  vt_target_vol: 0.010, vt_halflife: 10,
  daily_limit: 0.02, total_limit: 0.10, spend_rate: 0.33,
  lmax: 0.02, steps_per_day: 1, freeze_after_loss: true,
  target_pct: 0.10, max_days: 30,
};

type Props = {
  params: SimParams;
  onCommit: (next: SimParams) => void; // met à jour l'état parent
  onRun: () => void;
  loading?: boolean;
};

export default function ParamForm({ params, onCommit, onRun, loading }: Props) {
  // helper: commit champ par champ
  const set = <K extends keyof SimParams>(k: K, v: number | boolean) =>
    onCommit({ ...params, [k]: v } as SimParams);

  const blurActive = () => {
    const el = document.activeElement as HTMLElement | null;
    if (el && typeof el.blur === "function") el.blur();
  };

  const Num = ({ label, k, step=0.001, min, max, decimals }:
    { label: string; k: keyof SimParams; step?: number; min?: number; max?: number; decimals?: number }) => (
    <label className="flex flex-col gap-1">
      <span className="text-xs opacity-70">{label}</span>
      <NumberField
        value={Number(params[k] as number)}
        onCommit={(v) => set(k, v)}
        step={step} min={min} max={max} decimals={decimals}
      />
    </label>
  );

  const Bool = ({ label, k }: { label: string; k: keyof SimParams }) => (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={Boolean(params[k] as boolean)}
        onChange={(e) => set(k, e.target.checked)}
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
            onMouseDown={blurActive}
            onClick={() => onCommit({ ...DEFAULT_PARAMS })}
            className="btn" type="button" disabled={loading}
          >
            Reset défauts
          </button>
          <button
            onMouseDown={blurActive} // force le blur pour commit le dernier champ
            onClick={onRun}
            className="btn" type="button" disabled={loading}
          >
            {loading ? "Simulation..." : "Lancer la simulation"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {/* Moteur */}
        <Num label="desired_risk" k="desired_risk" step={0.001} min={0} decimals={6} />
        <Num label="total_steps" k="total_steps" step={1} min={1} decimals={0} />
        <Num label="mu (drift test)" k="mu" step={0.001} decimals={6} />

        {/* CPPI */}
        <Num label="cppi_alpha (DD autorisé)" k="cppi_alpha" step={0.01} min={0} max={1} decimals={4} />
        <Num label="cppi_freeze_frac (freeze seuil HWM)" k="cppi_freeze_frac" step={0.01} min={0} max={1} decimals={4} />

        {/* VolTarget */}
        <Num label="vt_target_vol (vol cible/step)" k="vt_target_vol" step={0.001} min={0} decimals={6} />
        <Num label="vt_halflife (pas EWMA)" k="vt_halflife" step={1} min={1} decimals={0} />

        {/* FTMO */}
        <Num label="daily_limit" k="daily_limit" step={0.001} min={0} max={1} decimals={4} />
        <Num label="total_limit" k="total_limit" step={0.001} min={0} max={1} decimals={4} />
        <Num label="spend_rate" k="spend_rate" step={0.01} min={0} max={1} decimals={4} />
        <Num label="lmax" k="lmax" step={0.001} min={0} decimals={6} />
        <Num label="steps_per_day" k="steps_per_day" step={1} min={1} decimals={0} />
        <Bool label="freeze_after_loss (no upsize)" k="freeze_after_loss" />
        <Num label="target_pct (FTMO)" k="target_pct" step={0.01} min={0} max={1} decimals={4} />
        <Num label="max_days (FTMO)" k="max_days" step={1} min={1} decimals={0} />
      </div>
    </div>
  );
}
