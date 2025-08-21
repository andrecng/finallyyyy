"use client";
import { useState } from "react";
import EquityChart from "@/components/charts/EquityChart";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import { engine, type PresetV1, type SimulationOutput } from "@/engine/facade";

export default function Workspace() {
  const [out, setOut] = useState<SimulationOutput | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const preset: PresetV1 = {
        schema_version: "1.0",
        seed: 42, total_steps: 120, mu: 0, fees_per_trade: 0.0002,
        modules: {}
      };
      const res = await engine.simulate(preset);
      setOut(res);
    } catch (error) {
      console.error("Simulation failed:", error);
      alert("Erreur simulation: " + error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Workspace Simulation</h1>
        <p className="text-gray-600">Interface minimale et robuste pour tester le moteur</p>
      </div>
      
      <Card>
        <div className="space-y-4">
          <Button 
            onClick={run} 
            disabled={loading}
            variant="primary"
            size="lg"
          >
            {loading ? "⏳ Simulation..." : "🚀 Lancer simulation"}
          </Button>
          
          {out && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Résultats</h3>
              <EquityChart series={out?.series?.equity ?? []} />
              <div className="bg-gray-50 rounded p-3">
                <h4 className="font-medium mb-2">KPIs</h4>
                <pre className="text-xs overflow-auto">{JSON.stringify(out?.kpis ?? {}, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}
