"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { abortRun, runWithAbort, RunKind } from "@/lib/api";

type Props = {
  payloadFactory: () => unknown; // récupère la config actuelle à envoyer
  onResult: (kind: RunKind, data: unknown) => void; // met à jour l'UI (KPIs, graph, journal…)
  className?: string;
};

export default function RunButtons({ payloadFactory, onResult, className }: Props) {
  const [running, setRunning] = useState<{ [K in RunKind]?: boolean }>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Abort propre si on quitte la page/composant
      abortRun("simulate");
      abortRun("simulate_mc");
      abortRun("optimize");
    };
  }, []);

  const run = useCallback(
    async (kind: RunKind) => {
      if (running[kind]) return; // déjà en cours
      const payload = payloadFactory();

      try {
        setRunning((s) => ({ ...s, [kind]: true }));
        const data = await runWithAbort(kind, payload);
        if (mountedRef.current) onResult(kind, data);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // silencieux : action annulée
          return;
        }
        console.error(`[${kind}] failed:`, err);
        // Option: afficher un toast/alert ici
      } finally {
        if (mountedRef.current) setRunning((s) => ({ ...s, [kind]: false }));
      }
    },
    [running, payloadFactory, onResult]
  );

  const handleAbort = useCallback((kind: RunKind) => {
    abortRun(kind);
    // running repassera à false dans finally quand l'appel se résout
  }, []);

  const btn = (label: string, kind: RunKind) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => run(kind)}
        disabled={!!running[kind]}
        className="px-3 py-2 rounded-2xl shadow-sm border text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {running[kind] ? `… ${label}` : label}
      </button>
      {running[kind] && (
        <button
          onClick={() => handleAbort(kind)}
          className="px-2 py-2 rounded-xl border text-xs"
          title="Annuler en cours"
        >
          Stop
        </button>
      )}
    </div>
  );

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      {btn("Run Simulation", "simulate")}
    </div>
  );
}
