export type SimParams = {
  initialCapital: number;   // ex: 10000
  horizonDays: number;      // ex: 20
  volAnn: number;           // ex: 0.10 (10%)
  dailyMaxLoss: number;     // ex: 0.005 (0.5%)
  totalMaxLoss: number;     // ex: 0.10  (10%)
  seed?: number;
};

export type SimResult = {
  equity: number[];         // valeurs absolues
  equityPct: number[];      // normalisé 1.0 = départ
  passDaily: boolean;
  passTotal: boolean;
  dailyViolations: number;
  maxDrawdownPct: number;
};

function rng(seed: number) {
  // LCG simple (déterministe)
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 2**32;
  };
}

export function runLocalSim(p: SimParams): SimResult {
  const { initialCapital, horizonDays, volAnn, dailyMaxLoss, totalMaxLoss, seed = 42 } = p;
  const r = rng(seed);
  // vol journalière approx (252 jours de marché)
  const volDay = volAnn / Math.sqrt(252);
  const equity: number[] = [initialCapital];
  const equityPct: number[] = [1];

  let hwm = 1;
  let maxDD = 0;
  let dailyViol = 0;

  for (let d = 1; d <= horizonDays; d++) {
    // random walk simple (normal ~ approximé via Box-Muller pauvre)
    const u1 = Math.max(1e-12, r());
    const u2 = Math.max(1e-12, r());
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const ret = z * volDay; // drift 0 pour base
    const nextPct = equityPct[equityPct.length - 1] * (1 + ret);
    equityPct.push(nextPct);
    equity.push(nextPct * initialCapital);

    // drawdown
    hwm = Math.max(hwm, nextPct);
    const dd = (hwm - nextPct) / hwm;
    maxDD = Math.max(maxDD, dd);

    // daily violation (simple) : si retour journalier < -dailyMaxLoss
    if (ret < -dailyMaxLoss) dailyViol += 1;
  }

  const passDaily = dailyViol === 0;           // aucun jour < -dailyMaxLoss
  const passTotal = maxDD <= totalMaxLoss;     // DD total <= limite

  return {
    equity,
    equityPct,
    passDaily,
    passTotal,
    dailyViolations: dailyViol,
    maxDrawdownPct: maxDD,
  };
}
