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

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

export async function simulate(body: SimInput): Promise<SimOutput> {
  const res = await fetch(`${BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`simulate failed: ${res.status}`);
  return res.json();
}
