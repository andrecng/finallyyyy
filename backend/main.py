from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, List
import random

from engine.pipeline import EngineParams, EngineState, run_step, apply_pnl
from engine.ftmo_gate import start_day

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
    desired_risk = float(inp.params.get("desired_risk", 0.01))
    total_steps  = int(inp.params.get("total_steps", 200))

    p = EngineParams()
    p.desired_risk = desired_risk
    # CPPI
    p.cppi.alpha = float(inp.params.get("cppi_alpha", 0.10))
    p.cppi.freeze_frac = float(inp.params.get("cppi_freeze_frac", 0.05))
    # VolTarget (optionnel)
    p.vt.target_vol = float(inp.params.get("vt_target_vol", p.vt.target_vol))
    p.vt.halflife   = int(inp.params.get("vt_halflife",   p.vt.halflife))
    # FTMO
    p.ftmo.daily_limit = float(inp.params.get("daily_limit", 0.02))
    p.ftmo.total_limit = float(inp.params.get("total_limit", 0.10))
    p.ftmo.spend_rate = float(inp.params.get("spend_rate", 0.33))
    p.ftmo.lmax = float(inp.params.get("lmax", 0.02))
    p.ftmo.steps_per_day = int(inp.params.get("steps_per_day", 1))
    p.ftmo.freeze_after_loss = bool(inp.params.get("freeze_after_loss", True))
    p.ftmo.target_pct = float(inp.params.get("target_pct", 0.10))
    p.ftmo.max_days = int(inp.params.get("max_days", 30))

    state = EngineState(equity=1.0, equity0=1.0)
    start_day(state.ftmo, state.equity, p.ftmo)

    series = [{"t": 0, "eq": state.equity}]
    logs: List[Dict[str, Any]] = []
    max_eq = state.equity
    max_dd = 0.0

    mu = float(inp.params.get("mu", 0.0))  # drift pour tests
    for t in range(1, total_steps + 1):
        risk, step_log = run_step(state, p)
        logs.append(step_log)
        pnl = random.gauss(mu, max(1e-9, risk))
        apply_pnl(state, risk, pnl, p)

        max_eq = max(max_eq, state.equity)
        dd = (max_eq - state.equity) / max_eq if max_eq > 0 else 0.0
        max_dd = max(max_dd, dd)
        series.append({"t": t, "eq": state.equity})

        if state.ftmo.target_hit or state.ftmo.total_breaches > 0: break
        if state.ftmo.days_used >= p.ftmo.max_days: break

    kpis = {
        "max_dd": round(max_dd, 6),
        "pass_ftmo": (state.ftmo.target_hit and state.ftmo.daily_breaches == 0
                      and state.ftmo.total_breaches == 0 and state.ftmo.days_used <= p.ftmo.max_days),
        "ftmo": {
            "daily_breaches": state.ftmo.daily_breaches,
            "total_breaches": state.ftmo.total_breaches,
            "target_hit": state.ftmo.target_hit,
            "days_used": state.ftmo.days_used
        }
    }
    return {"series": series, "kpis": kpis, "logs": logs}
