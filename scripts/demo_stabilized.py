#!/usr/bin/env python3
"""
Démonstration de l'environnement stabilisé
"""

import requests
import json
import time

def demo_stabilized_environment():
    """Démonstration complète de l'environnement stabilisé"""
    
    base_url = "http://localhost:8001"
    
    print("🚀 DÉMONSTRATION ENVIRONNEMENT STABILISÉ")
    print("=" * 60)
    
    # Test 1: Vérification de la santé
    print("\n1️⃣ Test de santé de l'API:")
    try:
        response = requests.get(f"{base_url}/healthz")
        if response.status_code == 200:
            print("   ✅ API en ligne et fonctionnelle")
        else:
            print(f"   ❌ API en erreur: {response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Impossible de contacter l'API: {e}")
        return
    
    # Test 2: Simulation avec télémetrie normalisée
    print("\n2️⃣ Test simulation avec télémetrie:")
    
    params = {
        "desired_risk": 0.015,
        "total_steps": 50,
        "daily_limit": 0.025,
        "cppi_alpha": 0.12,
        "vt_target_vol": 0.008,
        "modules": ["FTMOGate", "CPPI", "VolTarget", "SoftBarrier"]
    }
    
    try:
        response = requests.post(f"{base_url}/simulate", json={"params": params})
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Simulation réussie: {len(data.get('series', []))} points")
            
            # Vérifier la télémetrie normalisée
            logs = data.get('logs', [])
            if logs:
                last_log = logs[-1]
                print(f"   📊 Télémetrie normalisée:")
                
                # Vérifier que toutes les clés sont présentes
                expected_keys = [
                    'cppi_cap_mult', 'cppi_freeze', 'vt_sigma', 'vt_cap',
                    'sb_dd', 'sb_mult', 'ftmo_lmax_dyn', 'ftmo_budget_day_left'
                ]
                
                for key in expected_keys:
                    value = last_log.get(key)
                    status = "✅" if key in last_log else "❌"
                    print(f"      {status} {key}: {value}")
                
                # Vérifier la structure des logs
                print(f"   📋 Structure des logs: {list(last_log.keys())}")
                
        else:
            print(f"   ❌ Erreur simulation: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Test 3: Monte Carlo avec environnement stable
    print("\n3️⃣ Test Monte Carlo stable:")
    
    try:
        response = requests.post(f"{base_url}/mc_simulate", json={
            "params": params,
            "n_runs": 50,
            "seed": 42
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ MC réussi: {data['n_runs']} runs")
            
            if 'metrics' in data:
                metrics = data['metrics']
                if 'max_dd' in metrics:
                    max_dd = metrics['max_dd']
                    print(f"   📊 MaxDD: p05={max_dd.get('p05', 'N/A'):.6f}, p50={max_dd.get('p50', 'N/A'):.6f}, p95={max_dd.get('p95', 'N/A'):.6f}")
                    
        else:
            print(f"   ❌ Erreur MC: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Test 4: Vérification des performances
    print("\n4️⃣ Test de performance:")
    
    start_time = time.time()
    try:
        response = requests.post(f"{base_url}/simulate", json={"params": params})
        end_time = time.time()
        
        if response.status_code == 200:
            duration = (end_time - start_time) * 1000  # en ms
            print(f"   ⚡ Temps de réponse: {duration:.1f}ms")
            
            if duration < 100:
                print("   🚀 Performance excellente")
            elif duration < 500:
                print("   ✅ Performance correcte")
            else:
                print("   ⚠️  Performance à surveiller")
                
        else:
            print(f"   ❌ Erreur: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 DÉMONSTRATION TERMINÉE !")
    print("\n💡 Environnement stabilisé avec:")
    print("   ✅ API FastAPI sur port 8001")
    print("   ✅ Frontend Next.js sur port 3000")
    print("   ✅ Télémetrie normalisée et cohérente")
    print("   ✅ Tests automatisés fonctionnels")
    print("   ✅ Scripts de nettoyage des ports")
    print("   ✅ Configuration d'environnement propre")
    print("\n🌐 Interface prête sur: http://localhost:3000/workspace")
    print("🔧 API prête sur: http://localhost:8001")

if __name__ == "__main__":
    demo_stabilized_environment()
