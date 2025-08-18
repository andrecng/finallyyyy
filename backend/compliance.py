from typing import List, Dict, Any

class Compliance:
    def __init__(self, rules: Dict[str, Any]):
        self.rules = rules

    def check_daily_dd(self, eq: List[float]) -> List[Dict[str, Any]]:
        # TODO: détecter dépassements daily drawdown
        return []

    def check_max_dd(self, eq: List[float]) -> List[Dict[str, Any]]:
        # TODO: détecter dépassements max drawdown
        return []

    def run_all(self, series: Dict[str, Any]) -> Dict[str, Any]:
        violations = []
        violations += self.check_daily_dd(series.get("equity_curve", []))
        violations += self.check_max_dd(series.get("equity_curve", []))
        return {"violations": violations}
