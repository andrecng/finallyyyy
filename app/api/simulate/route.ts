export const runtime = "nodejs";

type Preset = any;

function drawdownStats(equity: number[]) {
  let peak = equity[0] ?? 1;
  let maxDD = 0;
  for (const x of equity) {
    peak = Math.max(peak, x);
    const dd = peak > 0 ? (peak - x) / peak : 0;
    maxDD = Math.max(maxDD, dd);
  }
  const rets: number[] = [];
  for (let i = 1; i < equity.length; i++) {
    const r = (equity[i] - equity[i - 1]) / (Math.abs(equity[i - 1]) || 1);
    rets.push(r);
  }
  const maxDailyLoss = rets.reduce((m, r) => Math.min(m, r), 0);
  return { maxDD_total: maxDD, maxDailyLoss };
}

function mockSimulate(preset: Preset) {
  const steps = Math.max(10, Math.floor(preset?.total_steps ?? 200));
  const mu = Number(preset?.mu ?? 0);
  const fees = Number(preset?.fees_per_trade ?? 0);
  const dailyLimit = Number(preset?.modules?.FTMOGate?.daily_limit ?? 0.02);
  const totalLimit = Number(preset?.modules?.FTMOGate?.total_limit ?? 0.10);

  // pseudo random walk (vol ~1%)
  let x = 1;
  const eq: number[] = [x];
  for (let i = 1; i < steps; i++) {
    const noise = (Math.random() - 0.5) * 0.02; // ±1%
    const r = mu / Math.max(steps, 1) + noise - fees;
    x = x * (1 + r);
    eq.push(x);
  }
  const { maxDD_total, maxDailyLoss } = drawdownStats(eq);
  const violations_daily = maxDailyLoss < -dailyLimit ? 1 : 0;
  const violations_total = maxDD_total > totalLimit ? 1 : 0;

  return {
    kpis: {
      max_dd_total: maxDD_total,
      max_dd_daily: Math.abs(maxDailyLoss),
      violations_daily,
      violations_total,
      pass_rate: violations_daily === 0 && violations_total === 0 ? 1 : 0,
    },
    series: { equity: eq },
    modules_active: Object.keys(preset?.modules ?? {}),
  };
}

export async function POST(req: Request) {
  const preset = await req.json();
  const FORCE_MOCK = process.env.FORCE_MOCK === "1";
  const url = process.env.BACKEND_URL?.replace(/\/$/, "");

  if (!FORCE_MOCK && url) {
    const r = await fetch(`${url}/simulate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(preset),
    });
    const data = await r.json();
    return new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
  }

  const data = mockSimulate(preset);
  return new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
}
