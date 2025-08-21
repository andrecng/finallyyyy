from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Any, List, Tuple
from engine.modules.cppi import CPPIParams, CPPIState, cppi_step
from engine.ftmo_gate import FTMOGateParams, FTMOGateState, ftmo_gate_step, ftmo_update_after_trade, start_day

def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

@dataclass
class EngineParams:
    desired_risk: float = 0.01
    cppi: CPPIParams = CPPIParams()
    ftmo: FTMOGateParams = FTMOGateParams()

@dataclass
class EngineState:
    equity: float = 1.0
    equity0: float = 1.0
    prev_risk: float = 0.0
    cppi: CPPIState = CPPIState()
    ftmo: FTMOGateState = FTMOGateState()

def run_step(state: EngineState, p: EngineParams) -> Tuple[float, Dict[str, Any]]:
    logs: List[Dict[str, Any]] = []

    # 1) Modules "cap"
    cppi = cppi_step(state.equity, state.cppi, p.cppi); logs.append({"module":"CPPI","data":cppi})
    # FTMO renvoie une taille "gate" (pacing + lmax + budgets)
    ftmo_risk, ftmo_log = ftmo_gate_step(p.desired_risk, state.equity, state.ftmo, p.ftmo); logs.append(ftmo_log)

    # 2) Agrégateur min()
    caps = [ftmo_risk, p.desired_risk * cppi["cap_mult"]]
    raw = min(caps)
    # Invariants
    final = raw
    if state.ftmo.last_pnl < 0 and final > state.prev_risk:
        final = state.prev_risk  # no upsize after loss
    final = clamp(final, 0.0, p.ftmo.lmax)

    return final, {"modules": logs, "risk_raw": raw, "risk_final": final}

def apply_pnl(state: EngineState, risk: float, pnl: float, p: EngineParams):
    state.equity = max(1e-12, state.equity + pnl)
    # notifier le gate
    ftmo_update_after_trade(state.ftmo, pnl, state.equity, p.ftmo)
    state.prev_risk = risk
