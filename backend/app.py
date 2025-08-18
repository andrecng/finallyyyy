from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, List
import os

app = FastAPI(title="MM Engine API")
API_PORT = int(os.getenv("API_PORT", "8001"))

class Preset(BaseModel):
    capital_initial: float
    modules: List[Dict[str, Any]]
    gating: Dict[str, Any] = {}
    risk_limits: Dict[str, Any]

class SimRequest(BaseModel):
    preset: Preset
    seeds: List[int]
    horizon: int
    market_model: Dict[str, Any]

@app.post("/simulate")
def simulate(req: SimRequest):
    # TODO:
    # - Orchestrateur séquencé
    # - Respect invariants: no-increase-after-loss, CPPI freeze, risk_final=min(...)
    # - Stabilité numérique CPPI proche du floor
    result = {
        "kpis": {"CAGR": 0.0, "MaxDD": 0.0, "ES95": 0.0, "ruin_prob": 0.0},
        "series": {"equity_curve": [], "risk_effectif": [], "sizing": []},
        "logs": [],
        "compliance": {"violations": []}
    }
    return result

@app.get("/health")
def health():
    return {"ok": True}
