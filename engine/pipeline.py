from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Any, List, Tuple

from engine.modules.cppi import CPPIParams, CPPIState, cppi_step
from engine.modules.vol_target import VolTargetParams, VolTargetState, vol_target_step, vol_target_update_after_trade
from engine.modules.soft_barrier import SoftBarrierParams, soft_barrier_step
from engine.ftmo_gate import FTMOGateParams, FTMOGateState, ftmo_gate_step, ftmo_update_after_trade, start_day

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
    cppi = cppi_step(state.equity, state.cppi, p.cppi); logs.append({"module":"CPPI","data":cppi})
    vt = vol_target_step(state.vt, p.vt);              logs.append({"module":"VolTarget","data":vt})
    sb = soft_barrier_step(state.equity, state.cppi.hwm, p.sb); logs.append({"module":"SoftBarrier","data":sb})

    # FTMO gate (absolu)
    risk_ftmo, log_ftmo = ftmo_gate_step(p.desired_risk, state.equity, state.ftmo, p.ftmo); logs.append(log_ftmo)

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
    # ret = pnl / equity_avant
    equity_before = state.equity
    ret = pnl / max(1e-12, equity_before)

    # mise à jour equity
    state.equity = max(1e-12, equity_before + pnl)

    # notifier les modules
    vol_target_update_after_trade(state.vt, ret, p.vt)
    ftmo_update_after_trade(state.ftmo, pnl, state.equity, p.ftmo)

    # garder dernière taille
    state.prev_risk = risk
