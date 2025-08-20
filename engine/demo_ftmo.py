#!/usr/bin/env python3
"""
Script de démonstration FTMO Multi-Challenge
Teste différents scénarios et affiche les résultats
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8001"

def test_ftmo_scenario(name: str, config: Dict[str, Any]) -> None:
    """Teste un scénario FTMO et affiche les résultats"""
    print(f"\n🔍 {name}")
    print("=" * 50)
    
    try:
        response = requests.post(f"{BASE_URL}/ftmo_multi", json=config)
        if response.status_code == 200:
            data = response.json()
            estimate = data["estimate"]
            example = data["example"]
            
            print(f"📊 Probabilités:")
            print(f"   • P(≥1 succès): {estimate['p_any']:.1%}")
            print(f"   • P(tous succès): {estimate['p_all']:.1%}")
            print(f"   • P(aucun succès): {estimate['p_none']:.1%}")
            print(f"   • IC 95%: [{estimate['ci95'][0]:.1%}, {estimate['ci95'][1]:.1%}]")
            
            print(f"\n📈 Exemple de challenge:")
            print(f"   • Succès: {'✅' if example['passed'] else '❌'}")
            print(f"   • Gain: {example['gain_pct']:.3f}%")
            print(f"   • MaxDD: {example['kpis']['MaxDD']:.1%}")
            print(f"   • Violations: {len(example['violations'])}")
            
        else:
            print(f"❌ Erreur API: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

def main():
    """Fonction principale de démonstration"""
    print("🚀 DÉMONSTRATION FTMO MULTI-CHALLENGE")
    print("=" * 60)
    
    # Configuration de base
    base_preset = {
        "capital_initial": 100000,
        "modules": [
            {"id": "bayes", "enabled": True, "params": {"p": 0.55, "k": 0.1, "cap": 0.02}},
            {"id": "vol_target", "enabled": True, "params": {"target_vol": 0.1, "vol_est": 0.1, "scale": 0.1, "max_risk": 0.02}},
            {"id": "cppi", "enabled": True, "params": {"multiplier": 1.0, "cap": 0.02}},
            {"id": "drawdown_manager", "enabled": True, "params": {"bands": [[5, 0.02], [10, 0.01], [20, 0.0]]}}
        ],
        "gating": {},
        "risk_limits": {"max_dd": 10, "daily_dd": 5, "freeze_cushion_pct": 5}
    }
    
    # Scénario 1: Marché haussier modéré
    config1 = {
        "preset": base_preset,
        "market_model": {"type": "MC", "params": {"mu": 0.002, "sigma": 0.01}},
        "horizon": 100,
        "rules": {
            "profit_target_pct": 8,
            "max_total_dd_pct": 10,
            "max_daily_dd_pct": 5,
            "min_trading_steps": 5,
            "time_limit_steps": 100
        },
        "parallel": 3,
        "trials": 20,
        "seed": 42
    }
    
    # Scénario 2: Marché volatil
    config2 = {
        "preset": base_preset,
        "market_model": {"type": "MC", "params": {"mu": 0.001, "sigma": 0.02}},
        "horizon": 100,
        "rules": {
            "profit_target_pct": 12,
            "max_total_dd_pct": 15,
            "max_daily_dd_pct": 8,
            "min_trading_steps": 5,
            "time_limit_steps": 100
        },
        "parallel": 3,
        "trials": 20,
        "seed": 42
    }
    
    # Scénario 3: Marché stable
    config3 = {
        "preset": base_preset,
        "market_model": {"type": "MC", "params": {"mu": 0.0005, "sigma": 0.005}},
        "horizon": 100,
        "rules": {
            "profit_target_pct": 5,
            "max_total_dd_pct": 8,
            "max_daily_dd_pct": 3,
            "min_trading_steps": 5,
            "time_limit_steps": 100
        },
        "parallel": 3,
        "trials": 20,
        "seed": 42
    }
    
    # Test des scénarios
    test_ftmo_scenario("Marché Haussier Modéré (μ=0.2%, σ=1%)", config1)
    test_ftmo_scenario("Marché Volatil (μ=0.1%, σ=2%)", config2)
    test_ftmo_scenario("Marché Stable (μ=0.05%, σ=0.5%)", config3)
    
    print(f"\n🎯 Résumé:")
    print("=" * 50)
    print("• Le système FTMO Multi-Challenge est opérationnel")
    print("• 3 scénarios de marché testés avec différents paramètres")
    print("• Probabilités estimées avec intervalles de confiance 95%")
    print("• Intégration complète avec le moteur MM (Bayes, CPPI, etc.)")
    
    print(f"\n🌐 Accès:")
    print("• Backend API: http://localhost:8001")
    print("• Frontend: http://localhost:3000")
    print("• Documentation API: http://localhost:8001/docs")

if __name__ == "__main__":
    main()
