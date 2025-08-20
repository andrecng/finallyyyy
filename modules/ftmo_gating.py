class FTMOGating:
    def __init__(self, dd_total=0.10, dd_daily=0.05):
        self.dd_total, self.dd_daily = dd_total, dd_daily
    
    def step(self, equity_curve_day, equity_curve_total):
        # TODO: compute remaining headroom; return risk cap + gating logs
        return {"risk_eff": 0.0, "logs": {"dd_daily": None, "dd_total": None}}
