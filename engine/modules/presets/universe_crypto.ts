// 📄 @fichier: modules/presets/universe_crypto.ts
// 🌐 Univers crypto factice pour test

export const universeCrypto = {
  BTC: Array.from({ length: 100 }, (_, t) => ({
    pWins: 0.55,
    pLosses: 0.45,
    R: 1.5,
    realizedVol: 0.22,
    lastResult: t % 3 === 0 ? "win" : "loss",
    outcome: (Math.random() - 0.45) * 2.5,
    cluster: "crypto",
    marketContext: "uptrend"
  })),
  ETH: Array.from({ length: 100 }, (_, t) => ({
    pWins: 0.53,
    pLosses: 0.47,
    R: 1.8,
    realizedVol: 0.28,
    lastResult: t % 4 === 0 ? "win" : "loss",
    outcome: (Math.random() - 0.4) * 2.8,
    cluster: "crypto",
    marketContext: "volatile"
  }))
};
