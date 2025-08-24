"use client";

import React, { useEffect, useState } from "react";
import { Preset, loadAutoPresets } from "@/app/lib/presets";
import { setWorkspacePayload } from "@/app/lib/workspacePayload";

export default function AutoPresetSelect({
  onApply,
}: {
  onApply?: (preset: Preset) => void; // callback optionnel (maj nom preset courant, etc.)
}) {
  const [items, setItems] = useState<Preset[]>([]);
  const [sel, setSel] = useState<string>("");

  useEffect(() => {
    setItems(loadAutoPresets());
  }, []);

  function apply(id: string) {
    setSel(id);
    const p = items.find(x => x.id === id);
    if (!p) return;
    setWorkspacePayload(p.payload);
    onApply?.(p);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-600">Auto‑Search</label>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={sel}
        onChange={(e) => apply(e.target.value)}
      >
        <option value="">{`Presets (Auto‑Search)…`}</option>
        {items.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
