import numpy as np
from typing import Dict, Any, List

def check_daily_dd(intraday_equity: List[float], dd_daily_limit: float) -> Dict[str, Any]:
    # intraday_equity = suite de points au fil de la journée (tick/5min/15min)
    arr = np.asarray(intraday_equity, dtype=float)
    peaks = np.maximum.accumulate(arr)
    dd = (arr - peaks) / peaks  # négatif
    worst_dd = dd.min()
    ok = (abs(worst_dd) <= dd_daily_limit)
    return {"ok": ok, "worst_dd": float(worst_dd), "limit": -dd_daily_limit}
