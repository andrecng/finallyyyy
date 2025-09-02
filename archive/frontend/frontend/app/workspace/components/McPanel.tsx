"use client";

type McData = { pass_rate?: number; pass_rate_full?: number; dd_p50?: number; dd_p95?: number };

interface McPanelProps {
  n: number;
  status: "ready" | "running" | "error";
  data: McData | null;
  passRateFull: boolean;
  onToggleFull: (v: boolean) => void;
  onNChange: (n: number) => void;
  onRun: () => void;
  autoMC: boolean;
  onToggleAutoMC: (v: boolean) => void;
}

export default function McPanel(props: McPanelProps) {
  const { n, status, data, passRateFull, onToggleFull, onNChange, onRun, autoMC, onToggleAutoMC } = props;
  const pr = passRateFull ? data?.pass_rate_full : data?.pass_rate;

  return (
    <div className="p-4 rounded-2xl shadow bg-white space-y-3">
      <h3 className="font-semibold">Monte-Carlo</h3>
      
      <div className="flex items-center gap-3">
        <label className="text-sm">Iterations</label>
        <input
          type="number"
          min={10}
          step={10}
          className="input"
          value={Number.isFinite(n) ? n : 0}
          onChange={(e) => onNChange(Math.max(1, Number(e.currentTarget.value) || 0))}
        />
        <button disabled={status === "running"} className="btn" onClick={onRun}>
          {status === "running" ? "Monte-Carlo…" : `Lancer ${n} runs`}
        </button>

        <label className="ml-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={passRateFull} onChange={(e) => onToggleFull(e.target.checked)} />
          Pass rate (Full)
        </label>

        <label className="ml-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoMC}
            onChange={(e) => onToggleAutoMC(e.target.checked)}
          />
          Auto-run Monte-Carlo
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>Pass rate: {pr != null ? `${(pr * 100).toFixed(1)}%` : "—"}</div>
        <div>DD p50: {data?.dd_p50 != null ? `${(data.dd_p50 * 100).toFixed(2)}%` : "—"}</div>
        <div>DD p95: {data?.dd_p95 != null ? `${(data.dd_p95 * 100).toFixed(2)}%` : "—"}</div>
      </div>

      {!data && (
        <div className="text-sm text-neutral-500">
          {autoMC ? "Simulation Monte Carlo automatique activée" : "Cliquez sur 'Lancer " + n + " runs' pour démarrer..."}
        </div>
      )}
    </div>
  );
}
