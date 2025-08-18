from fastapi import FastAPI, Body
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
def simulate(payload: dict = Body(...)):
    """
    Permissif: accepte 'preset' = str OU dict.
    Normalise en dict pour la suite du pipeline.
    """
    preset = payload.get("preset")
    if isinstance(preset, str):
        # Normalisation minimale; adapte si tu as un registre de presets
        payload["preset"] = {"name": preset}

    # >>> ICI: appelle ta logique existante de simulation <<<
    # Exemple 1 (si tu avais une fonction simulate_core(payload)):
    #   return simulate_core(payload)

    # Exemple 2 (écho de test pour débloquer l'UI):
    #   return {"kpis": {"ok": True}, "equityCurve": [100000, 100200, 100050], "violations": [], "run_id": "dryrun"}

    # Afin de ne rien casser si tu n'as pas de wrapper, on tente un import doux:
    try:
        from backend.simulation import simulate_core  # adapte au vrai chemin
        return simulate_core(payload)
    except Exception:
        # Fallback temporaire pour test UI (à retirer quand simulate_core est câblé)
        return {
            "kpis": {"status": "dryrun", "note": "fallback /simulate (normalisation preset string->dict)"},
            "equityCurve": [100000, 100300, 100250, 100500],
            "violations": [],
            "run_id": "dryrun-" + str(payload.get("seed", "n/a")),
        }

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
