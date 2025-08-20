"use client";
import React from "react";

type KpiProps = {
  label: string;       // ex: "CAGR"
  value: string;       // ex: "12.4%"
  subtitle?: string;   // ex: "Taux de croissance annualisé"
};
export default function Kpi({ label, value, subtitle }: KpiProps) {
  return (
    <div className="rounded-2xl border border-base p-4 bg-card">
      <div className="text-sm text-muted">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {subtitle && <div className="text-xs text-muted mt-1">{subtitle}</div>}
    </div>
  );
}
