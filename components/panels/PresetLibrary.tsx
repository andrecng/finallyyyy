"use client";
import { useEffect, useState } from "react";
import type { PresetV1 } from "@/engine/facade";
import {
  listPresets, savePreset, loadPreset, deletePreset, sanitizeName, type PresetMeta
} from "@/lib/presetStorage";

export default function PresetLibrary({
  current, setPreset,
}: { current: PresetV1; setPreset: (p: PresetV1) => void }) {
  const [items, setItems] = useState<PresetMeta[]>([]);
  const [name, setName] = useState<string>(sanitizeName(current?.name || "preset"));
  const [msg, setMsg] = useState<string>("");

  const refresh = () => setItems(listPresets());

  useEffect(() => { refresh(); }, []);
  useEffect(() => { setName(sanitizeName(current?.name || name || "preset")); }, [current?.name]);

  function onSaveAs() {
    try {
      const meta = savePreset(name, { ...current, name });
      setMsg(`Saved: ${meta.name}`);
      refresh();
      setTimeout(() => setMsg(""), 1200);
    } catch (e) {
      console.error(e);
      setMsg("Erreur de sauvegarde");
    }
  }

  function onLoad(n: string) {
    const p = loadPreset(n);
    if (p) setPreset(p);
  }

  function onDelete(n: string) {
    deletePreset(n);
    refresh();
  }

  function onExport(n: string) {
    const p = loadPreset(n);
    if (!p) return;
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${n}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Preset Library</div>
        <button onClick={refresh} className="text-xs px-2 py-1 rounded border">↻ Refresh</button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          className="rounded border px-2 py-1 text-sm"
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="preset-name"
        />
        <button onClick={onSaveAs} className="px-3 py-1 rounded border">💾 Save As</button>
        {msg && <span className="text-xs text-gray-500">{msg}</span>}
      </div>

      <div className="overflow-auto">
        {items.length === 0 ? (
          <div className="text-xs text-gray-500">Aucun preset sauvegardé.</div>
        ) : (
          <table className="w-full text-xs border">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 border">Name</th>
                <th className="text-left p-2 border">Saved at</th>
                <th className="text-left p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.name}>
                  <td className="p-2 border font-medium">{m.name}</td>
                  <td className="p-2 border">{new Date(m.savedAt).toLocaleString()}</td>
                  <td className="p-2 border">
                    <div className="flex flex-wrap gap-2">
                      <button className="px-2 py-0.5 rounded border" onClick={() => onLoad(m.name)}>Load</button>
                      <button className="px-2 py-0.5 rounded border" onClick={() => onExport(m.name)}>Export</button>
                      <button className="px-2 py-0.5 rounded border text-red-600" onClick={() => onDelete(m.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
