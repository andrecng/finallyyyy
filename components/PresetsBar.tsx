"use client";
import React, { useEffect, useMemo, useState } from "react";

type PresetPayload = {
  name: string;
  params: Record<string, any>;
  toggles: Record<string, boolean>;
  createdAt: string;
};

const STORAGE_KEY = "mm_engine_presets_v1";

function readAll(): PresetPayload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function writeAll(list: PresetPayload[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function PresetsBar({
  params,
  toggles,
  onLoadPreset,
  defaultName = "Baseline_2025-08-21",
}: {
  params: Record<string, any>;
  toggles: Record<string, boolean>;
  onLoadPreset: (p: { params: any; toggles: any }) => void;
  defaultName?: string;
}) {
  const [presets, setPresets] = useState<PresetPayload[]>([]);
  const [current, setCurrent] = useState<string>("");

  useEffect(() => {
    const list = readAll();
    setPresets(list);
    // Auto-load baseline si existe, sinon créer
    const hit = list.find(p => p.name === defaultName);
    if (hit) {
      setCurrent(hit.name);
      onLoadPreset({ params: hit.params, toggles: hit.toggles });
    } else {
      const baseline: PresetPayload = {
        name: defaultName,
        params,
        toggles,
        createdAt: new Date().toISOString(),
      };
      const next = [...list, baseline];
      setPresets(next);
      writeAll(next);
      setCurrent(defaultName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const names = useMemo(() => presets.map(p => p.name), [presets]);

  function savePreset(name?: string) {
    const nm = name?.trim() || prompt("Nom du preset :", current || "Preset");
    if (!nm) return;
    const list = readAll();
    const idx = list.findIndex(p => p.name === nm);
    const payload: PresetPayload = {
      name: nm,
      params,
      toggles,
      createdAt: new Date().toISOString(),
    };
    if (idx >= 0) list[idx] = payload; else list.push(payload);
    writeAll(list);
    setPresets(list);
    setCurrent(nm);
  }
  function loadPreset(nm: string) {
    const list = readAll();
    const hit = list.find(p => p.name === nm);
    if (!hit) return;
    setCurrent(nm);
    onLoadPreset({ params: hit.params, toggles: hit.toggles });
  }
  function deletePreset(nm: string) {
    const list = readAll().filter(p => p.name !== nm);
    writeAll(list);
    setPresets(list);
    if (current === nm) setCurrent("");
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-3 shadow">
      <span className="text-sm font-medium">Presets</span>
      <select
        className="rounded-xl border px-3 py-2 text-sm"
        value={current}
        onChange={(e) => loadPreset(e.target.value)}
      >
        <option value="" disabled>Choisir…</option>
        {names.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <button
        className="rounded-2xl bg-black px-4 py-2 text-white text-sm"
        onClick={() => savePreset()}
      >
        Save
      </button>
      <button
        className="rounded-2xl border px-4 py-2 text-sm"
        onClick={() => {
          const nm = prompt("Nom du nouveau preset :", "Preset");
          if (nm) savePreset(nm);
        }}
      >
        Save as…
      </button>
      <button
        className="rounded-2xl border px-4 py-2 text-sm"
        onClick={() => {
          if (!current) return;
          if (confirm(`Supprimer le preset "${current}" ?`)) deletePreset(current);
        }}
      >
        Delete
      </button>
    </div>
  );
}
