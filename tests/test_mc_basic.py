"""
Test pour la logique Monte Carlo basique
"""

def test_mc_returns_basic_metrics():
    import sys
    sys.path.append('.')
    from backend.simulator import run_mc
    out = run_mc({"desired_risk": 0.012, "daily_limit": 0.02, "total_steps": 100}, n_runs=20, seed=123)
    assert "pass_pct" in out and 0.0 <= out["pass_pct"] <= 100.0
    assert "metrics" in out and "max_dd" in out["metrics"]

def test_mc_seed_reproducibility():
    import sys
    sys.path.append('.')
    from backend.simulator import run_mc
    
    # Même seed = même résultat
    out1 = run_mc({"desired_risk": 0.01, "total_steps": 50}, n_runs=10, seed=42)
    out2 = run_mc({"desired_risk": 0.01, "total_steps": 50}, n_runs=10, seed=42)
    assert out1["pass_pct"] == out2["pass_pct"]
    assert out1["metrics"]["max_dd"] == out2["metrics"]["max_dd"]

def test_mc_quantiles_calculation():
    import sys
    sys.path.append('.')
    from backend.simulator import run_mc
    
    out = run_mc({"desired_risk": 0.01, "total_steps": 30}, n_runs=50, seed=123, quantiles=[0.1, 0.5, 0.9])
    assert "p10" in out["metrics"]["max_dd"]
    assert "p50" in out["metrics"]["max_dd"]
    assert "p90" in out["metrics"]["max_dd"]
