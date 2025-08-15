// 📁 /stores/simStore.ts
// 🧠 Store Zustand unifié pour simulations multi-actifs

import { create } from 'zustand';

export interface SimulationMetrics {
  CAGR: number;
  MaxDD: number;
  Sharpe: number;
  Sortino: number;
  WinRate: number;
  TimeInDrawdown: number;
  ES95: number;
  UlcerIndex: number;
}

export interface RiskLog {
  tradeId: string;
  riskPct: number;
  modules: string[];
  notes: string;
}

export interface SimStore {
  metrics: SimulationMetrics;
  equitySeries: number[];
  riskLog: RiskLog[];
  presets: Record<string, any>;
  volatilityTarget: number;
  capital: number;
  nbSimulations: number;

  setMetrics: (metrics: SimulationMetrics) => void;
  setEquity: (equity: number[]) => void;
  addLog: (log: RiskLog) => void;
  setVolatilityTarget: (value: number) => void;
  setCapital: (value: number) => void;
  setNbSimulations: (value: number) => void;
  reset: () => void;
  resetAll: () => void;
}

export const useSimStore = create<SimStore>()((set) => ({
  metrics: {
    CAGR: 0,
    MaxDD: 0,
    Sharpe: 0,
    Sortino: 0,
    WinRate: 0,
    TimeInDrawdown: 0,
    ES95: 0,
    UlcerIndex: 0,
  },
  equitySeries: [],
  riskLog: [],
  presets: {},
  volatilityTarget: 15,
  capital: 100000,
  nbSimulations: 1000,

  setMetrics: (metrics) => set({ metrics }),
  setEquity: (equity) => set({ equitySeries: equity }),
  addLog: (log) => set((state) => ({ riskLog: [...state.riskLog, log] })),
  setVolatilityTarget: (value) => set({ volatilityTarget: value }),
  setCapital: (value) => set({ capital: value }),
  setNbSimulations: (value) => set({ nbSimulations: value }),
  reset: () =>
    set({
      metrics: {
        CAGR: 0,
        MaxDD: 0,
        Sharpe: 0,
        Sortino: 0,
        WinRate: 0,
        TimeInDrawdown: 0,
        ES95: 0,
        UlcerIndex: 0,
      },
      equitySeries: [],
      riskLog: [],
      presets: {},
      volatilityTarget: 15,
      capital: 100000,
      nbSimulations: 1000,
    }),
  resetAll: () => set(() => ({
    capital: 100000,
    nbSimulations: 1,
    volatilityTarget: 15,
    metrics: {
      CAGR: 0,
      MaxDD: 0,
      Sharpe: 0,
      Sortino: 0,
      WinRate: 0,
      TimeInDrawdown: 0,
      ES95: 0,
      UlcerIndex: 0,
    },
    equitySeries: [],
    riskLog: [],
    presets: {},
  })),
}));
