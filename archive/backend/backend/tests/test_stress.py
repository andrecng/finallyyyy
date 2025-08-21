from backend.orchestrator import PositionSizer
from backend.modules.vol_target import VolTarget
from backend.modules.drawdown_manager import DrawdownManager
from backend.modules.cppi import CPPI
from backend.modules.bayes import Bayes

BASE_PRESET = {
    "capital_initial": 100000.0,
    "modules": [
        {"id":"bayes","enabled":True,"params":{"p":0.55,"k":0.1,"cap":0.02}},
        {"id":"vol_target","enabled":True,"params":{"target_vol":0.1,"vol_est":0.1,"scale":0.1,"max_risk":0.02}},
        {"id":"cppi","enabled":True,"params":{"multiplier":1.0,"cap":0.02}},
        {"id":"drawdown_manager","enabled":True,"params":{"bands":[[5,0.02],[10,0.01],[20,0.0]]}}
    ],
    "gating": {"risk_cap": 0.02},
    "risk_limits": {"max_dd": 10.0, "daily_dd": 5.0, "freeze_cushion_pct": 5.0}
}

def test_crash_freeze_engages():
    """Test que le freeze CPPI s'engage en cas de crash"""
    eng = PositionSizer(BASE_PRESET, [])
    # mu très négatif → cushion tombe sous seuil → risk=0 à un moment
    res = eng.run_single(horizon=60, seed=1, market_model={"type":"MC","params":{"mu":-0.2,"sigma":0.0}})
    assert any(abs(x) < 1e-12 for x in res["series"]["risk_effectif"])

def test_silent_market_keeps_cap():
    """Test que le risk_cap est respecté en marché silencieux"""
    eng = PositionSizer(BASE_PRESET, [])
    res = eng.run_single(horizon=50, seed=2, market_model={"type":"MC","params":{"mu":0.0,"sigma":0.0}})
    # min des modules ≤ risk_cap; vérifie qu'on ne dépasse jamais
    assert all((x <= 0.0200001) for x in res["series"]["risk_effectif"])

def test_extreme_volatility_handling():
    """Test gestion de volatilité extrême"""
    eng = PositionSizer(BASE_PRESET, [])
    res = eng.run_single(horizon=30, seed=3, market_model={"type":"MC","params":{"mu":0.0,"sigma":0.1}})
    # Vérifie que le système reste stable même avec sigma élevé
    assert len(res["series"]["equity_curve"]) == 31  # horizon + 1
    assert all(x >= 0 for x in res["series"]["equity_curve"])

def test_zero_risk_edge_case():
    """Test cas limite: tous modules désactivés"""
    preset = {**BASE_PRESET, "modules": []}
    eng = PositionSizer(preset, [])
    res = eng.run_single(horizon=20, seed=4, market_model={"type":"MC","params":{"mu":0.0,"sigma":0.01}})
    # Sans modules, risk doit être 0
    assert all(abs(x) < 1e-12 for x in res["series"]["risk_effectif"])

def test_very_long_horizon():
    """Test horizon très long (stress mémoire)"""
    eng = PositionSizer(BASE_PRESET, [])
    res = eng.run_single(horizon=1000, seed=5, market_model={"type":"MC","params":{"mu":0.001,"sigma":0.01}})
    # Vérifie que le système gère de longues séries
    assert len(res["series"]["equity_curve"]) == 1001
    assert len(res["logs"]) > 0  # Logs générés

def test_gating_blackout_enforcement():
    """Test que les blackouts news forcent risk=0"""
    preset = {**BASE_PRESET, "gating": {"news_blackouts_steps": [[5, 8]]}}
    eng = PositionSizer(preset, [])
    res = eng.run_single(horizon=20, seed=6, market_model={"type":"MC","params":{"mu":0.001,"sigma":0.01}})
    # Steps 5,6,7 doivent avoir risk=0
    for t in [5, 6, 7]:
        if t < len(res["series"]["risk_effectif"]):
            assert abs(res["series"]["risk_effectif"][t]) < 1e-12

def test_session_mask_enforcement():
    """Test que le masque de session fonctionne"""
    preset = {**BASE_PRESET, "gating": {"session_mask": {"day_len": 10, "allow": [[0, 3]]}}}
    eng = PositionSizer(preset, [])
    res = eng.run_single(horizon=25, seed=7, market_model={"type":"MC","params":{"mu":0.001,"sigma":0.01}})
    # Seuls t=0,1,2,10,11,12,20,21,22 doivent avoir risk>0 potentiellement
    allowed_steps = {0,1,2,10,11,12,20,21,22}
    for t, risk in enumerate(res["series"]["risk_effectif"]):
        if t not in allowed_steps and t < len(res["series"]["risk_effectif"]):
            assert abs(risk) < 1e-12
