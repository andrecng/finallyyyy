"use client";
import { useState } from "react";

type Mc = { pass_rate?: number; pass_rate_full?: number; dd_p50?: number; dd_p95?: number };

export default function McPanel({ mc }: { mc?: Mc }) {
  const [fullMode, setFullMode] = useState(false);
  const pr = fullMode ? mc?.pass_rate_full : mc?.pass_rate;

  return (
    <div className="p-4 rounded-2xl shadow bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Monte-Carlo</h3>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={fullMode} onChange={e => setFullMode(e.target.checked)} />
          Pass rate (Full)
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Pass rate{fullMode ? " (Full)" : ""}</div>
        <div>{pr != null ? `${(pr * 100).toFixed(1)}%` : "—"}</div>

        <div>DD p50</div>
        <div>{mc?.dd_p50 != null ? `${(mc.dd_p50 * 100).toFixed(2)}%` : "—"}</div>

        <div>DD p95</div>
        <div>{mc?.dd_p95 != null ? `${(mc.dd_p95 * 100).toFixed(2)}%` : "—"}</div>
      </div>
    </div>
  );
}
