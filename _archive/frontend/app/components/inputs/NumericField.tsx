"use client";
import React, { useEffect, useRef, useState } from "react";

function toNumLoose(s: string): number | null {
  const t = s.replace("%", "").replace(",", ".").trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function NumericField({
  value,
  onCommit,
  className = "w-36",
  allowNegative = true,
  step,
  placeholder,
}: {
  value: number | null | undefined;                   // peut être null → affiche vide
  onCommit: (v: number | null) => void;               // null = vide
  className?: string;
  allowNegative?: boolean;
  step?: number;
  placeholder?: string;
}) {
  const [s, setS] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const last = useRef(value);

  useEffect(() => {
    if (!editing && value !== last.current) {
      last.current = value;
      setS(value == null ? "" : String(value));
    }
  }, [value, editing]);

  function commit() {
    const n = toNumLoose(s);
    if (n == null) { onCommit(null); setEditing(false); return; }
    if (!allowNegative && n < 0) { onCommit(0); setS("0"); setEditing(false); return; }
    onCommit(n); setEditing(false);
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      className={`border rounded px-2 py-1 ${className}`}
      value={s}
      placeholder={placeholder}
      onChange={(e) => { setEditing(true); setS(e.target.value); }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); }
        if (e.key === "Escape") { setS(value == null ? "" : String(value)); (e.target as HTMLInputElement).blur(); }
        if (e.key === "ArrowUp" && step) { setS(String((toNumLoose(s) ?? 0) + step)); }
        if (e.key === "ArrowDown" && step) { setS(String((toNumLoose(s) ?? 0) - step)); }
      }}
    />
  );
}
