"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Preset,
  listPresets,
  getPreset,
  savePreset,
  deletePreset,
  getActivePresetName,
  setActivePresetName,
} from "@/lib/presets";

type Props = {
  // renvoie l'état courant des inputs (pour Save As)
  getFormSnapshot: () => any;
  // applique un preset aux inputs
  onApplyPreset: (data: any) => void;
  className?: string;
};

export default function PresetDropdown({ getFormSnapshot, onApplyPreset, className }: Props) {
  const [items, setItems] = useState<Preset[]>([]);
  const [value, setValue] = useState<string>("");

  // charge depuis localStorage
  const refresh = () => {
    const list = listPresets();
    setItems(list);
    setValue(getActivePresetName() || "");
  };

  useEffect(() => {
    refresh();
    // synchro inter-onglets
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ws.presets.v2" || e.key === "ws.activePreset.v2") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    }, []);

  const options = useMemo(() => [
    { label: "baseline (défaut)", value: "" },
    ...items.map(p => ({ label: p.name, value: p.name }))
  ], [items]);

  // sélection d'un preset → appliquer aux inputs
  const handleChange = (name: string) => {
    setValue(name);
    setActivePresetName(name);
    const p = name ? getPreset(name) : undefined;
    const data = p?.data ?? {}; // baseline = objet vide ⇒ tes valeurs par défaut s'appliquent
    onApplyPreset?.(data);
  };

  const handleSaveAs = () => {
    const suggested = value || "new-preset";
    const name = prompt("Nom du preset à enregistrer :", suggested);
    if (!name) return;
    const snap = getFormSnapshot?.() ?? {};
    savePreset(name, snap);
    refresh();
    alert(`Preset "${name}" sauvegardé !`);
  };

  const handleDelete = () => {
    if (!value) return alert("Sélectionne d'abord un preset à supprimer.");
    if (!confirm(`Supprimer définitivement le preset "${value}" ?`)) return;
    deletePreset(value);
    refresh();
  };

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <select
        className="h-9 rounded-md border bg-white px-2 text-sm"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.value || "__baseline"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleSaveAs}
        className="h-9 rounded-md border px-3 text-sm font-medium"
        title="Enregistrer l'état courant comme preset"
      >
        Save As
      </button>

      <button
        type="button"
        onClick={handleDelete}
        className="h-9 rounded-md border px-3 text-sm text-red-600"
        title="Supprimer le preset sélectionné"
      >
        Delete
      </button>
    </div>
  );
}
