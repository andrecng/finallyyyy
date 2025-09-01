"use client";
import React, { useEffect, useRef, useState } from "react";

function toNumLoose(s: string): number | null {
  const t = s.replace("%", "").replace(",", ".").trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function InputPercent({
  value,            // décimal ex 0.10
  onCommit,         // renvoie décimal (ou null si vide)
  className = "w-36",
  decimals = 2,
}: {
  value: number | null | undefined;
  onCommit: (dec: number | null) => void;
  className?: string;
  decimals?: number;
}) {
  const [s, setS] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const last = useRef(value);

  useEffect(() => {
    if (!editing && value !== last.current) {
      last.current = value;
      setS(value == null ? "" : (value * 100).toFixed(decimals));
    }
  }, [value, editing, decimals]);

  function commit() {
    const n = toNumLoose(s); // n en pourcentage (ex: 10)
    if (n == null) { onCommit(null); setEditing(false); return; }
    onCommit(n / 100);
    setEditing(false);
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        inputMode="decimal"
        className="border rounded px-2 py-1 w-full pr-7"
        value={s}
        onChange={(e) => { setEditing(true); setS(e.target.value); }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setS(value == null ? "" : (value * 100).toFixed(decimals));
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
    </div>
  );
}
