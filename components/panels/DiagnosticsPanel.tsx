"use client";
import { fmt, pct, toNum } from "@/lib/format";

function Badge({ ok, label }: { ok: boolean | null; label: string }) {
  if (ok == null) return null;
  return ok ? (
    <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">{label}: OK</span>
  ) : (
    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs">{label}: ALERT</span>
  );
}

export default function DiagnosticsPanel({ out }: { out: any }) {
  const d = out?.diag ?? {};
  const hasAny =
    d.cppi_freeze_events != null || d.kelly_cap_hits != null ||
    (Array.isArray(d.softbarrier_level_hits) && d.softbarrier_level_hits.length > 0) ||
    d.vt_realized_vol != null || d.ftmo_gate_events != null ||
    d.no_upsize_after_loss != null || d.risk_final_is_min != null;

  if (!hasAny) return null;

  return (
    <div className="rounded border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Diagnostics modules</div>
        <div className="flex items-center gap-2">
          <Badge ok={d?.no_upsize_after_loss ?? null} label="No upsize after loss" />
          <Badge ok={d?.risk_final_is_min ?? null} label="Risk=min(modules)" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {toNum(d.vt_realized_vol) != null && (
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">VT vol réalisée</div>
            <div className="font-medium">{pct(d.vt_realized_vol)}</div>
          </div>
        )}
        {toNum(d.vt_target_vol_echo) != null && (
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">VT cible (echo)</div>
            <div className="font-medium">{pct(d.vt_target_vol_echo)}</div>
          </div>
        )}
        {toNum(d.cppi_freeze_events) != null && (
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">CPPIFreeze events</div>
            <div className="font-medium">{fmt(d.cppi_freeze_events, 0)}</div>
          </div>
        )}
        {toNum(d.time_frozen_steps) != null && (
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">Temps gelé (steps)</div>
            <div className="font-medium">{fmt(d.time_frozen_steps, 0)}</div>
          </div>
        )}
        {toNum(d.kelly_cap_hits) != null && (
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">Kelly cap hits</div>
            <div className="font-medium">{fmt(d.kelly_cap_hits, 0)}</div>
          </div>
        )}
        {Array.isArray(d.softbarrier_level_hits) && (
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">SoftBarrier hits</div>
            <div className="font-medium">{d.softbarrier_level_hits.join(" · ")}</div>
          </div>
        )}
        {toNum(d.ftmo_gate_events) != null && (
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">FTMO gate events</div>
            <div className="font-medium">{fmt(d.ftmo_gate_events, 0)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
