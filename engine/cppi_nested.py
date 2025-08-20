from dataclasses import dataclass

@dataclass
class NestedCPPIConfig:
    alpha: float = 0.10
    freeze_floor_pct: float = 0.05
    defreeze_pct: float = 0.08

class NestedCPPI:
    def __init__(self, cfg: NestedCPPIConfig): 
        self.cfg = cfg
    
    def step(self, W, HWM, cushion_in, loss_flag=False):
        # TODO: compute floor = HWM * (1 - alpha)
        # TODO: freeze gating if cushion < freeze_floor_pct
        # TODO: inner CPPI transform on cushion_in (smoothing)
        # Return effective risk bound (no upsize after loss)
        return {"risk_eff": 0.0, "logs": {"floor": None, "freeze": None}}
