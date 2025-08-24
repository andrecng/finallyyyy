"use client";

import React, { useState } from "react";
import { addPreset, suggestPresetName } from "@/app/lib/presets";

type Props = {
  disabled?: boolean;
  getPreset: () => { name?: string; payload: Record<string, any>; meta?: Record<string, any> } | null;
};

export default function PresetSaver({ disabled, getPreset }: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  function saveToLibrary() {
    setMsg(null);
    const p = getPreset();
    if (!p) return;
    const autoName = suggestPresetName({
      score: p.meta?.score as number | undefined,
      pass_rate_full: p.meta?.mc?.pass_rate_full as number | undefined,
      payload: p.payload,
    });
    const saved = addPreset({
      name: p.name || autoName,
      payload: p.payload,
      meta: {
        source: "auto",                     // <<< TAG SOURCE
        score: p.meta?.score,
        kpis: p.meta?.kpis,
        mc: p.meta?.mc,
        constraints: p.meta?.constraints,
        n: p.meta?.n,
        score_breakdown: p.meta?.score_breakdown,
        grid: p.meta?.grid,
      },
    });
    setMsg(`Enregistré: ${saved.name}`);
  }

  function downloadJson() {
    setMsg(null);
    const p = getPreset();
    if (!p) return;
    const name = p.name || suggestPresetName({
      score: p.meta?.score as number | undefined,
      pass_rate_full: p.meta?.mc?.pass_rate_full as number | undefined,
      payload: p.payload,
    });
    const blob = new Blob([JSON.stringify({ name, ...p }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `${name}.preset.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    setMsg(`Téléchargé: ${name}.preset.json`);
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm space-y-3">
      <div className="font-medium">Sauvegarder le meilleur preset</div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          disabled={!!disabled}
          onClick={saveToLibrary}
          className="px-3 py-1.5 rounded-2xl border shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Enregistrer dans la bibliothèque
        </button>
        <a href="/presets" className="text-sm underline">Voir la bibliothèque</a>
        <button
          disabled={!!disabled}
          onClick={downloadJson}
          className="px-3 py-1.5 rounded-2xl border shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Télécharger le JSON
        </button>
      </div>
      {msg && <div className="text-xs text-green-700">{msg}</div>}
      <p className="text-xs text-gray-500">Le nom est suggéré automatiquement (score, pass_rate_full, paramètres clés).</p>
    </div>
  );
}
