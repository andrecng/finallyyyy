#!/usr/bin/env python3
"""
Test des modules actifs/inactifs
"""

import requests
import json

def test_modules():
    """Test de différentes configurations de modules"""
    
    base_url = "http://127.0.0.1:8001"
    
    print("🧪 TEST DES MODULES ACTIFS/INACTIFS")
    print("=" * 50)
    
    # Configuration de base
    base_params = {
        "desired_risk": 0.015,
        "total_steps": 50,
        "daily_limit": 0.025,
        "cppi_alpha": 0.12,
        "vt_target_vol": 0.008
    }
    
    # Test 1: Tous les modules activés
    print("\n1️⃣ Tous les modules activés:")
    response = requests.post(f"{base_url}/simulate", json={
        "params": {**base_params, "modules": ["FTMOGate", "CPPI", "VolTarget", "SoftBarrier"]}
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ MaxDD: {data['kpis']['max_dd']:.6f}")
        print(f"   📊 Modules dans les logs: {len(data['logs'])} étapes")
    else:
        print(f"   ❌ Erreur: {response.status_code}")
    
    # Test 2: Seulement FTMO
    print("\n2️⃣ Seulement FTMO:")
    response = requests.post(f"{base_url}/simulate", json={
        "params": {**base_params, "modules": ["FTMOGate"]}
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ MaxDD: {data['kpis']['max_dd']:.6f}")
        print(f"   📊 Modules dans les logs: {len(data['logs'])} étapes")
    else:
        print(f"   ❌ Erreur: {response.status_code}")
    
    # Test 3: Seulement CPPI
    print("\n3️⃣ Seulement CPPI:")
    response = requests.post(f"{base_url}/simulate", json={
        "params": {**base_params, "modules": ["CPPI"]}
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ MaxDD: {data['kpis']['max_dd']:.6f}")
        print(f"   📊 Modules dans les logs: {len(data['logs'])} étapes")
    else:
        print(f"   ❌ Erreur: {response.status_code}")
    
    # Test 4: Aucun module (fallback)
    print("\n4️⃣ Aucun module (fallback):")
    response = requests.post(f"{base_url}/simulate", json={
        "params": {**base_params, "modules": []}
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ MaxDD: {data['kpis']['max_dd']:.6f}")
        print(f"   📊 Modules dans les logs: {len(data['logs'])} étapes")
    else:
        print(f"   ❌ Erreur: {response.status_code}")
    
    # Test 5: Monte Carlo avec modules limités
    print("\n5️⃣ Monte Carlo avec modules limités:")
    response = requests.post(f"{base_url}/mc_simulate", json={
        "params": {**base_params, "modules": ["FTMOGate", "CPPI"]},
        "n_runs": 30,
        "seed": 123
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ MC réussi: {data['n_runs']} runs")
        print(f"   📈 MaxDD p50: {data['metrics']['max_dd']['p50']:.6f}")
    else:
        print(f"   ❌ Erreur: {response.status_code}")
    
    print("\n" + "=" * 50)
    print("🎉 Test des modules terminé !")
    print("\n💡 Pour tester l'interface complète:")
    print("   1. Ouvrez http://localhost:3000/workspace")
    print("   2. Utilisez les toggles pour activer/désactiver des modules")
    print("   3. Lancez la simulation et observez les différences")

if __name__ == "__main__":
    test_modules()
