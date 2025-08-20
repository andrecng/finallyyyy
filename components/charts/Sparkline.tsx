"use client";
import React from "react";

type Props = {
  data: number[];    // série normalisée (ex: equityPct)
  height?: number;
};

export default function Sparkline({ data, height = 120 }: Props) {
  if (!data || data.length < 2) return <div className="text-muted">Aucune donnée</div>;
  const w = 600; // largeur fixe pour commencer (simple)
  const h = height;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = Math.max(1e-9, max - min);

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 2) + 1;
    const y = h - ((v - min) / span) * (h - 2) - 1;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="rounded-xl border border-base bg-card">
      <polyline fill="none" stroke="white" strokeWidth="2" points={points} />
    </svg>
  );
}
