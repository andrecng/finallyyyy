"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

type Props = {
  data: { day: number; eq: number }[];
  title?: string;
};

export default function EquityChart({ data, title = "Équity (normalisée)" }: Props) {
  if (!data || data.length < 2) {
    return <div className="text-muted">Aucune donnée</div>;
  }
  return (
    <div className="rounded-2xl border border-base p-3 bg-card">
      <div className="text-sm text-muted mb-2">{title}</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="day" tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis
              tick={{ fill: "currentColor", fontSize: 12 }}
              domain={["auto", "auto"]}
              tickFormatter={(v) => v.toFixed(2)}
            />
            <Tooltip
              contentStyle={{ background: "#111115", border: "1px solid #2a2a31", borderRadius: 12 }}
              labelStyle={{ color: "#a3a3ad" }}
              formatter={(v: number) => [v.toFixed(4), "eq"]}
              labelFormatter={(l: number) => `Jour ${l}`}
            />
            <ReferenceLine y={1} stroke="#8884d8" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="eq" stroke="#ffffff" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
