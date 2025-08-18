from typing import Dict, Any

class VolTarget:
    def __init__(self, params: Dict[str, Any]):
        self.id = "vol_target"
        self.enabled = params.get("enabled", True)
        self.params = params

    def apply(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        # Aucune formule sensible: simple mapping monotone vol_target/vol_est
        target = float(self.params.get("target_vol", 0.10))   # ex: 10%
        vol_est = float(self.params.get("vol_est", target))   # défaut = target
        scale = float(self.params.get("scale", 0.10))         # réduit naturellement le risque
        max_risk = float(self.params.get("max_risk", 0.02))   # 2% par défaut

        # Proportionnel, borné, robuste
        proposal = scale * (target / max(vol_est, 1e-8))
        risk = max(0.0, min(max_risk, proposal))
        return {"risk_proposal": risk, "notes": {"target": target, "vol_est": vol_est, "scale": scale}}
