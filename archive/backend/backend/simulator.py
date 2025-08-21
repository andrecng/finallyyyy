"""
Simulateur unifié - Toute la logique du moteur dans un seul fichier
FTMO + CPPI + VolTarget + SoftBarrier + Pipeline
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Any, List, Tuple
import math
import random

# ============================================================================
# Helpers pour volatilité FTMO
# ============================================================================

def _lambda_from_halflife(halflife: int) -> float:
    if halflife <= 1:
        return 0.0
    return math.exp(-math.log(2.0) / float(halflife))

def ftmo_update_vol_after_trade(state: FTMOGateState, ret: float, p: FTMOGateParams):
    lam = _lambda_from_halflife(p.lmax_halflife)
    state.var_ewma_short = lam * state.var_ewma_short + (1.0 - lam) * (ret * ret)
    state.vol_init = True

def ftmo_lmax_dynamic(state: FTMOGateState, p: FTMOGateParams) -> float:
    sigma = (state.var_ewma_short ** 0.5) if state.vol_init else p.ftmo_target_vol
    # cap dynamique : plus la vol observée est haute, plus le lmax se resserre
    if sigma <= p.eps:
        dyn = p.lmax_base
    else:
        dyn = p.lmax_base * (p.ftmo_target_vol / max(p.eps, sigma))
    # bornes
    return max(p.lmax_min, min(p.lmax_base, dyn))

# ============================================================================
# FTMOGate - Gestion des limites FTMO
# ============================================================================

@dataclass
class FTMOGateParams:
    daily_limit: float = 0.02      # fraction max de perte par jour
    total_limit: float = 0.10      # fraction max de perte totale
    spend_rate: float = 0.33       # pacing du budget journalier
    lmax_base: float = 0.02        # ex 'lmax' d'avant -> lmax_base maintenant
    lmax_min: float = 0.003        # plancher de cap dynamique
    lmax_halflife: int = 5         # EWMA pas courts pour vol FTMO
    ftmo_target_vol: float = 0.010 # vol cible courte pour calibrer lmax_dyn
    steps_per_day: int = 1         # nb de pas par jour
    freeze_after_loss: bool = True # pas d'upsize après perte
    target_pct: float = 0.10       # cible de profit
    max_days: int = 30             # nb max de jours autorisés
    eps: float = 1e-12

@dataclass
class FTMOGateState:
    day_idx: int = 0
    step_in_day: int = 0
    equity_init: float = 1.0
    remaining_daily_budget: float = 0.0
    prev_risk: float = 0.0
    last_pnl: float = 0.0
    day_start_equity: float = 1.0
    daily_breaches: int = 0
    total_breaches: int = 0
    target_hit: bool = False
    days_used: int = 0
    # EWMA pour lmax dynamique
    var_ewma_short: float = 0.0
    vol_init: bool = False

def start_day(state: FTMOGateState, equity: float, p: FTMOGateParams):
    state.remaining_daily_budget = max(0.0, p.daily_limit * equity)
    state.step_in_day = 0
    state.day_start_equity = equity

def _check_daily_breach(equity: float, state: FTMOGateState, p: FTMOGateParams) -> bool:
    threshold = state.day_start_equity * (1.0 - p.daily_limit)
    return equity < threshold

def _check_total_breach(equity: float, state: FTMOGateState, p: FTMOGateParams) -> bool:
    threshold = state.equity_init * (1.0 - p.total_limit)
    return equity < threshold

def _check_target_hit(equity: float, state: FTMOGateState, p: FTMOGateParams) -> bool:
    threshold = state.equity_init * (1.0 + p.target_pct)
    return equity >= threshold

def ftmo_gate_step(
    desired_risk: float,
    equity: float,
    state: FTMOGateState,
    p: FTMOGateParams
) -> Tuple[float, Dict[str, Any]]:
    # Cap dur total
    if _check_total_breach(equity, state, p):
        state.total_breaches = max(state.total_breaches, 1)
        return 0.0, {"gate": "FTMO", "reason": "total_limit_reached", "risk": 0.0, "day_idx": state.day_idx}

    # Cap d'exposition dynamique basé sur la volatilité
    lmax_dyn = ftmo_lmax_dynamic(state, p)
    capped = min(desired_risk, lmax_dyn)
    
    # Pacing : fraction du budget journalier
    day_allow = p.spend_rate * max(0.0, state.remaining_daily_budget)
    risk_before_loss_rule = min(capped, day_allow)

    # No upsize after loss
    if p.freeze_after_loss and state.last_pnl < 0 and risk_before_loss_rule > state.prev_risk:
        risk_final = state.prev_risk
        reason = "no_upsize_after_loss"
    else:
        risk_final = risk_before_loss_rule
        reason = "ok"

    # Réserve budget jour
    state.remaining_daily_budget = max(0.0, state.remaining_daily_budget - abs(risk_final))
    state.prev_risk = risk_final

    # Avancement pas/jour
    state.step_in_day += 1
    rolled = False
    if state.step_in_day >= p.steps_per_day:
        state.days_used = state.day_idx + 1
        state.day_idx += 1
        state.step_in_day = 0
        start_day(state, equity, p)
        rolled = True

    log = {
        "gate": "FTMO",
        "reason": reason,
        "risk": risk_final,
        "day_idx": state.day_idx,
        "remain_day": state.remaining_daily_budget,
        "rolled_day": rolled,
        "lmax_dyn": lmax_dyn
    }
    return risk_final, log

def ftmo_update_after_trade(state: FTMOGateState, pnl: float, equity: float, p: FTMOGateParams):
    state.last_pnl = pnl
    if _check_daily_breach(equity, state, p):
        state.daily_breaches = max(state.daily_breaches, 1)
    if _check_total_breach(equity, state, p):
        state.total_breaches = max(state.total_breaches, 1)
    if _check_target_hit(equity, state, p):
        state.target_hit = True

# ============================================================================
# CPPI - Constant Proportion Portfolio Insurance
# ============================================================================

@dataclass
class CPPIParams:
    alpha: float = 0.10        # drawdown autorisé
    freeze_frac: float = 0.05  # seuil de freeze

@dataclass
class CPPIState:
    hwm: float = 1.0          # High Water Mark

def cppi_step(equity: float, state: CPPIState, p: CPPIParams) -> Dict[str, Any]:
    state.hwm = max(state.hwm, equity)
    floor = state.hwm * (1.0 - p.alpha)
    cushion = equity - floor
    freeze = cushion < (p.freeze_frac * state.hwm)
    cap_mult = max(0.0, min(1.0, cushion / max(1e-12, state.hwm)))
    return {"floor": floor, "cushion": cushion, "freeze": freeze, "cap_mult": cap_mult}

# ============================================================================
# VolTarget - Volatility Targeting
# ============================================================================

@dataclass
class VolTargetParams:
    target_vol: float = 0.01  # vol cible par pas
    halflife: int = 10        # pas EWMA
    eps: float = 1e-12

@dataclass
class VolTargetState:
    var_ewma: float = 0.0
    initialized: bool = False

def _lambda_from_halflife(halflife: int) -> float:
    if halflife <= 1:
        return 0.0
    return math.exp(-math.log(2.0) / float(halflife))

def vol_target_step(state: VolTargetState, p: VolTargetParams) -> Dict[str, Any]:
    sigma = (state.var_ewma ** 0.5) if state.initialized else p.target_vol
    cap = p.target_vol / max(p.eps, sigma)
    cap = max(0.0, min(1.0, cap))
    return {"sigma_hat": float(sigma), "cap": float(cap)}

def vol_target_update_after_trade(state: VolTargetState, ret: float, p: VolTargetParams):
    lam = _lambda_from_halflife(p.halflife)
    r2 = float(ret) * float(ret)
    state.var_ewma = lam * state.var_ewma + (1.0 - lam) * r2
    state.initialized = True

# ============================================================================
# SoftBarrier - Barrière souple basée sur drawdown
# ============================================================================

@dataclass
class SoftBarrierParams:
    levels: List[Tuple[float, float]] = field(default_factory=lambda: [
        (0.00, 1.00),  # 0% DD → 100% risk
        (0.05, 0.75),  # 5% DD → 75% risk
        (0.10, 0.50),  # 10% DD → 50% risk
        (0.15, 0.25),  # 15% DD → 25% risk
        (0.20, 0.00),  # 20% DD → 0% risk
    ])

def soft_barrier_step(equity: float, hwm: float, p: SoftBarrierParams) -> Dict[str, Any]:
    if hwm <= 0.0:
        dd = 0.0
    else:
        dd = max(0.0, (hwm - equity) / hwm)

    lv = sorted(p.levels, key=lambda x: x[0])
    if dd <= lv[0][0]:
        mult = lv[0][1]
    else:
        mult = lv[-1][1]
        for (a, ma), (b, mb) in zip(lv, lv[1:]):
            if a <= dd <= b:
                t = 0.0 if b == a else (dd - a) / (b - a)
                mult = ma + (mb - ma) * t
                break

    mult = max(0.0, min(1.0, mult))
    return {"dd": float(dd), "mult": float(mult)}

# ============================================================================
# Pipeline - Orchestrateur principal
# ============================================================================

def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

@dataclass
class EngineParams:
    desired_risk: float = 0.01
    cppi: CPPIParams = field(default_factory=CPPIParams)
    vt: VolTargetParams = field(default_factory=VolTargetParams)
    sb: SoftBarrierParams = field(default_factory=SoftBarrierParams)
    ftmo: FTMOGateParams = field(default_factory=FTMOGateParams)

@dataclass
class EngineState:
    equity: float = 1.0
    equity0: float = 1.0
    prev_risk: float = 0.0
    cppi: CPPIState = field(default_factory=CPPIState)
    vt: VolTargetState = field(default_factory=VolTargetState)
    ftmo: FTMOGateState = field(default_factory=FTMOGateState)

def run_step(state: EngineState, p: EngineParams, mods: Dict[str, bool]) -> Tuple[float, Dict[str, Any]]:
    logs: List[Dict[str, Any]] = []
    candidates = []

    # FTMO (gate absolu) — si OFF, ne pas mettre de cap ici (ou mettre desired_risk)
    if mods["FTMOGate"]:
        risk_ftmo, log_ftmo = ftmo_gate_step(p.desired_risk, state.equity, state.ftmo, p.ftmo)
        logs.append(log_ftmo)
        candidates.append(risk_ftmo)
    else:
        candidates.append(p.desired_risk)  # FTMO off ⇒ pas de cap FTMO

    # CPPI
    if mods["CPPI"]:
        cppi = cppi_step(state.equity, state.cppi, p.cppi)
        logs.append({"module": "CPPI", "data": cppi})
        candidates.append(p.desired_risk * cppi["cap_mult"])
    else:
        candidates.append(p.desired_risk)

    # VolTarget
    if mods["VolTarget"]:
        vt = vol_target_step(state.vt, p.vt)
        logs.append({"module": "VolTarget", "data": vt})
        candidates.append(p.desired_risk * vt["cap"])
    else:
        candidates.append(p.desired_risk)

    # SoftBarrier
    if mods["SoftBarrier"]:
        sb = soft_barrier_step(state.equity, state.cppi.hwm, p.sb)
        logs.append({"module": "SoftBarrier", "data": sb})
        candidates.append(p.desired_risk * sb["mult"])
    else:
        candidates.append(p.desired_risk)

    # Agrégateur min() sur les candidats
    raw = min(candidates)

    # Invariants
    final = raw
    if state.ftmo.last_pnl < 0 and final > state.prev_risk:
        final = state.prev_risk  # no upsize after loss
    # Pas de clamp dur ici - c'est géré par ftmo_gate_step avec lmax_dyn

    # Extraction de la télémetrie des modules
    telemetry = {}
    
    # CPPI
    if mods["CPPI"]:
        cppi_data = next((log["data"] for log in logs if log.get("module") == "CPPI"), {})
        telemetry["cppi_cap_mult"] = cppi_data.get("cap_mult")
        telemetry["cppi_freeze"] = cppi_data.get("freeze")
    
    # VolTarget
    if mods["VolTarget"]:
        vt_data = next((log["data"] for log in logs if log.get("module") == "VolTarget"), {})
        telemetry["vt_sigma"] = vt_data.get("sigma_hat")
        telemetry["vt_cap"] = vt_data.get("cap")
    
    # SoftBarrier
    if mods["SoftBarrier"]:
        sb_data = next((log["data"] for log in logs if log.get("module") == "SoftBarrier"), {})
        telemetry["sb_dd"] = sb_data.get("dd")
        telemetry["sb_mult"] = sb_data.get("mult")
    
    # FTMO
    if mods["FTMOGate"]:
        ftmo_data = next((log for log in logs if log.get("gate") == "FTMO"), {})
        telemetry["ftmo_lmax_dyn"] = ftmo_data.get("lmax_dyn")
        telemetry["ftmo_budget_day_left"] = ftmo_data.get("budget_day_left")
    
    # Log des modules actifs pour traçabilité
    step_log = {
        "modules_active": [k for k,v in mods.items() if v], 
        "risk_final": final,
        "risk_raw": raw,
        "modules": logs,
        **telemetry  # Injecter la télémetrie normalisée
    }

    return final, step_log

def apply_pnl(state: EngineState, risk: float, pnl: float, p: EngineParams):
    equity_before = state.equity
    ret = pnl / max(1e-12, equity_before)
    
    # mise à jour equity
    state.equity = max(1e-12, equity_before + pnl)
    
    # notifier les modules
    vol_target_update_after_trade(state.vt, ret, p.vt)
    ftmo_update_after_trade(state.ftmo, pnl, state.equity, p.ftmo)
    ftmo_update_vol_after_trade(state.ftmo, ret, p.ftmo)  # mise à jour vol pour lmax_dyn
    
    # garder dernière taille
    state.prev_risk = risk

# ============================================================================
# Simulation - Boucle principale
# ============================================================================

def _normalize_telemetry(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalise les clés de télémetrie attendues par le front.
    Garantit que toutes les clés sont présentes (même si None).
    """
    return {
        "cppi_cap_mult": state.get("cppi_cap_mult"),
        "cppi_freeze": state.get("cppi_freeze"),
        "vt_sigma": state.get("vt_sigma"),
        "vt_cap": state.get("vt_cap"),
        "sb_dd": state.get("sb_dd"),
        "sb_mult": state.get("sb_mult"),
        "ftmo_lmax_dyn": state.get("ftmo_lmax_dyn"),
        "ftmo_budget_day_left": state.get("ftmo_budget_day_left"),
        "modules_active": state.get("modules_active", []),
        "risk_final": state.get("risk_final"),
        "risk_raw": state.get("risk_raw"),
        "modules": state.get("modules", [])
    }

def run_simulation(params: Dict[str, Any], seed: int | None = None) -> Dict[str, Any]:
    """Simulation complète avec tous les modules"""
    # Seed optionnel pour reproductibilité
    if seed is not None:
        random.seed(seed)
    
    # Récupération des modules actifs
    active = params.get("modules") or []
    mods = {
        "FTMOGate": "FTMOGate" in active or not active,  # si liste vide → ON par défaut
        "CPPI": "CPPI" in active or not active,
        "VolTarget": "VolTarget" in active or not active,
        "SoftBarrier": "SoftBarrier" in active or not active,
    }
    
    # Paramètres par défaut
    p = EngineParams()
    p.desired_risk = float(params.get("desired_risk", 0.01))
    
    # CPPI
    p.cppi.alpha = float(params.get("cppi_alpha", 0.10))
    p.cppi.freeze_frac = float(params.get("cppi_freeze_frac", 0.05))
    
    # VolTarget
    p.vt.target_vol = float(params.get("vt_target_vol", 0.010))
    p.vt.halflife = int(params.get("vt_halflife", 10))
    
    # FTMO
    p.ftmo.daily_limit = float(params.get("daily_limit", 0.02))
    p.ftmo.total_limit = float(params.get("total_limit", 0.10))
    p.ftmo.spend_rate = float(params.get("spend_rate", 0.33))
    p.ftmo.lmax_base = float(params.get("lmax", params.get("lmax_base", 0.02)))  # rétro-compat
    p.ftmo.lmax_min = float(params.get("lmax_min", 0.003))
    p.ftmo.lmax_halflife = int(params.get("lmax_halflife", 5))
    p.ftmo.ftmo_target_vol = float(params.get("ftmo_target_vol", 0.010))
    p.ftmo.steps_per_day = int(params.get("steps_per_day", 1))
    p.ftmo.freeze_after_loss = bool(params.get("freeze_after_loss", True))
    p.ftmo.target_pct = float(params.get("target_pct", 0.10))
    p.ftmo.max_days = int(params.get("max_days", 30))
    
    # État initial
    state = EngineState(equity=1.0, equity0=1.0)
    start_day(state.ftmo, state.equity, p.ftmo)
    
    # Simulation
    total_steps = int(params.get("total_steps", 200))
    mu = float(params.get("mu", 0.0))
    
    series = [{"t": 0, "eq": state.equity}]
    logs: List[Dict[str, Any]] = []
    max_eq = state.equity
    max_dd = 0.0
    
    for t in range(1, total_steps + 1):
        risk, step_log = run_step(state, p, mods)
        logs.append(step_log)
        
        pnl = random.gauss(mu, max(1e-9, risk))
        apply_pnl(state, risk, pnl, p)
        
        max_eq = max(max_eq, state.equity)
        dd = (max_eq - state.equity) / max_eq if max_eq > 0 else 0.0
        max_dd = max(max_dd, dd)
        series.append({"t": t, "eq": state.equity})
        
        # Conditions d'arrêt
        if state.ftmo.target_hit or state.ftmo.total_breaches > 0:
            break
        if state.ftmo.days_used >= p.ftmo.max_days:
            break
    
    # KPIs
    kpis = {
        "max_dd": round(max_dd, 6),
        "pass_ftmo": (state.ftmo.target_hit and state.ftmo.daily_breaches == 0
                      and state.ftmo.total_breaches == 0 and state.ftmo.days_used <= p.ftmo.max_days),
        "ftmo": {
            "daily_breaches": state.ftmo.daily_breaches,
            "total_breaches": state.ftmo.total_breaches,
            "target_hit": state.ftmo.target_hit,
            "days_used": state.ftmo.days_used
        }
    }
    
    return {"series": series, "kpis": kpis, "logs": logs}

# ============================================================================
# Monte Carlo helpers & ratios
# ============================================================================

TRADING_DAYS_PER_YEAR = 252

def _safe_div(a: float, b: float, default: float = 0.0) -> float:
    try:
        if b == 0 or math.isnan(a) or math.isnan(b):
            return default
        return a / b
    except Exception:
        return default

def _percentile(vals: List[float], q: float) -> float:
    if not vals:
        return float("nan")
    v = sorted(vals)
    k = (len(v) - 1) * q
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return v[int(k)]
    return v[f] * (c - k) + v[c] * (k - f)

def _series_to_returns(series: List[Dict[str, Any]]) -> List[float]:
    # ret_t = (eq_t / eq_{t-1}) - 1
    rets: List[float] = []
    for i in range(1, len(series)):
        eq_prev = float(series[i-1]["eq"])
        eq_now  = float(series[i]["eq"])
        if eq_prev <= 0:
            continue
        rets.append(eq_now / eq_prev - 1.0)
    return rets

def _compute_ratios(series: List[Dict[str, Any]], steps_per_day: int | None = None, max_dd: float | None = None) -> Dict[str, Any]:
    rets = _series_to_returns(series)
    n = len(rets)
    if n == 0:
        return {"sortino": None, "calmar": None}

    # Sortino (cible 0)
    neg_sq = [r*r for r in rets if r < 0]
    downside_var = sum(neg_sq) / max(1, len(neg_sq)) if neg_sq else None
    mean_r = sum(rets) / n
    sortino_step = _safe_div(mean_r, math.sqrt(downside_var)) if downside_var and downside_var > 0 else None

    # Annualisation approximative si steps_per_day fourni
    sortino_ann = None
    if sortino_step is not None and steps_per_day and steps_per_day > 0:
        sortino_ann = sortino_step * math.sqrt(TRADING_DAYS_PER_YEAR * steps_per_day)

    # Calmar = CAGR / MaxDD
    eq0 = float(series[0]["eq"]) if series else 1.0
    eqN = float(series[-1]["eq"]) if series else 1.0
    if steps_per_day and steps_per_day > 0:
        n_days = max(1.0, (len(series)-1) / steps_per_day)
        years = n_days / TRADING_DAYS_PER_YEAR
    else:
        years = 1.0  # fallback
    cagr = (eqN/eq0)**(1.0/max(1e-12, years)) - 1.0 if eq0 > 0 else None
    dd = max_dd if max_dd is not None else None
    calmar = _safe_div(cagr, dd) if (cagr is not None and dd and dd > 0) else None

    return {
        "sortino": sortino_ann if sortino_ann is not None else sortino_step,
        "calmar": calmar
    }

def run_mc(params: Dict[str, Any], n_runs: int = 200, seed: int = 42,
           quantiles: Iterable[float] = (0.05, 0.5, 0.95)) -> Dict[str, Any]:
    """
    Exécute n_runs simulations indépendantes avec seeds reproductibles.
    Requiert une fonction run_simulation(params, seed=...) qui retourne:
      { "series": [...], "kpis": {"max_dd": float, "pass_ftmo": bool, "ftmo": {...}}, ... }
    """
    n = max(1, min(int(n_runs), 2000))  # garde-fou
    base = int(seed)

    passes = 0
    maxdds: List[float] = []
    finales: List[float] = []
    sortinos: List[float] = []
    calmars: List[float] = []

    # steps_per_day pour annualisation ratios (optionnel)
    spd = None
    if "steps_per_day" in params:
        try:
            spd = int(params["steps_per_day"])
        except Exception:
            spd = None

    for i in range(n):
        s = base + i
        # seed du RNG
        random.seed(s)

        out = run_simulation(params, seed=s)  # <-- utilise ta fonction moteur existante
        series = out.get("series", [])
        kpis   = out.get("kpis", {})

        # agrégats
        maxdd = float(kpis.get("max_dd", 0.0) or 0.0)
        maxdds.append(maxdd)
        finales.append(float(series[-1]["eq"]) if series else 1.0)
        r = _compute_ratios(series, steps_per_day=spd, max_dd=maxdd)
        sortinos.append(r["sortino"] if r["sortino"] is not None else float("nan"))
        calmars.append(r["calmar"]  if r["calmar"]  is not None else float("nan"))
        if bool(kpis.get("pass_ftmo", False)):
            passes += 1

    qs = list(quantiles)
    def qmap(vals: List[float]) -> Dict[str, float]:
        clean = [v for v in vals if isinstance(v, (int, float)) and not math.isnan(v)]
        if not clean:
            return {}
        return {f"p{int(q*100):02d}": _percentile(clean, q) for q in qs}

    return {
        "n_runs": n,
        "seed": base,
        "pass_pct": round(100.0 * passes / n, 2),
        "metrics": {
            "max_dd":  qmap(maxdds),
            "final_eq": qmap(finales),
            "sortino": qmap(sortinos),
            "calmar":  qmap(calmars),
        }
    }
