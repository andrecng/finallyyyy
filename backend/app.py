from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.requests import Request
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import os

# ✅ IMPORTS ABSOLUS
from backend.orchestrator import PositionSizer
from backend.modules.vol_target import VolTarget
from backend.modules.cppi import CPPI
from backend.modules.drawdown_manager import DrawdownManager
from backend.modules.bayes import Bayes
from backend.utils import compliance_violations
from backend.logging_jsonl import JsonlLogger
from backend.ftmo import estimate_multi

app = FastAPI(title="MM Engine API")
API_PORT = int(os.getenv("API_PORT", "8001"))

# CORS (front en dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restreins en prod si besoin
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------- MODELS

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

class FtmoRules(BaseModel):
    profit_target_pct: float = 10.0
    max_total_dd_pct: float = 10.0
    max_daily_dd_pct: float = 5.0
    min_trading_steps: int = 0
    time_limit_steps: Optional[int] = None

class FtmoRequest(BaseModel):
    preset: Preset
    market_model: Dict[str, Any]
    horizon: int
    rules: FtmoRules
    parallel: int = 3
    trials: int = 100
    seed: int = 42

# --------- HELPERS

def build_modules(preset: Dict[str, Any]):
    ms = []
    for m in preset.get("modules", []):
        if not m.get("enabled", True):
            continue
        mid = m.get("id")
        params = dict(m.get("params", {}))
        params["enabled"] = True
        if mid in ("vol_target", "VolatilityTarget"):
            ms.append(VolTarget(params))
        elif mid in ("cppi", "CPPIFreeze"):
            ms.append(CPPI(params))
        elif mid in ("drawdown_manager", "DrawdownManager"):
            ms.append(DrawdownManager(params))
        elif mid in ("bayes", "Bayes"):
            ms.append(Bayes(params))
        else:
            # inconnu: ignorer proprement
            continue
    return ms

# --------- ENDPOINTS

@app.post("/simulate")
def simulate(req: SimRequest):
    preset = req.preset.model_dump()
    modules = build_modules(preset)

    logger = JsonlLogger()
    logger.log_run("simulate_start", seeds=req.seeds, horizon=req.horizon, market_model=req.market_model)

    engine = PositionSizer(preset, modules, logger=logger)

    # On exécute tous les seeds; on moyenne les KPIs et on expose les séries/logs du premier
    kpis_acc = []
    first_run = None
    for i, seed in enumerate(req.seeds):
        res = engine.run_single(req.horizon, int(seed), req.market_model)  # ✅ PAS .dict()
        if i == 0:
            first_run = res
        kpis_acc.append(res["kpis"])

    def avg(key: str):
        if not kpis_acc:
            return 0.0
        return sum(x.get(key, 0.0) for x in kpis_acc) / len(kpis_acc)

    series = first_run["series"] if first_run else {"equity_curve": [], "risk_effectif": [], "sizing": []}
    logs = first_run["logs"] if first_run else []

    violations = compliance_violations(series.get("equity_curve", []), preset.get("risk_limits", {}))
    for v in violations:
        logger.log_compliance(v)

    result = {
        "kpis": {
            "CAGR": avg("CAGR"),
            "MaxDD": avg("MaxDD"),
            "ES95": avg("ES95"),
            "ruin_prob": avg("ruin_prob")
        },
        "series": series,
        "logs": logs,
        "compliance": {"violations": violations},
        "run_id": logger.run_id
    }

    logger.log_run("simulate_end", kpis=result["kpis"], violations=len(violations))
    logger.close()
    return result

@app.post("/ftmo_multi")
def ftmo_multi(req: FtmoRequest):
    preset = req.preset.model_dump()
    rules = req.rules.model_dump()
    if rules.get("time_limit_steps") is None:
        rules["time_limit_steps"] = req.horizon

    out = estimate_multi(
        preset=preset,
        horizon=req.horizon,
        base_seed=int(req.seed),
        market_model=req.market_model,   # ✅ PAS .dict()
        rules=rules,
        parallel=int(req.parallel),
        trials=int(req.trials),
    )
    return out

@app.get("/health")
def health():
    return {"ok": True}

# --------- ERROR HANDLERS

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": "validation_error", "detail": exc.errors()},
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # évite de crasher en dev; loggue côté serveur
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "message": str(exc.__class__.__name__)},
    )
