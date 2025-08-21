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

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8001";

export async function simulate(body: SimInput): Promise<SimOutput> {
  const url = `${BASE}/simulate`;
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
  const url = `${BASE}/healthz`;
  const res = await fetch(url, { cache: "no-store" });
  return { ok: res.ok, base: BASE };
}
