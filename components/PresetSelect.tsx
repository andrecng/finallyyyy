"use client";
import { useEffect, useMemo, useState } from "react";
import { listManualPresets, loadPreset, normalizePreset, validatePreset, type Preset } from "@/lib/presets";

type Props = {
  currentPreset?: string;
  onPresetChange: (preset: any) => void; // applique au workspace
  className?: string;
};

export default function PresetSelect({ currentPreset, onPresetChange, className }: Props) {
  const [options, setOptions] = useState<{ label: string; value: string; source: string }[]>([]);
  const value = currentPreset ?? "";

  const reload = () => {
    const arr = listManualPresets(); // UNIQUEMENT presets manuels
    setOptions(arr.map((p) => ({ 
      label: `${p.name}${p.meta?.source === 'default' ? ' (défaut)' : ''}`, 
      value: p.name,
      source: p.meta?.source ?? 'manual'
    })));
  };

  useEffect(() => {
    reload();
  }, []);

  const onChange = (name: string) => {
    const raw = loadPreset(name);
    if (!raw) return;
    
    const p = normalizePreset(raw.payload);
    const errs = validatePreset(p);
    if (errs.length) {
      alert("Preset invalide:\n" + errs.join("\n"));
      return;
    }
    
    onPresetChange(p);
  };

  const placeholder = useMemo(() => (value ? undefined : "Sélectionner un preset"), [value]);

  return (
    <div className={`preset-select ${className ?? ""}`}>
      <select
        className="px-3 py-2 rounded-2xl border text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {!value && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} className={o.source === 'default' ? 'font-semibold' : ''}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
