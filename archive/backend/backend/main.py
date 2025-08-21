from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List

from backend.simulator import run_simulation, run_mc

app = FastAPI(title="Fond & FTMO API", version="0.1.0")

# Configuration CORS pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimInput(BaseModel):
    preset: str | None = None
    modules: List[str] = []
    params: Dict[str, Any] = {}

class MCInput(BaseModel):
    params: Dict[str, Any] = {}
    n_runs: int = 200
    seed: int = 42
    quantiles: List[float] | None = None  # ex [0.05, 0.5, 0.95]

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.post("/simulate")
def simulate(inp: SimInput):
    """Simulation complète avec tous les modules"""
    try:
        result = run_simulation(inp.params)
        return result
    except Exception as e:
        return {
            "error": str(e),
            "series": [],
            "kpis": {"max_dd": 0.0, "pass_ftmo": False}
        }

@app.post("/mc_simulate")
def mc_simulate(inp: MCInput):
    """Simulation Monte Carlo avec métriques avancées"""
    try:
        qs = tuple(inp.quantiles) if inp.quantiles else (0.05, 0.5, 0.95)
        out = run_mc(inp.params, n_runs=inp.n_runs, seed=inp.seed, quantiles=qs)
        return out
    except Exception as e:
        return {
            "error": str(e),
            "n_runs": 0,
            "pass_pct": 0.0,
            "metrics": {}
        }
