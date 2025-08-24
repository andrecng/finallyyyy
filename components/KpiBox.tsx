"use client";

import React from "react";

interface KpiBoxProps {
  label: string;
  value?: number;
  fmt?: "pct" | "num";
}

export default function KpiBox({ label, value, fmt }: KpiBoxProps) {
  const show = (v?: number) =>
    v == null || Number.isNaN(v) ? "—" : fmt === "pct" ? `${(v * 100).toFixed(2)}%` : String(v);
  
  return (
    <div className="rounded-lg border px-3 py-2 text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="font-medium">{show(value)}</div>
    </div>
  );
}
