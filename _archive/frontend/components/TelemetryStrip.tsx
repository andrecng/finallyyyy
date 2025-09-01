"use client";
import React from "react";

type Telemetry = {
  cppi_cap_mult?: number | null;
  cppi_freeze?: boolean | null;
  vt_sigma?: number | null;
  vt_cap?: number | null;
  sb_dd?: number | null;      // drawdown fraction (0.0265 -> 2.65%)
  sb_mult?: number | null;
  ftmo_lmax_dyn?: number | null;
  ftmo_budget_day_left?: number | null; // fraction of daily budget left
};

function fmtPct(x?: number | null, digits = 2) {
  if (x === null || x === undefined) return "—";
  return `${(x * 100).toFixed(digits)}%`;
}
function fmtNum(x?: number | null, digits = 3) {
  if (x === null || x === undefined) return "—";
  return Number.isFinite(x) ? x.toFixed(digits) : "—";
}
function fmtBool(b?: boolean | null) {
  if (b === null || b === undefined) return "—";
  return b ? "ON" : "OFF";
}

export default function TelemetryStrip({ t }: { t?: Partial<Telemetry> }) {
  const tp = t ?? {};
  return (
    <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
      <div className="rounded-2xl bg-slate-50 p-3 shadow">
        <div className="font-medium">CPPI</div>
        <div className="mt-1 flex flex-wrap gap-3">
          <span className="opacity-70">cap_mult:</span><span>{fmtNum(tp.cppi_cap_mult, 2)}</span>
          <span className="opacity-70">freeze:</span><span>{fmtBool(tp.cppi_freeze ?? null)}</span>
        </div>
      </div>
      <div className="rounded-2xl bg-slate-50 p-3 shadow">
        <div className="font-medium">VolTarget</div>
        <div className="mt-1 flex flex-wrap gap-3">
          <span className="opacity-70">σ:</span><span>{fmtPct(tp.vt_sigma, 2)}</span>
          <span className="opacity-70">cap:</span><span>{fmtNum(tp.vt_cap, 2)}</span>
        </div>
      </div>
      <div className="rounded-2xl bg-slate-50 p-3 shadow">
        <div className="font-medium">SoftBarrier</div>
        <div className="mt-1 flex flex-wrap gap-3">
          <span className="opacity-70">dd:</span><span>{fmtPct(tp.sb_dd, 2)}</span>
          <span className="opacity-70">mult:</span><span>{fmtNum(tp.sb_mult, 2)}</span>
        </div>
      </div>
      <div className="rounded-2xl bg-slate-50 p-3 shadow">
        <div className="font-medium">FTMO</div>
        <div className="mt-1 flex flex-wrap gap-3">
          <span className="opacity-70">lmax_dyn:</span><span>{fmtPct(tp.ftmo_lmax_dyn, 2)}</span>
          <span className="opacity-70">budget_day_left:</span><span>{fmtPct(tp.ftmo_budget_day_left, 1)}</span>
        </div>
      </div>
    </div>
  );
}
