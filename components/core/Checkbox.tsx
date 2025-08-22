"use client";
import React from "react";
type Props = { checked: boolean; onChange: (v: boolean) => void; label?: string };
export default function Checkbox({ checked, onChange, label }: Props) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label && <span>{label}</span>}
    </label>
  );
}
