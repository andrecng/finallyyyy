from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
  response = client.get('/health')
  assert response.status_code == 200
  data = response.json()
  assert data['status'] == 'healthy'

def test_monte_carlo_endpoint():
  payload = {
    'initial_capital': 1000,
    'risk_per_trade': 1.0,
    'win_rate': 0.5,
    'avg_win': 2.0,
    'avg_loss': 1.0,
    'num_trades': 10,
    'num_simulations': 100
  }
  response = client.post('/simulate/monte-carlo', json=payload)
  assert response.status_code == 200
  data = response.json()
  assert 'simulations' in data
  assert 'statistics' in data
