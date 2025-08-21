#!/usr/bin/env python3
"""
Test de la télémetrie et des presets
"""

import requests
import json

def test_telemetry():
    """Test de l'extraction de télémetrie depuis les logs"""
    
    base_url = "http://127.0.0.1:8001"
    
    print("🧪 TEST DE LA TÉLÉMÉTRIE")
    print("=" * 50)
    
    # Test 1: Simulation avec tous les modules pour générer de la télémetrie
    print("\n1️⃣ Test simulation complète avec télémetrie:")
    
    params = {
        "desired_risk": 0.015,
        "total_steps": 100,
        "daily_limit": 0.025,
        "total_limit": 0.08,
        "spend_rate": 0.4,
        "lmax": 0.05,
        "lmax_min": 0.003,
        "lmax_halflife": 3,
        "ftmo_target_vol": 0.008,
        "cppi_alpha": 0.12,
        "cppi_freeze_frac": 0.06,
        "vt_target_vol": 0.012,
        "vt_halflife": 8,
        "modules": ["FTMOGate", "CPPI", "VolTarget", "SoftBarrier"]
    }
    
    try:
        response = requests.post(f"{base_url}/simulate", json={"params": params})
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Simulation réussie: {len(data.get('series', []))} points")
            print(f"   📊 KPIs: max_dd={data.get('kpis', {}).get('max_dd', 'N/A')}")
            
            # Vérifier la présence des logs
            logs = data.get('logs', [])
            print(f"   📝 Logs: {len(logs)} étapes")
            
            if logs:
                # Analyser la dernière étape pour la télémetrie
                last_log = logs[-1]
                print(f"   🔍 Dernière étape - modules actifs: {last_log.get('modules_active', [])}")
                
                # Vérifier les données de télémetrie
                modules_data = last_log.get('modules', [])
                for module_log in modules_data:
                    module_name = module_log.get('module', 'Unknown')
                    module_data = module_log.get('data', {})
                    print(f"      📊 {module_name}: {json.dumps(module_data, indent=6)}")
                    
        else:
            print(f"   ❌ Erreur simulation: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur connexion: {e}")
    
    # Test 2: Simulation simple pour vérifier la structure des logs
    print("\n2️⃣ Test structure des logs:")
    
    simple_params = {
        "desired_risk": 0.01,
        "total_steps": 20,
        "modules": ["FTMOGate"]
    }
    
    try:
        response = requests.post(f"{base_url}/simulate", json={"params": simple_params})
        
        if response.status_code == 200:
            data = response.json()
            logs = data.get('logs', [])
            
            if logs:
                print(f"   ✅ Logs générés: {len(logs)} étapes")
                # Afficher la structure d'une étape
                sample_log = logs[0]
                print(f"   📋 Structure log: {list(sample_log.keys())}")
                
                # Vérifier les champs de télémetrie
                if 'modules_active' in sample_log:
                    print(f"   🎯 Modules actifs: {sample_log['modules_active']}")
                if 'risk_final' in sample_log:
                    print(f"   ⚡ Risque final: {sample_log['risk_final']}")
                    
        else:
            print(f"   ❌ Erreur simulation simple: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur connexion: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Test télémetrie terminé !")
    print("\n💡 Pour tester l'interface complète:")
    print("   1. Ouvrez http://localhost:3000/workspace")
    print("   2. Lancez une simulation")
    print("   3. Observez la télémetrie sous les toggles")
    print("   4. Testez les presets (Save/Load)")

if __name__ == "__main__":
    test_telemetry()
