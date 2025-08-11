'use client';

import { create } from 'zustand';
import { SimulationConfig, SimulationResult, Preset } from '@/lib/types';

interface SimulationStore {
  // Configuration
  config: SimulationConfig;
  
  // Results
  results: SimulationResult[];
  currentResult: SimulationResult | null;
  isLoading: boolean;
  error: string | null;
  
  // Presets
  presets: Preset[];
  selectedPresetId: string | null;
  
  // UI State
  compareMode: boolean;
  compareResults: SimulationResult[];
  
  // Actions
  updateConfig: (updates: Partial<SimulationConfig>) => void;
  runSimulation: () => Promise<void>;
  clearResults: () => void;
  
  // Presets
  savePreset: (name: string, description: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  
  // Compare
  toggleCompareMode: () => void;
  addToCompare: (result: SimulationResult) => void;
  removeFromCompare: (index: number) => void;
  
  // Export
  exportConfig: () => void;
  exportResults: (format: 'csv' | 'json' | 'png' | 'pdf') => void;
}

const defaultConfig: SimulationConfig = {
  seed: 42,
  n_trades: 5000,
  capital: {
    initial: 100000,
    basis: 'balance',
    fees: 0,
    spread_bp: 1.5,
    slippage_bp: 1.0,
  },
  edge: {
    win_rate: 0.52,
    r_win: 1.2,
    r_loss: 1.0,
    source: 'fixed',
  },
  kelly: {
    enabled: true,
    fraction_cap: 0.5,
    cap_global_pct: 1.0,
  },
  bayes: {
    enabled: false,
    prior_a: 8,
    prior_b: 7,
    window: 200,
    decay: 0.98,
  },
  sequence: {
    type: 'anti_martingale_bornee',
    params: {
      step_up: 1.1,
      step_down: 0.5,
      cap_seq: 0.75,
    },
  },
  dd_paliers: {
    thresholds: [-0.10, -0.20, -0.30],
    multipliers: [0.5, 0.33, 0.2],
    reset_on_hwm: true,
  },
  cppi: {
    enabled: false,
    alpha: 0.2,
  },
  vol_target: {
    enabled: false,
    sigma_target: 0.15,
  },
  markov: {
    enabled: false,
    mode: 'both',
    matrix_params: {
      p_cc: 0.92,
      p_ss: 0.85,
      mu_c: 0.5,
      mu_s: -0.8,
    },
  },
  portfolio: {
    cap_global: 1.0,
    cap_per_instr: {
      EURUSD: 0.4,
      XAUUSD: 0.3,
    },
    rho: [[1, 0.3], [0.3, 1]],
    priority: 'pro_rata',
  },
  stops: {
    dd_stop_pct: 0.35,
    breach_behavior: 'halt',
  },
  stress_flags: {
    wr_minus_10: false,
    wr_plus_10: false,
    vol_plus_50: false,
    costs_x2: false,
    costs_x3: false,
    corr_to_1: false,
    black_swan_5r: false,
  },
};

// Mock simulation function - would call FastAPI backend
const mockSimulation = async (config: SimulationConfig): Promise<SimulationResult> => {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  
  return {
    kpis: {
      CAGR: 0.21,
      MaxDD: 0.12,
      Sharpe: 1.4,
      Sortino: 2.1,
      WinRate: 0.53,
      ProfitFactor: 1.45,
      Expectancy_R: 0.08,
      ruin_prob: {
        dd_10: 0.06,
        dd_20: 0.02,
        dd_30: 0.005,
      },
      ES_95: -0.18,
      Ulcer: 0.09,
      time_in_dd: 0.32,
      longest_loss_streak: 8,
      trades_needed_mean: 850,
      trades_needed_p95: 2100,
    },
    guardrails: {
      palier_break_count: [2, 0, 0],
      prob_break_next_palier: 0.07,
      floor_breaches: 0,
      avg_dd_recovery_trades: 120,
      peak_concurrent_pos: 3,
      var_est: 0.12,
      compliance_flags: [],
    },
    series: {
      equity: Array.from({ length: 100 }, (_, i) => [
        i,
        100000 + (Math.random() - 0.3) * 10000 * Math.sqrt(i),
      ] as [number, number]),
      dd: Array.from({ length: 100 }, (_, i) => [
        i,
        -Math.abs(Math.random() * 0.15),
      ] as [number, number]),
      hwm: Array.from({ length: 100 }, (_, i) => [
        i,
        100000 + Math.max(0, (Math.random() - 0.3) * 10000 * Math.sqrt(i)),
      ] as [number, number]),
    },
    trades: [],
    posteriors: {
      p_hat: Array.from({ length: 50 }, (_, i) => [
        i * 100,
        0.52 + (Math.random() - 0.5) * 0.1,
      ] as [number, number]),
    },
    run_meta: {
      seed: config.seed,
      duration_ms: 680,
      engine_version: '0.2.0',
    },
  };
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  config: defaultConfig,
  results: [],
  currentResult: null,
  isLoading: false,
  error: null,
  presets: [],
  selectedPresetId: null,
  compareMode: false,
  compareResults: [],

  updateConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),

  runSimulation: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await mockSimulation(get().config);
      set((state) => ({
        results: [...state.results, result],
        currentResult: result,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearResults: () =>
    set({ results: [], currentResult: null, compareResults: [] }),

  savePreset: (name, description) => {
    const preset: Preset = {
      id: Date.now().toString(),
      name,
      description,
      config: get().config,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ presets: [...state.presets, preset] }));
  },

  loadPreset: (presetId) => {
    const preset = get().presets.find(p => p.id === presetId);
    if (preset) {
      set({ config: preset.config, selectedPresetId: presetId });
    }
  },

  deletePreset: (presetId) =>
    set((state) => ({
      presets: state.presets.filter(p => p.id !== presetId),
      selectedPresetId: state.selectedPresetId === presetId ? null : state.selectedPresetId,
    })),

  toggleCompareMode: () =>
    set((state) => ({ compareMode: !state.compareMode })),

  addToCompare: (result) =>
    set((state) => ({
      compareResults: [...state.compareResults.slice(-2), result],
    })),

  removeFromCompare: (index) =>
    set((state) => ({
      compareResults: state.compareResults.filter((_, i) => i !== index),
    })),

  exportConfig: () => {
    const config = get().config;
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportResults: (format) => {
    const result = get().currentResult;
    if (!result) return;

    switch (format) {
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(result, null, 2)], {
          type: 'application/json',
        });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonA = document.createElement('a');
        jsonA.href = jsonUrl;
        jsonA.download = `results_${new Date().toISOString().split('T')[0]}.json`;
        jsonA.click();
        URL.revokeObjectURL(jsonUrl);
        break;
      case 'csv':
        // Implementation would go here
        console.log('CSV export not implemented yet');
        break;
      case 'png':
        // Implementation would go here
        console.log('PNG export not implemented yet');
        break;
      case 'pdf':
        // Implementation would go here
        console.log('PDF export not implemented yet');
        break;
    }
  },
}));