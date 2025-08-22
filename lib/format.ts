// lib/format.ts
"use client";

function toNum(x: unknown): number | null {
  if (x == null) return null;
  if (typeof x === "number") return Number.isFinite(x) ? x : null;
  const n = parseFloat(String(x));
  return Number.isFinite(n) ? n : null;
}

export function pct(x: unknown, digits = 2) {
  const n = toNum(x);
  return n == null ? "—" : `${(n * 100).toFixed(digits)}%`;
}

export function fmt(x: unknown, digits = 4) {
  const n = toNum(x);
  return n == null ? "—" : n.toFixed(digits);
}

export function asInt01(x: unknown): 0 | 1 | null {
  if (x === 0 || x === 1) return x;
  if (x === true) return 1;
  if (x === false) return 0;
  const n = parseInt(String(x), 10);
  if (Number.isFinite(n)) return (n ? 1 : 0) as 0 | 1;
  return null;
}
