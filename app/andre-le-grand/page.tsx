'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

/**
 * Configuration complète du moteur de Money Management
 * 
 * Cette interface définit tous les paramètres nécessaires pour configurer
 * le système de gestion des risques et de position sizing
 */
interface MMConfig {
  capital: number;                    // Capital initial en dollars
  kelly: {
    f_cap: number;                    // Limite maximale de la fraction Kelly (ex: 0.25 = 25%)
    decay: number;                    // Facteur de décroissance bayésienne (ex: 0.1)
    prior: [number, number];          // Prior Beta(a,b) pour la probabilité de gain
    window: number;                   // Fenêtre glissante pour le calcul de g_expectation
    winsor_R: number;                 // Limite supérieure pour R (évite les extrêmes)
  };
  sequence: {
    mult: number;                     // Multiplicateur de base pour les gains consécutifs
    max_steps: number;                // Nombre maximal d'étapes consécutives
    reset: boolean;                   // Reset du multiplicateur sur perte
    stop_rules: any;                  // Règles de blocage (à implémenter)
  };
  vol_target: {
    target_vol: number;               // Volatilité cible (ex: 0.15 = 15%)
    current_vol: number;              // Volatilité actuelle observée
    lookback?: number;                // Fenêtre de calcul de la volatilité (en jours)
    cap_multiplier?: number;         // Multiplicateur de cap pour limiter l'effet
  };
  dd_paliers: {
    level1: number;                   // Premier palier de drawdown (ex: 0.05 = 5%)
    level2: number;                   // Deuxième palier de drawdown (ex: 0.10 = 10%)
    level3: number;                   // Troisième palier de drawdown (ex: 0.20 = 20%)
  };
  cushion_floor: {
    alpha: number;                    // Facteur de protection du capital (ex: 0.20 = 20%)
  };
}

/**
 * Résultat d'un trade pour l'analyse et la mise à jour des modèles
 */
interface TradeResult {
  win: boolean;                       // True si gain, False si perte
  R: number;                          // Ratio risque/récompense réalisé
  equity: number;                     // Capital après le trade
}

/**
 * Calculateur Kelly optimisé avec mise à jour bayésienne
 * 
 * Implémente la formule de Kelly : f* = p̂ - (1-p̂)/R
 * Avec protection contre les valeurs extrêmes et mise à jour bayésienne
 * 
 * Référence : Kelly, J.L. (1956). "A New Interpretation of Information Rate"
 */
class KellyCalculator {
  private f_cap: number;              // Limite maximale de la fraction
  private decay: number;              // Facteur de décroissance bayésienne
  private prior_a: number;            // Paramètre a du prior Beta
  private prior_b: number;            // Paramètre b du prior Beta
  private window: number;             // Fenêtre pour le calcul de g_expectation
  private winsor_R: number;           // Limite supérieure pour R
  private past_results: TradeResult[] = []; // Historique des trades

  constructor(config: MMConfig['kelly']) {
    this.f_cap = config.f_cap;
    this.decay = config.decay;
    this.prior_a = config.prior[0];
    this.prior_b = config.prior[1];
    this.window = config.window;
    this.winsor_R = config.winsor_R;
  }

  /**
   * Calcule la fraction optimale selon la formule de Kelly
   * 
   * @param p_hat - Probabilité estimée de gain (0-1)
   * @param R - Ratio risque/récompense (gain potentiel / perte potentielle)
   * @returns Fraction optimale du capital à risquer (0-1)
   * 
   * Formule : f* = p̂ - (1-p̂)/R
   * 
   * Exemple : p̂=0.6, R=2 → f* = 0.6 - 0.4/2 = 0.4 (40% du capital)
   * 
   * Protection : R est limité par winsor_R pour éviter les extrêmes
   */
  compute(p_hat: number, R: number): number {
    // Winsorisation : limite R à une valeur maximale pour éviter les extrêmes
    const capped_R = Math.min(R, this.winsor_R);
    
    // Formule de Kelly avec protection contre les valeurs négatives
    return Math.max(0.0, p_hat - (1 - p_hat) / capped_R);
  }

  /**
   * Critère de Rotando/Thorp pour valider la fraction Kelly
   * 
   * Calcule l'espérance logarithmique de croissance : E[log(1 + f*R)]
   * Si g(f*) < 0, la position est rejetée (trop risquée)
   * 
   * @param f - Fraction du capital à tester
   * @returns Espérance logarithmique de croissance
   * 
   * Référence : Thorp, E.O. (2006). "The Kelly Criterion in Blackjack Sports Betting"
   */
  g_expectation(f: number): number {
    if (this.past_results.length === 0) return 1; // Accepte tout si pas d'historique
    
    let g = 0;
    const recent_results = this.past_results.slice(-this.window); // Fenêtre glissante
    
    for (const r of recent_results) {
      const r_val = Math.min(r.R, this.winsor_R); // Winsorisation
      if (r.win) {
        g += Math.log(1 + f * r_val); // Gain : log(1 + f*R)
      } else {
        g += Math.log(1 - f);         // Perte : log(1 - f)
      }
    }
    
    return g / Math.min(this.past_results.length, this.window);
  }

  /**
   * Met à jour le modèle bayésien avec un nouveau résultat
   * 
   * @param result - Résultat du trade à intégrer
   * 
   * Le modèle Beta(a,b) est mis à jour :
   * - Gain : a += decay
   * - Perte : b += decay
   * 
   * La fenêtre glissante maintient un historique limité
   */
  update_bayes(result: TradeResult): void {
    this.past_results.push(result);
    
    // Maintient la fenêtre glissante
    if (this.past_results.length > this.window) {
      this.past_results.shift(); // Supprime le plus ancien
    }
  }

  /**
   * Calcule la probabilité de gain bayésienne mise à jour
   * 
   * @returns Probabilité de gain basée sur l'historique et le prior
   * 
   * Formule : p̂ = a / (a + b)
   * Où a et b sont les paramètres du prior Beta mis à jour
   */
  get_bayesian_p_hat(): number {
    let a = this.prior_a;
    let b = this.prior_b;
    
    // Mise à jour bayésienne avec l'historique
    for (const r of this.past_results) {
      if (r.win) {
        a += this.decay; // Gain augmente a
      } else {
        b += this.decay; // Perte augmente b
      }
    }
    
    return a / (a + b);
  }

  /**
   * Récupère les statistiques du calculateur Kelly
   */
  get_stats() {
    return {
      past_results: this.past_results,
      bayesian_p_hat: this.get_bayesian_p_hat(),
      total_trades: this.past_results.length
    };
  }
}

/**
 * Gestionnaire de séquence anti-martingale optimisé
 * 
 * Implémente un système de progression basé sur les gains consécutifs
 * avec protection contre les pertes et limites de progression
 * 
 * Différence avec l'ancienne version :
 * - Système d'étapes au lieu de multiplicateur progressif
 * - Reset automatique sur perte
 * - Limite maximale d'étapes
 */
class SequenceManager {
  private mult: number;               // Multiplicateur de base
  private max_steps: number;          // Nombre maximal d'étapes
  private reset_on_loss: boolean;     // Reset sur perte
  private stop_rules: any;            // Règles de blocage (à implémenter)
  private current_step: number = 0;   // Étape actuelle
  private last_result: string | null = null; // Dernier résultat

  constructor(config: MMConfig['sequence']) {
    this.mult = config.mult;
    this.max_steps = config.max_steps;
    this.reset_on_loss = config.reset;
    this.stop_rules = config.stop_rules;
  }

  /**
   * Calcule le multiplicateur actuel basé sur l'étape
   * 
   * @returns Multiplicateur = mult^current_step
   * 
   * Exemple : mult=1.2, current_step=3 → 1.2³ = 1.728
   */
  getCurrentMultiplier(): number {
    return Math.pow(this.mult, this.current_step);
  }

  /**
   * Met à jour la séquence avec un nouveau résultat
   * 
   * @param result - Résultat du trade
   * 
   * Logique :
   * - Gain : avance d'une étape (si < max_steps)
   * - Perte : reset à l'étape 0 (si reset_on_loss = true)
   */
  update(result: TradeResult): void {
    if (result.win) {
      this.last_result = 'win';
      // Avance d'une étape si pas à la limite
      if (this.current_step < this.max_steps) {
        this.current_step += 1;
      }
    } else {
      this.last_result = 'loss';
      // Reset sur perte si configuré
      if (this.reset_on_loss) {
        this.current_step = 0;
      }
    }
  }

  /**
   * Remet la séquence à zéro
   */
  reset(): void {
    this.current_step = 0;
    this.last_result = null;
  }

  /**
   * Récupère l'état actuel de la séquence
   */
  getSequenceState() {
    return {
      current_step: this.current_step,
      multiplier: this.getCurrentMultiplier(),
      last_result: this.last_result,
      max_steps: this.max_steps
    };
  }
}

/**
 * Gestionnaire de cible de volatilité avancé
 * 
 * Calcule la volatilité historique et ajuste la taille des positions
 * pour maintenir une volatilité cible constante
 * 
 * Implémente deux approches :
 * 1. Calcul automatique de la volatilité à partir des rendements
 * 2. Ajustement de taille selon la volatilité observée
 */
class VolatilityTarget {
  private target_vol: number;         // Volatilité cible annualisée (ex: 0.15 = 15%)
  private lookback: number;           // Fenêtre de calcul de la volatilité (en jours)
  private cap_multiplier: number;     // Multiplicateur de cap pour limiter l'effet
  private returns_history: number[] = []; // Historique des rendements journaliers

  constructor(config: MMConfig['vol_target']) {
    this.target_vol = config.target_vol;
    this.lookback = config.lookback || 20; // Valeur par défaut si non spécifiée
    this.cap_multiplier = config.cap_multiplier || 2.0; // Valeur par défaut si non spécifiée
  }

  /**
   * Calcule la volatilité historique annualisée
   * 
   * @param returns - Liste des rendements journaliers récents
   * @returns Volatilité annualisée ou null si pas assez de données
   * 
   * Formule : σ = √(Σ(r - μ)²/n) × √252
   * Où :
   * - r = rendement journalier
   * - μ = moyenne des rendements
   * - n = nombre de jours (lookback)
   * - 252 = jours de trading par an
   * 
   * Cas limites :
   * - Si pas assez de data (< lookback) → return null
   * - Si vol = 0 → return null (évite division par zéro)
   */
  computeVolatility(returns?: number[]): number | null {
    const data = returns || this.returns_history;
    
    if (data.length < this.lookback) {
      return null; // Pas assez de données
    }
    
    const recent_returns = data.slice(-this.lookback);
    const mean_return = recent_returns.reduce((sum, r) => sum + r, 0) / this.lookback;
    
    // Calcul de la variance
    const variance = recent_returns.reduce((sum, r) => sum + Math.pow(r - mean_return, 2), 0) / this.lookback;
    
    if (variance === 0) {
      return null; // Évite division par zéro
    }
    
    // Volatilité journalière × √252 pour annualiser
    const daily_vol = Math.sqrt(variance);
    return daily_vol * Math.sqrt(252);
  }

  /**
   * Ajuste la taille pour atteindre la volatilité cible
   * 
   * @param size - Taille de position initiale
   * @param external_vol_estimate - Estimation externe de volatilité (optionnel)
   * @returns Taille ajustée selon la volatilité cible
   * 
   * Pattern de fallback robuste :
   * 1. Calcule la volatilité à partir des rendements historiques
   * 2. Utilise l'estimation externe si fournie
   * 3. Fallback vers une volatilité par défaut si aucune n'est disponible
   * 
   * Logique :
   * - Si vol_observée < vol_cible : augmente la taille
   * - Si vol_observée > vol_cible : diminue la taille
   * - Cap à cap_multiplier pour éviter les extrêmes
   * 
   * Exemple :
   * - Vol cible : 15%, Vol observée : 10%
   * - Ajustement : 15/10 = 1.5x
   * - Taille finale : size × 1.5
   */
  adjustSize(size: number, external_vol_estimate?: number): number {
    // Pattern de fallback robuste recommandé
    const vol = this.computeVolatility() || external_vol_estimate || this.getDefaultVolatility();
    
    if (vol === null || vol === 0) {
      return size; // Pas d'ajustement si pas de volatilité
    }
    
    // Calcul de l'ajustement brut
    const raw_adjustment = this.target_vol / vol;
    
    // Application du cap pour éviter les extrêmes
    const capped_adjustment = Math.min(raw_adjustment, this.cap_multiplier);
    
    return size * capped_adjustment;
  }

  /**
   * Ajuste la taille avec une estimation externe de volatilité
   * 
   * @param size - Taille de position initiale
   * @param external_vol_estimate - Estimation externe de volatilité
   * @returns Taille ajustée selon la volatilité cible
   * 
   * Cette méthode permet l'injection d'estimations de volatilité depuis :
   * - Données de marché en temps réel
   * - Modèles de volatilité externes
   * - Estimations d'autres systèmes
   */
  adjustSizeWithExternalVol(size: number, external_vol_estimate: number): number {
    return this.adjustSize(size, external_vol_estimate);
  }

  /**
   * Obtient une volatilité par défaut en cas de fallback
   * 
   * @returns Volatilité par défaut basée sur la configuration
   * 
   * Cette méthode fournit une estimation raisonnable quand :
   * - Pas assez de données historiques
   * - Aucune estimation externe fournie
   * - Calcul automatique échoue
   */
  private getDefaultVolatility(): number {
    // Utilise la volatilité cible comme estimation par défaut
    // Alternative : pourrait utiliser une moyenne de marché ou une valeur historique
    return this.target_vol;
  }

  /**
   * Met à jour l'historique des rendements
   * 
   * @param new_return - Nouveau rendement journalier
   * 
   * Maintient un historique limité pour éviter l'accumulation de données
   */
  updateReturns(new_return: number): void {
    this.returns_history.push(new_return);
    
    // Maintient la taille de l'historique
    if (this.returns_history.length > this.lookback * 2) {
      this.returns_history = this.returns_history.slice(-this.lookback * 2);
    }
  }

  /**
   * Met à jour la volatilité observée (méthode legacy pour compatibilité)
   * 
   * @param new_vol - Nouvelle volatilité observée
   * 
   * @deprecated Utilisez updateReturns() pour une approche plus robuste
   */
  updateVolatility(new_vol: number): void {
    // Calcul approximatif du rendement basé sur la volatilité
    // Cette méthode est maintenue pour la compatibilité
    const daily_return = new_vol / Math.sqrt(252);
    this.updateReturns(daily_return);
  }

  /**
   * Récupère les statistiques de volatilité
   */
  getVolatilityStats() {
    const current_vol = this.computeVolatility();
    return {
      target_vol: this.target_vol,
      current_vol: current_vol,
      lookback: this.lookback,
      cap_multiplier: this.cap_multiplier,
      returns_count: this.returns_history.length,
      adjustment_ratio: current_vol ? this.target_vol / current_vol : 1
    };
  }
}

/**
 * Contrôleur de risque avec paliers de drawdown
 * 
 * Applique des réductions progressives de taille selon le niveau de drawdown
 * et gère la cushion de protection du capital
 */
class RiskController {
  private dd_paliers: MMConfig['dd_paliers'];
  private cushion_floor: MMConfig['cushion_floor'];
  private hwm: number;                // High Water Mark (plus haut historique)
  private floor: number;              // Niveau de protection (capital minimum)
  private cushion: number;            // Marge de sécurité (HWM - floor)

  constructor(config: MMConfig['dd_paliers'] & MMConfig['cushion_floor'], initial_capital: number) {
    this.dd_paliers = config;
    this.cushion_floor = config;
    this.hwm = initial_capital;
    this.floor = this.hwm * (1 - this.cushion_floor.alpha);
    this.cushion = this.hwm - this.floor;
  }

  /**
   * Applique les paliers de réduction selon le drawdown
   * 
   * @param size - Taille de position initiale
   * @returns Taille réduite selon le niveau de risque
   * 
   * Paliers :
   * - DD > 20% : réduction à 10% (protection maximale)
   * - DD > 10% : réduction à 50% (protection modérée)
   * - DD > 5%  : réduction à 80% (protection légère)
   * - DD ≤ 5%  : pas de réduction
   */
  applyPaliers(size: number): number {
    const current_equity = this.hwm; // Simplifié pour l'exemple
    const drawdown = (this.hwm - current_equity) / this.hwm;
    
    if (drawdown > this.dd_paliers.level3) {
      return size * 0.1; // Réduction drastique (90%)
    } else if (drawdown > this.dd_paliers.level2) {
      return size * 0.5; // Réduction modérée (50%)
    } else if (drawdown > this.dd_paliers.level1) {
      return size * 0.8; // Réduction légère (20%)
    }
    
    return size; // Pas de réduction
  }

  /**
   * Met à jour les métriques de risque
   */
  update(hwm: number, equity: number): void {
    this.hwm = Math.max(this.hwm, hwm);
    this.floor = this.hwm * (1 - this.cushion_floor.alpha);
    this.cushion = this.hwm - this.floor;
  }

  /**
   * Récupère les métriques de risque actuelles
   */
  getRiskMetrics() {
    return {
      hwm: this.hwm,
      floor: this.floor,
      cushion: this.cushion,
      current_equity: this.hwm // Simplifié
    };
  }
}

/**
 * Moteur principal de Money Management
 * 
 * Orchestre tous les composants pour calculer la taille optimale des positions
 * et gérer l'évolution du capital et des risques
 */
class MoneyManagementEngine {
  private config: MMConfig;
  private hwm: number;                // High Water Mark
  private floor: number;              // Niveau de protection
  private cushion: number;            // Marge de sécurité
  private kelly: KellyCalculator;     // Calculateur Kelly
  private sequence: SequenceManager;  // Gestionnaire de séquence
  private vol_target: VolatilityTarget; // Cible de volatilité
  private risk_controller: RiskController; // Contrôleur de risque
  private equity_history: number[] = []; // Historique du capital

  constructor(config: MMConfig) {
    this.config = config;
    this.hwm = config.capital;
    this.floor = this.hwm * (1 - config.cushion_floor.alpha);
    this.cushion = this.hwm - this.floor;
    
    // Initialisation des composants
    this.kelly = new KellyCalculator(config.kelly);
    this.sequence = new SequenceManager(config.sequence);
    this.vol_target = new VolatilityTarget(config.vol_target);
    this.risk_controller = new RiskController(
      { ...config.dd_paliers, ...config.cushion_floor },
      config.capital
    );
    
    this.equity_history.push(config.capital);
  }

  /**
   * Calcule la taille optimale de position
   * 
   * @param p_hat - Probabilité de gain
   * @param R - Ratio risque/récompense
   * @returns Taille de position en pourcentage du capital
   * 
   * Pipeline de calcul :
   * 1. Kelly : f* = p̂ - (1-p̂)/R
   * 2. Validation : g_expectation(f*) > 0
   * 3. Limitation : min(f*, f_cap)
   * 4. Séquence : × multiplicateur anti-martingale
   * 5. Volatilité : ajustement pour cible de vol
   * 6. Risque : application des paliers de DD
   */
  computeSize(p_hat: number, R: number): number {
    // Étape 1 : Calcul Kelly
    const f_star = this.kelly.compute(p_hat, R);
    
    // Étape 2 : Validation par critère de Rotando/Thorp
    if (this.kelly.g_expectation(f_star) < 0) {
      return 0; // Position rejetée
    }
    
    // Étape 3 : Limitation par f_cap
    let size = Math.min(f_star, this.config.kelly.f_cap);
    
    // Étape 4 : Application du multiplicateur de séquence
    size *= this.sequence.getCurrentMultiplier();
    
    // Étape 5 : Ajustement pour cible de volatilité
    // Pattern de fallback robuste : vol = vt.compute_volatility(recent_returns) || external_vol_estimate
    size = this.vol_target.adjustSize(size);
    
    // Étape 6 : Application des paliers de risque
    size = this.risk_controller.applyPaliers(size);
    
    return size;
  }

  /**
   * Met à jour le moteur après un trade
   * 
   * @param result - Résultat du trade
   * 
   * Mises à jour :
   * - HWM et historique du capital
   * - Séquence anti-martingale
   * - Modèle bayésien Kelly
   * - Métriques de risque
   * - Historique des rendements pour volatilité
   */
  updateAfterTrade(result: TradeResult): void {
    // Mise à jour du capital
    this.hwm = Math.max(this.hwm, result.equity);
    this.equity_history.push(result.equity);
    
    // Calcul du rendement du trade
    if (this.equity_history.length > 1) {
      const previous_equity = this.equity_history[this.equity_history.length - 2];
      const trade_return = (result.equity - previous_equity) / previous_equity;
      
      // Mise à jour de l'historique des rendements pour le calcul de volatilité
      this.vol_target.updateReturns(trade_return);
    }
    
    // Mise à jour des composants
    this.sequence.update(result);
    this.kelly.update_bayes(result);
    this.risk_controller.update(this.hwm, result.equity);
  }

  /**
   * Récupère les statistiques complètes du moteur
   */
  getEngineStats() {
    return {
      hwm: this.hwm,
      floor: this.floor,
      cushion: this.cushion,
      kelly_stats: this.kelly.get_stats(),
      sequence_stats: this.sequence.getSequenceState(),
      risk_metrics: this.risk_controller.getRiskMetrics(),
      equity_history: this.equity_history,
      vol_stats: this.vol_target.getVolatilityStats()
    };
  }

  /**
   * Remet le moteur à son état initial
   */
  reset(): void {
    this.hwm = this.config.capital;
    this.floor = this.hwm * (1 - this.config.cushion_floor.alpha);
    this.cushion = this.hwm - this.floor;
    this.equity_history = [this.config.capital];
    this.sequence.reset();
  }
}

// Composant React principal
export default function AndreLeGrandPage() {
  const [config, setConfig] = useState<MMConfig>({
    capital: 100000,
    kelly: {
      f_cap: 0.25,
      decay: 0.1,
      prior: [1, 1],
      window: 20,
      winsor_R: 3.0
    },
    sequence: {
      mult: 1.2,
      max_steps: 3,
      reset: true,
      stop_rules: {}
    },
    vol_target: {
      target_vol: 0.15,
      current_vol: 0.12,
      lookback: 20,
      cap_multiplier: 2.0
    },
    dd_paliers: {
      level1: 0.05,
      level2: 0.10,
      level3: 0.20
    },
    cushion_floor: {
      alpha: 0.20
    }
  });

  const [engine, setEngine] = useState<MoneyManagementEngine | null>(null);
  const [p_hat, setP_hat] = useState(0.55);
  const [R, setR] = useState(2.0);
  const [computedSize, setComputedSize] = useState(0);
  const [tradeResults, setTradeResults] = useState<TradeResult[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (engine) {
      setStats(engine.getEngineStats());
    }
  }, [engine, tradeResults]);

  const initializeEngine = () => {
    const newEngine = new MoneyManagementEngine(config);
    setEngine(newEngine);
    setStats(newEngine.getEngineStats());
  };

  const computeSize = () => {
    if (engine) {
      const size = engine.computeSize(p_hat, R);
      setComputedSize(size);
    }
  };

  const simulateTrade = () => {
    if (!engine) return;

    // Simulation d'un trade
    const isWin = Math.random() < p_hat;
    const actual_R = isWin ? R : -1;
    const equity_change = computedSize * actual_R;
    const current_equity = (stats?.equity_history[stats.equity_history.length - 1] || config.capital) + equity_change;
    
    const result: TradeResult = {
      win: isWin,
      R: actual_R,
      equity: current_equity
    };

    engine.updateAfterTrade(result);
    setTradeResults([...tradeResults, result]);
    setStats(engine.getEngineStats());
  };

  const resetEngine = () => {
    if (engine) {
      engine.reset();
      setTradeResults([]);
      setStats(engine.getEngineStats());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4">
            🧠 André le Grand
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Moteur de Money Management Modulaire</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="config" className="data-[state=active]:bg-blue-600">⚙️ Configuration</TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-purple-600">🎯 Simulation</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-green-600">📊 Statistiques</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-orange-600">📈 Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-blue-400">⚙️ Configuration du Moteur</CardTitle>
                <CardDescription className="text-gray-300">Paramètres du système de Money Management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capital" className="text-gray-300">Capital Initial</Label>
                    <Input
                      id="capital"
                      type="number"
                      value={config.capital}
                      onChange={(e) => setConfig({...config, capital: Number(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="f_cap" className="text-gray-300">Kelly F Cap</Label>
                    <Input
                      id="f_cap"
                      type="number"
                      step="0.01"
                      value={config.kelly.f_cap}
                      onChange={(e) => setConfig({
                        ...config, 
                        kelly: {...config.kelly, f_cap: Number(e.target.value)}
                      })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lookback" className="text-gray-300">Fenêtre Volatilité (jours)</Label>
                    <Input
                      id="lookback"
                      type="number"
                      value={config.vol_target.lookback}
                      onChange={(e) => setConfig({
                        ...config, 
                        vol_target: {...config.vol_target, lookback: Number(e.target.value)}
                      })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cap_multiplier" className="text-gray-300">Cap Multiplicateur Vol</Label>
                    <Input
                      id="cap_multiplier"
                      type="number"
                      step="0.1"
                      value={config.vol_target.cap_multiplier}
                      onChange={(e) => setConfig({
                        ...config, 
                        vol_target: {...config.vol_target, cap_multiplier: Number(e.target.value)}
                      })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <Button onClick={initializeEngine} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  🚀 Initialiser le Moteur
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-purple-400">🎯 Simulation de Trade</CardTitle>
                <CardDescription className="text-gray-300">Testez le moteur avec différents paramètres</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="p_hat" className="text-gray-300">Probabilité de gain (p̂)</Label>
                    <Slider
                      id="p_hat"
                      min={0.1}
                      max={0.9}
                      step={0.01}
                      value={[p_hat]}
                      onValueChange={([value]) => setP_hat(value)}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-400">{p_hat.toFixed(2)}</span>
                  </div>
                  <div>
                    <Label htmlFor="R" className="text-gray-300">Ratio Risque/Récompense (R)</Label>
                    <Slider
                      id="R"
                      min={0.5}
                      max={5.0}
                      step={0.1}
                      value={[R]}
                      onValueChange={([value]) => setR(value)}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-400">{R.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={computeSize} disabled={!engine} className="bg-blue-600 hover:bg-blue-700">
                    🧮 Calculer Taille
                  </Button>
                  <Button onClick={simulateTrade} disabled={!engine || computedSize === 0} className="bg-purple-600 hover:bg-purple-700">
                    🎲 Simuler Trade
                  </Button>
                  <Button onClick={resetEngine} variant="outline" disabled={!engine} className="border-slate-600 text-gray-300 hover:bg-slate-700">
                    🔄 Reset
                  </Button>
                </div>

                {computedSize > 0 && (
                  <div className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
                    <h4 className="font-semibold mb-2 text-blue-300">🎯 Résultat du calcul :</h4>
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      Taille de position : {(computedSize * 100).toFixed(2)}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-green-400">📊 Statistiques du Moteur</CardTitle>
                <CardDescription className="text-gray-300">État actuel et métriques</CardDescription>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-green-300">💰 Capital & Risque</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">HWM:</span>
                          <Badge variant="secondary" className="bg-green-600 text-white">${stats.hwm.toLocaleString()}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">Floor:</span>
                          <Badge variant="outline" className="border-orange-500 text-orange-400">${stats.floor.toLocaleString()}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">Cushion:</span>
                          <Badge variant="outline" className="border-blue-500 text-blue-400">${stats.cushion.toLocaleString()}</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-purple-300">🧠 Kelly & Séquence</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">p̂ bayésien:</span>
                          <Badge variant="secondary" className="bg-purple-600 text-white">{(stats.kelly_stats.bayesian_p_hat * 100).toFixed(1)}%</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">Multiplicateur:</span>
                          <Badge variant="outline" className="border-yellow-500 text-yellow-400">{stats.sequence_stats.multiplier.toFixed(2)}x</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">Étape actuelle:</span>
                          <Badge variant="outline" className="border-yellow-500 text-yellow-400">{stats.sequence_stats.current_step}/{stats.sequence_stats.max_steps}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">Trades totaux:</span>
                          <Badge variant="outline" className="border-gray-500 text-gray-400">{stats.kelly_stats.total_trades}</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-cyan-300">📊 Volatilité & Ajustements</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">Vol cible:</span>
                          <Badge variant="secondary" className="bg-cyan-600 text-white">{(stats.vol_stats?.target_vol * 100).toFixed(1)}%</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">Vol actuelle:</span>
                          <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                            {stats.vol_stats?.current_vol ? (stats.vol_stats.current_vol * 100).toFixed(1) + '%' : 'N/A'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">Ratio ajustement:</span>
                          <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                            {stats.vol_stats?.adjustment_ratio ? stats.vol_stats.adjustment_ratio.toFixed(2) + 'x' : '1.0x'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                          <span className="text-gray-300">Fenêtre:</span>
                          <Badge variant="outline" className="border-gray-500 text-gray-400">{stats.vol_stats?.lookback || 20}j</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">🚀 Initialisez le moteur pour voir les statistiques</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-orange-400">📈 Historique des Trades</CardTitle>
                <CardDescription className="text-gray-300">Résultats des simulations</CardDescription>
              </CardHeader>
              <CardContent>
                {tradeResults.length > 0 ? (
                  <div className="space-y-3">
                    {tradeResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <span className="font-mono text-gray-300">#{index + 1}</span>
                        <Badge variant={result.win ? "default" : "destructive"} className={result.win ? "bg-green-600" : "bg-red-600"}>
                          {result.win ? "✅ WIN" : "❌ LOSS"}
                        </Badge>
                        <span className="font-mono text-gray-300">R: {result.R.toFixed(2)}</span>
                        <span className="font-mono text-gray-300">${result.equity.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">🎲 Aucun trade simulé pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
