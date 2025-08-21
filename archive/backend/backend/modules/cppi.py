from typing import Dict, Any

class CPPI:
    def __init__(self, params: Dict[str, Any]):
        self.id = "cppi"
        self.enabled = params.get("enabled", True)
        self.params = params

    def apply(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        # floor = HWM * (1 - alpha), alpha fourni via risk_limits (pas de formule sensible)
        alpha = float(ctx.get("risk_limits", {}).get("max_dd", 10.0))  # %
        freeze_cushion_pct = float(ctx.get("risk_limits", {}).get("freeze_cushion_pct", 5.0))
        cushion_pct = float(ctx.get("cushion_pct", 0.0))

        # Multiplicateur simple borné (placeholder, non sensible)
        mult = float(self.params.get("multiplier", 1.0))
        cap = float(self.params.get("cap", 0.02))  # cap de sécurité (2%)

        if cushion_pct < freeze_cushion_pct:
            return {"risk_proposal": 0.0, "freeze": True, "notes": {"cushion_pct": cushion_pct, "freeze_cushion_pct": freeze_cushion_pct, "alpha": alpha}}

        # Proportionnel au cushion (robuste et borné)
        prop = (cushion_pct / 100.0) * mult
        risk = max(0.0, min(cap, prop))
        return {"risk_proposal": risk, "notes": {"cushion_pct": cushion_pct, "mult": mult, "cap": cap}}
