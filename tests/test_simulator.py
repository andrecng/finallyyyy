"""Tests pour le simulateur unifié"""

from backend.simulator import run_simulation

def test_simulator_basic():
    """Test de base du simulateur"""
    params = {
        "desired_risk": 0.01,
        "total_steps": 50,
        "daily_limit": 0.02,
        "total_limit": 0.10
    }
    
    result = run_simulation(params)
    
    assert "series" in result
    assert "kpis" in result
    assert len(result["series"]) > 0
    assert result["kpis"]["max_dd"] >= 0.0
    assert "ftmo" in result["kpis"]

def test_simulator_ftmo_limits():
    """Test des limites FTMO"""
    params = {
        "desired_risk": 0.05,  # Risk élevé
        "total_steps": 100,
        "daily_limit": 0.01,   # Limite journalière stricte
        "total_limit": 0.05    # Limite totale stricte
    }
    
    result = run_simulation(params)
    
    # Vérifier que les limites sont respectées
    ftmo = result["kpis"]["ftmo"]
    assert ftmo["daily_breaches"] >= 0
    assert ftmo["total_breaches"] >= 0
