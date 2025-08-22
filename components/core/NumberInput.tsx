"use client";
import React from "react";
type Props = {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
};
export default function NumberInput({ value, onChange, step = 0.01, min, max, placeholder }: Props) {
  return (
    <input
      type="number"
      className="w-full rounded border px-2 py-1 text-sm"
      value={Number.isFinite(value) ? value : 0}
      step={step}
      min={min as number | undefined}
      max={max as number | undefined}
      placeholder={placeholder}
      onChange={(e) => {
        const n = parseFloat(e.target.value);
        if (!Number.isNaN(n)) onChange(n);
      }}
    />
  );
}
