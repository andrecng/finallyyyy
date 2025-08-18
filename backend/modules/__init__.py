from typing import Protocol, Dict, Any

class Module(Protocol):
    id: str
    enabled: bool
    params: Dict[str, Any]
    def apply(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        ctx fields (garanti par l'orchestrateur):
          - t: int (horodatage uniforme)
          - equity: float
          - hwm: float
          - dd_pct: float  (drawdown courant en % vs HWM)
          - cushion_pct: float (% au-dessus du floor CPPI)
          - risk_limits: dict
          - gating: dict
          - last_pnl: float
        Retour attendu: {"risk_proposal": float in [0,1], "notes": {...}, "freeze": bool?}
        """
        ...
