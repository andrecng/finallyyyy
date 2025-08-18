from typing import Dict, Any

class Bayes:
    def __init__(self, params: Dict[str, Any]):
        self.id = "bayes"
        self.enabled = params.get("enabled", True)
        self.params = params

    def apply(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        # Ne PAS exposer de formule bayésienne/kelly.
        # Mapping monotone simple à partir d'un "p" (postérieur estimé ailleurs).
        p = float(self.params.get("p", 0.5))      # 0.5 neutre si inconnu
        k = float(self.params.get("k", 1.0))      # pente douce
        cap = float(self.params.get("cap", 0.02)) # cap de sécurité 2%

        edge = max(0.0, p - 0.5)                  # uniquement la partie > 0.5
        risk = min(cap, k * edge)                 # borné, linéaire (placeholder sûr)
        risk = max(0.0, min(1.0, risk))
        return {"risk_proposal": risk, "notes": {"p": p, "k": k, "cap": cap}}
