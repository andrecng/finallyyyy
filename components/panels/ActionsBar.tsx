"use client";
import { useRef, useState } from "react";
import type { PresetV1 } from "@/engine/facade";

const STORAGE_KEY = "workspace:preset"; // slot rapide (en plus de la Library)

export default function ActionsBar({
  preset, onRun, onReset, setPreset, busy = false,
}: {
  preset: PresetV1;
  onRun: () => void;
  onReset: () => void;
  setPreset: (p: PresetV1) => void;
  busy?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string>("");

  const note = (s: string) => { setMsg(s); setTimeout(() => setMsg(""), 1200); };

  const saveLS = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preset)); note("Saved"); }
    catch { note("Save error"); }
  };

  const loadLS = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return note("Empty");
      setPreset(JSON.parse(raw) as PresetV1);
      note("Loaded");
    } catch {
      note("Load error");
    }
  };

  const exportFile = () => {
    try {
      const blob = new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${preset.name ?? "preset"}.json`; a.click();
      URL.revokeObjectURL(url);
      note("Exported");
    } catch {
      note("Export error");
    }
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={onRun} disabled={busy} className={`px-3 py-1 rounded border ${busy ? "opacity-50 cursor-not-allowed" : ""}`}>▶ Run</button>
      <button onClick={onReset} disabled={busy} className={`px-3 py-1 rounded border ${busy ? "opacity-50 cursor-not-allowed" : ""}`}>⟲ Reset</button>
      <span className="mx-1 opacity-50">|</span>
      <button onClick={saveLS} disabled={busy} className="px-3 py-1 rounded border">💾 Save</button>
      <button onClick={loadLS} disabled={busy} className="px-3 py-1 rounded border">📂 Load</button>
      <button onClick={exportFile} disabled={busy} className="px-3 py-1 rounded border">⬇ Export</button>
      <label className={`px-3 py-1 rounded border cursor-pointer ${busy ? "opacity-50 cursor-not-allowed" : ""}`}>
        ⬆ Import
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => !busy && importFile(e.target.files?.[0])} />
      </label>
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
    </div>
  );
}
