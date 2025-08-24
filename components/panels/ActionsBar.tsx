"use client";
import { useEffect, useRef, useState } from "react";
import type { PresetV1 } from "@/engine/facade";
import {
  listPresets, savePreset, loadPreset, deletePreset, sanitizeName,
} from "@/lib/presetStorage";
import { Chip, ChipPct } from "@/components/StatusChips";

const QUICK_SLOT_KEY = "workspace:preset"; // slot rapide en plus de la Library

export default function ActionsBar({
  preset, onRun, onReset, setPreset, busy = false, results,
}: {
  preset: PresetV1;
  onRun: () => void;
  onReset: () => void;                // restaure le baseline (défini dans /workspace)
  setPreset: (p: PresetV1) => void;
  busy?: boolean;
  results?: any;
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
  const onClickResetBaseline = () => { if (!busy) { onReset(); note("Preset par défaut (baseline)"); } };

  // === Quick slot Save/Load (slot unique) ===
  const saveQuick = () => {
    try { localStorage.setItem(QUICK_SLOT_KEY, JSON.stringify(preset)); note("Saved (Quick)"); }
    catch { note("Save error"); }
  };

  const loadQuick = () => {
    try {
      const raw = localStorage.getItem(QUICK_SLOT_KEY);
      if (!raw) return note("Empty");
      setPreset(JSON.parse(raw) as PresetV1);
      note("Loaded (Quick)");
    } catch {
      note("Load error");
    }
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

  // === Preset Library compacte (sélecteur + Load/Delete + Save As) ===
  const onSaveAs = () => {
    if (busy) return;
    const name = sanitizeName(prompt("Nom du preset :", preset.name || "preset") || "");
    try {
      savePreset(name, { ...preset, name });
      note(`Saved (Library): ${name}`);
      refreshLib();
      setSelected(name);
    } catch { note("SaveAs error"); }
  };

  

  return (
    <div className="sticky top-2 z-10 bg-white/80 backdrop-blur rounded-xl border p-2 flex flex-wrap items-center gap-2">
      {/* Run + Reset (baseline) */}
      <button
        onClick={onClickRun}
        disabled={busy}
        className={`px-3 py-1 rounded border ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        ▶ Run
      </button>
      <button
        onClick={onClickResetBaseline}
        disabled={busy}
        className={`px-3 py-1 rounded border ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
        title="Rétablit le preset par défaut (baseline)"
      >
        ⟲ Reset
      </button>

                   {/* Preset Library compacte (sélecteur) */}
             <div className="flex items-center gap-1">
               <select
                 className="rounded border px-2 py-1 text-sm"
                 value={selected}
                 onChange={(e) => {
                   const name = e.target.value;
                   setSelected(name);
                   if (!name || busy) return;
                   const p = loadPreset(name);
                   if (p) {
                     setPreset(p);
                     note(`Loaded (Library): ${name}`);
                   }
                 }}
                 title="Choisir un preset enregistré (chargement automatique)"
               >
                 <option value="">Presets enregistrés…</option>
                 {items.map((m) => (
                   <option key={m.name} value={m.name}>{m.name}</option>
                 ))}
               </select>

               <button
                 className="px-2 py-1 rounded border text-xs text-red-600"
                 onClick={() => {
                   if (!selected || busy) return;
                   if (!confirm(`Supprimer le preset "${selected}" ?`)) return;
                   deletePreset(selected);
                   refreshLib();
                   setSelected("");
                   note("Deleted (Library)");
                 }}
                 disabled={!selected || busy}
                 title="Supprimer le preset sélectionné"
               >
                 Delete (Library)
               </button>

               <button
                 className="px-2 py-1 rounded border text-xs"
                 onClick={() => {
                   if (busy) return;
                   const name = sanitizeName(prompt("Nom du preset :", preset.name || "preset") || "");
                   try {
                     savePreset(name, { ...preset, name });
                     note(`Saved (Library): ${name}`);
                     refreshLib();
                     setSelected(name);
                   } catch {
                     note("SaveAs error");
                   }
                 }}
                 disabled={busy}
                 title="Sauvegarder le preset courant sous un nom"
               >
                 Save As
               </button>
             </div>

      <span className="mx-1 opacity-50">|</span>

      {/* Quick slot + Import/Export */}
      <button onClick={saveQuick} disabled={busy} className="px-3 py-1 rounded border">💾 Save (Quick)</button>
      <button onClick={loadQuick} disabled={busy} className="px-3 py-1 rounded border">📂 Load (Quick)</button>
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
      
      {/* Compteurs "santé FTMO" */}
      <div className="ml-auto flex items-center gap-2">
        <Chip label="Viol. daily" v={results?.diag?.violations_daily} />
        <Chip label="Viol. total" v={results?.diag?.violations_total} />
        <ChipPct label="DD daily" val={results?.kpis?.max_dd_daily} limit={0.05} />
        <ChipPct label="DD total" val={results?.kpis?.max_dd_total} limit={0.10} />
        <Chip label="Freeze hits" v={results?.diag?.cppi_freeze_events} />
        <Chip label="Kelly hits" v={results?.diag?.kelly_cap_hits} />
      </div>
    </div>
  );
}
