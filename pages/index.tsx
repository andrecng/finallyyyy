import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import InlineAlert from "../components/InlineAlert";
const RiskChart = dynamic(() => import("../components/RiskChart"), { 
  ssr: false,
  loading: () => <div>Chargement...</div>
});
import type { RiskChartHandle } from "../components/RiskChart";

type SimInput = {
  initial_equity: number;
  returns: number[];
  steps_per_day?: number;
  params?: Record<string, any>;
};
type SimOutput = {
  kpis: {
    steps: number;
    initial_equity: number;
    final_equity: number;
    max_dd_pct: number;
    max_daily_dd_pct?: number;
    success_flags?: Record<string, boolean>;
  };
  series: { equity: number[]; exposure: number[] };
  logs: any[];
  modules: string[];
};

const demoInput: SimInput = {
  initial_equity: 100000,
  returns: Array(200).fill(0).map(() => (Math.random() - 0.5) * 0.01),
  steps_per_day: 20,
  params: {
    cppi: { alpha: 0.2, m: 3.0, freeze_cushion_pct: 0.05 },
    amplifier: { gain: 1.0, cap: 1.5 },
    kelly: { enabled: false },
    gates: { news_enabled: true, news_blocked_steps: [], fee_bps_per_step: 0 }
  },
};

function toTVSeries(arr: number[]) { return arr.map((v, i) => ({ time: i, value: v })); }

// === Helpers série → index virtuel ===
function toIndexSeries(arr: number[]) {
  // time = index numérique pour l'ordre ascendant, mais on formate en t{index}
  return arr.map((v, i) => ({ time: i, value: v }));
}
function downloadJSON(obj: any, filename = "simulation_out.json") {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function validateInput(raw: string): { ok: true; data: SimInput } | { ok: false; error: string } {
  try {
    const data = JSON.parse(raw);
    if (typeof data.initial_equity !== "number" || !Array.isArray(data.returns)) {
      return { ok: false, error: "Champs requis manquants ou invalides: initial_equity (number), returns (array)" };
    }
    if (data.returns.some((x: any) => typeof x !== "number" || !isFinite(x))) {
      return { ok: false, error: "Le tableau returns doit contenir uniquement des nombres finis." };
    }
    if (data.steps_per_day !== undefined && (!Number.isFinite(data.steps_per_day) || data.steps_per_day <= 0)) {
      return { ok: false, error: "steps_per_day doit être un nombre > 0." };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: "JSON invalide: " + (e?.message ?? "Parse error") };
  }
}

export default function Home() {
  const [jsonIn, setJsonIn] = useState<string>(JSON.stringify(demoInput, null, 2));
  const [out, setOut] = useState<SimOutput | { error: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  
  // Refs pour les composants de graphiques
  const equityChartRef = useRef<RiskChartHandle | null>(null);
  const exposureChartRef = useRef<RiskChartHandle | null>(null);

  // Mémoriser l'état d'affichage des graphes
  useEffect(() => {
    const v = localStorage.getItem("showCharts");
    if (v === "1") setShowCharts(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("showCharts", showCharts ? "1" : "0");
  }, [showCharts]);

  const run = useCallback(async () => {
    try {
      setIsRunning(true);
      setInputError(null); // on efface juste l'erreur précédente, pas la sortie
      const body = JSON.parse(jsonIn);
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setOut(data);        // on écrase la sortie seulement si la requête réussit
    } catch (err: any) {
      setInputError(err?.message ?? String(err));
    } finally {
      setIsRunning(false);
    }
  }, [jsonIn]);

  const reset = useCallback(() => {
    setOut(null);
    setInputError(null);
    setShowCharts(false);
  }, []);

  // Raccourci clavier Cmd/Ctrl+Enter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  const kpis = useMemo(() => {
    if (!out || "error" in out) return null;
    const k = out.kpis; const pnl = k.final_equity - k.initial_equity; const pnlPct = k.initial_equity ? (pnl / k.initial_equity) : 0;
    return { ...k, pnl, pnlPct };
  }, [out]);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setJsonIn(String(reader.result || ""));
    reader.readAsText(file);
  };

  return (
    <>
      <Head>
        <title>2048 Asset Management — Moteur Alpha</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={styles.page}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <span style={styles.logoDot} />
            <div>
              <div style={styles.brandTitle}>2048 Asset Management</div>
              <div style={styles.brandSub}>Moteur Alpha — RiskSummary</div>
            </div>
          </div>
        </header>

        <section style={styles.grid}>
          {/* Entrée */}
          <div style={styles.card}>
            <h2 style={styles.h2}>Entrée (JSON)</h2>
            <textarea
              style={styles.textarea}
              value={jsonIn}
              onChange={(e) => setJsonIn(e.target.value)}
              placeholder='{"initial_equity":100000,"returns":[0.01,-0.005,...]}'
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <label style={styles.button as any}>
                Importer JSON
                <input type="file" accept="application/json" onChange={onUpload} style={{ display: "none" }} />
              </label>
              <button
                onClick={run}
                style={styles.button}
                disabled={isRunning}
                title="Lancer la simulation avec l'entrée JSON"
              >
                {isRunning ? "En cours…" : "Lancer"}
              </button>
              <button
                onClick={reset}
                style={styles.buttonSecondary}
                title="Effacer la sortie et refermer les graphes"
              >
                Reset
              </button>
              <button
                onClick={() => out && !("error" in out) ? downloadJSON(out) : null}
                disabled={!out || ("error" in (out || {}))}
                style={styles.button}
                title={!out || ("error" in (out || {})) ? "Pas de résultat exportable" : "Exporter le JSON résultat"}
              >
                Exporter Résultat
              </button>
            </div>
            {inputError ? <div style={{ marginTop: 8 }}><InlineAlert type="error" message={inputError} /></div> : null}
            <p style={styles.helper}>Colle ou importe un JSON valide, puis lance la simulation.</p>
          </div>

          {/* KPIs + Graphes masquables */}
          <div style={styles.card}>
            <h2 style={styles.h2}>KPIs</h2>
            {!out ? (
              <div style={styles.placeholder}>Aucun résultat pour l'instant.</div>
            ) : "error" in out ? (
              <div style={{ marginTop: 8 }}><InlineAlert type="error" message={out.error} /></div>
            ) : (
              <>
                <div style={styles.kpiGrid}>
                  <KPI label="Initial" value={fmtMoney(kpis!.initial_equity)} />
                  <KPI label="Final" value={fmtMoney(kpis!.final_equity)} />
                  <KPI label="PnL" value={`${fmtMoney(kpis!.pnl)} (${fmtPct(kpis!.pnlPct)})`} />
                  <KPI label="Max DD" value={fmtPct(kpis!.max_dd_pct)} />
                  <KPI label="Max DD/jour" value={fmtPct(kpis!.max_daily_dd_pct ?? 0)} />
                  <KPI label="FTMO Total≤10%" value={kpis!.success_flags?.ftmo_total_dd_le_10 ? "✅ OK" : "❌"} />
                  <KPI label="FTMO Jour≤5%" value={kpis!.success_flags?.ftmo_daily_dd_le_5 ? "✅ OK" : "❌"} />
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => setShowCharts(s => !s)} style={styles.buttonSecondary}>
                    {showCharts ? "Masquer graphes" : "Afficher graphes"}
                  </button>
                  <button
                    onClick={() => { equityChartRef.current?.resetZoom(); exposureChartRef.current?.resetZoom(); }}
                    style={styles.buttonSecondary}
                    disabled={!showCharts}
                    title="Recentrer les graphes sur toute la série"
                  >
                    Reset zoom
                  </button>
                </div>

                {showCharts && (
                  <>
                    <h3 style={styles.h3}>Courbe Equity</h3>
                    <div style={styles.chartWrap}>
                      <RiskChart
                  ref={equityChartRef}
                  data={toIndexSeries(out.series.equity)}
                  height={240}
                  label="Equity (€)"
                  showIndexLabels={true}
                />
                    </div>

                    <h3 style={styles.h3}>Exposition</h3>
                    <div style={styles.chartWrap}>
                      <RiskChart
                  ref={exposureChartRef}
                  data={toIndexSeries(out.series.exposure)}
                  height={200}
                  label="Exposure (x)"
                  showIndexLabels={true}
                />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* JSON brut */}
        <section style={styles.gridWide}>
          <div style={styles.card}>
            <h2 style={styles.h2}>Sortie (JSON brut)</h2>
            <pre style={styles.pre}>{out ? JSON.stringify(out, null, 2) : "// Résultat JSON ici"}</pre>
          </div>
        </section>

        <footer style={styles.footer}>
          <span>© {new Date().getFullYear()} 2048 Asset Management — Internal Tools</span>
        </footer>
      </main>
    </>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (<div style={styles.kpi}><div style={styles.kpiLabel}>{label}</div><div style={styles.kpiValue}>{value}</div></div>);
}
function fmtMoney(v: number) { if (!isFinite(v)) return "-"; return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v); }
function fmtPct(v: number) { if (!isFinite(v)) return "-"; return `${(v * 100).toFixed(2)}%`; }

const styles: Record<string, any> = {
  page: { minHeight: "100vh", background: "linear-gradient(120deg, #0f1020 0%, #101436 60%, #1c1b3a 100%)", color: "#e8e8ff", padding: "20px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logoDot: { width: 14, height: 14, borderRadius: 9999, background: "radial-gradient(circle at 30% 30%, #7c8cff, #5a3ef7)", boxShadow: "0 0 18px rgba(122,134,255,0.6)" },
  brandTitle: { fontSize: 18, fontWeight: 600, letterSpacing: 0.2 },
  brandSub: { fontSize: 12, opacity: 0.8 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  gridWide: { display: "grid", gridTemplateColumns: "1fr", marginTop: 16 },
  card: { background: "rgba(19, 21, 46, 0.85)", border: "1px solid rgba(118, 105, 255, 0.15)", borderRadius: 14, padding: 16, boxShadow: "0 6px 24px rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" },
  h2: { margin: "4px 0 12px 0", fontSize: 16, fontWeight: 600 },
  h3: { margin: "16px 0 8px 0", fontSize: 14, fontWeight: 600 },
  textarea: { width: "100%", height: 300, padding: 10, background: "#0b0c1e", color: "#eaeaff", border: "1px solid rgba(118, 105, 255, 0.25)", borderRadius: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12 },
  button: { padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(122, 134, 255, 0.5)", background: "linear-gradient(90deg,#4a46db,#7c8cff)", color: "#fff", cursor: "pointer" },
  buttonSecondary: { padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(122,134,255,0.5)", background: "transparent", color: "#eaeaff", cursor: "pointer" },
  helper: { fontSize: 12, opacity: 0.75, marginTop: 8 },
  placeholder: { fontSize: 12, opacity: 0.8, padding: 8, border: "1px dashed rgba(255,255,255,0.25)", borderRadius: 8 },
  pre: { width: "100%", height: 420, overflow: "auto", background: "#0b0c1e", color: "#eaeaff", border: "1px solid rgba(118, 105, 255, 0.25)", borderRadius: 8, padding: 12, fontSize: 11 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 8 },
  kpi: { background: "linear-gradient(180deg, rgba(124,140,255,0.12), rgba(124,140,255,0.04))", border: "1px solid rgba(124,140,255,0.25)", borderRadius: 10, padding: 10 },
  kpiLabel: { fontSize: 11, opacity: 0.8, marginBottom: 4 },
  kpiValue: { fontWeight: 600, fontSize: 14 },
  chartWrap: {
    width: "100%",
    background: "#0b0c1e",
    border: "1px solid rgba(118, 105, 255, 0.25)",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  footer: { marginTop: 18, fontSize: 12, opacity: 0.7, textAlign: "center" },
  // Mobile
  "@media (max-width: 900px)": {
    grid: { gridTemplateColumns: "1fr" as any }
  }
};
