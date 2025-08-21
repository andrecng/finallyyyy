from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, List
import random

from engine.ftmo_gate import FTMOGateParams, FTMOGateState, ftmo_gate_step, ftmo_update_after_trade, start_day  # type: ignore

app = FastAPI(title="Fond & FTMO API", version="0.1.0")

class SimInput(BaseModel):
    preset: str | None = None
    modules: List[str] = []
    params: Dict[str, Any] = {}

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.post("/simulate")
def simulate(inp: SimInput):
    # Params par défaut (tu pourras les passer côté front → body.params)
    p = FTMOGateParams(
        daily_limit=float(inp.params.get("daily_limit", 0.02)),
        total_limit=float(inp.params.get("total_limit", 0.10)),
        spend_rate=float(inp.params.get("spend_rate", 0.33)),
        lmax=float(inp.params.get("lmax", 0.02)),
        steps_per_day=int(inp.params.get("steps_per_day", 1)),
        freeze_after_loss=bool(inp.params.get("freeze_after_loss", True)),
    )

    equity0 = 1.0
    equity = equity0
    state = FTMOGateState(equity_init=equity0)
    start_day(state, equity, p)

    series = [{"t": 0, "eq": equity}]
    logs: List[Dict[str, Any]] = []

    max_eq = equity
    max_dd = 0.0

    # Simu ultra simple (20 pas) : desired_risk = 1% par défaut
    for t in range(1, 21):
        desired_risk = float(inp.params.get("desired_risk", 0.01))

        risk_final, log = ftmo_gate_step(desired_risk, equity, state, p)
        logs.append(log)

        # PnL factice ~ N(0, risk_final) (pour illustrer)
        pnl = random.gauss(0.0, risk_final)
        equity = max(1e-9, equity + pnl)

        # update état gate
        ftmo_update_after_trade(state, pnl, equity0)

        # dd
        max_eq = max(max_eq, equity)
        dd = (max_eq - equity) / max_eq if max_eq > 0 else 0.0
        max_dd = max(max_dd, dd)

        series.append({"t": t, "eq": equity})

    kpis = {
        "max_dd": round(max_dd, 6),
        # pass_ftmo: à calculer selon tes vraies règles → placeholder False pour l'instant
        "pass_ftmo": False
    }

    return {"series": series, "kpis": kpis, "logs": logs}
