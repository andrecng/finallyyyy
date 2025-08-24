// Simple client avec AbortController par action
export type RunKind = "simulate" | "simulate_mc" | "optimize";

type Endpoints = Record<RunKind, string>;
const ENDPOINTS: Endpoints = {
  simulate: "/api/simulate",
  simulate_mc: "/api/simulate_mc",
  optimize: "/api/optimize",
};

const controllers = new Map<RunKind, AbortController>();

export function abortRun(kind: RunKind) {
  const c = controllers.get(kind);
  if (c) {
    c.abort();
    controllers.delete(kind);
  }
}

export async function runWithAbort<T = unknown>(kind: RunKind, payload: unknown): Promise<T> {
  // Annule une éventuelle requête encore en vol pour cette action
  abortRun(kind);

  const controller = new AbortController();
  controllers.set(kind, controller);

  try {
    const res = await fetch(ENDPOINTS[kind], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {}),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} – ${text || res.statusText}`);
    }
    const data = (await res.json()) as T;
    return data;
  } finally {
    // Libère le contrôleur quand terminé (succès/erreur/abort)
    controllers.delete(kind);
  }
}
