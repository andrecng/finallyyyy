#!/usr/bin/env python3
"""
Test rapide de l'interface Monte Carlo
"""

import requests
import json
import time

def test_ui_workflow():
    """Test du workflow complet : simulation simple + Monte Carlo"""
    
    base_url = "http://127.0.0.1:8001"
    
    print("🧪 TEST INTERFACE MONTE CARLO")
    print("=" * 50)
    
    # 1. Test simulation simple
    print("\n1️⃣ Test simulation simple (/simulate):")
    simple_params = {
        "desired_risk": 0.015,
        "total_steps": 100,
        "steps_per_day": 1
    }
    
    try:
        response = requests.post(f"{base_url}/simulate", json={
            "params": simple_params
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Simulation réussie: {len(data.get('series', []))} points")
            print(f"   📊 KPIs: max_dd={data.get('kpis', {}).get('max_dd', 'N/A')}")
        else:
            print(f"   ❌ Erreur simulation: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur connexion: {e}")
    
    # 2. Test Monte Carlo
    print("\n2️⃣ Test Monte Carlo (/mc_simulate):")
    mc_params = {
        **simple_params,
        "daily_limit": 0.025,
        "lmax": 0.04,
        "lmax_min": 0.002
    }
    
    try:
        response = requests.post(f"{base_url}/mc_simulate", json={
            "params": mc_params,
            "n_runs": 50,
            "seed": 42,
            "quantiles": [0.05, 0.25, 0.5, 0.75, 0.95]
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ MC réussi: {data['n_runs']} runs, {data['pass_pct']}% pass")
            print(f"   📈 MaxDD: p05={data['metrics']['max_dd']['p05']:.4f}, p95={data['metrics']['max_dd']['p95']:.4f}")
            print(f"   💰 Final EQ: p50={data['metrics']['final_eq']['p50']:.4f}")
            print(f"   📊 Sortino: p50={data['metrics']['sortino']['p50']:.2f}")
        else:
            print(f"   ❌ Erreur MC: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur connexion: {e}")
    
    # 3. Test comparaison
    print("\n3️⃣ Test comparaison (base vs avancé):")
    
    # Configuration de base
    base_response = requests.post(f"{base_url}/mc_simulate", json={
        "params": simple_params,
        "n_runs": 30,
        "seed": 123
    })
    
    # Configuration avancée
    advanced_response = requests.post(f"{base_url}/mc_simulate", json={
        "params": mc_params,
        "n_runs": 30,
        "seed": 123
    })
    
    if base_response.status_code == 200 and advanced_response.status_code == 200:
        base_data = base_response.json()
        advanced_data = advanced_response.json()
        
        print(f"   📊 Base: MaxDD p50={base_data['metrics']['max_dd']['p50']:.4f}")
        print(f"   🚀 Avancé: MaxDD p50={advanced_data['metrics']['max_dd']['p50']:.4f}")
        
        # Comparaison des drawdowns
        base_dd = base_data['metrics']['max_dd']['p50']
        advanced_dd = advanced_data['metrics']['max_dd']['p50']
        
        if advanced_dd > base_dd:
            print(f"   ⚠️  Modules avancés augmentent le risque (protection active)")
        else:
            print(f"   ✅ Modules avancés réduisent le risque")
            
    else:
        print("   ❌ Erreur lors de la comparaison")
    
    print("\n" + "=" * 50)
    print("🎉 Test terminé !")
    print("\n💡 Pour tester l'interface complète:")
    print("   1. Ouvrez http://localhost:3000/workspace")
    print("   2. Cliquez 'Lancer la simulation'")
    print("   3. Cliquez 'Lancer Monte Carlo (200 runs)'")
    print("   4. Observez les résultats dans le panneau MC")

if __name__ == "__main__":
    test_ui_workflow()
