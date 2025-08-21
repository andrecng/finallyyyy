"""
Simulateur unifié - Toute la logique du moteur dans un seul fichier
FTMO + CPPI + VolTarget + SoftBarrier + Pipeline
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Any, List, Tuple
import math
import random

# ============================================================================
# FTMOGate - Gestion des limites FTMO
# ============================================================================

@dataclass
class FTMOGateParams:
    daily_limit: float = 0.02      # fraction max de perte par jour
    total_limit: float = 0.10      # fraction max de perte totale
    spend_rate: float = 0.33       # pacing du budget journalier
    lmax: float = 0.02             # cap d'exposition par pas
    steps_per_day: int = 1         # nb de pas par jour
    freeze_after_loss: bool = True # pas d'upsize après perte
    target_pct: float = 0.10       # cible de profit
    max_days: int = 30             # nb max de jours autorisés

@dataclass
class FTMOGateState:
    day_idx: int = 0
    step_in_day: int = 0
    equity_init: float = 1.0
    remaining_daily_budget: float = 0.0
    prev_risk: float = 0.0
    last_pnl: float = 0.0
    day_start_equity: float = 1.0
    daily_breaches: int = 0
    total_breaches: int = 0
    target_hit: bool = False
    days_used: int = 0

def start_day(state: FTMOGateState, equity: float, p: FTMOGateParams):
    state.remaining_daily_budget = max(0.0, p.daily_limit * equity)
    state.step_in_day = 0
    state.day_start_equity = equity

def _check_daily_breach(equity: float, state: FTMOGateState, p: FTMOGateParams) -> bool:
    threshold = state.day_start_equity * (1.0 - p.daily_limit)
    return equity < threshold

def _check_total_breach(equity: float, state: FTMOGateState, p: FTMOGateParams) -> bool:
    threshold = state.equity_init * (1.0 - p.total_limit)
    return equity < threshold

def _check_target_hit(equity: float, state: FTMOGateState, p: FTMOGateParams) -> bool:
    threshold = state.equity_init * (1.0 + p.target_pct)
    return equity >= threshold

def ftmo_gate_step(
    desired_risk: float,
    equity: float,
    state: FTMOGateState,
    p: FTMOGateParams
) -> Tuple[float, Dict[str, Any]]:
    # Cap dur total
    if _check_total_breach(equity, state, p):
        state.total_breaches = max(state.total_breaches, 1)
        return 0.0, {"gate": "FTMO", "reason": "total_limit_reached", "risk": 0.0, "day_idx": state.day_idx}

    # Cap d'exposition
    capped = min(desired_risk, p.lmax)
    
    # Pacing : fraction du budget journalier
    day_allow = p.spend_rate * max(0.0, state.remaining_daily_budget)
    risk_before_loss_rule = min(capped, day_allow)

    # No upsize after loss
    if p.freeze_after_loss and state.last_pnl < 0 and risk_before_loss_rule > state.prev_risk:
        risk_final = state.prev_risk
        reason = "no_upsize_after_loss"
    else:
        risk_final = risk_before_loss_rule
        reason = "ok"

    # Réserve budget jour
    state.remaining_daily_budget = max(0.0, state.remaining_daily_budget - abs(risk_final))
    state.prev_risk = risk_final

    # Avancement pas/jour
    state.step_in_day += 1
    rolled = False
    if state.step_in_day >= p.steps_per_day:
        state.days_used = state.day_idx + 1
        state.day_idx += 1
        state.step_in_day = 0
        start_day(state, equity, p)
        rolled = True

    log = {
        "gate": "FTMO",
        "reason": reason,
        "risk": risk_final,
        "day_idx": state.day_idx,
        "remain_day": state.remaining_daily_budget,
        "rolled_day": rolled
    }
    return risk_final, log

def ftmo_update_after_trade(state: FTMOGateState, pnl: float, equity: float, p: FTMOGateParams):
    state.last_pnl = pnl
    if _check_daily_breach(equity, state, p):
        state.daily_breaches = max(state.daily_breaches, 1)
    if _check_total_breach(equity, state, p):
        state.total_breaches = max(state.total_breaches, 1)
    if _check_target_hit(equity, state, p):
        state.target_hit = True

# ============================================================================
# CPPI - Constant Proportion Portfolio Insurance
# ============================================================================

@dataclass
class CPPIParams:
    alpha: float = 0.10        # drawdown autorisé
    freeze_frac: float = 0.05  # seuil de freeze

@dataclass
class CPPIState:
    hwm: float = 1.0          # High Water Mark

def cppi_step(equity: float, state: CPPIState, p: CPPIParams) -> Dict[str, Any]:
    state.hwm = max(state.hwm, equity)
    floor = state.hwm * (1.0 - p.alpha)
    cushion = equity - floor
    freeze = cushion < (p.freeze_frac * state.hwm)
    cap_mult = max(0.0, min(1.0, cushion / max(1e-12, state.hwm)))
    return {"floor": floor, "cushion": cushion, "freeze": freeze, "cap_mult": cap_mult}

# ============================================================================
# VolTarget - Volatility Targeting
# ============================================================================

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
    sigma = (state.var_ewma ** 0.5) if state.initialized else p.target_vol
    cap = p.target_vol / max(p.eps, sigma)
    cap = max(0.0, min(1.0, cap))
    return {"sigma_hat": float(sigma), "cap": float(cap)}

def vol_target_update_after_trade(state: VolTargetState, ret: float, p: VolTargetParams):
    lam = _lambda_from_halflife(p.halflife)
    r2 = float(ret) * float(ret)
    state.var_ewma = lam * state.var_ewma + (1.0 - lam) * r2
    state.initialized = True

# ============================================================================
# SoftBarrier - Barrière souple basée sur drawdown
# ============================================================================

@dataclass
class SoftBarrierParams:
    levels: List[Tuple[float, float]] = field(default_factory=lambda: [
        (0.00, 1.00),  # 0% DD → 100% risk
        (0.05, 0.75),  # 5% DD → 75% risk
        (0.10, 0.50),  # 10% DD → 50% risk
        (0.15, 0.25),  # 15% DD → 25% risk
        (0.20, 0.00),  # 20% DD → 0% risk
    ])

def soft_barrier_step(equity: float, hwm: float, p: SoftBarrierParams) -> Dict[str, Any]:
    if hwm <= 0.0:
        dd = 0.0
    else:
        dd = max(0.0, (hwm - equity) / hwm)

    lv = sorted(p.levels, key=lambda x: x[0])
    if dd <= lv[0][0]:
        mult = lv[0][1]
    else:
        mult = lv[-1][1]
        for (a, ma), (b, mb) in zip(lv, lv[1:]):
            if a <= dd <= b:
                t = 0.0 if b == a else (dd - a) / (b - a)
                mult = ma + (mb - ma) * t
                break

    mult = max(0.0, min(1.0, mult))
    return {"dd": float(dd), "mult": float(mult)}

# ============================================================================
# Pipeline - Orchestrateur principal
# ============================================================================

def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

@dataclass
class EngineParams:
    desired_risk: float = 0.01
    cppi: CPPIParams = field(default_factory=CPPIParams)
    vt: VolTargetParams = field(default_factory=VolTargetParams)
    sb: SoftBarrierParams = field(default_factory=SoftBarrierParams)
    ftmo: FTMOGateParams = field(default_factory=FTMOGateParams)

@dataclass
class EngineState:
    equity: float = 1.0
    equity0: float = 1.0
    prev_risk: float = 0.0
    cppi: CPPIState = field(default_factory=CPPIState)
    vt: VolTargetState = field(default_factory=VolTargetState)
    ftmo: FTMOGateState = field(default_factory=FTMOGateState)

def run_step(state: EngineState, p: EngineParams) -> Tuple[float, Dict[str, Any]]:
    logs: List[Dict[str, Any]] = []

    # Modules "cap"
    cppi = cppi_step(state.equity, state.cppi, p.cppi)
    logs.append({"module": "CPPI", "data": cppi})
    
    vt = vol_target_step(state.vt, p.vt)
    logs.append({"module": "VolTarget", "data": vt})
    
    sb = soft_barrier_step(state.equity, state.cppi.hwm, p.sb)
    logs.append({"module": "SoftBarrier", "data": sb})

    # FTMO gate (absolu)
    risk_ftmo, log_ftmo = ftmo_gate_step(p.desired_risk, state.equity, state.ftmo, p.ftmo)
    logs.append(log_ftmo)

    # Agrégateur min() sur les candidats
    candidates = [
        risk_ftmo,
        p.desired_risk * cppi["cap_mult"],
        p.desired_risk * vt["cap"],
        p.desired_risk * sb["mult"],
    ]
    raw = min(candidates)

    # Invariants
    final = raw
    if state.ftmo.last_pnl < 0 and final > state.prev_risk:
        final = state.prev_risk  # no upsize after loss
    final = clamp(final, 0.0, p.ftmo.lmax)

    return final, {"modules": logs, "risk_raw": raw, "risk_final": final}

def apply_pnl(state: EngineState, risk: float, pnl: float, p: EngineParams):
    equity_before = state.equity
    ret = pnl / max(1e-12, equity_before)
    
    # mise à jour equity
    state.equity = max(1e-12, equity_before + pnl)
    
    # notifier les modules
    vol_target_update_after_trade(state.vt, ret, p.vt)
    ftmo_update_after_trade(state.ftmo, pnl, state.equity, p.ftmo)
    
    # garder dernière taille
    state.prev_risk = risk

# ============================================================================
# Simulation - Boucle principale
# ============================================================================

def run_simulation(params: Dict[str, Any]) -> Dict[str, Any]:
    """Simulation complète avec tous les modules"""
    
    # Paramètres par défaut
    p = EngineParams()
    p.desired_risk = float(params.get("desired_risk", 0.01))
    
    # CPPI
    p.cppi.alpha = float(params.get("cppi_alpha", 0.10))
    p.cppi.freeze_frac = float(params.get("cppi_freeze_frac", 0.05))
    
    # VolTarget
    p.vt.target_vol = float(params.get("vt_target_vol", 0.010))
    p.vt.halflife = int(params.get("vt_halflife", 10))
    
    # FTMO
    p.ftmo.daily_limit = float(params.get("daily_limit", 0.02))
    p.ftmo.total_limit = float(params.get("total_limit", 0.10))
    p.ftmo.spend_rate = float(params.get("spend_rate", 0.33))
    p.ftmo.lmax = float(params.get("lmax", 0.02))
    p.ftmo.steps_per_day = int(params.get("steps_per_day", 1))
    p.ftmo.freeze_after_loss = bool(params.get("freeze_after_loss", True))
    p.ftmo.target_pct = float(params.get("target_pct", 0.10))
    p.ftmo.max_days = int(params.get("max_days", 30))
    
    # État initial
    state = EngineState(equity=1.0, equity0=1.0)
    start_day(state.ftmo, state.equity, p.ftmo)
    
    # Simulation
    total_steps = int(params.get("total_steps", 200))
    mu = float(params.get("mu", 0.0))
    
    series = [{"t": 0, "eq": state.equity}]
    logs: List[Dict[str, Any]] = []
    max_eq = state.equity
    max_dd = 0.0
    
    for t in range(1, total_steps + 1):
        risk, step_log = run_step(state, p)
        logs.append(step_log)
        
        pnl = random.gauss(mu, max(1e-9, risk))
        apply_pnl(state, risk, pnl, p)
        
        max_eq = max(max_eq, state.equity)
        dd = (max_eq - state.equity) / max_eq if max_eq > 0 else 0.0
        max_dd = max(max_dd, dd)
        series.append({"t": t, "eq": state.equity})
        
        # Conditions d'arrêt
        if state.ftmo.target_hit or state.ftmo.total_breaches > 0:
            break
        if state.ftmo.days_used >= p.ftmo.max_days:
            break
    
    # KPIs
    kpis = {
        "max_dd": round(max_dd, 6),
        "pass_ftmo": (state.ftmo.target_hit and state.ftmo.daily_breaches == 0
                      and state.ftmo.total_breaches == 0 and state.ftmo.days_used <= p.ftmo.max_days),
        "ftmo": {
            "daily_breaches": state.ftmo.daily_breaches,
            "total_breaches": state.ftmo.total_breaches,
            "target_hit": state.ftmo.target_hit,
            "days_used": state.ftmo.days_used
        }
    }
    
    return {"series": series, "kpis": kpis, "logs": logs}
