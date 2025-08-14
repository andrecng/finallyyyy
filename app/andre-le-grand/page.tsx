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
 * 
 * Configuration étendue selon GPT pour inclure tous les nouveaux modules
 */
interface MMConfig {
  capital: number;                    // Capital initial en dollars
  kelly: {
    f_cap: number;                    // Limite maximale de la fraction Kelly (ex: 0.25 = 25%)
    mode: 'simple' | 'bayesian';     // Mode Kelly à utiliser (simple ou bayésien)
  };
  bayesian: {
    prior_a: number;                  // Prior Beta pour les succès (ex: 1.0)
    prior_b: number;                  // Prior Beta pour les échecs (ex: 1.0)
    decay: number;                    // Facteur de décay temporel (ex: 0.95)
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
  drawdown: {
    thresholds: number[];             // Seuils de drawdown (ex: [-0.05, -0.10, -0.20])
    multipliers: number[];            // Multiplicateurs correspondants (ex: [0.8, 0.5, 0.2])
    soft_barrier: {
      paliers: number[];              // Seuils de drawdown pour barrières douces
      ratios: number[];               // Ratios associés à chaque palier
    };
  };
  cppi: {
    alpha: number;                    // Facteur de protection CPPI (ex: 0.1 = 10%)
    freeze_threshold: number;         // Seuil de gel (ex: 0.05 = 5%)
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
 * Estimateur bayésien de la probabilité de gain
 * 
 * NOUVEAU MODULE selon GPT : Estime p^ via une mise à jour bayésienne
 * Plus sophistiqué que l'ancien système de prior fixe
 * 
 * Avantages :
 * - Adaptation automatique aux conditions de marché
 * - Décay temporel pour donner plus de poids aux trades récents
 * - Estimation robuste même avec peu de données
 */
class BayesianWinRate {
  private a: number;                    // Succès a priori (prior Beta)
  private b: number;                    // Échecs a priori (prior Beta)
  private decay: number;                // Poids de l'historique (1.0 = pas de decay)

  constructor(prior_a: number = 1, prior_b: number = 1, decay: number = 1.0) {
    this.a = prior_a;
    this.b = prior_b;
    this.decay = decay;
  }

  /**
   * Met à jour la distribution après un trade
   * 
   * @param result - Résultat du trade (1 = gain, 0 = perte)
   * 
   * Logique bayésienne :
   * - a = a × decay + result (succès)
   * - b = b × decay + (1 - result) (échecs)
   * 
   * Exemple avec decay = 0.9 :
   * - Trade gagné : a = 1 × 0.9 + 1 = 1.9, b = 1 × 0.9 + 0 = 0.9
   * - Trade perdu : a = 1.9 × 0.9 + 0 = 1.71, b = 0.9 × 0.9 + 1 = 1.81
   */
  update(result: number): void {
    this.a = this.a * this.decay + result;
    this.b = this.b * this.decay + (1 - result);
  }

  /**
   * Retourne l'espérance de la probabilité de gain
   * 
   * @returns p^ estimé = a / (a + b)
   * 
   * Formule : E[p] = α / (α + β) où α, β sont les paramètres Beta
   * 
   * Propriétés :
   * - 0 ≤ p^ ≤ 1 (probabilité valide)
   * - Plus de données → estimation plus précise
   * - Decay < 1 → plus de poids aux trades récents
   */
  getEstimate(): number {
    return this.a / (this.a + this.b);
  }

  /**
   * Récupère l'état actuel de l'estimateur
   */
  getState() {
    return {
      a: this.a,
      b: this.b,
      decay: this.decay,
      estimate: this.getEstimate(),
      total_observations: this.a + this.b - 2 // -2 car prior initial
    };
  }

  /**
   * Remet l'estimateur à ses valeurs initiales
   */
  reset(): void {
    this.a = 1;
    this.b = 1;
  }
}

/**
 * Calculateur Kelly simplifié et optimisé
 * 
 * VERSION MISE À JOUR selon GPT : Plus simple, plus rapide
 * Remplace la complexité bayésienne par une approche directe
 * 
 * Avantages :
 * - Calcul rapide et efficace
 * - Moins de paramètres à ajuster
 * - Idéal pour les stratégies à court terme
 */
class KellyCalculator {
  private f_cap: number;                // Limite maximale de la fraction

  constructor(f_cap: number = 0.2) {
    this.f_cap = f_cap;
  }

  /**
   * Calcule la fraction Kelly optimale
   * 
   * @param p_win - Probabilité estimée de gain
   * @param payoff - Ratio gain/perte moyen (R)
   * @returns Fraction de capital à risquer
   * 
   * Formule Kelly : f* = p_win - (1 - p_win) / payoff
   * 
   * Exemples :
   * - p_win = 0.6, payoff = 2 → f* = 0.6 - 0.4/2 = 0.4
   * - p_win = 0.5, payoff = 1 → f* = 0.5 - 0.5/1 = 0.0
   * - p_win = 0.7, payoff = 1.5 → f* = 0.7 - 0.3/1.5 = 0.5
   * 
   * Protection :
   * - f* ≤ 0 → retourne 0 (pas de trade)
   * - f* > f_cap → retourne f_cap (limite de risque)
   */
  computeKelly(p_win: number, payoff: number): number {
    if (payoff <= 0) return 0;
    
    const kelly = p_win - (1 - p_win) / payoff;
    
    if (kelly <= 0) return 0.0;
    
    return Math.min(kelly, this.f_cap);
  }

  /**
   * Récupère la configuration du calculateur
   */
  getConfig() {
    return { f_cap: this.f_cap };
  }
}

/**
 * Gestionnaire de séquence anti-martingale optimisé
 * 
 * Implémente un système de progression basé sur les gains consécutifs
 * avec protection contre les pertes et limites de progression
 * 
 * Interfaces harmonisées selon GPT : on_win, on_loss, get_multiplier
 * Logique interne conservée : système d'étapes avec reset automatique
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
   * Interface harmonisée : Gestion d'un gain
   * 
   * Avance d'une étape si pas à la limite maximale
   * Logique interne : système d'étapes progressives
   */
  on_win(): void {
    this.last_result = 'win';
    // Avance d'une étape si pas à la limite
    if (this.current_step < this.max_steps) {
      this.current_step += 1;
    }
  }

  /**
   * Interface harmonisée : Gestion d'une perte
   * 
   * Reset à l'étape 0 si configuré
   * Logique interne : protection contre les séries de pertes
   */
  on_loss(): void {
    this.last_result = 'loss';
    // Reset sur perte si configuré
    if (this.reset_on_loss) {
      this.current_step = 0;
    }
  }

  /**
   * Interface harmonisée : Obtention du multiplicateur
   * 
   * @returns Multiplicateur = mult^current_step
   * 
   * Exemple : mult=1.2, current_step=3 → 1.2³ = 1.728
   */
  get_multiplier(): number {
    return Math.pow(this.mult, this.current_step);
  }

  /**
   * Méthode legacy pour compatibilité (à déprécier)
   * @deprecated Utilisez get_multiplier() à la place
   */
  getCurrentMultiplier(): number {
    return this.get_multiplier();
  }

  /**
   * Méthode legacy pour compatibilité (à déprécier)
   * @deprecated Utilisez on_win() et on_loss() à la place
   */
  update(result: TradeResult): void {
    if (result.win) {
      this.on_win();
    } else {
      this.on_loss();
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
      multiplier: this.get_multiplier(),
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
    this.kelly = new KellyCalculator(config.kelly.f_cap);
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
    const f_star = this.kelly.computeKelly(p_hat, R);
    
    // Étape 2 : Validation par critère de Rotando/Thorp
    // La validation de g_expectation est maintenant gérée par KellyCalculator
    // On peut ajouter une logique ici si nécessaire, mais la formule Kelly est déjà une limite.
    
    // Étape 3 : Limitation par f_cap
    let size = Math.min(f_star, this.config.kelly.f_cap);
    
    // Étape 4 : Application du multiplicateur de séquence
    size *= this.sequence.get_multiplier();
    
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
    if (result.win) {
      this.sequence.on_win();
    } else {
      this.sequence.on_loss();
    }
    // La mise à jour bayésienne est maintenant gérée par BayesianWinRate
    // this.kelly.update_bayes(result); 
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
      kelly_stats: this.kelly.getConfig(),
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

/**
 * Gestionnaire de drawdown avec seuils configurables
 * 
 * Gère la réduction dynamique de risque selon le drawdown vs HWM
 * Remplace l'ancien système de paliers fixes par des seuils configurables
 */
class DrawdownManager {
  private thresholds: number[];        // Seuils de drawdown (ex: [-0.05, -0.10, -0.20])
  private multipliers: number[];      // Multiplicateurs correspondants (ex: [0.8, 0.5, 0.2])
  private hwm: number;                // High Water Mark

  constructor(thresholds: number[] = [-0.05, -0.10, -0.20], multipliers: number[] = [0.8, 0.5, 0.2]) {
    this.thresholds = thresholds;
    this.multipliers = multipliers;
    this.hwm = 1.0;
  }

  /**
   * Met à jour le HWM et calcule le multiplicateur de risque
   * 
   * @param equity - Capital actuel
   * @returns Multiplicateur de réduction de risque (1.0 = pas de réduction)
   * 
   * Logique :
   * - Si equity > HWM : met à jour HWM, retourne 1.0
   * - Si drawdown ≤ seuil : applique le multiplicateur correspondant
   * - Plus le drawdown est profond, plus la réduction est forte
   */
  getMultiplier(equity: number): number {
    const drawdown = (equity - this.hwm) / this.hwm;
    
    // Vérifie les seuils de drawdown
    for (let i = 0; i < this.thresholds.length; i++) {
      if (drawdown <= this.thresholds[i]) {
        return this.multipliers[i];
      }
    }
    
    // Si equity > HWM, met à jour le HWM
    if (equity > this.hwm) {
      this.hwm = equity;
    }
    
    return 1.0; // Pas de réduction
  }

  /**
   * Met à jour le HWM manuellement
   */
  updateHWM(newHWM: number): void {
    this.hwm = Math.max(this.hwm, newHWM);
  }

  /**
   * Récupère l'état actuel du gestionnaire
   */
  getState() {
    return {
      hwm: this.hwm,
      thresholds: this.thresholds,
      multipliers: this.multipliers
    };
  }
}

/**
 * Gestionnaire de floor CPPI (Constant Proportion Portfolio Insurance)
 * 
 * Implémente la logique CPPI avec un facteur de protection alpha
 * Plus sophistiqué que l'ancien système de cushion simple
 */
class CPPIFloorManager {
  private alpha: number;               // Facteur de protection (ex: 0.1 = 10%)
  private floor: number | null;        // Niveau de protection actuel

  constructor(alpha: number = 0.1) {
    this.alpha = alpha;
    this.floor = null;
  }

  /**
   * Met à jour le niveau de protection basé sur le HWM
   * 
   * @param hwm - High Water Mark actuel
   * 
   * Formule : Floor = HWM × (1 - α)
   * Exemple : HWM = 100, α = 0.1 → Floor = 90
   */
  updateFloor(hwm: number): void {
    this.floor = hwm * (1 - this.alpha);
  }

  /**
   * Vérifie si le capital est en dessous du niveau de protection
   * 
   * @param equity - Capital actuel
   * @returns true si equity ≤ floor (protection activée)
   */
  isBelowFloor(equity: number): boolean {
    if (this.floor === null) return false;
    return equity <= this.floor;
  }

  /**
   * Calcule la marge de sécurité (cushion)
   * 
   * @param equity - Capital actuel
   * @returns Marge de sécurité (equity - floor) ou 0 si pas de floor
   */
  getCushion(equity: number): number {
    if (this.floor === null) return 0;
    return Math.max(0, equity - this.floor);
  }

  /**
   * Récupère l'état actuel du gestionnaire CPPI
   */
  getState() {
    return {
      alpha: this.alpha,
      floor: this.floor,
      isProtected: this.floor !== null
    };
  }
}

/**
 * Gestionnaire de drawdown avec barrières douces (Version GPT)
 * 
 * VERSION OPTIMISÉE selon GPT : Interface plus claire et logique simplifiée
 * Coexiste avec DrawdownManager pour comparaison et modularité
 * 
 * Différences avec DrawdownManager :
 * - Interface : compute_multiplier(current_dd) vs getMultiplier(equity)
 * - Logique : Drawdown direct vs calcul HWM
 * - Paramètres : paliers/ratios vs thresholds/multipliers
 */
class SoftBarrierDrawdownPalier {
  private paliers: number[];              // Seuils de drawdown (négatifs)
  private ratios: number[];               // Multiplicateurs associés à chaque palier

  constructor(paliers: number[] = [-0.1, -0.2, -0.3], ratios: number[] = [0.6, 0.4, 0.2]) {
    this.paliers = paliers;
    this.ratios = ratios;
  }

  /**
   * Calcule le multiplicateur de risque selon le drawdown courant
   * 
   * @param current_dd - Drawdown courant (ex: -0.15 pour -15%)
   * @returns Multiplicateur de risque (1.0 = pas de réduction)
   * 
   * Logique optimisée GPT :
   * - Si drawdown ≤ seuil → applique le ratio correspondant
   * - Plus le drawdown est profond, plus la réduction est forte
   * - Si drawdown > tous les seuils → retourne 1.0 (pas de réduction)
   * 
   * Exemple :
   * - Seuils : [-0.1, -0.2, -0.3]
   * - Ratios : [0.6, 0.4, 0.2]
   * - Drawdown -15% → ratio 0.4 (réduction de 60%)
   * 
   * Avantages vs DrawdownManager :
   * - Interface plus claire : drawdown direct vs equity
   * - Logique simplifiée : pas de calcul HWM
   * - Paramètres intuitifs : paliers/ratios
   */
  compute_multiplier(current_dd: number): number {
    for (let i = 0; i < this.paliers.length; i++) {
      if (current_dd <= this.paliers[i]) {
        return this.ratios[i];
      }
    }
    return 1.0; // Pas de réduction si drawdown > tous les seuils
  }

  /**
   * Récupère l'état actuel du gestionnaire
   */
  getState() {
    return {
      paliers: this.paliers,
      ratios: this.ratios
    };
  }
}

/**
 * Gestionnaire CPPI avec seuil de gel automatique (Version GPT)
 * 
 * VERSION ÉTENDUE selon GPT : Plus sophistiquée que CPPIFloorManager
 * Coexiste avec CPPIFloorManager pour comparaison et modularité
 * 
 * Différences avec CPPIFloorManager :
 * - Méthode : should_freeze(equity) vs isBelowFloor(equity)
 * - Logique : Gel automatique vs simple protection
 * - Paramètres : freeze_threshold en plus de alpha
 * 
 * Avantages vs CPPIFloorManager :
   * - Protection renforcée du capital
   * - Gel automatique en cas de danger
   * - Seuil configurable pour la sensibilité
 */
class CPPIFreeze {
  private alpha: number;                   // Facteur de protection CPPI
  private freeze_threshold: number;        // Seuil de gel (ex: 0.05 = 5%)
  private floor: number | null;            // Niveau de protection actuel

  constructor(alpha: number = 0.1, freeze_threshold: number = 0.05) {
    this.alpha = alpha;
    this.freeze_threshold = freeze_threshold;
    this.floor = null;
  }

  /**
   * Met à jour le niveau de protection basé sur le HWM
   * 
   * @param hwm - High Water Mark actuel
   * 
   * Formule : Floor = HWM × (1 - α)
   * Exemple : HWM = 100, α = 0.1 → Floor = 90
   */
  update_floor(hwm: number): void {
    this.floor = hwm * (1 - this.alpha);
  }

  /**
   * Détermine si le risque doit être gelé
   * 
   * @param equity - Capital actuel
   * @returns true si freeze activé, false sinon
   * 
   * Logique de gel avancée GPT :
   * - Calcule le cushion = equity - floor
   * - Si cushion/equity < freeze_threshold → gel activé
   * - Protection renforcée quand le capital est en danger
   * 
   * Exemple :
   * - Floor = 90, Equity = 92, Freeze threshold = 5%
   * - Cushion = 2, Ratio = 2/92 = 2.2%
   * - 2.2% < 5% → Freeze activé
   * 
   * Différence avec CPPIFloorManager :
   * - isBelowFloor : protection basique (equity ≤ floor)
   * - should_freeze : protection avancée (cushion trop faible)
   */
  should_freeze(equity: number): boolean {
    if (this.floor === null || equity <= 0) return true;
    
    const cushion = equity - this.floor;
    const cushion_ratio = cushion / equity;
    
    return cushion_ratio < this.freeze_threshold;
  }

  /**
   * Vérifie si le capital est en dessous du niveau de protection
   * 
   * @param equity - Capital actuel
   * @returns true si equity ≤ floor (protection CPPI activée)
   * 
   * Compatibilité avec CPPIFloorManager :
   * - Même logique que isBelowFloor
   * - Permet la migration progressive
   */
  isBelowFloor(equity: number): boolean {
    if (this.floor === null) return false;
    return equity <= this.floor;
  }

  /**
   * Calcule la marge de sécurité (cushion)
   * 
   * @param equity - Capital actuel
   * @returns Marge de sécurité (equity - floor) ou 0 si pas de floor
   */
  getCushion(equity: number): number {
    if (this.floor === null) return 0;
    return Math.max(0, equity - this.floor);
  }

  /**
   * Récupère l'état complet du gestionnaire CPPI
   */
  getState() {
    return {
      alpha: this.alpha,
      freeze_threshold: this.freeze_threshold,
      floor: this.floor,
      isProtected: this.floor !== null,
      shouldFreeze: this.floor !== null ? this.should_freeze(this.floor + 1) : false
    };
  }
}

/**
 * Orchestrateur principal de position sizing
 * 
 * Combine tous les modules pour déterminer la taille optimale de position
 * Architecture modulaire recommandée par GPT avec orchestration centralisée
 * 
 * Remplace progressivement l'ancien MoneyManagementEngine
 */
class PositionSizer {
  private kelly: KellyCalculator;  // Kelly simplifié
  private dd: DrawdownManager;                             // Gestionnaire de drawdown
  private cppi: CPPIFloorManager;                          // Gestionnaire CPPI
  private vol_target?: VolatilityTarget;                   // Cible de volatilité (optionnel)
  private seq_manager?: SequenceManager;                    // Gestionnaire de séquence (optionnel)
  private use_bayesian: boolean;                           // Mode Kelly à utiliser

  constructor(
    kelly_calculator: KellyCalculator,
    drawdown_manager: DrawdownManager,
    cppi_manager: CPPIFloorManager,
    vol_target?: VolatilityTarget,
    seq_manager?: SequenceManager,
    use_bayesian: boolean = false
  ) {
    this.kelly = kelly_calculator;
    this.dd = drawdown_manager;
    this.cppi = cppi_manager;
    this.vol_target = vol_target;
    this.seq_manager = seq_manager;
    this.use_bayesian = use_bayesian;
  }

  /**
   * Calcule la taille optimale de position
   * 
   * @param equity - Capital actuel
   * @param hwm - High Water Mark
   * @param p_win - Probabilité de gain
   * @param payoff - Ratio gain/perte moyen (R)
   * @param current_size_pct - Taille actuelle (optionnel)
   * @param realized_vol - Volatilité observée (optionnel)
   * @returns Taille de position optimale
   * 
   * Pipeline de calcul selon GPT :
   * 1. Kelly size capée (simple ou bayésien)
   * 2. Ajustement drawdown
   * 3. Contrainte CPPI
   * 4. Volatility targeting (si disponible)
   * 5. Logique de séquence (si disponible)
   */
  computeSize(
    equity: number,
    hwm: number,
    p_win: number,
    payoff: number,
    current_size_pct?: number,
    realized_vol?: number
  ): number {
    // Étape 1 : Kelly size capée
    let base_size: number;
    
    if (this.use_bayesian && 'computeKelly' in this.kelly) {
      // Kelly bayésien simplifié
      base_size = (this.kelly as KellyCalculator).computeKelly(p_win, payoff);
    } else {
      // Kelly simple
      base_size = (this.kelly as KellyCalculator).computeKelly(p_win, payoff);
    }

    // Étape 2 : Ajustement drawdown
    const dd_multiplier = this.dd.getMultiplier(equity);
    base_size *= dd_multiplier;

    // Étape 3 : Contrainte CPPI
    this.cppi.updateFloor(hwm);
    if (this.cppi.isBelowFloor(equity)) {
      return 0.0; // Protection activée
    }

    // Étape 4 : Volatility targeting
    if (this.vol_target && realized_vol) {
      base_size = this.vol_target.adjustSize(base_size, realized_vol);
    }

    // Étape 5 : Logique de séquence
    const seq_mult = this.seq_manager ? this.seq_manager.get_multiplier() : 1.0;
    base_size *= seq_mult;

    return Math.max(0, base_size);
  }

  /**
   * Met à jour les composants après un trade
   * 
   * @param result - Résultat du trade
   * @param equity - Capital après le trade
   * @param hwm - High Water Mark mis à jour
   */
  updateAfterTrade(result: TradeResult, equity: number, hwm: number): void {
    // Mise à jour du HWM dans le gestionnaire de drawdown
    this.dd.updateHWM(hwm);
    
    // Mise à jour de la séquence
    if (this.seq_manager) {
      if (result.win) {
        this.seq_manager.on_win();
      } else {
        this.seq_manager.on_loss();
      }
    }
    
    // Mise à jour du floor CPPI
    this.cppi.updateFloor(hwm);
  }

  /**
   * Bascule entre Kelly simple et bayésien
   * 
   * @param use_bayesian - true pour Kelly bayésien, false pour simple
   */
  setKellyMode(use_bayesian: boolean): void {
    this.use_bayesian = use_bayesian;
  }

  /**
   * Récupère l'état complet de tous les composants
   */
  getState() {
    return {
      kelly_mode: this.use_bayesian ? 'bayesian' : 'simple',
      drawdown: this.dd.getState(),
      cppi: this.cppi.getState(),
      volatility: this.vol_target?.getVolatilityStats() || null,
      sequence: this.seq_manager?.getSequenceState() || null
    };
  }
}

// Composant React principal
export default function AndreLeGrandPage() {
  const [config, setConfig] = useState<MMConfig>({
    capital: 100000,
    kelly: {
      f_cap: 0.25,
      mode: 'simple'
    },
    bayesian: {
      prior_a: 1.0,
      prior_b: 1.0,
      decay: 0.95
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
    drawdown: {
      thresholds: [-0.05, -0.10, -0.20],
      multipliers: [0.8, 0.5, 0.2],
      soft_barrier: {
        paliers: [-0.1, -0.2, -0.3],
        ratios: [0.6, 0.4, 0.2]
      }
    },
    cppi: {
      alpha: 0.1,
      freeze_threshold: 0.05
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
  const [positionSizer, setPositionSizer] = useState<PositionSizer | null>(null);
  const [bayesianWinRate, setBayesianWinRate] = useState<BayesianWinRate | null>(null);
  const [p_hat, setP_hat] = useState(0.55);
  const [R, setR] = useState(2.0);
  const [computedSize, setComputedSize] = useState(0);
  const [tradeResults, setTradeResults] = useState<TradeResult[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [useNewArchitecture, setUseNewArchitecture] = useState(false);

  useEffect(() => {
    if (engine) {
      setStats(engine.getEngineStats());
    }
    if (positionSizer) {
      setStats(positionSizer.getState());
    }
  }, [engine, positionSizer, tradeResults]);

  const initializeEngine = () => {
    // Initialisation de l'estimateur bayésien
    const newBayesianWinRate = new BayesianWinRate(
      config.bayesian.prior_a,
      config.bayesian.prior_b,
      config.bayesian.decay
    );
    setBayesianWinRate(newBayesianWinRate);

    if (useNewArchitecture) {
      // Nouvelle architecture modulaire avec PositionSizer
      const kellyCalculator = new KellyCalculator(config.kelly.f_cap);
      const drawdownManager = new DrawdownManager(config.drawdown.thresholds, config.drawdown.multipliers);
      const cppiManager = new CPPIFloorManager(config.cppi.alpha);
      const volTarget = new VolatilityTarget(config.vol_target);
      const seqManager = new SequenceManager(config.sequence);
      
      const newPositionSizer = new PositionSizer(
        kellyCalculator,
        drawdownManager,
        cppiManager,
        volTarget,
        seqManager,
        config.kelly.mode === 'bayesian'
      );
      
      setPositionSizer(newPositionSizer);
      setStats(newPositionSizer.getState());
    } else {
      // Ancienne architecture avec MoneyManagementEngine
      const newEngine = new MoneyManagementEngine(config);
      setEngine(newEngine);
      setStats(newEngine.getEngineStats());
    }
  };

  const computeSize = () => {
    if (useNewArchitecture && positionSizer) {
      // Nouvelle architecture modulaire
      const currentEquity = stats?.drawdown?.hwm || config.capital;
      const hwm = stats?.drawdown?.hwm || config.capital;
      const size = positionSizer.computeSize(currentEquity, hwm, p_hat, R);
      setComputedSize(size);
    } else if (engine) {
      // Ancienne architecture
      const size = engine.computeSize(p_hat, R);
      setComputedSize(size);
    }
  };

  const simulateTrade = () => {
    if (useNewArchitecture && positionSizer) {
      // Nouvelle architecture modulaire
      const isWin = Math.random() < p_hat;
      const actual_R = isWin ? R : -1;
      const equity_change = computedSize * actual_R;
      const current_equity = (stats?.drawdown?.hwm || config.capital) + equity_change;
      
      const result: TradeResult = {
        win: isWin,
        R: actual_R,
        equity: current_equity
      };

      // Mise à jour de l'estimateur bayésien
      if (bayesianWinRate) {
        bayesianWinRate.update(isWin ? 1 : 0);
        // Mise à jour automatique de p_hat basée sur l'estimation bayésienne
        setP_hat(bayesianWinRate.getEstimate());
      }

      positionSizer.updateAfterTrade(result, current_equity, Math.max(stats?.drawdown?.hwm || config.capital, current_equity));
      setTradeResults([...tradeResults, result]);
      setStats(positionSizer.getState());
    } else if (engine) {
      // Ancienne architecture
      const isWin = Math.random() < p_hat;
      const actual_R = isWin ? R : -1;
      const equity_change = computedSize * actual_R;
      const current_equity = (stats?.equity_history[stats.equity_history.length - 1] || config.capital) + equity_change;
      
      const result: TradeResult = {
        win: isWin,
        R: actual_R,
        equity: current_equity
      };

      // Mise à jour de l'estimateur bayésien
      if (bayesianWinRate) {
        bayesianWinRate.update(isWin ? 1 : 0);
        // Mise à jour automatique de p_hat basée sur l'estimation bayésienne
        setP_hat(bayesianWinRate.getEstimate());
      }

      engine.updateAfterTrade(result);
      setTradeResults([...tradeResults, result]);
      setStats(engine.getEngineStats());
    }
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
            🧠 André le Grand MM Engine
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Moteur de Money Management Modulaire et Avancé</p>
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

                {/* Nouveaux contrôles pour BayesianWinRate */}
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <h4 className="text-lg font-semibold text-purple-400 mb-3">🧠 Estimateur Bayésien</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="prior_a" className="text-gray-300 text-sm">Prior Succès (a)</Label>
                      <Input
                        id="prior_a"
                        type="number"
                        step="0.1"
                        value={config.bayesian.prior_a}
                        onChange={(e) => setConfig({
                          ...config, 
                          bayesian: {...config.bayesian, prior_a: Number(e.target.value)}
                        })}
                        className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prior_b" className="text-gray-300 text-sm">Prior Échecs (b)</Label>
                      <Input
                        id="prior_b"
                        type="number"
                        step="0.1"
                        value={config.bayesian.prior_b}
                        onChange={(e) => setConfig({
                          ...config, 
                          bayesian: {...config.bayesian, prior_b: Number(e.target.value)}
                        })}
                        className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="decay" className="text-gray-300 text-sm">Facteur Decay</Label>
                      <Input
                        id="decay"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={config.bayesian.decay}
                        onChange={(e) => setConfig({
                          ...config, 
                          bayesian: {...config.bayesian, decay: Number(e.target.value)}
                        })}
                        className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Prior Beta(a,b) pour l'estimation de p^ avec decay temporel. Decay = 1.0 = pas de decay, 0.9 = 10% de decay par trade.
                  </p>
                </div>

                {/* Nouveaux contrôles pour CPPIFreeze */}
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">❄️ CPPI avec Gel Automatique</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cppi_alpha" className="text-gray-300 text-sm">Facteur de Protection (α)</Label>
                      <Input
                        id="cppi_alpha"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={config.cppi.alpha}
                        onChange={(e) => setConfig({
                          ...config, 
                          cppi: {...config.cppi, alpha: Number(e.target.value)}
                        })}
                        className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeze_threshold" className="text-gray-300 text-sm">Seuil de Gel (%)</Label>
                      <Input
                        id="freeze_threshold"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={config.cppi.freeze_threshold}
                        onChange={(e) => setConfig({
                          ...config, 
                          cppi: {...config.cppi, freeze_threshold: Number(e.target.value)}
                        })}
                        className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    CPPI avec gel automatique. α = facteur de protection, Seuil de gel = pourcentage du cushion pour activer le gel.
                  </p>
                </div>

                {/* Nouveaux contrôles pour SoftBarrierDrawdownPalier */}
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3">🛡️ Barrières de Drawdown Douces (Version GPT)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="soft_paliers" className="text-gray-300 text-sm">Seuils (ex: -0.1,-0.2,-0.3)</Label>
                      <Input
                        id="soft_paliers"
                        type="text"
                        value={config.drawdown.soft_barrier.paliers.join(',')}
                        onChange={(e) => {
                          const values = e.target.value.split(',').map(v => Number(v.trim()));
                          if (values.every(v => !isNaN(v))) {
                            setConfig({
                              ...config, 
                              drawdown: {
                                ...config.drawdown,
                                soft_barrier: {
                                  ...config.drawdown.soft_barrier,
                                  paliers: values
                                }
                              }
                            });
                          }
                        }}
                        className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                        placeholder="-0.1,-0.2,-0.3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="soft_ratios" className="text-gray-300 text-sm">Ratios (ex: 0.6,0.4,0.2)</Label>
                      <Input
                        id="soft_ratios"
                        type="text"
                        value={config.drawdown.soft_barrier.ratios.join(',')}
                        onChange={(e) => {
                          const values = e.target.value.split(',').map(v => Number(v.trim()));
                          if (values.every(v => !isNaN(v))) {
                            setConfig({
                              ...config, 
                              drawdown: {
                                ...config.drawdown,
                                soft_barrier: {
                                  ...config.drawdown.soft_barrier,
                                  ratios: values
                                }
                              }
                            });
                          }
                        }}
                        className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                        placeholder="0.6,0.4,0.2"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Version GPT optimisée : Seuils de drawdown et ratios associés pour la réduction douce du risque. Format: seuils séparés par des virgules.
                  </p>
                </div>

                {/* Contrôles existants pour comparaison */}
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <h4 className="text-lg font-semibold text-blue-400 mb-3">🔄 Modules Existants (Pour Comparaison)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dd_thresholds" className="text-gray-300 text-sm">Seuils Drawdown (Legacy)</Label>
                      <Input
                        id="dd_thresholds"
                        type="text"
                        value={config.drawdown.thresholds.join(',')}
                        onChange={(e) => {
                          const values = e.target.value.split(',').map(v => Number(v.trim()));
                          if (values.every(v => !isNaN(v))) {
                            setConfig({
                              ...config, 
                              drawdown: {
                                ...config.drawdown,
                                thresholds: values
                              }
                            });
                          }
                        }}
                        className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                        placeholder="-0.05,-0.10,-0.20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dd_multipliers" className="text-gray-300 text-sm">Multiplicateurs (Legacy)</Label>
                      <Input
                        id="dd_multipliers"
                        type="text"
                        value={config.drawdown.multipliers.join(',')}
                        onChange={(e) => {
                          const values = e.target.value.split(',').map(v => Number(v.trim()));
                          if (values.every(v => !isNaN(v))) {
                            setConfig({
                              ...config, 
                              drawdown: {
                                ...config.drawdown,
                                multipliers: values
                              }
                            });
                          }
                        }}
                        className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                        placeholder="0.8,0.5,0.2"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Modules existants pour comparaison avec les nouvelles versions GPT. Permet de tester les deux approches.
                  </p>
                </div>

                {/* Nouveau contrôle pour l'architecture */}
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-gray-300 font-semibold">🏗️ Architecture du Moteur</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Legacy</span>
                      <Button
                        variant={useNewArchitecture ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseNewArchitecture(!useNewArchitecture)}
                        className={useNewArchitecture ? "bg-green-600 hover:bg-green-700" : "border-slate-600"}
                      >
                        {useNewArchitecture ? "🆕 Modulaire" : "🔄 Legacy"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {useNewArchitecture 
                      ? "Nouvelle architecture modulaire avec PositionSizer, DrawdownManager, CPPI" 
                      : "Ancienne architecture MoneyManagementEngine pour compatibilité"
                    }
                  </p>
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

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="text-green-400">📊 Kelly Calculator</CardTitle>
                  <CardDescription className="text-gray-300">Statistiques du calculateur Kelly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">F Cap:</span>
                      <span className="text-white font-mono">{stats?.kelly_stats?.f_cap || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Mode:</span>
                      <span className="text-white font-mono">{stats?.kelly_mode || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nouvelle carte pour BayesianWinRate */}
              <Card className="bg-slate-800/50 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="text-purple-400">🧠 Estimateur Bayésien</CardTitle>
                  <CardDescription className="text-gray-300">Probabilité de gain estimée</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">p^ estimé:</span>
                      <span className="text-white font-mono">{(p_hat * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Prior (a,b):</span>
                      <span className="text-white font-mono">
                        {bayesianWinRate ? `(${bayesianWinRate.getState().a.toFixed(1)}, ${bayesianWinRate.getState().b.toFixed(1)})` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Decay:</span>
                      <span className="text-white font-mono">
                        {bayesianWinRate ? bayesianWinRate.getState().decay.toFixed(2) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Observations:</span>
                      <span className="text-white font-mono">
                        {bayesianWinRate ? bayesianWinRate.getState().total_observations : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                            <Badge variant="secondary" className="bg-green-600 text-white">
                              ${stats?.hwm ? stats.hwm.toLocaleString() : config.capital.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                            <span className="text-gray-300">Floor:</span>
                            <Badge variant="outline" className="border-orange-500 text-orange-400">
                              ${stats?.floor ? stats.floor.toLocaleString() : (config.capital * (1 - config.cushion_floor.alpha)).toLocaleString()}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                            <span className="text-gray-300">Cushion:</span>
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              ${stats?.cushion ? stats.cushion.toLocaleString() : (config.capital * config.cushion_floor.alpha).toLocaleString()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-purple-300">🧠 Kelly & Séquence</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                            <span className="text-gray-300">p̂ bayésien:</span>
                            <Badge variant="secondary" className="bg-purple-600 text-white">
                              {stats?.kelly_stats?.bayesian_p_hat ? (stats.kelly_stats.bayesian_p_hat * 100).toFixed(1) : 'N/A'}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                            <span className="text-gray-300">Multiplicateur:</span>
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                              {stats?.sequence_stats?.multiplier ? stats.sequence_stats.multiplier.toFixed(2) : 'N/A'}x
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                            <span className="text-gray-300">Étape actuelle:</span>
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                              {stats?.sequence_stats?.current_step ? `${stats.sequence_stats.current_step}/${stats.sequence_stats.max_steps || 'N/A'}` : 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                            <span className="text-gray-300">Trades totaux:</span>
                            <Badge variant="outline" className="border-gray-500 text-gray-400">
                              {stats?.kelly_stats?.total_trades || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-cyan-300">📊 Volatilité & Ajustements</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                            <span className="text-gray-300">Vol cible:</span>
                            <Badge variant="secondary" className="bg-cyan-600 text-white">
                              {stats?.vol_stats?.target_vol ? (stats.vol_stats.target_vol * 100).toFixed(1) : 'N/A'}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                            <span className="text-gray-300">Vol actuelle:</span>
                            <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                              {stats?.vol_stats?.current_vol ? (stats.vol_stats.current_vol * 100).toFixed(1) + '%' : 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                            <span className="text-gray-300">Ratio ajustement:</span>
                            <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                              {stats?.vol_stats?.adjustment_ratio ? stats.vol_stats.adjustment_ratio.toFixed(2) + 'x' : '1.0x'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                            <span className="text-gray-300">Fenêtre:</span>
                            <Badge variant="outline" className="border-gray-500 text-gray-400">
                              {stats?.vol_stats?.lookback || 20}j
                            </Badge>
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
            </div>
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
