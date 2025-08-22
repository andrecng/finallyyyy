"use client";
import { useEffect, useRef, useState } from "react";
import type { PresetV1 } from "@/engine/facade";
import {
  listPresets, savePreset, loadPreset, deletePreset, sanitizeName,
} from "@/lib/presetStorage";

const QUICK_SLOT_KEY = "workspace:preset"; // slot rapide en plus de la Library

function zeroPreset(from: PresetV1): PresetV1 {
  return {
    name: "zero",
    schema_version: from.schema_version,
    seed: 0,
    total_steps: 0,
    mu: 0,
    fees_per_trade: 0,
    modules: {}, // tous les modules OFF
  };
}

export default function ActionsBar({
  preset, onRun, onReset, setPreset, busy = false,
}: {
  preset: PresetV1;
  onRun: () => void;
  onReset: () => void;                // laissé pour compat (non utilisé ici)
  setPreset: (p: PresetV1) => void;
  busy?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string>("");

  // Preset Library (compact)
  const [items, setItems] = useState<{ name: string; savedAt: string }[]>([]);
  const [selected, setSelected] = useState<string>("");

  const note = (s: string) => { setMsg(s); setTimeout(() => setMsg(""), 1200); };
  const refreshLib = () => { setItems(listPresets()); };

  useEffect(() => { refreshLib(); }, []);

  // === Boutons principaux ===
  const onClickRun = () => { if (!busy) onRun(); };

  const onClickResetZero = () => {
    if (busy) return;
    setPreset(zeroPreset(preset));
    note("Preset mis à zéro");
  };

  // === Quick slot Save/Load ===
  const saveQuick = () => {
    try { localStorage.setItem(QUICK_SLOT_KEY, JSON.stringify(preset)); note("Saved"); }
    catch { note("Save error"); }
  };

  const loadQuick = () => {
    try {
      const raw = localStorage.getItem(QUICK_SLOT_KEY);
      if (!raw) return note("Empty");
      setPreset(JSON.parse(raw) as PresetV1);
      note("Loaded");
    } catch { note("Load error"); }
  };

  // === Import/Export fichier ===
  const exportFile = () => {
    try {
      const blob = new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${preset.name ?? "preset"}.json`; a.click();
      URL.revokeObjectURL(url);
      note("Exported");
    } catch { note("Export error"); }
  };

  const importFile = (f?: File | null) => {
    const file = f ?? fileRef.current?.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try {
        const p = JSON.parse(txt) as PresetV1;
        setPreset(p);
        note("Imported");
      } catch {
        note("Import error");
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  };

  // === Preset Library compacte ===
  const onSaveAs = () => {
    if (busy) return;
    const name = sanitizeName(prompt("Nom du preset :", preset.name || "preset") || "");
    try {
      savePreset(name, { ...preset, name });
      note(`Saved: ${name}`);
      refreshLib();
      setSelected(name);
    } catch { note("SaveAs error"); }
  };

  const onLoadSelected = () => {
    if (!selected) return;
    const p = loadPreset(selected);
    if (p) setPreset(p);
  };

  const onDeleteSelected = () => {
    if (!selected) return;
    if (!confirm(`Supprimer le preset "${selected}" ?`)) return;
    deletePreset(selected);
    refreshLib();
    setSelected("");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Run + Reset (zéro) */}
      <button
        onClick={onClickRun}
        disabled={busy}
        className={`px-3 py-1 rounded border ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        ▶ Run
      </button>
      <button
        onClick={onClickResetZero}
        disabled={busy}
        className={`px-3 py-1 rounded border ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
        title="Met le preset actuel entièrement à 0 (modules off)"
      >
        ⟲ Reset (0)
      </button>

      {/* Preset Library compacte (à côté de Run) */}
      <div className="flex items-center gap-1">
        <select
          className="rounded border px-2 py-1 text-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Presets enregistrés…</option>
          {items.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
        <button
          className="px-2 py-1 rounded border text-xs"
          onClick={onLoadSelected}
          disabled={!selected || busy}
          title="Charger le preset sélectionné"
        >
          Load
        </button>
        <button
          className="px-2 py-1 rounded border text-xs text-red-600"
          onClick={onDeleteSelected}
          disabled={!selected || busy}
          title="Supprimer le preset sélectionné"
        >
          Delete
        </button>
        <button
          className="px-2 py-1 rounded border text-xs"
          onClick={onSaveAs}
          disabled={busy}
          title="Sauvegarder le preset courant sous un nom"
        >
          Save As
        </button>
      </div>

      <span className="mx-1 opacity-50">|</span>

      {/* Quick slot + Import/Export */}
      <button onClick={saveQuick} disabled={busy} className="px-3 py-1 rounded border">💾 Save</button>
      <button onClick={loadQuick} disabled={busy} className="px-3 py-1 rounded border">📂 Load</button>
      <button onClick={exportFile} disabled={busy} className="px-3 py-1 rounded border">⬇ Export</button>
      <label className={`px-3 py-1 rounded border cursor-pointer ${busy ? "opacity-50 cursor-not-allowed" : ""}`}>
        ⬆ Import
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => !busy && importFile(e.target.files?.[0])}
        />
      </label>

      {msg && <span className="text-xs text-gray-500">{msg}</span>}
    </div>
  );
}
