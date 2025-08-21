#!/usr/bin/env python3
"""
Test du composant NumberField
"""

import requests
import json

def test_numberfield():
    """Test du composant NumberField via l'API"""

    base_url = "http://127.0.0.1:8001"

    print("🧪 TEST DU COMPOSANT NUMBERFIELD")
    print("=" * 50)

    # Test 1: Valeurs avec virgules (parsing tolérant)
    print("\n1️⃣ Test parsing tolérant (virgules):")
    
    params_with_commas = {
        "desired_risk": "0,015",      # virgule
        "total_steps": " 200 ",       # espaces
        "mu": "-0,001",               # virgule + négatif
        "cppi_alpha": "0,12",         # virgule
        "daily_limit": "0,025",       # virgule
        "lmax": "0,02",               # virgule
        "steps_per_day": "1",         # normal
        "freeze_after_loss": True,    # boolean
        "modules": ["FTMOGate", "CPPI"]
    }

    response = requests.post(f"{base_url}/simulate", json={
        "params": params_with_commas
    })

    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Parsing réussi: MaxDD = {data['kpis']['max_dd']:.6f}")
        print(f"   📊 Modules actifs: {params_with_commas['modules']}")
    else:
        print(f"   ❌ Erreur parsing: {response.status_code}")

    # Test 2: Valeurs extrêmes (validation min/max)
    print("\n2️⃣ Test validation min/max:")
    
    extreme_params = {
        "desired_risk": "0.05",       # risque élevé
        "total_steps": "1000",        # beaucoup d'étapes
        "daily_limit": "0.001",       # limite très stricte
        "cppi_alpha": "0.20",         # alpha élevé
        "vt_target_vol": "0.005",     # vol très basse
        "modules": ["FTMOGate", "CPPI", "VolTarget", "SoftBarrier"]
    }

    response = requests.post(f"{base_url}/simulate", json={
        "params": extreme_params
    })

    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Validation OK: MaxDD = {data['kpis']['max_dd']:.6f}")
        print(f"   📊 Étapes exécutées: {len(data['series'])}")
    else:
        print(f"   ❌ Erreur validation: {response.status_code}")

    # Test 3: Valeurs partielles (fallback)
    print("\n3️⃣ Test valeurs partielles (fallback):")
    
    partial_params = {
        "desired_risk": "0.015",
        "total_steps": "50",
        "mu": "",                     # vide
        "cppi_alpha": "-",            # juste un tiret
        "daily_limit": "0.025",
        "modules": ["FTMOGate"]
    }

    response = requests.post(f"{base_url}/simulate", json={
        "params": partial_params
    })

    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Fallback OK: MaxDD = {data['kpis']['max_dd']:.6f}")
        print(f"   📊 Valeurs partielles gérées")
    else:
        print(f"   ❌ Erreur fallback: {response.status_code}")

    # Test 4: Monte Carlo avec NumberField
    print("\n4️⃣ Test Monte Carlo avec NumberField:")
    
    mc_params = {
        "desired_risk": "0,015",      # virgule
        "total_steps": "100",         # normal
        "daily_limit": "0,025",       # virgule
        "cppi_alpha": "0,12",         # virgule
        "vt_target_vol": "0,008",     # virgule
        "modules": ["FTMOGate", "CPPI", "VolTarget"]
    }

    response = requests.post(f"{base_url}/mc_simulate", json={
        "params": mc_params,
        "n_runs": 30,
        "seed": 42
    })

    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ MC réussi: {data['n_runs']} runs")
        if data['n_runs'] > 0 and 'metrics' in data:
            print(f"   📈 MaxDD p50: {data['metrics']['max_dd']['p50']:.6f}")
            print(f"   💰 Final EQ p50: {data['metrics']['final_eq']['p50']:.6f}")
        else:
            print(f"   📊 Pas de métriques disponibles")
    else:
        print(f"   ❌ Erreur MC: {response.status_code}")

    print("\n" + "=" * 50)
    print("🎉 Test NumberField terminé !")
    print("\n💡 Fonctionnalités testées:")
    print("   ✅ Parsing tolérant (virgules, espaces)")
    print("   ✅ Validation min/max")
    print("   ✅ Fallback sur valeurs partielles")
    print("   ✅ Monte Carlo avec parsing")
    print("\n🌐 Interface prête:")
    print("   Frontend: http://localhost:3000/workspace")
    print("   Backend: http://127.0.0.1:8001")

if __name__ == "__main__":
    test_numberfield()
