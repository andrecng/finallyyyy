import { mapToBackend } from "./buildPayload";
import { addRun, hashPayload, shortHash } from "@/app/lib/runJournal";
import { validatePayload } from "@/app/lib/validate";

export async function simulate(payload: any, presetName?: string) {
  // Validation du payload avant envoi
  const warns = validatePayload(payload);
  if (warns.length) {
    console.warn("[validate]", warns.join(" | "));
    // Option: afficher un toast discret si tu en utilises
  }

  const r = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const data = await r.json();
  
  // Log dans le journal
  const payloadHash = hashPayload(payload);
  addRun({
    id: `${new Date().toISOString()}-simulate-${shortHash(payloadHash)}`,
    ts: new Date().toISOString(),
    type: "simulate",
    presetName,
    payloadHash,
    payload,
    gist: {
      CAGR: data?.kpis?.cagr,
      max_dd_total: data?.max_dd_total,
      max_dd_daily: data?.max_dd_daily,
      pass_target: data?.kpis?.target_pass,
      violations_daily: data?.violations_daily,
      violations_total: data?.violations_total,
    },
  });
  
  return data;
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

export async function simulateMc(payload: any, n = 100, base_seed = 777, presetName?: string) {
  const r = await fetch("/api/simulate_mc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload, n, base_seed }),
    cache: "no-store",
  });
  const data = await r.json(); // { n, mc: { pass_rate, pass_rate_full, dd_p50, dd_p95 } }
  
  // Log dans le journal
  const payloadHash = hashPayload({ payload, n, base_seed });
  addRun({
    id: `${new Date().toISOString()}-simulate_mc-${shortHash(payloadHash)}`,
    ts: new Date().toISOString(),
    type: "simulate_mc",
    presetName,
    payloadHash,
    payload: { payload, n, base_seed },
    gist: {
      pass_rate: data?.mc?.pass_rate,
      pass_rate_full: data?.mc?.pass_rate_full,
      dd_p50: data?.mc?.dd_p50,
      dd_p95: data?.mc?.dd_p95,
    },
  });
  
  return data;
}
