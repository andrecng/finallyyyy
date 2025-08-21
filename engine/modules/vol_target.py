from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Any
import math

@dataclass
class VolTargetParams:
    target_vol: float = 0.01  # vol cible par pas
    halflife: int = 10        # pas EWMA
    eps: float = 1e-12

@dataclass
class VolTargetState:
    var_ewma: float = 0.0
    initialized: bool = False

def _lambda_from_halflife(halflife: int) -> float:
    if halflife <= 1:
        return 0.0
    return math.exp(-math.log(2.0) / float(halflife))

def vol_target_step(state: VolTargetState, p: VolTargetParams) -> Dict[str, Any]:
    # sigma courante (si non init, partir sur target_vol)
    sigma = (state.var_ewma ** 0.5) if state.initialized else p.target_vol
    cap = p.target_vol / max(p.eps, sigma)
    cap = max(0.0, min(1.0, cap))  # cap ∈ [0,1]
    return {"sigma_hat": float(sigma), "cap": float(cap)}

def vol_target_update_after_trade(state: VolTargetState, ret: float, p: VolTargetParams):
    # ret = pnl / equity_avant
    lam = _lambda_from_halflife(p.halflife)
    r2 = float(ret) * float(ret)
    state.var_ewma = lam * state.var_ewma + (1.0 - lam) * r2
    state.initialized = True
