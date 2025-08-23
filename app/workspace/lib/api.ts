import { mapToBackend } from "./buildPayload";

export async function simulate(payload: any) {
  const r = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  return r.json();
}

export async function simulateFromUI(uiState: any) {
  const payload = mapToBackend(uiState);
  const r = await fetch("/api/simulate", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  return r.json();
}

export async function simulateMc(payload: any, n = 100, base_seed = 777) {
  const r = await fetch("/api/simulate_mc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload, n, base_seed }),
    cache: "no-store",
  });
  return r.json(); // { n, mc: { pass_rate, pass_rate_full, dd_p50, dd_p95 } }
}
