# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import numpy as np
import sys
import os

# Ajouter le dossier tests au path pour importer le moteur
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'tests'))

app = FastAPI()

# ---------- Schémas I/O ----------
class Preset(BaseModel):
    schema_version: str
    name: Optional[str] = None
    seed: Optional[int] = 0
    total_steps: int
    mu: float
    fees_per_trade: float
    modules: Dict[str, Any] = {}

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

# ---------- Health ----------
@app.get("/health")
def health():
    return {"ok": True}

# ---------- Utilitaires KPI ----------
def max_drawdown_total(equity: np.ndarray) -> float:
    """Max drawdown global en décimal (0.12 = 12%)."""
    if equity.size < 2:
        return 0.0
    run_max = np.maximum.accumulate(equity)
    dd = (equity - run_max) / run_max  # <= 0
    return float(-dd.min())  # positif

def max_drawdown_daily(equity: np.ndarray) -> float:
    """
    Max drawdown 'daily' simplifié: pire rendement d'un step (si 1 step = 1 jour).
    Si tes steps ne sont pas journaliers, adapte ici le regroupement par jour.
    """
    if equity.size < 2:
        return 0.0
    rets = np.diff(equity) / equity[:-1]
    worst = float(np.min(rets))
    return float(max(0.0, -worst))  # rendre positif

def read_ftmo_limits(preset: Preset) -> tuple[float, float]:
    """Extrait les limites FTMO depuis le preset (décimales)."""
    gate = preset.modules.get("FTMOGate", {}) if preset.modules else {}
    daily = float(gate.get("daily_limit", 0.02))   # défaut 2%
    total = float(gate.get("total_limit", 0.10))   # défaut 10%
    return daily, total

# ---------- Branche TA vraie simu ici ----------
def run_true_engine(preset: Preset) -> List[float]:
    """
    Appel au vrai moteur de simulation qui se trouve dans tests/
    """
    try:
        # Import du moteur depuis tests/
        from test_freeze_modes import run_strategy
        
        # Conversion du preset en format attendu par le moteur
        preset_dict = preset.dict()
        
        # Extraction des paramètres pour run_strategy
        total_steps = preset_dict.get('total_steps', 200)
        mu = preset_dict.get('mu', 0.0)
        fees = preset_dict.get('fees_per_trade', 0.0002)
        
        # Paramètres des modules
        modules = preset_dict.get('modules', {})
        cppi_config = modules.get('CPPIFreeze', {})
        alpha = cppi_config.get('alpha', 0.10)
        freeze_frac = cppi_config.get('freeze_frac', 0.05)
        
        # Génération des trades (simulation simplifiée)
        # TODO: Remplacer par votre vraie logique de génération de trades
        rng = np.random.default_rng(int(preset_dict.get('seed', 42)))
        trades = rng.normal(mu/252, 0.02, total_steps)  # Vol ~2% par jour
        
        # Appel au moteur
        result = run_strategy(
            trades=trades,
            W0=100_000,  # Capital initial
            alpha=alpha,
            f=0.1,       # Fraction Kelly
            lam=0.5,     # Fractionnement Kelly
            freeze_mode="soft",
            tau=freeze_frac
        )
        
        # Extraction de la série equity
        equity_series = result.get('capital_history', [])
        
        # Normalisation pour commencer à 1.0
        if equity_series and len(equity_series) > 0:
            initial = equity_series[0]
            normalized = [float(x / initial) for x in equity_series]
            return normalized
        
        # Fallback si pas de données
        return [1.0] + [1.0 + 0.001*i for i in range(total_steps-1)]
        
    except Exception as e:
        print(f"Erreur moteur: {e}")
        # Fallback en cas d'erreur
        raise NotImplementedError(f"Erreur moteur: {e}")

# ---------- Fallback temporaire (si tu n'as pas encore branché le moteur) ----------
def fallback_equity(preset: Preset) -> List[float]:
    """
    Fallback NON-RÉALISTE (meilleur que la ligne droite du placeholder).
    - Random walk calibré grossièrement par mu et une vol proxy,
    - Frais appliqués à chaque step (simplifié).
    Remplace dès que possible par run_true_engine(...).
    """
    rng = np.random.default_rng(int(preset.seed or 0))
    n = max(2, int(preset.total_steps or 200))
    mu = float(preset.mu or 0.0)        # drift "annualisé" simplifié (décimal)
    vt = preset.modules.get("VolatilityTarget", {}) if preset.modules else {}
    vol = float(vt.get("vt_target_vol", 0.10))     # vol cible proxy (annualisée)
    # Approx discretisation simple (pas de formule sensible ici)
    dt = 1.0 / 252.0
    sigma_step = vol * np.sqrt(dt)
    mu_step = mu * dt
    eps = rng.standard_normal(n - 1)
    rets = mu_step + sigma_step * eps
    # frais simplistes par step
    fees = float(preset.fees_per_trade or 0.0)
    rets = rets - fees
    equity = np.empty(n, dtype=float)
    equity[0] = 1.0
    equity[1:] = equity[0] * np.cumprod(1.0 + rets)
    return equity.tolist()

# ---------- Endpoint principal ----------
@app.post("/simulate", response_model=SimOut)
def simulate(preset: Preset):
    # 1) Obtenir la série d'équity depuis TON moteur
    try:
        equity = run_true_engine(preset)
    except NotImplementedError:
        # Fallback temporaire si non branché
        equity = fallback_equity(preset)

    equity_arr = np.asarray(equity, dtype=float)
    if not np.isfinite(equity_arr).all() or equity_arr.size < 2:
        # Sanity guard pour éviter des valeurs absurdes
        equity_arr = np.array([1.0, 0.99, 1.01], dtype=float)

    # 2) KPI de base (contrat minimal)
    dd_total = max_drawdown_total(equity_arr)
    dd_daily = max_drawdown_daily(equity_arr)

    daily_limit, total_limit = read_ftmo_limits(preset)
    viol_daily = int(dd_daily > daily_limit)
    viol_total = int(dd_total > total_limit)

    # 3) Optionnel: KPI étendus (remplis ce que tu veux renvoyer)
    kpis: Dict[str, Any] = {
        # "cagr": ..., "vol_realized": ..., "sharpe": ..., etc. (décimaux si %)
    }

    # 4) Optionnel: Diagnostics modules (compteurs/logs)
    diag: Dict[str, Any] = {
        # "kelly_cap_hits": ..., "cppi_freeze_events": ..., "no_upsize_after_loss": True, ...
    }

    # 5) Réponse au format attendu (décimaux; le front affiche en %)
    out = SimOut(
        max_dd_total=float(dd_total),
        max_dd_daily=float(dd_daily),
        violations_daily=viol_daily,
        violations_total=viol_total,
        series=Series(equity=[float(x) for x in equity_arr.tolist()]),
        kpis=kpis or None,
        diag=diag or None,
    )
    return out

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
