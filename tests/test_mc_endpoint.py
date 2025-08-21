"""
Test pour l'endpoint FastAPI Monte Carlo
"""

def test_mc_endpoint_exposes_metrics():
    import sys
    sys.path.append('.')
    from fastapi.testclient import TestClient
    from backend.main import app
    
    client = TestClient(app)
    r = client.post("/mc_simulate", json={
        "params": {"desired_risk": 0.01, "daily_limit": 0.02, "total_steps": 50}, 
        "n_runs": 10
    })
    assert r.status_code == 200
    data = r.json()
    assert "pass_pct" in data and "metrics" in data

def test_mc_endpoint_custom_quantiles():
    import sys
    sys.path.append('.')
    from fastapi.testclient import TestClient
    from backend.main import app
    
    client = TestClient(app)
    r = client.post("/mc_simulate", json={
        "params": {"desired_risk": 0.01, "total_steps": 30}, 
        "n_runs": 20,
        "quantiles": [0.25, 0.75]
    })
    assert r.status_code == 200
    data = r.json()
    assert "p25" in data["metrics"]["max_dd"]
    assert "p75" in data["metrics"]["max_dd"]
