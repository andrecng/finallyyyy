// lib/format.ts
"use client";

export function pct(x: number | null | undefined, digits = 2) {
  if (x == null || !Number.isFinite(x)) return "—";
  return `${(x * 100).toFixed(digits)}%`;
}

export function fmt(x: number | null | undefined, digits = 4) {
  if (x == null || !Number.isFinite(x)) return "—";
  return x.toFixed(digits);
}
