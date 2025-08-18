export type MMContext = {
  t: number;                      // horodatage uniforme: index (int)
  hwm: number;                    // High Water Mark
  equity: number;                 // current equity
  last_pnl?: number;              // dernier P&L
  cushion?: number;               // % au-dessus du plancher CPPI
  regime?: string;                // bull/bear/side...
  gating: {
    fees_bps?: number;
    sessions?: string[];
    news_blackouts?: string[];
  };
};

export type ModuleDecision = {
  risk_proposal?: number;         // fraction risque (0..1), unités cohérentes
  size_proposal?: number;         // taille en "risk units" (pas de lots natifs)
  notes?: Record<string, unknown>;
};

export interface MMModule {
  id: string;
  enabled: boolean;
  // Invariants: no-increase-after-loss; freeze si cushion < seuil;
  // G(f) >= 0 (capé) — formules internes non exposées.
  apply(ctx: MMContext, params: Record<string, unknown>): ModuleDecision;
}

export type OrchestratorOutput = {
  risk_final: number;             // min des risques proposés par modules actifs
  size_final: number;             // taille finale après anti-martingale etc.
  logs: Array<{ t: number; module: string; event: string; details?: unknown }>;
};
