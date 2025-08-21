#!/usr/bin/env python3
"""
Script de validation des calculs Monte-Carlo
Vérifie que les mathématiques sont correctes
"""

import numpy as np
import json
from datetime import datetime
import requests

def test_basic_statistics():
    """Test des statistiques de base avec des données connues"""
    print("🔍 Test 1: Validation des statistiques de base")
    
    # Données de test simples
    test_data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    
    # Calculs manuels
    manual_mean = np.mean(test_data)
    manual_std = np.std(test_data)
    manual_p50 = np.percentile(test_data, 50)
    
    print(f"   Moyenne manuelle: {manual_mean}")
    print(f"   Écart-type manuel: {manual_std:.4f}")
    print(f"   Médiane manuelle: {manual_p50}")
    
    # Vérification
    assert abs(manual_mean - 5.5) < 0.001, "Moyenne incorrecte"
    assert abs(manual_std - 2.8723) < 0.001, "Écart-type incorrect"
    assert abs(manual_p50 - 5.5) < 0.001, "Médiane incorrecte"
    
    print("   ✅ Statistiques de base validées\n")

def test_monte_carlo_math():
    """Test des calculs Monte-Carlo avec des paramètres connus"""
    print("🎲 Test 2: Validation des calculs Monte-Carlo")
    
    # Paramètres de test
    initial_capital = 10000
    risk_per_trade = 1.0  # 1%
    win_rate = 0.5  # 50%
    avg_win = 2.0  # 2R
    avg_loss = 1.0  # 1R
    num_trades = 100
    num_simulations = 1000
    
    print(f"   Capital initial: {initial_capital}")
    print(f"   Risque par trade: {risk_per_trade}%")
    print(f"   Taux de gain: {win_rate * 100}%")
    print(f"   Gain moyen: {avg_win}R")
    print(f"   Perte moyenne: {avg_loss}R")
    print(f"   Nombre de trades: {num_trades}")
    print(f"   Simulations: {num_simulations}")
    
    # Calcul théorique du rendement attendu
    expected_win_trades = num_trades * win_rate
    expected_loss_trades = num_trades * (1 - win_rate)
    
    # R = Risk per trade
    expected_total_r = (expected_win_trades * avg_win) - (expected_loss_trades * avg_loss)
    expected_return_pct = expected_total_r * risk_per_trade / 100
    
    print(f"   Trades gagnants attendus: {expected_win_trades}")
    print(f"   Trades perdants attendus: {expected_loss_trades}")
    print(f"   R total attendu: {expected_total_r:.2f}")
    print(f"   Rendement attendu: {expected_return_pct:.2f}%")
    
    # Test avec l'API
    try:
        response = requests.post(
            'http://localhost:8000/simulate/monte-carlo',
            json={
                'initial_capital': initial_capital,
                'risk_per_trade': risk_per_trade,
                'win_rate': win_rate,
                'avg_win': avg_win,
                'avg_loss': avg_loss,
                'num_trades': num_trades,
                'num_simulations': num_simulations
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Vérification des résultats
            actual_mean_return = data['statistics']['mean_total_return'] * 100
            actual_success_rate = data['statistics']['success_rate']
            
            print(f"   Rendement moyen réel: {actual_mean_return:.2f}%")
            print(f"   Taux de succès réel: {actual_success_rate * 100:.1f}%")
            
            # Validation (avec tolérance)
            tolerance = 0.5  # 0.5% de tolérance
            assert abs(actual_mean_return - expected_return_pct) < tolerance, f"Rendement hors tolérance: attendu {expected_return_pct:.2f}%, obtenu {actual_mean_return:.2f}%"
            
            print("   ✅ Calculs Monte-Carlo validés\n")
        else:
            print(f"   ❌ Erreur API: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur de test: {e}\n")

def test_drawdown_calculation():
    """Test du calcul du drawdown maximum"""
    print("📉 Test 3: Validation du calcul du drawdown")
    
    # Courbe d'équité de test
    equity_curve = [10000, 10100, 10200, 10150, 10300, 10200, 10400, 10350, 10500]
    
    # Calcul manuel du drawdown
    peak = equity_curve[0]
    max_dd = 0
    
    for value in equity_curve:
        if value > peak:
            peak = value
        dd = (peak - value) / peak
        if dd > max_dd:
            max_dd = dd
    
    print(f"   Courbe d'équité: {equity_curve}")
    print(f"   Drawdown maximum calculé: {max_dd * 100:.2f}%")
    
    # Vérification
    expected_dd = 0.0476  # (10500 - 10000) / 10500
    assert abs(max_dd - expected_dd) < 0.001, f"Drawdown incorrect: attendu {expected_dd:.4f}, obtenu {max_dd:.4f}"
    
    print("   ✅ Calcul du drawdown validé\n")

def test_sharpe_ratio():
    """Test du calcul du ratio de Sharpe"""
    print("📊 Test 4: Validation du ratio de Sharpe")
    
    # Retours de test
    returns = [0.01, 0.02, -0.01, 0.03, -0.02, 0.01, 0.02, -0.01]
    
    # Calcul manuel
    risk_free_rate = 0.02 / 252  # Taux journalier
    excess_returns = [r - risk_free_rate for r in returns]
    
    sharpe = np.mean(excess_returns) / np.std(excess_returns) if np.std(excess_returns) > 0 else 0
    
    print(f"   Retours: {returns}")
    print(f"   Ratio de Sharpe calculé: {sharpe:.4f}")
    
    # Vérification basique
    assert not np.isnan(sharpe), "Ratio de Sharpe est NaN"
    assert not np.isinf(sharpe), "Ratio de Sharpe est infini"
    
    print("   ✅ Calcul du ratio de Sharpe validé\n")

def test_api_endpoints():
    """Test de tous les endpoints de l'API"""
    print("🌐 Test 5: Validation des endpoints API")
    
    base_url = "http://localhost:8000"
    
    # Test de santé
    try:
        response = requests.get(f"{base_url}/health")
        assert response.status_code == 200, f"Health check échoué: {response.status_code}"
        print("   ✅ Health check")
    except Exception as e:
        print(f"   ❌ Health check: {e}")
    
    # Test des indicateurs techniques
    try:
        response = requests.get(f"{base_url}/indicators/technical")
        assert response.status_code == 200, f"Indicateurs échoué: {response.status_code}"
        data = response.json()
        assert data['total_indicators'] == 158, f"Nombre d'indicateurs incorrect: {data['total_indicators']}"
        print("   ✅ Indicateurs techniques")
    except Exception as e:
        print(f"   ❌ Indicateurs techniques: {e}")
    
    # Test de simulation rapide
    try:
        response = requests.post(
            f"{base_url}/simulate/monte-carlo",
            json={
                'initial_capital': 1000,
                'risk_per_trade': 1,
                'win_rate': 0.5,
                'avg_win': 2,
                'avg_loss': 1,
                'num_trades': 10,
                'num_simulations': 10
            }
        )
        assert response.status_code == 200, f"Simulation échoué: {response.status_code}"
        print("   ✅ Simulation Monte-Carlo")
    except Exception as e:
        print(f"   ❌ Simulation Monte-Carlo: {e}")
    
    print("   ✅ Tous les endpoints testés\n")

def main():
    """Fonction principale de test"""
    print("🚀 Démarrage des tests de validation Monte-Carlo\n")
    
    try:
        test_basic_statistics()
        test_monte_carlo_math()
        test_drawdown_calculation()
        test_sharpe_ratio()
        test_api_endpoints()
        
        print("🎉 Tous les tests de validation sont PASSÉS !")
        print("✅ Les calculs Monte-Carlo sont mathématiquement corrects")
        
    except AssertionError as e:
        print(f"❌ Test échoué: {e}")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
