from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np

# -------- I/O MODELS --------
class RunIn(BaseModel):
    profile: str
    preset: str
    modules: List[str]
    params: Dict[str, Any]
    seed: Optional[int] = 123
    horizon_days: Optional[int] = 20

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",        # DEV: autorise toutes origines
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

# --------- PROFILES (loader minimal) ---------
PROFILES = {
    "gaussian": {
        "sampler": "gaussian", "mu": 0.0002, "sigma": 0.008,
        "vol_process": "none", "jumps": {"enabled": False}
    },
    "student_t": {
        "sampler": "student_t", "mu": 0.0002, "sigma": 0.009, "nu": 4,
        "vol_process": "none", "jumps": {"enabled": False}
    },
    "student_t_jumps_ewma": {
        "sampler": "student_t", "mu": 0.00015, "sigma": 0.010, "nu": 4,
        "vol_process": "ewma", "ewma": {"lambda": 0.94, "sigma0": 0.010, "shock": 0.02},
        "jumps": {"enabled": True, "p_jump": 0.01, "jump_sigma": 0.04}
    },
}

# --------- SAMPLERS (profils) ----------
def sample_student_t(mu=0.0, sigma=0.01, nu=4, size=1, rng=None):
    rng = rng or np.random.default_rng()
    x = rng.standard_t(df=nu, size=size)
    # normalisation pour approx var cible
    x = (x / np.sqrt(nu/(nu-2))) * sigma
    return mu + x

def sample_with_jumps(mu=0.0, sigma=0.008, p_jump=0.01, jump_sigma=0.04, size=1, rng=None):
    rng = rng or np.random.default_rng()
    r = rng.normal(mu, sigma, size)
    jumps = rng.normal(0.0, jump_sigma, size)
    do_jump = rng.random(size) < p_jump
    r[do_jump] += jumps[do_jump]
    return r

def ewma_vol_path(T=1000, sigma0=0.01, lam=0.94, shock=0.02, rng=None):
    rng = rng or np.random.default_rng()
    sig = np.empty(T)
    sig[0] = sigma0
    for t in range(1, T):
        eps = abs(rng.standard_normal())
        sig[t] = np.sqrt(lam*sig[t-1]**2 + (1-lam)*(shock*eps)**2)
    return sig

def gen_returns(profile_name: str, T: int, rng, overrides: dict | None = None) -> np.ndarray:
    p = dict(PROFILES[profile_name])  # copie
    overrides = overrides or {}
    if "mu" in overrides and overrides["mu"] is not None:
        p["mu"] = float(overrides["mu"])
    if "sigma" in overrides and overrides["sigma"] is not None:
        p["sigma"] = float(overrides["sigma"])

    mu = p.get("mu", 0.0)
    sigma = p.get("sigma", 0.01)
    sampler = p.get("sampler", "gaussian")
    vol_proc = p.get("vol_process", "none")

    if vol_proc == "ewma":
        lam = p.get("ewma", {}).get("lambda", 0.94)
        sigma0 = p.get("ewma", {}).get("sigma0", sigma)
        shock = p.get("ewma", {}).get("shock", 0.02)
        sig_path = ewma_vol_path(T=T, sigma0=sigma0, lam=lam, shock=shock, rng=rng)
    else:
        sig_path = np.full(T, sigma)

    if sampler == "gaussian":
        base = np.array([rng.normal(mu, s) for s in sig_path])
    elif sampler == "student_t":
        nu = p.get("nu", 4)
        base = np.array([sample_student_t(mu, s, nu, 1, rng)[0] for s in sig_path])
    else:
        raise ValueError(f"Unsupported sampler: {sampler}")

    jumps_cfg = p.get("jumps", {"enabled": False})
    if jumps_cfg.get("enabled", False):
        pj = jumps_cfg.get("p_jump", 0.01)
        js = jumps_cfg.get("jump_sigma", 0.04)
        base += sample_with_jumps(0.0, 0.0, p_jump=pj, jump_sigma=js, size=T, rng=rng)

    return base

# ---------- MODULES (squelettes sûrs) ----------
# NB: on n'expose pas de formule Kelly exacte. On traite ce module comme "cap".
class VolatilityTarget:
    def __init__(self, vol_target=0.10, cap_mult=2.0):
        self.vol_target = float(vol_target)
        self.cap_mult = float(cap_mult)
        self.window = 50
        self.eps = 1e-8

    def step(self, realized_vol):
        # sizing proportionnel très simple et capé
        raw = self.vol_target / max(self.eps, realized_vol)
        risk_eff = min(raw, self.cap_mult * self.vol_target)
        return {"name":"VolatilityTarget","risk_eff": max(0.0, float(risk_eff)), "logs":{"rv":realized_vol}}

class CPPIFreeze:
    def __init__(self, alpha=0.10, freeze_floor_pct=0.05, defreeze_pct=0.08):
        self.alpha = float(alpha)
        self.freeze_floor_pct = float(freeze_floor_pct)
        self.defreeze_pct = float(defreeze_pct)
        self.hwm = 1.0
        self.frozen = False

    def step(self, equity):
        self.hwm = max(self.hwm, equity)
        floor = self.hwm * (1.0 - self.alpha)
        cushion = max(0.0, (equity - floor) / max(1e-9, self.hwm))
        if cushion < self.freeze_floor_pct:
            self.frozen = True
        elif cushion > self.defreeze_pct:
            self.frozen = False
        risk_cap = 0.0 if self.frozen else cushion # proxy simple
        return {"name":"CPPIFreeze","risk_eff": float(max(0.0, risk_cap)), "logs":{"floor":floor,"cushion":cushion,"frozen":self.frozen}}

class KellyCap:
    def __init__(self, kelly_cap=0.015):
        # on cappe sans exposer de formule interne
        self.kcap = float(kelly_cap)

    def step(self):
        return {"name":"KellyCap","risk_eff": self.kcap, "logs":{}}

class SoftBarrier:
    def __init__(self, levels=((-0.03, 0.75), (-0.05, 0.50), (-0.08, 0.25))):
        self.levels = sorted(levels) # (DD seuil, multiplicateur)
        self.hwm = 1.0

    def step(self, equity, base_risk=1.0):
        self.hwm = max(self.hwm, equity)
        dd = (equity - self.hwm) / self.hwm
        cap = 1.0
        for thr, mult in self.levels:
            if dd <= thr:
                cap = min(cap, mult)
        return {"name":"SoftBarrier","risk_eff": float(max(0.0, base_risk*cap)), "logs":{"dd":dd,"cap":cap}}

class FTMOGate:
    """
    DD total (vs HWM) et DD journalier (vs start-of-day), avec cap préventif.
    Paramètres clés :
      - dd_total_limit : ex 0.10 (10%)
      - dd_daily_limit : ex 0.05 (5%)
      - worst_step_loss_guess : perte max step plausible (ex 0.02)
      - safety_buffer : marge de sécurité avant blocage (ex 0.002)
    """
    def __init__(self, dd_total_limit=0.10, dd_daily_limit=0.05, worst_step_loss_guess=0.02, safety_buffer=0.002):
        self.dd_total_limit = float(dd_total_limit)
        self.dd_daily_limit = float(dd_daily_limit)
        self.worst_step_loss_guess = float(worst_step_loss_guess)
        self.safety_buffer = float(safety_buffer)
        self.hwm = 1.0
        self.day_start = 1.0
        self.day_peak = 1.0

    def new_day(self, equity):
        self.day_start = float(equity)
        self.day_peak  = float(equity)

    def step(self, equity):
        # MAJ HWM / peak jour
        self.hwm = max(self.hwm, float(equity))
        self.day_peak = max(self.day_peak, float(equity))

        # Floors
        total_floor = self.hwm * (1.0 - self.dd_total_limit)
        daily_floor = self.day_start * (1.0 - self.dd_daily_limit)

        # Violations dures
        if equity <= total_floor or equity <= daily_floor:
            return {"name":"FTMOGate","risk_eff":0.0,"logs":{
                "violation": True, "equity": equity,
                "total_floor": total_floor, "daily_floor": daily_floor
            }}

        # Headrooms
        head_total = equity - total_floor
        head_daily = equity - daily_floor
        headroom = min(head_total, head_daily)

        # Cap préventif : si une perte step "worst_step_loss_guess" ferait casser une limite
        # risk_cap <= headroom / (equity * worst_step_loss_guess)
        denom = max(1e-9, equity * self.worst_step_loss_guess)
        risk_cap = max(0.0, min(1.0, headroom / denom))

        # Safety buffer (si marge trop faible, coupe)
        if headroom <= self.safety_buffer * equity:
            risk_cap = 0.0

        return {"name":"FTMOGate","risk_eff": float(risk_cap), "logs":{
            "violation": False, "equity": equity,
            "head_total": head_total, "head_daily": head_daily,
            "total_floor": total_floor, "daily_floor": daily_floor,
            "risk_cap": risk_cap
        }}

class SessionNewsGate:
    """
    Gate par fenêtres interdites (heures 0..23). Exemple:
      banned_hours = [(22,23),(0,1)] -> block de 22h à 23h et de 0h à 1h.
    """
    def __init__(self, banned_hours=None, haircut=0.0):
        self.banned_hours = banned_hours or []  # liste de (h_deb, h_fin) inclusifs
        self.haircut = float(haircut)

    def step(self, hour_of_day):
        blocked = any(h0 <= hour_of_day <= h1 for (h0,h1) in self.banned_hours)
        eff = 0.0 if blocked else max(0.0, min(1.0, 1.0*self.haircut + (1.0 if self.haircut==0.0 else 0.0)))
        # Si haircut==0.0 -> block complet; sinon tu peux définir haircut=0.5 pour diviser par 2
        if not blocked and self.haircut>0:
            eff = max(0.0, min(1.0, 1.0 - (1.0 - self.haircut)))  # = haircut
        return {"name":"SessionNewsGate","risk_eff": eff, "logs":{"blocked": blocked, "hour": hour_of_day}}

class NestedCPPI:
    """
    Double airbag:
      - Externe: protège floor = HWM * (1 - alpha), gèle sous un seuil de cushion.
      - Interne: lisse le cushion transmis (EMA) et cappe le risk en 0..1.
    Remarque: aucune formule Kelly exposée ici; ce module ne booste jamais le risque.
    """
    def __init__(
        self,
        alpha=0.10,
        freeze_floor_pct=0.05,
        defreeze_pct=0.08,
        ema_beta=0.85,          # lissage interne (0..1)
        cushion_gain=1.0,       # multiplicateur doux du cushion lissé (<=1 recommandé)
        hard_cap=1.0            # cap ultime 0..1
    ):
        self.alpha = float(alpha)
        self.freeze_floor_pct = float(freeze_floor_pct)
        self.defreeze_pct = float(defreeze_pct)
        self.ema_beta = float(ema_beta)
        self.cushion_gain = float(cushion_gain)
        self.hard_cap = float(hard_cap)

        self.hwm = 1.0
        self.frozen = False
        self.ema_cushion = 0.0

    def step(self, equity: float):
        # Externe: floor & freeze
        self.hwm = max(self.hwm, float(equity))
        floor = self.hwm * (1.0 - self.alpha)
        raw_cushion = max(0.0, (equity - floor) / max(1e-9, self.hwm))
        if raw_cushion < self.freeze_floor_pct:
            self.frozen = True
        elif raw_cushion > self.defreeze_pct:
            self.frozen = False

        if self.frozen:
            risk_cap = 0.0
            self.ema_cushion = 0.0
        else:
            # Interne: EMA du cushion (lissage)
            self.ema_cushion = self.ema_beta * self.ema_cushion + (1.0 - self.ema_beta) * raw_cushion
            # Risk proposé = cushion lissé * gain, cap 0..hard_cap
            risk_cap = max(0.0, min(self.hard_cap, self.cushion_gain * self.ema_cushion))

        return {
            "name": "NestedCPPI",
            "risk_eff": float(risk_cap),
            "logs": {
                "floor": floor,
                "raw_cushion": raw_cushion,
                "ema_cushion": self.ema_cushion,
                "frozen": self.frozen
            }
        }

# ---------- AGRÉGATEUR ----------
def aggregate_min(module_results: List[Dict[str,Any]], last_pnl: Optional[float]=None, prev_risk: Optional[float]=None):
    risk_final = max(0.0, min(r["risk_eff"] for r in module_results))
    # No upsize after loss: si perte précédente et proposition > prev_risk, on clippe à prev_risk
    if last_pnl is not None and last_pnl < 0 and prev_risk is not None:
        risk_final = min(risk_final, prev_risk)

    binders = sorted([(r["risk_eff"], r["name"]) for r in module_results])[:2]
    return {"risk_final": risk_final, "binders": binders}

# ---------- KPIs ----------
def compute_kpis(equity: np.ndarray, daily_equity: np.ndarray, dd_daily_limit: float=0.05) -> Dict[str,Any]:
    # ret journaliers sur la granularité du pas (ici 24 pas/jour => ret pas-à-pas)
    ret = equity[1:] / equity[:-1] - 1.0

    peak = np.maximum.accumulate(equity)
    dd = (equity - peak) / peak
    max_dd = float(dd.min())

    T = len(equity) - 1
    years = max(1e-9, T/252.0)            # ~252 jours de bourse
    end_val = float(equity[-1])
    cagr = float(end_val**(1/years) - 1.0) if end_val > 0 else -1.0

    downside = ret[ret < 0]
    ds = float(np.std(downside)) if downside.size else 1e-9
    mean_r = float(np.mean(ret)) if ret.size else 0.0
    sortino = float(mean_r / max(ds, 1e-9))

    # FTMO "daily" (approx) sur equity fin de jour
    day_peaks = np.maximum.accumulate(daily_equity)
    day_dd = (daily_equity - day_peaks) / day_peaks
    worst_daily = float(day_dd.min())
    ftmo_ok = (abs(worst_daily) <= dd_daily_limit)

    return {
        "cagr": cagr,
        "sortino": sortino,
        "max_dd": max_dd,
        "ftmo_daily_ok": ftmo_ok,
        "dd_daily_max": worst_daily
    }

# ---------- LOOP ----------
def run_simulation(req: RunIn) -> Dict[str,Any]:
    rng = np.random.default_rng(req.seed)
    steps_per_day = 24
    T = int(req.horizon_days or 20) * steps_per_day
    overrides = {"mu": (req.params or {}).get("mu_override"),
                 "sigma": (req.params or {}).get("sigma_override")}
    r = gen_returns(req.profile, T, rng, overrides=overrides)

    # Params
    p = req.params or {}
    vol_mod = VolatilityTarget(vol_target=p.get("vol_target", 0.10), cap_mult=p.get("cap_mult", 2.0))
    cppi     = CPPIFreeze(alpha=p.get("alpha", 0.10), freeze_floor_pct=p.get("freeze_floor_pct", 0.05), defreeze_pct=p.get("defreeze_pct", 0.08))
    kelly    = KellyCap(kelly_cap=p.get("kelly_cap", 0.012))
    soft     = SoftBarrier(levels=p.get("soft_levels", ((-0.03,0.75),(-0.05,0.50),(-0.08,0.25))))
    ftmo     = FTMOGate(dd_total_limit=p.get("dd_total_limit", 0.10), dd_daily_limit=p.get("dd_daily_limit", 0.05),
                        worst_step_loss_guess=p.get("worst_step_loss_guess", 0.02), safety_buffer=p.get("safety_buffer", 0.002))
    sess     = SessionNewsGate(banned_hours=p.get("banned_hours", []), haircut=p.get("session_haircut", 0.0))
    nested_cppi = NestedCPPI(
        alpha=p.get("alpha", 0.10),
        freeze_floor_pct=p.get("freeze_floor_pct", 0.05),
        defreeze_pct=p.get("defreeze_pct", 0.08),
        ema_beta=p.get("ema_beta", 0.85),
        cushion_gain=p.get("cushion_gain", 1.0),
        hard_cap=p.get("hard_cap", 1.0)
    )

    use = {
        "VolatilityTarget": ("vol", vol_mod),
        "CPPIFreeze": ("cppi", cppi),
        "KellyCap": ("kelly", kelly),
        "SoftBarrier": ("soft", soft),
        "FTMOGate": ("ftmo", ftmo),
        "SessionNewsGate": ("sess", sess),
        "NestedCPPI": ("nested_cppi", nested_cppi),
    }
    active = [use[m][1] for m in req.modules if m in use]

    equity = np.ones(T+1, dtype=float)
    pnl_hist, logs = [], []
    rv_win = 50

    # init jour 0 pour FTMOGate
    if any(isinstance(m, FTMOGate) for m in active):
        ftmo.new_day(equity[0])

    for t in range(T):
        # new day ?
        if t>0 and (t % steps_per_day)==0:
            if any(isinstance(m, FTMOGate) for m in active):
                ftmo.new_day(equity[t])

        # realized vol simple
        start = max(0, t-rv_win)
        realized_vol = np.std(r[start:t+1]) if t>0 else vol_mod.vol_target

        # modules -> proposals
        props = []
        for m in active:
            if isinstance(m, VolatilityTarget):
                props.append(m.step(realized_vol))
            elif isinstance(m, CPPIFreeze):
                props.append(m.step(equity[t]))
            elif isinstance(m, KellyCap):
                props.append(m.step())
            elif isinstance(m, SoftBarrier):
                props.append(m.step(equity[t], base_risk=1.0))
            elif isinstance(m, FTMOGate):
                props.append(m.step(equity[t]))
            elif isinstance(m, SessionNewsGate):
                hour = t % steps_per_day  # 0..23
                props.append(m.step(hour))
            elif isinstance(m, NestedCPPI):
                props.append(m.step(equity[t]))

        prev_risk = equity[t] * r[t] if t>0 else None
        ag = aggregate_min(props, last_pnl=pnl_hist[-1] if pnl_hist else None, prev_risk=prev_risk)
        risk = ag["risk_final"]

        pnl = equity[t] * risk * r[t]
        equity[t+1] = max(1e-9, equity[t] + pnl)
        pnl_hist.append(pnl)

        logs.append({
            "t": t, "hour": (t % steps_per_day), "risk_final": risk, "binders": ag["binders"],
            "equity": equity[t+1], "ret": r[t],
            "mods": [{k:v for k,v in pr.items() if k in ("name","risk_eff","logs")} for pr in props],
        })

        # Stocker le risk actuel pour la prochaine itération (no-upsize-after-loss)
        prev_risk = risk

    daily = equity[::steps_per_day]
    kpis = compute_kpis(equity, daily, dd_daily_limit=float(p.get("dd_daily_limit", 0.05)))

    # Stats binder
    from collections import Counter
    binder_names = [min([(m["risk_eff"], m["name"]) for m in step["mods"]])[1] for step in logs if step.get("mods")]
    binder_count = Counter(binder_names)
    total_bind = max(1, sum(binder_count.values()))
    binder_pct = {k: round(100.0*v/total_bind, 2) for k, v in binder_count.items()}

    out = {
        "ok": True,
        "input": req.dict(),
        "series": {"equity": equity.tolist(), "daily_equity": daily.tolist()},
        "kpis": kpis,
        "ftmo": {
            "pass": bool(kpis["ftmo_daily_ok"]),
            "days_to_target": int(np.argmax(np.array(daily) >= (1.0 + float(p.get("target", 0.10)))) if np.any(np.array(daily) >= (1.0 + float(p.get("target", 0.10)))) else -1),
            "dd_daily_max": kpis["dd_daily_max"]
        },
        "binder_pct": binder_pct,
        "logs": logs[-200:]
    }
    return out

# --------- API ---------
@app.post("/simulate")
def simulate(req: RunIn):
    try:
        return run_simulation(req)
    except Exception as e:
        return {"error": str(e), "traceback": "Check backend logs"}

# --------- ENDPOINTS LEGACY ---------
@app.get("/profiles")
def list_profiles():
    return {"profiles": list(PROFILES.keys()), "details": PROFILES}
