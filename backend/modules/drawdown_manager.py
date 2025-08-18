from typing import Dict, Any, List

class DrawdownManager:
    def __init__(self, params: Dict[str, Any]):
        self.id = "drawdown_manager"
        self.enabled = params.get("enabled", True)
        self.params = params

    def apply(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        dd_pct = float(ctx.get("dd_pct", 0.0))  # drawdown courant en %
        # Bandes de réduction (placeholder, non sensible) : liste triée [ [seuil_dd%, cap_risk], ... ]
        bands: List[List[float]] = self.params.get("bands", [[5, 0.02], [10, 0.01], [20, 0.0]])
        cap = 1.0
        for th, c in bands:
            if dd_pct >= float(th):
                cap = min(cap, float(c))
        # Ajoute un hard-cap global si fourni
        cap = min(cap, float(self.params.get("cap", 1.0)))
        cap = max(0.0, min(1.0, cap))
        return {"risk_proposal": cap, "notes": {"dd_pct": dd_pct, "bands": bands}}
