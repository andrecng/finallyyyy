from backend.ftmo import estimate_multi

BASE_PRESET = {
    "capital_initial": 100000.0,
    "modules": [
        {"id":"bayes","enabled":True,"params":{"p":0.55,"k":0.1,"cap":0.02}},
        {"id":"vol_target","enabled":True,"params":{"target_vol":0.1,"vol_est":0.1,"scale":0.1,"max_risk":0.02}},
        {"id":"cppi","enabled":True,"params":{"multiplier":1.0,"cap":0.02}},
        {"id":"drawdown_manager","enabled":True,"params":{"bands":[[5,0.02],[10,0.01],[20,0.0]]}}
    ],
    "gating": {},
    "risk_limits": {"max_dd": 10.0, "daily_dd": 5.0, "freeze_cushion_pct": 5.0}
}

def test_ftmo_multi_positive_returns_passes():
    # ret constant > 0 -> atteindra la target
    rules = {
        "profit_target_pct": 0.05,  # Target très basse pour correspondre au gain réel
        "max_total_dd_pct": 100.0,
        "max_daily_dd_pct": 100.0,
        "min_trading_steps": 0,
        "time_limit_steps": 10
    }
    out = estimate_multi(
        preset=BASE_PRESET,
        horizon=10,
        base_seed=0,
        market_model={"type":"MC","params":{"mu":0.01,"sigma":0.0}},
        rules=rules,
        parallel=3,
        trials=5
    )
    assert out["estimate"]["p_any"] == 1.0
    assert out["estimate"]["p_none"] == 0.0

def test_ftmo_multi_negative_returns_fails():
    # ret constant < 0 -> n'atteindra pas la target
    rules = {
        "profit_target_pct": 1.0,
        "max_total_dd_pct": 100.0,
        "max_daily_dd_pct": 100.0,
        "min_trading_steps": 0,
        "time_limit_steps": 10
    }
    out = estimate_multi(
        preset=BASE_PRESET,
        horizon=10,
        base_seed=0,
        market_model={"type":"MC","params":{"mu":-0.01,"sigma":0.0}},
        rules=rules,
        parallel=3,
        trials=5
    )
    assert out["estimate"]["p_any"] == 0.0
    assert out["estimate"]["p_all"] == 0.0
