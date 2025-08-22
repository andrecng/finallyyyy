"use client";
import React, { useRef } from "react";
import type { PresetV1 } from "@/engine/facade";

type Props = {
  preset: PresetV1;
  onRun: () => void;
  onReset: () => void;
  setPreset: (p: PresetV1) => void;
};

const STORAGE_KEY = "workspace:preset";

export default function ActionsBar({ preset, onRun, onReset, setPreset }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const saveLS = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(preset));
  const loadLS = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try { setPreset(JSON.parse(raw)); } catch {}
  };
  const exportFile = () => {
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "preset.json"; a.click();
    URL.revokeObjectURL(url);
  };
  const importFile = (f?: File | null) => {
    const file = f ?? fileRef.current?.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try { setPreset(JSON.parse(txt) as PresetV1); } catch {}
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={onRun} className="px-3 py-1 rounded border">▶ Run</button>
      <button onClick={onReset} className="px-3 py-1 rounded border">⟲ Reset</button>
      <span className="mx-1 opacity-50">|</span>
      <button onClick={saveLS} className="px-3 py-1 rounded border">💾 Save</button>
      <button onClick={loadLS} className="px-3 py-1 rounded border">📂 Load</button>
      <button onClick={exportFile} className="px-3 py-1 rounded border">⬇ Export</button>
      <label className="px-3 py-1 rounded border cursor-pointer">
        ⬆ Import
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => importFile(e.target.files?.[0])} />
      </label>
    </div>
  );
}
