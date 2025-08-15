// 📄 @fichier: stores/unifiedStore.ts
// 🏪 Store unifié avec slices pour une gestion d'état centralisée

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SimulationResult, SimulationMetrics, RiskLogEntry } from '../lib/interfaces/simulation';

// Types unifiés
interface UnifiedState {
  // Simulation
  simulation: {
    results: SimulationResult | null;
    isRunning: boolean;
    progress: number;
  };
  
  // Configuration
  config: {
    selectedUniverse: string;
    portfolioCaps: {
      globalCap: number;
      perInstrumentCap: number;
      perClusterCap: number;
    };
    monteCarlo: {
      nSimulations: number;
    };
  };
  
  // UI State
  ui: {
    selectedPreset: string;
    activeTab: string;
    theme: 'light' | 'dark';
  };
}

// État initial
const initialState: UnifiedState = {
  simulation: {
    results: null,
    isRunning: false,
    progress: 0,
  },
  config: {
    selectedUniverse: 'fx_major',
    portfolioCaps: {
      globalCap: 1.0,
      perInstrumentCap: 0.3,
      perClusterCap: 0.6,
    },
    monteCarlo: {
      nSimulations: 100,
    },
  },
  ui: {
    selectedPreset: 'FX Major',
    activeTab: 'simulation',
    theme: 'dark' as const,
  },
};

export const useUnifiedStore = create<UnifiedState & {
  actions: {
    // Simulation
    setResults: (results: SimulationResult) => void;
    setRunning: (running: boolean) => void;
    setProgress: (progress: number) => void;
    
    // Configuration
    setUniverse: (universe: string) => void;
    setPortfolioCaps: (caps: Partial<UnifiedState['config']['portfolioCaps']>) => void;
    setMonteCarlo: (n: number) => void;
    
    // UI
    setPreset: (preset: string) => void;
    setActiveTab: (tab: string) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    
    // Reset
    reset: () => void;
  };
}>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      actions: {
        // Simulation
        setResults: (results) => set((state) => ({
          simulation: { ...state.simulation, results }
        })),
        
        setRunning: (running) => set((state) => ({
          simulation: { ...state.simulation, isRunning: running }
        })),
        
        setProgress: (progress) => set((state) => ({
          simulation: { ...state.simulation, progress }
        })),
        
        // Configuration
        setUniverse: (universe) => set((state) => ({
          config: { ...state.config, selectedUniverse: universe }
        })),
        
        setPortfolioCaps: (caps) => set((state) => ({
          config: {
            ...state.config,
            portfolioCaps: { ...state.config.portfolioCaps, ...caps }
          }
        })),
        
        setMonteCarlo: (n) => set((state) => ({
          config: {
            ...state.config,
            monteCarlo: { ...state.config.monteCarlo, nSimulations: n }
          }
        })),
        
        // UI
        setPreset: (preset) => set((state) => ({
          ui: { ...state.ui, selectedPreset: preset }
        })),
        
        setActiveTab: (tab) => set((state) => ({
          ui: { ...state.ui, activeTab: tab }
        })),
        
        setTheme: (theme) => set((state) => ({
          ui: { ...state.ui, theme }
        })),
        
        // Reset
        reset: () => set(initialState),
      },
    }),
    {
      name: 'unified-store',
    }
  )
);

// Sélecteurs pour faciliter l'utilisation
export const useSimulation = () => useUnifiedStore((state) => state.simulation);
export const useConfig = () => useUnifiedStore((state) => state.config);
export const useUI = () => useUnifiedStore((state) => state.ui);
export const useActions = () => useUnifiedStore((state) => state.actions);
