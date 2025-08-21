from typing import List, Dict, Any, Tuple
import numpy as np

def generate_returns(horizon: int, seed: int, mu: float = 0.0, sigma: float = 0.01) -> np.ndarray:
    rng = np.random.default_rng(int(seed))
    return rng.normal(mu, sigma, size=horizon)

def dd_series(equity: List[float]) -> List[float]:
    dd = []
    peak = -1e18
    for x in equity:
        peak = max(peak, x)
        d = 0.0 if peak <= 0 else 100.0 * (1.0 - (x / peak))
        dd.append(max(0.0, d))
    return dd

def max_drawdown(equity: List[float]) -> float:
    return max(dd_series(equity)) if equity else 0.0

def cagr_naive(e0: float, eT: float, horizon: int) -> float:
    if e0 <= 0 or eT <= 0 or horizon <= 0:
        return 0.0
    # Annualisation naïve non temporelle; à raffiner si nécessaire.
    return (eT / e0) ** (1.0 / max(1, horizon)) - 1.0

def es95(returns: List[float]) -> float:
    if not returns:
        return 0.0
    arr = np.array(returns, dtype=float)
    q = np.percentile(arr, 5.0)
    tail = arr[arr <= q]
    return float(tail.mean()) if tail.size else 0.0

def compliance_violations(equity: List[float], rules: Dict[str, Any]) -> List[Dict[str, Any]]:
    viol = []
    max_dd_rule = float(rules.get("max_dd", 0.0))  # %
    daily_dd_rule = float(rules.get("daily_dd", 0.0))  # %
    # Max DD versus HWM
    dd = dd_series(equity)
    for t, d in enumerate(dd):
        if d > max_dd_rule:
            viol.append({"rule": "max_dd", "t": t, "value": d})
    # "Daily" DD approximation: variation step-to-step
    for t in range(1, len(equity)):
        drop = 100.0 * (1.0 - (equity[t] / equity[t-1])) if equity[t-1] > 0 else 0.0
        if drop > daily_dd_rule:
            viol.append({"rule": "daily_dd", "t": t, "value": drop})
    return viol
