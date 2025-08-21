from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Any, Tuple

@dataclass
class FTMOGateParams:
    daily_limit: float = 0.02      # fraction max de perte par jour (vs equity début de jour)
    total_limit: float = 0.10      # fraction max de perte totale (vs equity_init)
    spend_rate: float = 0.33       # pacing du budget journalier
    lmax: float = 0.02             # cap d'exposition par pas
    steps_per_day: int = 1         # nb de pas par jour (adapter à ta simu)
    freeze_after_loss: bool = True # pas d'upsize après perte
    target_pct: float = 0.10       # cible de profit (ex: 10% phase 1)
    max_days: int = 30             # nb max de jours autorisés

@dataclass
class FTMOGateState:
    day_idx: int = 0
    step_in_day: int = 0
    equity_init: float = 1.0

    # Budget jour courant
    remaining_daily_budget: float = 0.0

    # Suivi des tailles/pertes
    prev_risk: float = 0.0
    last_pnl: float = 0.0

    # Suivi daily/total
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
    # Cap dur total : si déjà breach, on coupe
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
        # Fin d'une journée
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
    # Daily breach check
    if _check_daily_breach(equity, state, p):
        state.daily_breaches = max(state.daily_breaches, 1)
    # Total breach check
    if _check_total_breach(equity, state, p):
        state.total_breaches = max(state.total_breaches, 1)
    # Target hit
    if _check_target_hit(equity, state, p):
        state.target_hit = True
