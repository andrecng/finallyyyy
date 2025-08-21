from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Any, Tuple

@dataclass
class FTMOGateParams:
    daily_limit: float = 0.02      # ex: 2% du capital courant (paramétrable)
    total_limit: float = 0.10      # ex: 10% du capital initial (paramétrable)
    spend_rate: float = 0.33       # fraction du budget journalier consommable par pas
    lmax: float = 0.02             # cap d'exposition par pas (ex: 2% risk)
    steps_per_day: int = 1         # pas par jour (adapter selon ta simu)
    freeze_after_loss: bool = True # interdit d'augmenter après une perte

@dataclass
class FTMOGateState:
    day_idx: int = 0
    step_in_day: int = 0
    equity_init: float = 1.0
    remaining_daily_budget: float = 0.0
    prev_risk: float = 0.0
    last_pnl: float = 0.0
    cum_total_dd: float = 0.0      # drawdown cumulé depuis equity_init (approx)

def start_day(state: FTMOGateState, equity: float, p: FTMOGateParams):
    state.remaining_daily_budget = max(0.0, p.daily_limit * equity)
    state.step_in_day = 0

def ftmo_gate_step(
    desired_risk: float,
    equity: float,
    state: FTMOGateState,
    p: FTMOGateParams
) -> Tuple[float, Dict[str, Any]]:
    """
    desired_risk : taille demandée par les autres modules (en fraction d'equity, ex 0.01)
    Retourne (risk_final, log)
    """
    # Reset de la journée si besoin
    if state.step_in_day == 0 and state.remaining_daily_budget <= 0.0:
        start_day(state, equity, p)

    # Budget total hard cap (approx via drawdown cumulé)
    # (Tu peux remplacer par un suivi exact du max HWM si besoin)
    if state.cum_total_dd >= p.total_limit:
        return 0.0, {"gate": "FTMO", "reason": "total_limit_reached"}

    # Cap d'exposition
    capped = min(desired_risk, p.lmax)

    # Pacing : on ne consomme qu'une fraction du budget jour par pas
    day_allow = p.spend_rate * max(0.0, state.remaining_daily_budget)

    risk_before_loss_rule = min(capped, day_allow)

    # No upsize after loss : si la dernière pnl < 0, ne pas augmenter
    if p.freeze_after_loss and state.last_pnl < 0 and risk_before_loss_rule > state.prev_risk:
        risk_final = state.prev_risk
        reason = "no_upsize_after_loss"
    else:
        risk_final = risk_before_loss_rule
        reason = "ok"

    # Réserve le budget (consommation bornée par le risk_final)
    state.remaining_daily_budget = max(0.0, state.remaining_daily_budget - abs(risk_final))

    state.step_in_day += 1
    if state.step_in_day >= p.steps_per_day:
        # nouvelle journée au prochain pas
        state.day_idx += 1
        state.step_in_day = 0
        start_day(state, equity, p)

    state.prev_risk = risk_final

    return risk_final, {"gate": "FTMO", "reason": reason, "risk": risk_final, "day_idx": state.day_idx,
                        "remain_day": state.remaining_daily_budget}

def ftmo_update_after_trade(state: FTMOGateState, pnl: float, equity_init: float):
    state.last_pnl = pnl
    # approx DD cumulé (remplacer par tracking HWM si tu préfères)
    if pnl < 0:
        state.cum_total_dd += abs(pnl) / max(1e-12, equity_init)
