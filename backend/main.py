from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, List

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
    return {
        "series": [{"t": 0, "eq": 1.0}, {"t": 1, "eq": 1.002}],
        "kpis": {"max_dd": 0.01, "pass_ftmo": False},
        "logs": [{"module": "VolatilityTarget", "msg": "mock"}]
    }
