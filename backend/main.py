from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

app = FastAPI(title="FondForex API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Preset(BaseModel):
    schema_version: str
    name: Optional[str] = None
    seed: Optional[int] = 0
    total_steps: int
    mu: float
    fees_per_trade: float
    modules: Dict[str, Any]

class Series(BaseModel):
    equity: List[float]

class SimOut(BaseModel):
    max_dd_total: float
    max_dd_daily: float
    violations_daily: int
    violations_total: int
    series: Series
    kpis: Optional[Dict[str, Any]] = None
    diag: Optional[Dict[str, Any]] = None

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/simulate", response_model=SimOut)
def simulate(preset: Preset):
    # TODO: brancher TON moteur ici (ne mets pas les formules Kelly/Bayes)
    # placeholders chiffrés pour la démo I/O :
    series = [1.0 + 0.0005*i for i in range(max(2, preset.total_steps or 200))]
    
    out = SimOut(
        max_dd_total=0.12,
        max_dd_daily=0.01,
        violations_daily=0,
        violations_total=0,
        series=Series(equity=series),
        kpis={
            "cagr": 0.22, "vol_realized": 0.18, "sharpe": 1.1,
            "sortino": 1.6, "profit_factor": 1.35, "win_rate": 0.54,
            "best_day_return": 0.031, "worst_day_return": -0.024,
            "target_profit": 0.10, "max_days": 30, "days_to_target": 18, "target_pass": True,
            "max_consecutive_losses": 4, "recovery_days_maxdd": 12
        },
        diag={
            "vt_realized_vol": 0.19, "vt_target_vol_echo": 0.20,
            "cppi_freeze_events": 3, "time_frozen_steps": 27,
            "kelly_cap_hits": 12, "softbarrier_level_hits": [5,3,1],
            "ftmo_gate_events": 2, "no_upsize_after_loss": True, "risk_final_is_min": True,
            "cushion_breaches": 3
        }
    )
    return out

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
