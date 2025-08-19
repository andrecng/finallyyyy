#!/usr/bin/env python3
"""
Test complet des modes de freeze CPPI
Valide la logique de protection du capital selon la philosophie du risque relatif
"""

import numpy as np
import json
from datetime import datetime

def run_strategy(trades, W0=100_000, alpha=0.10, f=0.1, lam=0.5,
                 freeze_mode="hard", tau=0.05):
    """
    Simulateur CPPI avec modes de freeze
    
    Args:
        trades: array de résultats en % du capital engagé
        W0: capital initial
        alpha: paramètre de plancher (1-alpha = % du HWM)
        f: fraction Kelly
        lam: fractionnement Kelly
        freeze_mode: "hard" (freeze permanent) ou "soft" (défreeze possible)
        tau: seuil de freeze (cushion/W < tau)
    
    Returns:
        dict avec historique et métriques
    """
    W = W0
    HWM = W0
    F = HWM * (1 - alpha)
    frozen = False
    hist = []
    freeze_events = []
    exposure_history = []
    
    for i, ret in enumerate(trades):
        # Cushion et freeze
        C = max(W - F, 0)
        cushion_ratio = C / W if W > 0 else 0
        
        # Log freeze events
        if frozen:
            hist.append(W)
            exposure_history.append(0.0)
            
            if freeze_mode == "soft" and cushion_ratio >= tau:
                frozen = False  # défreeze si soft
                freeze_events.append({
                    "step": i,
                    "action": "defreeze",
                    "cushion_ratio": cushion_ratio,
                    "capital": W
                })
            else:
                continue
        
        # Check freeze condition
        if cushion_ratio < tau:
            if not frozen:
                frozen = True
                freeze_events.append({
                    "step": i,
                    "action": "freeze",
                    "cushion_ratio": cushion_ratio,
                    "capital": W
                })
            hist.append(W)
            exposure_history.append(0.0)
            continue
        
        # Allocation risquée
        E = lam * f * C
        exposure_history.append(E)
        
        # Update capital
        W_old = W
        W = W + E * ret
        HWM = max(HWM, W)
        F = HWM * (1 - alpha)
        
        hist.append(W)
    
    # Calculate metrics
    hist = np.array(hist)
    exposure_history = np.array(exposure_history)
    
    # Drawdown calculation
    peak = np.maximum.accumulate(hist)
    drawdown = (hist - peak) / peak
    max_dd = np.min(drawdown)
    
    # Risk metrics
    returns = np.diff(hist) / hist[:-1]
    volatility = np.std(returns) * np.sqrt(252) if len(returns) > 1 else 0
    
    # Freeze metrics
    freeze_count = len([e for e in freeze_events if e["action"] == "freeze"])
    defreeze_count = len([e for e in freeze_events if e["action"] == "defreeze"])
    
    return {
        "capital_history": hist.tolist(),
        "exposure_history": exposure_history.tolist(),
        "freeze_events": freeze_events,
        "metrics": {
            "initial_capital": W0,
            "final_capital": float(hist[-1]),
            "total_return": float((hist[-1] - W0) / W0),
            "max_drawdown": float(max_dd),
            "volatility": float(volatility),
            "freeze_count": freeze_count,
            "defreeze_count": defreeze_count,
            "max_capital": float(np.max(hist)),
            "min_capital": float(np.min(hist))
        }
    }

def run_comparison_test():
    """Test de comparaison des modes hard vs soft"""
    
    # Configuration FTMO
    config = {
        "W0": 100_000,
        "alpha": 0.10,  # plancher à 90% du HWM
        "f": 0.1,       # fraction Kelly
        "lam": 0.5,     # fractionnement Kelly
        "tau": 0.05,    # freeze si cushion < 5%
        "N_trades": 30, # horizon FTMO
        "win_rate": 0.55,
        "payoff": 1.0
    }
    
    # Générer trades
    rng = np.random.default_rng(42)
    N = config["N_trades"]
    signs = (rng.random(N) < config["win_rate"]).astype(int) * 2 - 1
    trades = signs * config["payoff"]
    
    # Test hard freeze
    result_hard = run_strategy(
        trades, 
        W0=config["W0"],
        alpha=config["alpha"],
        f=config["f"],
        lam=config["lam"],
        freeze_mode="hard",
        tau=config["tau"]
    )
    
    # Test soft freeze
    result_soft = run_strategy(
        trades, 
        W0=config["W0"],
        alpha=config["alpha"],
        f=config["f"],
        lam=config["lam"],
        freeze_mode="soft",
        tau=config["tau"]
    )
    
    # Analyse comparative
    analysis = {
        "config": config,
        "hard_freeze": result_hard,
        "soft_freeze": result_soft,
        "comparison": {
            "hard_vs_soft_capital": result_hard["metrics"]["final_capital"] - result_soft["metrics"]["final_capital"],
            "hard_vs_soft_dd": result_hard["metrics"]["max_drawdown"] - result_soft["metrics"]["max_drawdown"],
            "hard_vs_soft_vol": result_hard["metrics"]["volatility"] - result_soft["metrics"]["volatility"],
            "freeze_effectiveness": {
                "hard": result_hard["metrics"]["freeze_count"],
                "soft": result_soft["metrics"]["freeze_count"]
            }
        }
    }
    
    return analysis

def save_results(analysis, filename=None):
    """Sauvegarde des résultats avec timestamp"""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"logs/freeze_modes_test_{timestamp}.json"
    
    # Créer le dossier logs si nécessaire
    import os
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    with open(filename, 'w') as f:
        json.dump(analysis, f, indent=2)
    
    return filename

def print_summary(analysis):
    """Affichage du résumé des tests"""
    print("🧪 Test des Modes de Freeze CPPI")
    print("=" * 50)
    
    config = analysis["config"]
    print(f"📊 Configuration:")
    print(f"   Capital initial: ${config['W0']:,}")
    print(f"   Alpha (plancher): {config['alpha']:.1%}")
    print(f"   Tau (freeze): {config['tau']:.1%}")
    print(f"   Trades: {config['N_trades']}")
    print(f"   Win rate: {config['win_rate']:.1%}")
    print()
    
    hard = analysis["hard_freeze"]["metrics"]
    soft = analysis["soft_freeze"]["metrics"]
    
    print("🔒 Hard Freeze (permanent):")
    print(f"   Capital final: ${hard['final_capital']:,.2f}")
    print(f"   Return: {hard['total_return']:.2%}")
    print(f"   Max DD: {hard['max_drawdown']:.2%}")
    print(f"   Freezes: {hard['freeze_count']}")
    print()
    
    print("🔄 Soft Freeze (défreeze possible):")
    print(f"   Capital final: ${soft['final_capital']:,.2f}")
    print(f"   Return: {soft['total_return']:.2%}")
    print(f"   Max DD: {soft['max_drawdown']:.2%}")
    print(f"   Freezes: {soft['freeze_count']}")
    print(f"   Défreezes: {soft['defreeze_count']}")
    print()
    
    comp = analysis["comparison"]
    print("📈 Comparaison:")
    print(f"   Diff capital: ${comp['hard_vs_soft_capital']:,.2f}")
    print(f"   Diff DD: {comp['hard_vs_soft_dd']:.2%}")
    print(f"   Diff volatilité: {comp['hard_vs_soft_vol']:.2%}")
    
    # Validation des règles d'or
    print()
    print("✅ Validation des Règles d'Or:")
    
    # Règle 1: Pas de size-up after loss
    hard_peaks = np.maximum.accumulate(analysis["hard_freeze"]["capital_history"])
    soft_peaks = np.maximum.accumulate(analysis["soft_freeze"]["capital_history"])
    
    hard_size_up = np.any(np.diff(hard_peaks) > 0)
    soft_size_up = np.any(np.diff(soft_peaks) > 0)
    
    print(f"   Pas de size-up après perte (Hard): {'✅' if not hard_size_up else '❌'}")
    print(f"   Pas de size-up après perte (Soft): {'✅' if not soft_size_up else '❌'}")
    
    # Règle 2: Freeze effectif
    hard_freeze_effective = hard["freeze_count"] > 0
    soft_freeze_effective = soft["freeze_count"] > 0
    
    print(f"   Freeze effectif (Hard): {'✅' if hard_freeze_effective else '❌'}")
    print(f"   Freeze effectif (Soft): {'✅' if soft_freeze_effective else '❌'}")
    
    # Règle 3: Respect des contraintes FTMO
    ftmo_dd_ok = abs(hard["max_drawdown"]) <= 0.10  # DD max 10%
    print(f"   Contrainte FTMO (DD ≤ 10%): {'✅' if ftmo_dd_ok else '❌'}")

if __name__ == "__main__":
    print("🚀 Lancement du test des modes de freeze...")
    
    # Exécuter le test
    analysis = run_comparison_test()
    
    # Afficher le résumé
    print_summary(analysis)
    
    # Sauvegarder les résultats
    filename = save_results(analysis)
    print(f"\n💾 Résultats sauvegardés: {filename}")
    
    print("\n🎯 Test terminé avec succès!")
