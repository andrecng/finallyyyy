"""
Module principal du moteur de trading.
Contient les fonctions essentielles pour l'exécution des stratégies.
"""

import numpy as np
from typing import Dict, List, Any, Optional


def run_strategy(
    trades: List[float],
    initial_capital: float = 10000.0,
    mu: float = 0.0001,
    sigma: float = 0.01,
    fees_per_trade: float = 0.0,
    modules: Optional[Dict[str, Any]] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Exécute une stratégie de trading sur une série de trades.

    Args:
        trades: Liste des rendements des trades (en décimal)
        initial_capital: Capital initial
        mu: Espérance de rendement moyen par pas de temps
        sigma: Volatilité (écart-type) par pas de temps
        fees_per_trade: Frais par trade en pourcentage
        modules: Dictionnaire des modules de gestion des risques à appliquer
        **kwargs: Paramètres additionnels

    Returns:
        Dict contenant l'historique du capital et les métriques de performance
    """
    if modules is None:
        modules = {}

    # Conversion des trades en array numpy
    trades = np.array(trades)
    n_steps = len(trades)

    # Initialisation de l'historique du capital
    capital_history = np.zeros(n_steps + 1)
    capital_history[0] = initial_capital

    # Allocation initiale (100% par défaut)
    allocation = 1.0

    # Calcul de l'évolution du capital pour chaque pas de temps
    for i in range(n_steps):
        # Appliquer les modules de gestion des risques pour ajuster l'allocation
        if "cppi_freeze" in modules and modules["cppi_freeze"]["enabled"]:
            # Exemple d'implémentation de CPPI avec gel
            cppi = modules["cppi_freeze"]
            floor_pct = cppi.get("floor", 0.8)
            floor = capital_history[i] * floor_pct
            cushion = max(0, capital_history[i] - floor)
            multiplier = cppi.get("multiplier", 3.0)
            allocation = min(1.0, multiplier * cushion / capital_history[i])

        if "volatility_target" in modules and modules["volatility_target"]["enabled"]:
            # Exemple d'implémentation de ciblage de volatilité
            vt = modules["volatility_target"]
            target_vol = vt.get("target", 0.1)
            lookback = min(i, vt.get("lookback", 20))
            if lookback > 0:
                realized_vol = np.std(trades[max(0, i-lookback):i]) * np.sqrt(252)
                vol_ratio = target_vol / max(realized_vol, 1e-6)
                allocation = min(vt.get("max_alloc", 2.0), allocation * vol_ratio)

        if "kelly_cap" in modules and modules["kelly_cap"]["enabled"]:
            # Exemple d'implémentation de Kelly Cap
            kc = modules["kelly_cap"]
            max_alloc = kc.get("max_alloc", 1.0)
            allocation = min(allocation, max_alloc)

        # Calcul du rendement après prise en compte de l'allocation
        trade_return = trades[i] * allocation

        # Application des frais de transaction
        if fees_per_trade > 0 and allocation > 0:
            fees = capital_history[i] * allocation * fees_per_trade
            trade_return -= fees / (capital_history[i] * allocation)

        # Mise à jour du capital
        capital_history[i+1] = capital_history[i] * (1 + trade_return)

    # Calcul des métriques de performance
    equity = capital_history[1:]  # Exclure le capital initial
    returns = np.diff(capital_history) / capital_history[:-1]

    # Calcul du max drawdown
    peak = np.maximum.accumulate(capital_history)
    drawdown = (capital_history - peak) / peak
    max_dd = abs(np.min(drawdown))

    # Calcul du max drawdown quotidien
    daily_returns = returns  # Pour simplifier, on considère chaque trade comme "quotidien"
    daily_drawdowns = np.minimum(daily_returns, 0)
    max_daily_dd = abs(np.min(daily_drawdowns)) if len(daily_drawdowns) > 0 else 0

    # Comptage des violations
    violations_daily = np.sum(daily_drawdowns < -0.05)  # Violation si perte quotidienne > 5%
    violations_total = 1 if max_dd > 0.2 else 0  # Violation si DD total > 20%

    return {
        "capital_history": capital_history.tolist(),
        "max_dd_total": float(max_dd),
        "max_dd_daily": float(max_daily_dd),
        "violations_daily": int(violations_daily),
        "violations_total": int(violations_total),
        "final_capital": float(capital_history[-1]),
        "total_return": float((capital_history[-1] / initial_capital) - 1),
        "sharpe": float(np.mean(returns) / np.std(returns) * np.sqrt(252)) if len(returns) > 1 else 0,
    }
