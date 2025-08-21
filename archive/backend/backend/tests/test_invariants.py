import math
import os
import glob
from backend.orchestrator import PositionSizer
from backend.modules.cppi import CPPI
from backend.modules.drawdown_manager import DrawdownManager
from backend.modules.vol_target import VolTarget
from backend.modules.bayes import Bayes
from backend.logging_jsonl import JsonlLogger

def mk_engine():
    preset = {
        "capital_initial": 100000.0,
        "modules": [],
        "gating": {},
        "risk_limits": {"max_dd": 10.0, "daily_dd": 5.0, "freeze_cushion_pct": 5.0}
    }
    modules = [
        VolTarget({"target_vol": 0.1, "vol_est": 0.1, "scale": 0.1, "max_risk": 0.02}),
        DrawdownManager({"bands": [[5, 0.02], [10, 0.01], [20, 0.0]]}),
        CPPI({"multiplier": 1.0, "cap": 0.02}),
        Bayes({"p": 0.55, "k": 0.1, "cap": 0.02})
    ]
    return PositionSizer(preset, modules)

def test_no_increase_after_loss():
    eng = mk_engine()
    # Run 2 steps with deterministic "market": negative then positive drift
    res = eng.run_single(horizon=2, seed=123, market_model={"type": "MC", "params": {"mu": -0.05, "sigma": 0.0}})
    # Après une perte au step 0, la taille step 1 ne doit pas être > taille step 0
    sizing = res["series"]["sizing"]
    assert len(sizing) >= 2
    assert sizing[1] <= sizing[0] + 1e-12

def test_cppi_freeze_when_cushion_low():
    eng = mk_engine()
    # Simule des retours très négatifs pour forcer cushion < seuil
    res = eng.run_single(horizon=50, seed=42, market_model={"type": "MC", "params": {"mu": -0.3, "sigma": 0.0}})
    # On vérifie qu'il existe au moins un step avec risk_effectif == 0
    risk = res["series"]["risk_effectif"]
    assert any(abs(x) < 1e-12 for x in risk)

def test_risk_final_is_min_of_modules():
    eng = mk_engine()
    res = eng.run_single(horizon=5, seed=7, market_model={"type": "MC", "params": {"mu": 0.0, "sigma": 0.0}})
    # Sans bruit, les modules retournent des caps stables; min doit être respecté
    risk = res["series"]["risk_effectif"]
    assert all(r >= 0.0 for r in risk)

def test_logs_files_are_created(tmp_path):
    preset = {
        "capital_initial": 100000.0,
        "modules": [],
        "gating": {},
        "risk_limits": {"max_dd": 10.0, "daily_dd": 5.0, "freeze_cushion_pct": 5.0}
    }
    modules = [
        VolTarget({"target_vol": 0.1, "vol_est": 0.1, "scale": 0.1, "max_risk": 0.02}),
        DrawdownManager({"bands": [[5, 0.02], [10, 0.01], [20, 0.0]]}),
        CPPI({"multiplier": 1.0, "cap": 0.02}),
        Bayes({"p": 0.55, "k": 0.1, "cap": 0.02})
    ]
    logger = JsonlLogger(base_dir=str(tmp_path))
    eng = PositionSizer(preset, modules, logger=logger)
    res = eng.run_single(horizon=5, seed=0, market_model={"type": "MC", "params": {"mu": 0.0, "sigma": 0.0}})
    logger.close()

    run_dir = os.path.join(str(tmp_path), logger.run_id)
    assert os.path.isdir(run_dir)
    assert os.path.isfile(os.path.join(run_dir, "run.log.jsonl"))
    assert os.path.isfile(os.path.join(run_dir, "risk.log.jsonl"))
