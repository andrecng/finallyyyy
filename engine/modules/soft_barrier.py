class SoftBarrier:
    def __init__(self, levels=((-0.03, 0.75), (-0.05, 0.50), (-0.08, 0.25))):
        # levels: (DD seuil, multiplicateur max sur risk) ex: -3% => x0.75
        self.levels = sorted(levels)  # DD croissant (plus négatif)
        self.hwm = None

    def step(self, equity):
        if self.hwm is None: 
            self.hwm = equity
        self.hwm = max(self.hwm, equity)
        dd = (equity - self.hwm) / self.hwm  # <=0
        cap = 1.0
        for thr, mult in self.levels:
            if dd <= thr: 
                cap = min(cap, mult)
        return {"risk_eff": cap, "logs": {"dd": dd, "cap": cap}}
