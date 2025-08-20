"""
Rapports FTMO : Pass %, Jours jusqu'à cible, Max DD total/jour
Format JSON standardisé pour analyse
"""

import numpy as np
from typing import Dict, Any, List, Optional

class FTMOReporter:
    def __init__(self, target_profit: float = 0.10, dd_total_limit: float = 0.10, dd_daily_limit: float = 0.05):
        self.target_profit = target_profit
        self.dd_total_limit = dd_total_limit
        self.dd_daily_limit = dd_daily_limit
    
    def generate_report(self, equity_curve: List[float], daily_equity: List[List[float]]) -> Dict[str, Any]:
        """
        Génère un rapport FTMO complet
        
        Args:
            equity_curve: Courbe d'équité totale
            daily_equity: Liste des courbes intraday par jour
        
        Returns:
            Rapport JSON avec métriques FTMO
        """
        equity_arr = np.array(equity_curve)
        initial = equity_arr[0]
        
        # Calculs de base
        final_equity = equity_arr[-1]
        total_return = (final_equity - initial) / initial
        max_dd_total = self._calculate_max_dd(equity_arr)
        
        # FTMO daily drawdown
        daily_dds = []
        for day_curve in daily_equity:
            if day_curve:
                daily_dd = self._calculate_daily_dd(day_curve)
                daily_dds.append(daily_dd)
        
        max_dd_daily = max(daily_dds) if daily_dds else 0.0
        
        # Vérifications FTMO
        ftmo_total_ok = abs(max_dd_total) <= self.dd_total_limit
        ftmo_daily_ok = abs(max_dd_daily) <= self.dd_daily_limit
        target_reached = total_return >= self.target_profit
        
        # Jours jusqu'à cible
        days_to_target = self._days_to_target(equity_arr, self.target_profit)
        
        return {
            "ftmo": {
                "pass_total": ftmo_total_ok,
                "pass_daily": ftmo_daily_ok,
                "pass_target": target_reached,
                "overall_pass": ftmo_total_ok and ftmo_daily_ok and target_reached
            },
            "metrics": {
                "total_return": float(total_return),
                "max_dd_total": float(max_dd_total),
                "max_dd_daily": float(max_dd_daily),
                "days_to_target": days_to_target,
                "target_profit": self.target_profit,
                "dd_total_limit": self.dd_total_limit,
                "dd_daily_limit": self.dd_daily_limit
            },
            "logs": {
                "daily_dds": [float(dd) for dd in daily_dds],
                "equity_curve": [float(eq) for eq in equity_curve]
            }
        }
    
    def _calculate_max_dd(self, equity: np.ndarray) -> float:
        """Calcule le drawdown maximum total"""
        peaks = np.maximum.accumulate(equity)
        dd = (equity - peaks) / peaks
        return float(dd.min())
    
    def _calculate_daily_dd(self, day_equity: List[float]) -> float:
        """Calcule le drawdown maximum d'une journée"""
        arr = np.array(day_equity)
        peaks = np.maximum.accumulate(arr)
        dd = (arr - peaks) / peaks
        return float(dd.min())
    
    def _days_to_target(self, equity: np.ndarray, target: float) -> Optional[int]:
        """Calcule le nombre de jours pour atteindre la cible"""
        initial = equity[0]
        target_equity = initial * (1 + target)
        
        for i, eq in enumerate(equity):
            if eq >= target_equity:
                return i
        
        return None  # Cible non atteinte
