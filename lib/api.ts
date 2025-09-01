export type RunKind = "simulate" | "simulate_mc" | "optimize";

const controllers = new Map<RunKind, AbortController>();

function endpoint(kind: RunKind): string {
  if (kind === "simulate") return "/api/simulate";
  if (kind === "simulate_mc") return "/api/simulate_mc";
  return "/api/optimize";
}

export async function runWithAbort(kind: RunKind, payload: unknown, timeoutMs = 120_000) {
  const prev = controllers.get(kind);
  if (prev) { try { prev.abort(); } catch {} }

  const ctrl = new AbortController();
  controllers.set(kind, ctrl);

  const timer = setTimeout(() => { try { ctrl.abort(); } catch {} }, timeoutMs);

  try {
    const res = await fetch(endpoint(kind), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {}),
      signal: ctrl.signal,
    });

    const text = await res.text();
    let data: unknown = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      const err: any = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.response = data;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timer);
    if (controllers.get(kind) === ctrl) controllers.delete(kind);
  }
}

export function abortRun(kind: RunKind) {
  const c = controllers.get(kind);
  if (c) {
    try { c.abort(); } catch {}
    controllers.delete(kind);
  }
}
