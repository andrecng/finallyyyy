"use client";
import React from "react";

type Props = {
  value: number;
  onCommit: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;        // défaut: 0.001
  decimals?: number;    // pour arrondir à la fin (optionnel)
  placeholder?: string;
  className?: string;
};

function clamp(v: number, lo?: number, hi?: number) {
  if (typeof lo === "number") v = Math.max(lo, v);
  if (typeof hi === "number") v = Math.min(hi, v);
  return v;
}
function roundTo(v: number, d?: number) {
  if (!d && d !== 0) return v;
  const k = Math.pow(10, d);
  return Math.round(v * k) / k;
}
function parseLoose(s: string): number | null {
  const t = s.replace(/\s+/g, "").replace(",", "."); // 1,23 -> 1.23
  if (t === "" || t === "-" || t === "." || t === "-.") return null;
  const x = Number(t);
  return Number.isFinite(x) ? x : null;
}

export default function NumberField({
  value, onCommit, min, max, step = 0.001, decimals, placeholder, className
}: Props) {
  const [text, setText] = React.useState<string>(String(value));
  const [dirty, setDirty] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Si la value externe change et qu'on n'édite pas, resync l'affichage
  React.useEffect(() => {
    if (!dirty) setText(String(value));
  }, [value, dirty]);

  const commit = React.useCallback(() => {
    const parsed = parseLoose(text);
    const v = parsed == null ? value : clamp(roundTo(parsed, decimals), min, max);
    onCommit(v);
    setDirty(false);
    setText(String(v));
  }, [text, value, min, max, decimals, onCommit]);

  const revert = () => { setDirty(false); setText(String(value)); };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        const nxt = e.target.value;
        // autoriser chiffres, . , - (et espaces)
        if (/^[0-9.,\-\s]*$/.test(nxt)) {
          setText(nxt);
          setDirty(true);
        }
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") { commit(); }
        else if (e.key === "Escape") { e.preventDefault(); revert(); }
        else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const base = parseLoose(text) ?? value;
          const dir = e.key === "ArrowUp" ? 1 : -1;
          const inc = (e.metaKey || e.ctrlKey) ? step * 10 : step;
          const v = clamp(roundTo(base + dir * inc, decimals), min, max);
          setText(String(v));
          setDirty(true);
        }
      }}
      onWheel={(e) => { e.currentTarget.blur(); e.preventDefault(); }}
      className={className ?? "rounded-xl border px-3 py-2"}
    />
  );
}
