from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Body
from pydantic import BaseModel
import math
import numpy as np

# Importer notre nouveau moteur
from backend.engine.core import run_strategy

app = FastAPI()

# -----------------------------
# Helpers (stables & lisibles)
# -----------------------------
def realized_vol(returns: List[float]) -> float:
    if not returns:
        return 0.0
    m = sum(returns)/len(returns)
    var = sum((r-m)**2 for r in returns) / max(1, len(returns)-1)
    return math.sqrt(var)

def drawdowns(equity: List[float]) -> Dict[str, Any]:
    # Total DD
    peak = equity[0]
    max_dd_total = 0.0
    for x in equity:
        peak = max(peak, x)
        dd = (peak - x)/peak
        if dd > max_dd_total:
            max_dd_total = dd

    return {"max_dd_total": max_dd_total}

def daily_violations(equity: List[float], daily_limit: float, steps_per_day: int) -> Dict[str, Any]:
    """
    On interprète 'daily' comme une fenêtre qui redémarre au début de chaque journée (equity_open).
    Violation dès que equity descend sous equity_open*(1 - daily_limit).
    """
    if steps_per_day <= 0:
        steps_per_day = len(equity)  # 1 "journée" = tout (fallback)

    violations_daily = 0
    max_dd_daily = 0.0

    for day_start in range(0, len(equity), steps_per_day):
        day_end = min(day_start + steps_per_day, len(equity))
        eq_open = equity[day_start]
        peak = eq_open
        local_max_dd = 0.0

        violated = False
        threshold = eq_open * (1.0 - daily_limit)

        for x in equity[day_start:day_end]:
            peak = max(peak, x)
            dd = (peak - x)/peak if peak > 0 else 0.0
            local_max_dd = max(local_max_dd, dd)
            if (not violated) and x < threshold:
                violations_daily += 1
                violated = True

        max_dd_daily = max(max_dd_daily, local_max_dd)

    return {"max_dd_daily": max_dd_daily, "violations_daily": violations_daily}

def total_violations(equity: List[float], total_limit: float) -> int:
    """
    Violation 'total' si on passe sous HWM*(1 - total_limit) à n'importe quel moment.
    (On compte les occurrences distinctes.)
    """
    violations = 0
    hwm = equity[0]
    in_violation = False
    for x in equity:
        hwm = max(hwm, x)
        floor = hwm * (1.0 - total_limit)
        now_viol = x < floor
        if now_viol and not in_violation:
            violations += 1
            in_violation = True
        if not now_viol and in_violation:
            in_violation = False
    return violations

def safe_number(x):
    """Jamais NaN/Inf dans le JSON"""
    if x is None:
        return None
    if isinstance(x, float) and (math.isinf(x) or math.isnan(x)):
        return None
    return x

def compute_basic_kpis_from_equity(equity):
    if not equity or len(equity) < 2:
        return {
            "vol_realized": 0.0,
            "win_rate": 0.0,
            "profit_factor": None  # pas d'inf dans le JSON
        }
    rets = [(equity[i]/equity[i-1]) - 1.0 for i in range(1, len(equity))]
    m = sum(rets)/len(rets)
    var = sum((r-m)**2 for r in rets) / max(1, len(rets)-1)
    vol_realized = var ** 0.5

    wins = sum(1 for r in rets if r > 0)
    win_rate = wins / max(1, len(rets))

    gp = sum(r for r in rets if r > 0.0)
    gl = -sum(r for r in rets if r < 0.0)
    pf = (gp / gl) if gl > 0.0 else None  # évite inf

    return {
        "vol_realized": safe_number(vol_realized),
        "win_rate": safe_number(win_rate),
        "profit_factor": safe_number(pf)
    }

def clip01(x, name, clamped):
    """Filet de sécurité: clippe les valeurs entre 0.0 et 1.0 (unités décimales)"""
    if x < 0.0:
        clamped[name] = [x, 0.0]
        return 0.0
    if x > 1.0:
        clamped[name] = [x, 1.0]
        return 1.0
    return x

def safe_diag_dict(use_cppi=False, use_vt=False, use_kelly=False, use_soft=False,
                   kelly_cap_hits=0, cppi_freeze_events=0, no_upsize_after_loss=True,
                   used_default_expo=False, param_clamps=None):
    return {
        "kelly_cap_hits": int(kelly_cap_hits or 0),
        "cppi_freeze_events": int(cppi_freeze_events or 0),
        "no_upsize_after_loss": bool(no_upsize_after_loss if no_upsize_after_loss is not None else True),
        "modules_active": [m for m, flag in {
            "CPPI": use_cppi, "VolTarget": use_vt, "KellyCap": use_kelly, "SoftBarrier": use_soft
        }.items() if flag],
        "used_default_expo": bool(used_default_expo),
        "param_clamps": param_clamps or {}
    }

# -----------------------------
# Helpers KPI étendus pour Performance & Risque (version blindée)
# -----------------------------
def safe_num(x):
    try:
        v = float(x)
        if v != v or v == float("inf") or v == float("-inf"):
            return None
        return v
    except Exception:
        return None

def _daily_returns(equity, steps_per_day: int):
    """Agrège en 'jours' à partir d'une série equity par step.
       Retourne une liste (peut être vide) de rendements journaliers."""
    n = len(equity)
    if n < 2:
        return []
    spd = int(steps_per_day or 0)
    if spd <= 0:
        spd = n  # 1 "jour" = tout
    out = []
    for d0 in range(0, n, spd):
        d1 = min(d0 + spd, n)
        eo = equity[d0]
        ec = equity[d1 - 1]
        if eo and eo > 0:
            out.append((ec / eo) - 1.0)
    return out

def compute_extended_kpis(equity, steps_per_day: int):
    """Toujours retourner un DICT (jamais None) et des nombres sûrs ou None."""
    try:
        rd = _daily_returns(equity, steps_per_day)
        if not rd:
            return {
                "cagr": None, "sharpe": None, "sortino": None,
                "best_day": None, "worst_day": None,
                "max_consec_losses": None, "days_to_recover": None,
            }

        import math

        m = sum(rd) / len(rd)
        var = sum((r - m)**2 for r in rd) / max(1, len(rd) - 1)
        sd = math.sqrt(max(0.0, var))

        downside = [min(0.0, r) for r in rd]
        if len(downside) > 1:
            md = sum(downside) / len(downside)
            vard = sum((x - md)**2 for x in downside) / (len(downside) - 1)
            sd_dn = math.sqrt(max(0.0, vard))
        else:
            sd_dn = 0.0

        sharpe = (math.sqrt(252.0) * m / sd) if sd > 0 else None
        sortino = (math.sqrt(252.0) * m / sd_dn) if sd_dn > 0 else None

        best_day = max(rd)
        worst_day = min(rd)

        # max pertes consécutives
        max_consec_losses, run = 0, 0
        for r in rd:
            if r < 0:
                run += 1
                if run > max_consec_losses:
                    max_consec_losses = run
            else:
                run = 0

        # CAGR
        eq0 = equity[0] if equity else 1.0
        eq1 = equity[-1] if equity else 1.0
        days = len(rd)
        cagr = (eq1/eq0)**(252.0/max(1.0, days)) - 1.0 if (eq0 and eq0 > 0) else None

        # days_to_recover (sur equity quotidienne reconstruite)
        spd = int(steps_per_day or 0)
        if spd <= 0:
            spd = len(equity)
        eq_daily = [equity[min(i + spd, len(equity)) - 1] for i in range(0, len(equity), spd)]
        peak = eq_daily[0]
        peak_idx = 0
        trough_idx = 0
        max_dd = 0.0
        for i, x in enumerate(eq_daily):
            if x > peak:
                peak = x; peak_idx = i
            dd = (peak - x) / peak if peak > 0 else 0.0
            if dd > max_dd:
                max_dd = dd; trough_idx = i
        days_to_recover = None
        if trough_idx > peak_idx:
            target = eq_daily[peak_idx]
            for j in range(trough_idx, len(eq_daily)):
                if eq_daily[j] >= target:
                    days_to_recover = j - trough_idx
                    break

        return {
            "cagr": safe_num(cagr),
            "sharpe": safe_num(sharpe),
            "sortino": safe_num(sortino),
            "best_day": safe_num(best_day),
            "worst_day": safe_num(worst_day),
            "max_consec_losses": int(max_consec_losses),
            "days_to_recover": None if days_to_recover is None else int(days_to_recover),
        }
    except Exception:
        # En cas d'erreur, renvoyer un dict neutre (jamais None) pour ne pas casser l'API
        return {
            "cagr": None, "sharpe": None, "sortino": None,
            "best_day": None, "worst_day": None,
            "max_consec_losses": None, "days_to_recover": None,
        }

def safe_merge_dict(a, b):
    """Toujours retourner un dict; ne plante pas si 'a' ou 'b' ne sont pas des dicts."""
    out = a if isinstance(a, dict) else {}
    if isinstance(b, dict):
        out.update(b)
    return out

# -----------------------------
# Modèle d'entrée compatible avec l'ancien frontend
# -----------------------------
class SimInput(BaseModel):
    # Champs requis par l'ancien frontend
    schema_version: str = "1.0"
    name: Optional[str] = None
    seed: Optional[int] = 42
    total_steps: int = 500
    mu: float = 0.0
    fees_per_trade: float = 0.0002
    
    # Modules (format compatible)
    modules: Dict[str, Any] = {}
    
    # Nouveaux paramètres (avec valeurs par défaut)
    steps_per_day: int = 50
    sigma: float = 0.02
    
    # Paramètres des modules (extraits de modules.*)
    cppi_alpha: float = 0.10
    cppi_freeze_frac: float = 0.05
    vt_target_vol: float = 0.10
    vt_halflife: int = 20
    kelly_cap: float = 0.10
    soft_barrier: float = 0.0
    
    # Contraintes FTMO
    daily_limit: float = 0.05
    total_limit: float = 0.10
    
    # Pacing
    spend_rate: float = 1.0
    
    # Drapeaux d'activation (strict opt-in)
    use_cppi: bool = False
    use_vt: bool = False
    use_kelly_cap: bool = False
    use_soft_barrier: bool = False
    
    # Traces de débogage
    debug: bool = False
    trace_len: int = 10
    
    # Cible de profit
    target_profit: float = 0.10   # 10% = 0.10
    max_days: int = 30

# -----------------------------
# Boucle de simu (sans details privés)
# -----------------------------
def simulate_equity(p: SimInput) -> Dict[str, Any]:
    # Remplace l'usage global de random.seed(...) par un RNG local
    import random as _random
    rng = _random.Random(p.seed) if p.seed is not None else _random.Random()
    
    # Extraction des paramètres depuis modules.*
    if p.modules:
        cppi_config = p.modules.get("CPPIFreeze", {})
        vt_config = p.modules.get("VolatilityTarget", {})
        kelly_config = p.modules.get("KellyCap", {})
        soft_config = p.modules.get("SoftBarrier", {})
        ftmo_config = p.modules.get("FTMOGate", {})
        
        p.cppi_alpha = cppi_config.get("alpha", p.cppi_alpha)
        p.cppi_freeze_frac = cppi_config.get("freeze_frac", p.cppi_freeze_frac)
        p.vt_target_vol = vt_config.get("vt_target_vol", p.vt_target_vol)
        p.vt_halflife = vt_config.get("vt_halflife", p.vt_halflife)
        p.kelly_cap = kelly_config.get("kelly_cap", p.kelly_cap)
        p.soft_barrier = soft_config.get("soft_barrier", p.soft_barrier)
        p.daily_limit = ftmo_config.get("daily_limit", p.daily_limit)
        p.total_limit = ftmo_config.get("total_limit", p.total_limit)

    # Filets de sécurité sur les params en décimal
    param_clamps = {}
    p.daily_limit = clip01(p.daily_limit, "daily_limit", param_clamps)
    p.total_limit = clip01(p.total_limit, "total_limit", param_clamps)
    p.kelly_cap   = clip01(p.kelly_cap, "kelly_cap", param_clamps)

    # cppi_freeze_frac ne doit pas dépasser cppi_alpha (sinon freeze instantané)
    if p.cppi_freeze_frac > p.cppi_alpha:
        param_clamps["cppi_freeze_frac"] = [p.cppi_freeze_frac, p.cppi_alpha]
        p.cppi_freeze_frac = p.cppi_alpha

    equity = [1.0]
    hwm = 1.0
    floor = hwm * (1.0 - p.cppi_alpha) if p.use_cppi else 0.0

    # EW vol proxy (simple)
    vol_est = p.sigma
    lam = math.exp(math.log(0.5)/max(1, p.vt_halflife)) if p.use_vt else 0.5  # demi-vie → lambda

    # Diagnostics
    kelly_cap_hits = 0
    cppi_freeze_events = 0
    no_upsize_after_loss = True

    last_position = 0.0
    last_step_was_loss = False
    
    # Au début de la boucle, initialise la trace et les flags
    trace = []
    used_default_expo = False
    first_cross_step = None  # <- pour la cible de profit

    for t in range(1, p.total_steps+1):
        # Process bruité (mu, sigma)
        base_r = rng.gauss(p.mu, p.sigma)

        # Sizers "min aggregator"
        sizes: List[float] = []

        # VolTarget (approx) → target vol / vol_est
        if p.use_vt:
            f_vt = p.vt_target_vol / max(1e-8, vol_est)
            sizes.append(f_vt)

        # KellyCap (uniquement CAP – pas de formule interne divulguée)
        if p.use_kelly_cap:
            sizes.append(p.kelly_cap)

        # SoftBarrier (palier de réduction doux)
        if p.use_soft_barrier and p.soft_barrier > 0.0:
            # réduction si DD en cours dépasse soft_barrier
            dd_now = (hwm - equity[-1]) / max(hwm, 1e-8)
            if dd_now > p.soft_barrier:
                sizes.append(max(0.0, 1.0 - dd_now))  # haircut simple

        # Agrégateur min() — strict opt-in: pas d'expo si aucun module
        used_default_expo = (len(sizes) == 0)
        f_raw = min(sizes) if sizes else 0.0

        # Pacing
        f = max(0.0, min(1.0, f_raw * p.spend_rate))

        # Règle d'or: pas d'upsize après une perte (palier soft)
        if last_step_was_loss and f > last_position:
            no_upsize_after_loss = False  # on log seulement (diagnostic)
            # Option stricte (désactivée): f = min(f, last_position)

        # CPPI (cushion_ratio défini seulement si CPPI ON)
        cushion_ratio = None
        if p.use_cppi:
            cushion = max(0.0, equity[-1] - floor)
            cushion_ratio = (cushion / hwm) if hwm > 0 else 0.0
            if cushion_ratio < p.cppi_freeze_frac:
                f = 0.0
                cppi_freeze_events += 1

        # Cap hit ?
        if p.use_kelly_cap and abs(f - p.kelly_cap) < 1e-12:
            kelly_cap_hits += 1

        # PnL step (linéarisé)
        r_eff = f * base_r
        new_eq = max(1e-9, equity[-1] * (1.0 + r_eff))
        equity.append(new_eq)

        # --- détection de la cible ---
        if first_cross_step is None and new_eq >= (1.0 + p.target_profit):
            first_cross_step = t

        # Mises à jour HWM / floor
        if new_eq > hwm:
            hwm = new_eq
            if p.use_cppi:
                floor = hwm * (1.0 - p.cppi_alpha)

        # EW vol update
        if p.use_vt:
            vol_est = math.sqrt(lam * (vol_est**2) + (1-lam) * (base_r**2))

        # Diagnostics "no upsize after loss"
        last_step_was_loss = (new_eq < equity[-2])
        last_position = f
        
        # Ajoute la collecte de trace (sans NameError)
        if p.debug and len(trace) < p.trace_len:
            freeze_flag = (p.use_cppi and cushion_ratio is not None and cushion_ratio < p.cppi_freeze_frac and f == 0.0)
            trace.append({
                "t": t,
                "base_r": base_r,
                "f": f,
                "hwm": hwm,
                "floor": floor,
                "freeze": freeze_flag,
                "eq": new_eq
            })

    # ---- DD & Violations ----
    dd_tot = drawdowns(equity)["max_dd_total"]
    daily = daily_violations(equity, p.daily_limit, p.steps_per_day)
    v_total = total_violations(equity, p.total_limit)

    # --- Cible de profit -> days_to_target & target_pass ---
    days_to_target = None
    if first_cross_step is not None and p.steps_per_day > 0:
        days_to_target = int(math.ceil(first_cross_step / p.steps_per_day))

    target_pass = bool(
        (days_to_target is not None) and
        (days_to_target <= p.max_days) and
        (daily["violations_daily"] == 0) and
        (v_total == 0)
    )

    # ---- KPIs & Diagnostics ----
    # Bloc de retour JSON (jamais null + diag enrichi)
    kpis_out = compute_basic_kpis_from_equity(equity)  # doit toujours être un dict

    # extended
    spd = getattr(p, "steps_per_day", None) or 0
    ext = compute_extended_kpis(equity, steps_per_day=spd)

    # merge robuste (même si ext/basiques étaient None par erreur)
    kpis_out = safe_merge_dict(kpis_out, ext)
    
    kpis_out.update({
        "target_profit": safe_number(p.target_profit),
        "max_days": int(p.max_days),
        "days_to_target": days_to_target,   # peut être None si non atteint
        "target_pass": target_pass
    })
    diag_out = safe_diag_dict(
        use_cppi=p.use_cppi,
        use_vt=p.use_vt,
        use_kelly=p.use_kelly_cap,
        use_soft=p.use_soft_barrier,
        kelly_cap_hits=kelly_cap_hits,
        cppi_freeze_events=cppi_freeze_events,
        no_upsize_after_loss=no_upsize_after_loss,
        used_default_expo=used_default_expo,
        param_clamps=param_clamps
    )

    out = {
        "series": {"equity": equity},
        "max_dd_total": dd_tot,
        "max_dd_daily": daily["max_dd_daily"],
        "violations_daily": daily["violations_daily"],
        "violations_total": v_total,
        "kpis": kpis_out,   # jamais null, jamais inf/nan
        "diag": diag_out    # modules actifs, clamps, flags
    }
    if p.debug:
        out["trace"] = trace
    return out

# -----------------------------
# Endpoints
# -----------------------------
@app.get("/health")
def health():
    return {"ok": True, "app": "backend.app.main", "rev": "r1"}

@app.post("/simulate")
def simulate(payload: SimInput = Body(...)):
    # Génération des trades aléatoires basés sur les paramètres
    import random as _random
    rng = _random.Random(payload.seed) if payload.seed is not None else _random.Random()

    # Générer des rendements aléatoires pour les trades
    trades = [rng.gauss(payload.mu, payload.sigma) for _ in range(payload.total_steps)]

    # Préparer les modules pour le moteur
    modules = {}

    # Configuration des modules de gestion des risques
    if payload.use_cppi:
        modules["cppi_freeze"] = {
            "enabled": True,
            "floor": 1.0 - payload.cppi_alpha,
            "freeze_threshold": payload.cppi_freeze_frac,
            "multiplier": 1.0 / payload.cppi_freeze_frac if payload.cppi_freeze_frac > 0 else 10.0
        }

    if payload.use_vt:
        modules["volatility_target"] = {
            "enabled": True,
            "target": payload.vt_target_vol,
            "lookback": payload.vt_halflife,
            "max_alloc": 2.0
        }

    if payload.use_kelly_cap:
        modules["kelly_cap"] = {
            "enabled": True,
            "max_alloc": payload.kelly_cap
        }

    if payload.use_soft_barrier and payload.soft_barrier > 0.0:
        modules["soft_barrier"] = {
            "enabled": True,
            "threshold": payload.soft_barrier
        }

    # Appel au moteur de stratégie
    result = run_strategy(
        trades=trades,
        initial_capital=10000.0,
        mu=payload.mu,
        sigma=payload.sigma,
        fees_per_trade=payload.fees_per_trade,
        modules=modules
    )

    # Extraction des résultats du moteur
    capital_history = result["capital_history"]
    equity = capital_history[1:]  # Enlever le capital initial

    # Calcul des violations et drawdowns en utilisant les fonctions existantes
    dd_tot = result["max_dd_total"]
    daily = daily_violations(equity, payload.daily_limit, payload.steps_per_day)
    v_total = total_violations(equity, payload.total_limit)

    # Préparation des KPIs et diagnostics
    kpis_out = compute_basic_kpis_from_equity(equity)
    ext = compute_extended_kpis(equity, steps_per_day=payload.steps_per_day)
    kpis_out = safe_merge_dict(kpis_out, ext)

    # Calcul de l'atteinte de la cible de profit
    first_cross_step = None
    for i, eq in enumerate(equity):
        if eq >= (equity[0] * (1.0 + payload.target_profit)):
            first_cross_step = i + 1
            break

    days_to_target = None
    if first_cross_step is not None and payload.steps_per_day > 0:
        days_to_target = int(math.ceil(first_cross_step / payload.steps_per_day))

    target_pass = bool(
        (days_to_target is not None) and
        (days_to_target <= payload.max_days) and
        (daily["violations_daily"] == 0) and
        (v_total == 0)
    )

    kpis_out.update({
        "target_profit": safe_number(payload.target_profit),
        "max_days": int(payload.max_days),
        "days_to_target": days_to_target,
        "target_pass": target_pass
    })

    # Extraction des diagnostics du moteur
    diag_out = safe_diag_dict(
        use_cppi=payload.use_cppi,
        use_vt=payload.use_vt,
        use_kelly=payload.use_kelly_cap,
        use_soft=payload.use_soft_barrier,
        kelly_cap_hits=result.get("kelly_cap_hits", 0),
        cppi_freeze_events=result.get("cppi_freeze_events", 0),
        no_upsize_after_loss=True,
        used_default_expo=False,
        param_clamps={}
    )

    # Construction du résultat final
    out = {
        "series": {"equity": equity},
        "max_dd_total": dd_tot,
        "max_dd_daily": daily["max_dd_daily"],
        "violations_daily": daily["violations_daily"],
        "violations_total": v_total,
        "kpis": kpis_out,
        "diag": diag_out
    }

    return out

class MCInput(BaseModel):
    payload: SimInput
    n: int = 100
    base_seed: int = 12345

@app.post("/simulate_mc")
def simulate_mc(inp: MCInput):
    import copy
    dds = []
    pass_ftmo = 0
    pass_full = 0

    for i in range(inp.n):
        p = copy.deepcopy(inp.payload)
        p.seed = inp.base_seed + i
        res = simulate_equity(p)

        v_daily = res.get("violations_daily", 0)
        v_total = res.get("violations_total", 0)
        if v_daily == 0 and v_total == 0:
            pass_ftmo += 1

        k = res.get("kpis", {})
        if (k.get("target_pass") is True):
            pass_full += 1

        dds.append(res.get("max_dd_total", 0.0))

    dds_sorted = sorted(dds)
    def quantile(arr, q):
        if not arr: return 0.0
        idx = int(round(q*(len(arr)-1)))
        return arr[idx]

    return {
        "n": inp.n,
        "mc": {
            "pass_rate": pass_ftmo / max(1, inp.n),
            "pass_rate_full": pass_full / max(1, inp.n),
            "dd_p50": quantile(dds_sorted, 0.50),
            "dd_p95": quantile(dds_sorted, 0.95)
        }
    }
