from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class CPPIParams:
  alpha: float = 0.10
  freeze_frac: float = 0.05

@dataclass
class CPPIState:
  hwm: float = 1.0

def cppi_step(equity: float, state: CPPIState, p: CPPIParams) -> Dict[str, Any]:
  state.hwm = max(state.hwm, equity)
  floor = state.hwm * (1.0 - p.alpha)
  cushion = equity - floor
  freeze = cushion < (p.freeze_frac * state.hwm)
  cap_mult = max(0.0, min(1.0, cushion / max(1e-12, state.hwm)))
  return {"floor": floor, "cushion": cushion, "freeze": freeze, "cap_mult": cap_mult}
