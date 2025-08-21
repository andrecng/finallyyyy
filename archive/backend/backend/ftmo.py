from typing import Dict, Any, List, Tuple
import math
from backend.orchestrator import PositionSizer
from backend.modules.vol_target import VolTarget
from backend.modules.cppi import CPPI
from backend.modules.drawdown_manager import DrawdownManager
from backend.modules.bayes import Bayes
from backend.utils import compliance_violations

# --------- Helpers

def _build_modules(mod_cfgs: List[Dict[str, Any]]):
    ms = []
    for m in mod_cfgs or []:
        if not m.get("enabled", True):
            continue
        mid = m.get("id")
        params = dict(m.get("params", {}))
        params["enabled"] = True
        if mid in ("vol_target", "VolatilityTarget"):
            ms.append(VolTarget(params))
        elif mid in ("cppi", "CPPIFreeze"):
            ms.append(CPPI(params))
        elif mid in ("drawdown_manager", "DrawdownManager"):
            ms.append(DrawdownManager(params))
        elif mid in ("bayes", "Bayes"):
            ms.append(Bayes(params))
        else:
            continue
    return ms

def _wilson_ci(k: int, n: int, z: float = 1.96) -> Tuple[float, float]:
    if n <= 0:
        return (0.0, 0.0)
    p = k / n
    denom = 1 + z*z/n
    centre = p + z*z/(2*n)
    half = z * math.sqrt((p*(1-p) + z*z/(4*n)) / n)
    low = max(0.0, (centre - half) / denom)
    high = min(1.0, (centre + half) / denom)
    return (low, high)

# --------- Core evaluation

def evaluate_pass(equity_curve: List[float], e0: float, rules: Dict[str, Any]) -> Dict[str, Any]:
    """
    Conditions d'un 'pass' typé FTMO-like (simplifiées & paramétrables):
      - Aucune violation: max drawdown & daily drawdown (selon rules)
      - Profit target atteint à l'horizon (ou avant) : (E_T - E0) / E0 >= profit_target_pct/100
      - (optionnel) min_trading_steps satisfaits si fourni
    """
    profit_target_pct = float(rules.get("profit_target_pct", 10.0))
    min_trading_steps = int(rules.get("min_trading_steps", 0))
    time_limit_steps = int(rules.get("time_limit_steps", len(equity_curve)-1))

    # Vérif horizon
    T = min(time_limit_steps, max(0, len(equity_curve)-1))
    eq = equity_curve[: T+1] if equity_curve else []

    # Violations (utilise la même logique que /simulate, mais avec rules FTMO)
    rl = {
        "max_dd": float(rules.get("max_total_dd_pct", 10.0)),
        "daily_dd": float(rules.get("max_daily_dd_pct", 5.0)),
    }
    viol = compliance_violations(eq, rl)

    # Profit target à l'horizon T
    passed_target = False
    if eq:
        gain_pct = 100.0 * (eq[-1]/e0 - 1.0) if e0 > 0 else -1e9
        passed_target = (gain_pct >= profit_target_pct)

    # Min trading steps
    enough_steps = (T >= min_trading_steps)

    passed = (len(viol) == 0) and passed_target and enough_steps
    return {"passed": passed, "violations": viol, "T": T, "gain_pct": gain_pct if eq else 0.0}

def run_single_challenge(preset: Dict[str, Any], horizon: int, seed: int, market_model: Dict[str, Any], rules: Dict[str, Any]) -> Dict[str, Any]:
    modules = _build_modules(preset.get("modules", []))
    engine = PositionSizer(preset, modules)
    res = engine.run_single(horizon, int(seed), market_model)
    e0 = float(preset.get("capital_initial", 100000.0))
    evalr = evaluate_pass(res["series"]["equity_curve"], e0, rules)
    return {
        "passed": evalr["passed"],
        "kpis": res["kpis"],
        "series": res["series"],
        "logs": res["logs"],
        "violations": evalr["violations"],
        "T": evalr["T"],
        "gain_pct": evalr["gain_pct"]
    }

def estimate_multi(preset: Dict[str, Any], horizon: int, base_seed: int, market_model: Dict[str, Any],
                   rules: Dict[str, Any], parallel: int, trials: int) -> Dict[str, Any]:
    """
    Pour chaque essai (trial), lance 'parallel' challenges indépendants (seeds distincts).
    Retourne l'estimation de P(≥1 succès) avec intervalle de confiance 95% (Wilson).
    """
    success_trials = 0
    all_success = 0
    none_success = 0
    example = None

    for j in range(trials):
        passed_any = False
        passed_all = True
        for i in range(parallel):
            seed = int(base_seed + j*parallel + i)
            out = run_single_challenge(preset, horizon, seed, market_model, rules)
            if example is None:
                example = out
            passed_any = passed_any or out["passed"]
            passed_all = passed_all and out["passed"]
        success_trials += 1 if passed_any else 0
        all_success   += 1 if passed_all else 0
        none_success  += 1 if (not passed_any) else 0

    p_any = success_trials / trials if trials > 0 else 0.0
    lo, hi = _wilson_ci(success_trials, trials, 1.96)
    return {
        "estimate": {"p_any": p_any, "p_all": all_success / trials if trials > 0 else 0.0,
                     "p_none": none_success / trials if trials > 0 else 0.0,
                     "ci95": [lo, hi], "trials": trials, "parallel": parallel},
        "example": example
    }
