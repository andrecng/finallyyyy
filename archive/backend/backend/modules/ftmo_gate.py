from dataclasses import dataclass

@dataclass
class FTMOGateParams:
    daily_max_loss: float       # ex: 0.005 pour -0.5% max/jour
    total_max_loss: float       # ex: 0.10  pour -10% max total
    spend_rate: float           # ex: 0.20  => on dépense max 20% du budget jour par heure
    lmax_vol_mult: float        # ex: 1.0   => facteur plafond en fonction de la vol
    ref_vol: float              # ex: 0.10  => vol de référence (10%) pour calibrer lmax
    min_clip: float = 0.0       # pas d'expo négative
    freeze_cushion: float = 0.05  # si <5% de budget jour restant => freeze

@dataclass
class FTMOGateState:
    day_pnl: float          # PnL du jour (en % du capital HWM)
    total_drawdown: float   # drawdown total courant (en %)
    hourly_spent: float     # fraction du budget jour dépensée cette heure
    realized_vol: float     # vol réalisée/estimée pour la fenêtre courante

@dataclass
class GateOutput:
    allowed_risk: float     # fraction de risk unitaire autorisée après gate
    freeze: bool            # blocage trading pour le reste de la fenêtre/jour
    reasons: list           # logs textuels

def ftmo_gate(requested_risk: float, p: FTMOGateParams, s: FTMOGateState) -> GateOutput:
    reasons = []

    # 1) Priorité au daily (daily-first)
    daily_budget_left = p.daily_max_loss + min(s.day_pnl, 0.0)  # si PnL<0, budget réduit
    if daily_budget_left <= 0:
        reasons.append("daily_budget_depleted")
        return GateOutput(allowed_risk=0.0, freeze=True, reasons=reasons)

    # 2) Vérifier le total
    if s.total_drawdown >= p.total_max_loss:
        reasons.append("total_budget_depleted")
        return GateOutput(allowed_risk=0.0, freeze=True, reasons=reasons)

    # 3) Pacing intraday via spend_rate
    max_hourly = p.spend_rate * p.daily_max_loss
    hourly_left = max(0.0, max_hourly - s.hourly_spent)
    if hourly_left <= 0:
        reasons.append("pacing_spent")
        return GateOutput(allowed_risk=0.0, freeze=False, reasons=reasons)

    # 4) lmax vol-aware (si vol > ref, on réduit)
    vol_factor = max(0.25, p.ref_vol / max(p.ref_vol, s.realized_vol))  # borné
    lmax = p.lmax_vol_mult * vol_factor
    lmax = max(0.0, lmax)

    # 5) Calcul du risk autorisé
    allowed = min(requested_risk, hourly_left, lmax)
    if daily_budget_left <= p.freeze_cushion * p.daily_max_loss:
        reasons.append("daily_cushion_low_freeze")
        return GateOutput(allowed_risk=0.0, freeze=True, reasons=reasons)

    allowed = max(allowed, p.min_clip)
    if allowed < requested_risk:
        reasons.append("clipped")
    return GateOutput(allowed_risk=allowed, freeze=False, reasons=reasons)
