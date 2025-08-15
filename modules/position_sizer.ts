// 📄 @fichier: modules/position_sizer.ts

export type PositionSizerInput = {
  pWins: number;
  pLosses: number;
  R: number;
  realizedVol: number;
  drawdown: number;
  capital: number;
  hwm: number;
  lastResult: "win" | "loss" | "none";
  step: number;
  marketContext?: string;
};

export function computePositionSize(input: PositionSizerInput): number {
  const { pWins, R } = input;
  const p = Math.max(0.01, Math.min(0.99, pWins));
  const fKelly = p - (1 - p) / R;
  const capped = Math.min(Math.max(fKelly, 0), 0.03); // 3 % max
  return capped;
}
