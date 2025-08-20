// 📄 @fichier: modules/presets/fx_major.ts
// 🌍 Preset de test multi-actifs : paires majeures FX

export const fxMajorPreset = {
  EURUSD: [
    { pWins: 0.55, pLosses: 0.45, R: 2.0, realizedVol: 0.12, outcome: 0.015, lastResult: "win", cluster: "FX", marketContext: "bull" },
    { pWins: 0.52, pLosses: 0.48, R: 1.5, realizedVol: 0.10, outcome: -0.01, lastResult: "loss", cluster: "FX", marketContext: "sideways" },
    { pWins: 0.50, pLosses: 0.50, R: 1.8, realizedVol: 0.13, outcome: 0.007, lastResult: "win", cluster: "FX", marketContext: "bull" },
  ],
  GBPUSD: [
    { pWins: 0.53, pLosses: 0.47, R: 1.8, realizedVol: 0.14, outcome: -0.012, lastResult: "loss", cluster: "FX", marketContext: "bear" },
    { pWins: 0.56, pLosses: 0.44, R: 2.2, realizedVol: 0.11, outcome: 0.016, lastResult: "win", cluster: "FX", marketContext: "bull" },
    { pWins: 0.50, pLosses: 0.50, R: 2.0, realizedVol: 0.09, outcome: 0.009, lastResult: "win", cluster: "FX", marketContext: "sideways" },
  ],
};
