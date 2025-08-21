#!/usr/bin/env python3
"""
Démonstration Monte Carlo - Système de Risk Management Avancé
"""

import requests
import json
from typing import Dict, Any

def demo_mc_comparison():
    """Compare différentes configurations de risk management"""
    
    base_url = "http://127.0.0.1:8001"
    
    # Configuration de base (sans modules avancés)
    base_params = {
        "desired_risk": 0.018,
        "total_steps": 200,
        "steps_per_day": 1,
        "mu": 0.002
    }
    
    # Configuration avancée (avec tous les modules)
    advanced_params = {
        **base_params,
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
        "vt_halflife": 8
    }
    
    print("🎯 DÉMONSTRATION MONTE CARLO - RISK MANAGEMENT AVANCÉ")
    print("=" * 60)
    
    # Test configuration de base
    print("\n📊 Configuration de base (sans modules avancés):")
    print(f"   Paramètres: {json.dumps(base_params, indent=2)}")
    
    try:
        response = requests.post(f"{base_url}/mc_simulate", json={
            "params": base_params,
            "n_runs": 100,
            "seed": 42,
            "quantiles": [0.05, 0.25, 0.5, 0.75, 0.95]
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Résultats: {data['n_runs']} runs, {data['pass_pct']}% FTMO pass")
            print(f"   📈 MaxDD: p50={data['metrics']['max_dd']['p50']:.4f}, p95={data['metrics']['max_dd']['p95']:.4f}")
            print(f"   💰 Final EQ: p50={data['metrics']['final_eq']['p50']:.4f}, p95={data['metrics']['final_eq']['p95']:.4f}")
            print(f"   📊 Sortino: p50={data['metrics']['sortino']['p50']:.2f}")
            print(f"   🎯 Calmar: p50={data['metrics']['calmar']['p50']:.2f}")
        else:
            print(f"   ❌ Erreur: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    # Test configuration avancée
    print("\n🚀 Configuration avancée (avec tous les modules):")
    print(f"   Paramètres: {json.dumps(advanced_params, indent=2)}")
    
    try:
        response = requests.post(f"{base_url}/mc_simulate", json={
            "params": advanced_params,
            "n_runs": 100,
            "seed": 42,
            "quantiles": [0.05, 0.25, 0.5, 0.75, 0.95]
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Résultats: {data['n_runs']} runs, {data['pass_pct']}% FTMO pass")
            print(f"   📈 MaxDD: p50={data['metrics']['max_dd']['p50']:.4f}, p95={data['metrics']['max_dd']['p95']:.4f}")
            print(f"   💰 Final EQ: p50={data['metrics']['final_eq']['p50']:.4f}, p95={data['metrics']['final_eq']['p95']:.4f}")
            print(f"   📊 Sortino: p50={data['metrics']['sortino']['p50']:.2f}")
            print(f"   🎯 Calmar: p50={data['metrics']['calmar']['p50']:.2f}")
        else:
            print(f"   ❌ Erreur: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 Démonstration terminée !")
    print("\n💡 Points clés:")
    print("   • LMAX dynamique: ajuste automatiquement le risque selon la volatilité")
    print("   • CPPI: protège le capital avec un floor dynamique")
    print("   • VolTarget: maintient une volatilité cible constante")
    print("   • SoftBarrier: réduit le risque en cas de drawdown")
    print("   • Métriques avancées: Sortino, Calmar, quantiles")

if __name__ == "__main__":
    demo_mc_comparison()
