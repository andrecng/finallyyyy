"""Tests de base pour valider la configuration"""
import pytest
from backend.main import app

def test_healthz_endpoint():
    """Test que l'endpoint /healthz fonctionne"""
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    response = client.get("/healthz")
    
    assert response.status_code == 200
    assert response.json() == {"ok": True}

def test_simulate_endpoint():
    """Test que l'endpoint /simulate fonctionne"""
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    response = client.post("/simulate")
    
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "series" in data

def test_imports():
    """Test que les modules principaux peuvent être importés"""
    try:
        from backend.main import app
        assert app is not None
        print("✅ Backend importé avec succès")
    except ImportError as e:
        pytest.fail(f"Impossible d'importer le backend: {e}")
