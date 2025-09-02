"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import EquityChart from "@/components/charts/EquityChart";

type UIForm = {
  use_session_gate?: boolean;
  use_nested_cppi?: boolean;
  news_pre_blackout_min?: string; // string pour saisie libre
  news_post_blackout_min?: string; // string pour saisie libre
  sess_windows?: string[]; // CSV -> array
};

type SimOut = any;

const DEFAULTS: UIForm = {
  use_session_gate: undefined,
  use_nested_cppi: undefined,
  news_pre_blackout_min: "",
  news_post_blackout_min: "",
  sess_windows: [],
};

function parseNum(raw?: string): number | undefined {
  if (raw == null) return undefined;
  const s = raw.replace(",", ".").trim();
  if (s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

// Rend le résultat uniforme pour l'UI (équity + kpis + diag)
function normalizeResult(r: any) {
  // equity: accepte plusieurs formes (series.equity | equity | out.equity | series[])
  const equity =
    r?.series?.equity ??
    r?.equity ??
    r?.out?.equity ??
    (Array.isArray(r?.series) ? r.series : []);
  // kpis: tolère variations
  const kpis = r?.kpis ?? r?.KPIs ?? r?.metrics ?? r?.summary?.kpis ?? {};
  // diagnostics/diag: garde les deux alias pour compat
  const diagnostics = r?.diagnostics ?? r?.diag ?? {};
  return {
    ...r,
    series: { ...(r.series ?? {}), equity: Array.isArray(equity) ? [...equity] : [] },
    kpis,
    diagnostics,
    diag: diagnostics, // alias pour UI existante
  };
}

export default function Page() {
  // --- Form
  const [form, setForm] = useState<UIForm>(DEFAULTS);

  // --- Simu
  const [out, setOut] = useState<SimOut | null>(null);
  const [err, setErr] = useState<string>("");

  const sessWindowsText = useMemo(
    () => (form.sess_windows ?? []).join(", "),
    [form.sess_windows]
  );

  const setSessWindowsFromText = (val: string) => {
    const arr = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((f) => ({ ...f, sess_windows: arr }));
  };

  const run = async () => {
    setErr("");
    setOut(null);
    try {
      // construit le payload — laisse undefined si effacé
      const payload: any = {
        use_session_gate: form.use_session_gate,
        use_nested_cppi: form.use_nested_cppi,
        news_pre_blackout_min: parseNum(form.news_pre_blackout_min),
        news_post_blackout_min: parseNum(form.news_post_blackout_min),
        sess_windows: form.sess_windows ?? [],
      };

      console.log("▶️ /api/simulate payload:", payload);

      const r = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`HTTP ${r.status} ${r.statusText} → ${txt}`);
      }

      const raw = await r.json();
      const normalized = normalizeResult(raw);
      setOut(normalized);
      console.log(
        "🔁 out updated:",
        normalized?.series?.equity?.length,
        "points"
      );
    } catch (e: any) {
      setErr("Simulation failed: " + (e?.message || e));
    }
  };



  // --- UI
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Simulation</h1>
      </header>

      {/* Form */}
      <section className="rounded border p-4 space-y-4">
        <h2 className="text-sm font-semibold">Paramètres</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Session Gate */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Session Gate
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!form.use_session_gate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, use_session_gate: e.target.checked }))
                }
              />
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, use_session_gate: undefined }))
                }
                className="text-xs text-gray-500 hover:underline"
                title="Effacer (undefined)"
              >
                Effacer
              </button>
            </div>
          </div>

          {/* Nested CPPI */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Nested CPPI
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!form.use_nested_cppi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, use_nested_cppi: e.target.checked }))
                }
              />
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, use_nested_cppi: undefined }))
                }
                className="text-xs text-gray-500 hover:underline"
                title="Effacer (undefined)"
              >
                Effacer
              </button>
            </div>
          </div>

          {/* news_pre_blackout_min */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              news_pre_blackout_min
            </label>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              type="text"
              inputMode="decimal"
              placeholder="ex: 0, 15, 30…"
              value={form.news_pre_blackout_min ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, news_pre_blackout_min: e.target.value }))
              }
            />
          </div>

          {/* news_post_blackout_min */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              news_post_blackout_min
            </label>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              type="text"
              inputMode="decimal"
              placeholder="ex: 0, 15, 30…"
              value={form.news_post_blackout_min ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  news_post_blackout_min: e.target.value,
                }))
              }
            />
          </div>

          {/* sess_windows */}
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-600">
              sess_windows (CSV)
            </label>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              type="text"
              value={sessWindowsText}
              onChange={(e) => setSessWindowsFromText(e.target.value)}
              placeholder="09:00-11:30, 13:30-17:00"
            />
            <p className="mt-1 text-xs text-gray-500">
              Vide = pas de contrainte.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={run}
            className="rounded bg-black px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            Run
          </button>
        </div>

        {err && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {err}
          </div>
        )}
      </section>

      {/* Résultats */}
      {out && (
        <section className="rounded border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Résultats</h2>
            <div className="text-xs text-gray-500">
              {out?.series?.equity?.length ?? 0} points
            </div>
          </div>

          <div className="mt-3 h-[280px]">
            <EquityChart
              series={out?.series?.equity ?? out?.equity ?? []}
              key={out?.series?.equity?.length ?? 0}
            />
          </div>

          {/* KPIs simples */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {Object.entries(out?.kpis ?? {}).map(([k, v]) => (
              <div
                key={k}
                className="rounded border p-2 flex flex-col gap-0.5 bg-white"
              >
                <div className="text-gray-500">{k}</div>
                <div className="font-medium break-all">
                  {typeof v === "number" ? v.toString() : JSON.stringify(v)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
