// 📄 @fichier: modules/presets/universe_indices.ts
// 📈 Univers indices factice pour test

export const universeIndices = {
  SP500: Array.from({ length: 100 }, (_, t) => ({
    pWins: 0.52,
    pLosses: 0.48,
    R: 1.6,
    realizedVol: 0.15,
    lastResult: t % 2 === 0 ? "win" : "loss",
    outcome: (Math.random() - 0.5) * 1.8,
    cluster: "indices",
    marketContext: "neutral"
  })),
  NASDAQ: Array.from({ length: 100 }, (_, t) => ({
    pWins: 0.54,
    pLosses: 0.46,
    R: 1.9,
    realizedVol: 0.2,
    lastResult: t % 3 === 0 ? "win" : "loss",
    outcome: (Math.random() - 0.45) * 2.1,
    cluster: "indices",
    marketContext: "growth"
  }))
};
