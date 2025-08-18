from backend.orchestrator import PositionSizer
from backend.modules.vol_target import VolTarget
from backend.modules.cppi import CPPI
from backend.modules.drawdown_manager import DrawdownManager
from backend.modules.bayes import Bayes

BASE_MODULES = [
    VolTarget({"target_vol": 0.1, "vol_est": 0.1, "scale": 0.1, "max_risk": 0.02}),
    DrawdownManager({"bands": [[5, 0.02], [10, 0.01], [20, 0.0]]}),
    CPPI({"multiplier": 1.0, "cap": 0.02}),
    Bayes({"p": 0.55, "k": 0.1, "cap": 0.02}),
]

BASE_PRESET = {
    "capital_initial": 100000.0,
    "modules": [],
    "gating": {},
    "risk_limits": {"max_dd": 10.0, "daily_dd": 5.0, "freeze_cushion_pct": 5.0},
}

def test_blackout_steps_force_zero_risk():
    preset = {**BASE_PRESET, "gating": {"news_blackouts_steps": [[1, 3]]}}
    eng = PositionSizer(preset, BASE_MODULES)
    res = eng.run_single(horizon=5, seed=0, market_model={"type": "MC", "params": {"mu": 0.0, "sigma": 0.0}})
    risk = res["series"]["risk_effectif"]
    # t=1,2 doivent être à 0
    assert abs(risk[1]) < 1e-12 and abs(risk[2]) < 1e-12

def test_session_mask_allows_only_windows():
    preset = {
        **BASE_PRESET,
        "gating": {"session_mask": {"day_len": 10, "allow": [[0, 2], [5, 7]]}}
    }
    eng = PositionSizer(preset, BASE_MODULES)
    res = eng.run_single(horizon=10, seed=0, market_model={"type": "MC", "params": {"mu": 0.0, "sigma": 0.0}})
    risk = res["series"]["risk_effectif"]
    # autorisés: t=0,1,5,6 ; les autres doivent être 0
    allowed = {0, 1, 5, 6}
    for t, r in enumerate(risk):
        if t in allowed:
            assert r >= 0.0  # peut être 0 si autre invariant, mais pas forcé
        else:
            assert abs(r) < 1e-12
