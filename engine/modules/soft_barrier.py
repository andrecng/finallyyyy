from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Tuple, Dict, Any

@dataclass
class SoftBarrierParams:
    # Liste (DD, mult) en fractions (0.10 = 10% DD)
    levels: List[Tuple[float, float]] = field(default_factory=lambda: [
        (0.00, 1.00),
        (0.05, 0.75),
        (0.10, 0.50),
        (0.15, 0.25),
        (0.20, 0.00),
    ])

def soft_barrier_step(equity: float, hwm: float, p: SoftBarrierParams) -> Dict[str, Any]:
    if hwm <= 0.0:
        dd = 0.0
    else:
        dd = max(0.0, (hwm - equity) / hwm)

    lv = sorted(p.levels, key=lambda x: x[0])
    # Si en-dessous du 1er palier
    if dd <= lv[0][0]:
        mult = lv[0][1]
    else:
        mult = lv[-1][1]  # par défaut: dernier palier
        for (a, ma), (b, mb) in zip(lv, lv[1:]):
            if a <= dd <= b:
                # interpolation linéaire entre ma et mb
                t = 0.0 if b == a else (dd - a) / (b - a)
                mult = ma + (mb - ma) * t
                break

    mult = max(0.0, min(1.0, mult))
    return {"dd": float(dd), "mult": float(mult)}
