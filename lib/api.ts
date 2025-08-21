export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

export async function postJSON(path: string, body: any) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`API ${path} ${r.status}`);
  return r.json();
}

export type SimInput = { 
  preset?: string | null; 
  modules?: string[]; 
  params?: Record<string, any> 
};

export type SimOutput = {
  series: { t: number; eq: number }[];
  kpis: { 
    max_dd?: number; 
    pass_ftmo?: boolean; 
    ftmo?: any; 
    [k: string]: any 
  };
  logs?: any[];
};

export async function simulate(body: SimInput): Promise<SimOutput> {
  const url = `${API_BASE}/simulate`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });
  } catch (e: any) {
    throw new Error(`simulate network error: ${e?.message || e}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`simulate failed: ${res.status} ${res.statusText} ${text?.slice(0,200)}`);
  }
  return res.json();
}

export async function ping(): Promise<{ ok: boolean; base: string }> {
  const url = `${API_BASE}/healthz`;
  const res = await fetch(url, { cache: "no-store" });
  return { ok: res.ok, base: API_BASE };
}

export type MCOutput = {
  n_runs: number;
  seed: number;
  pass_pct: number; // 0..100
  metrics: {
    max_dd?: Record<string, number>;   // { p05: 0.07, p50: 0.12, ... }
    final_eq?: Record<string, number>; // { p05: 0.94, p50: 1.02, ... }
    sortino?: Record<string, number> | null;
    calmar?: Record<string, number> | null;
  };
};

export async function mcSimulate(body: {
  params: Record<string, any>;
  n_runs?: number;
  seed?: number;
  quantiles?: number[]; // ex [0.05,0.5,0.95]
}): Promise<MCOutput> {
  const url = `${API_BASE}/mc_simulate`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });
  } catch (e: any) {
    throw new Error(`mc_simulate network error: ${e?.message || e}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`mc_simulate failed: ${res.status} ${res.statusText} ${text?.slice(0,200)}`);
  }
  return res.json();
}
