"""
Configuration Monte Carlo pour tests de stress
- Seeds multiples pour couverture complète
- Tailles de runs configurables
- Paramètres de stress ajustables
"""

import numpy as np
from typing import List, Dict, Any

class MonteCarloConfig:
    def __init__(self, n_runs: int = 1000, seed_base: int = 42):
        self.n_runs = n_runs
        self.seed_base = seed_base
        self.seeds = self._generate_seeds()
    
    def _generate_seeds(self) -> List[int]:
        """Génère une grille de seeds pour couverture complète"""
        rng = np.random.default_rng(self.seed_base)
        return rng.integers(1, 1000000, size=self.n_runs).tolist()
    
    def get_stress_params(self) -> Dict[str, Any]:
        """Paramètres de stress pour les tests"""
        return {
            "heavy_tail": {
                "nu": [3, 4, 5],  # degrés de liberté Student-t
                "p_tail": [0.05, 0.10, 0.15],  # probabilité queue
                "tail_mult": [2.0, 3.0, 4.0]  # multiplicateur queue
            },
            "jumps": {
                "p_jump": [0.005, 0.01, 0.02],  # probabilité saut
                "jump_sigma": [0.03, 0.04, 0.06]  # volatilité saut
            },
            "vol_clustering": {
                "lam": [0.90, 0.94, 0.98],  # persistance EWMA
                "shock": [0.015, 0.02, 0.025]  # amplitude choc
            },
            "ftmo_limits": {
                "dd_daily": [0.03, 0.05, 0.07],  # limites DD journalier
                "dd_total": [0.08, 0.10, 0.12]   # limites DD total
            }
        }
    
    def get_run_config(self, run_id: int) -> Dict[str, Any]:
        """Configuration pour un run spécifique"""
        seed = self.seeds[run_id % len(self.seeds)]
        return {
            "run_id": run_id,
            "seed": seed,
            "rng": np.random.default_rng(seed)
        }

# Configuration par défaut
DEFAULT_MC_CONFIG = MonteCarloConfig(n_runs=1000, seed_base=42)
