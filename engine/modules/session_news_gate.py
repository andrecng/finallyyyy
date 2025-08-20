from datetime import time

class SessionNewsGate:
    def __init__(self, banned_ranges=((time(22,55), time(23,15)), ), haircut=0.0):
        self.banned = banned_ranges
        self.haircut = haircut  # 0.0 = full block

    def step(self, now_time):
        block = any(a <= now_time <= b for a,b in self.banned)
        eff = self.haircut if not block else 0.0
        return {"risk_eff": eff, "logs": {"blocked": block}}
