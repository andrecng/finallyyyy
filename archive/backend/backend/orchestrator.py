from typing import List, Dict, Any, Tuple
from dataclasses import dataclass

from backend.modules import Module
from backend.utils import generate_returns, max_drawdown, cagr_naive, es95, compliance_violations
from backend.logging_jsonl import JsonlLogger
from backend.gating import is_blackout, in_session, apply_gating_caps

@dataclass
class EngineState:
    t: int
    equity: float
    hwm: float
    last_pnl: float
    last_size: float

class PositionSizer:
    """
    Invariants:
      - risk_final = min(modules actifs)
      - freeze si cushion < freeze_cushion_pct -> risk_final = 0
      - no-increase-after-loss: si last_pnl < 0, la taille ne peut pas augmenter
      - gating ne peut jamais augmenter le risque
    Unités:
      - risk_final in [0..1] (proportion du capital à risque)
      - size_final = risk_final (risk units) — mapping neutre par défaut
    """
    def __init__(self, preset: Dict[str, Any], modules: List[Module], logger: JsonlLogger | None = None):
        self.preset = preset
        self.modules = [m for m in modules if getattr(m, "enabled", True)]
        rl = preset.get("risk_limits", {})
        self.freeze_cushion_pct = float(rl.get("freeze_cushion_pct", 5.0))
        self.alpha = float(rl.get("max_dd", 10.0))  # floor = HWM * (1 - alpha/100)
        self.logger = logger

    def _step_ctx(self, st: EngineState) -> Dict[str, Any]:
        floor = st.hwm * (1.0 - self.alpha / 100.0)
        cushion_pct = 0.0 if st.equity <= 0 else max(0.0, 100.0 * (st.equity - floor) / st.equity)
        dd_pct = 0.0 if st.hwm <= 0 else max(0.0, 100.0 * (1.0 - st.equity / st.hwm))
        return {
            "t": st.t,
            "equity": st.equity,
            "hwm": st.hwm,
            "dd_pct": dd_pct,
            "cushion_pct": cushion_pct,
            "risk_limits": self.preset.get("risk_limits", {}),
            "gating": self.preset.get("gating", {}),
            "last_pnl": st.last_pnl
        }

    def _apply_modules(self, ctx: Dict[str, Any]) -> Tuple[float, List[Dict[str, Any]], bool]:
        logs = []
        proposals = []
        freeze_flag = False
        for m in self.modules:
            d = m.apply(ctx) or {}
            r = float(d.get("risk_proposal", 1.0))
            r = max(0.0, min(1.0, r))
            proposals.append(r)
            entry = {"t": ctx["t"], "module": getattr(m, "id", "unknown"), "event": "proposal", "details": {"risk_proposal": r, "notes": d.get("notes", {})}}
            logs.append(entry)
            if self.logger:
                self.logger.log_module(getattr(m, "id", "unknown"), "proposal", t=ctx["t"], risk_proposal=r, notes=d.get("notes", {}))
            if d.get("freeze"):
                freeze_flag = True
                freeze_entry = {"t": ctx["t"], "module": getattr(m, "id", "unknown"), "event": "freeze", "details": {"reason": "module_flag"}}
                logs.append(freeze_entry)
                if self.logger:
                    self.logger.log_module(getattr(m, "id", "unknown"), "freeze", t=ctx["t"], reason="module_flag")
        risk_final = min(proposals) if proposals else 0.0
        logs.append({"t": ctx["t"], "module": "orchestrator", "event": "min_of_modules", "details": {"risk_final": risk_final, "proposals": proposals}})
        if self.logger:
            self.logger.log_run("min_of_modules", t=ctx["t"], risk_final=risk_final, proposals=proposals)
        return risk_final, logs, freeze_flag

    def _enforce_invariants(self, st: EngineState, risk_final: float, ctx: Dict[str, Any], logs: List[Dict[str, Any]]) -> float:
        # Freeze CPPI si cushion < seuil
        if ctx["cushion_pct"] < self.freeze_cushion_pct:
            if risk_final > 0.0:
                logs.append({"t": ctx["t"], "module": "orchestrator", "event": "freeze", "details": {"cushion_pct": ctx["cushion_pct"], "freeze_cushion_pct": self.freeze_cushion_pct}})
                if self.logger:
                    self.logger.log_run("freeze_cppi", t=ctx["t"], cushion_pct=ctx["cushion_pct"], freeze_cushion_pct=self.freeze_cushion_pct)
            risk_final = 0.0

        # No-increase-after-loss (porté au niveau global)
        if st.last_pnl < 0 and risk_final > st.last_size:
            logs.append({"t": ctx["t"], "module": "orchestrator", "event": "no_increase_after_loss_cap", "details": {"prev_size": st.last_size, "proposed": risk_final}})
            if self.logger:
                self.logger.log_run("no_increase_after_loss_cap", t=ctx["t"], prev_size=st.last_size, proposed=risk_final)
            risk_final = st.last_size

        # Gating cap explicite (jamais d'augmentation)
        risk_final = apply_gating_caps(risk_final, ctx.get("gating", {}) or {})
        if ctx.get("gating", {}).get("risk_cap") is not None and self.logger:
            self.logger.log_run("gating_cap_applied", t=ctx["t"], risk_final=risk_final)

        # Blackout news (risk = 0)
        if is_blackout(ctx["t"], ctx.get("gating", {}) or {}):
            if risk_final > 0.0:
                logs.append({"t": ctx["t"], "module": "gating", "event": "blackout_news", "details": {}})
                if self.logger:
                    self.logger.log_run("gating_blackout_news", t=ctx["t"])
            risk_final = 0.0

        # Sessions (hors session -> risk = 0)
        if not in_session(ctx["t"], ctx.get("gating", {}) or {}):
            if risk_final > 0.0:
                logs.append({"t": ctx["t"], "module": "gating", "event": "out_of_session", "details": {}})
                if self.logger:
                    self.logger.log_run("gating_out_of_session", t=ctx["t"])
            risk_final = 0.0

        return max(0.0, min(1.0, risk_final))

    def run_single(self, horizon: int, seed: int, market_model: Dict[str, Any]) -> Dict[str, Any]:
        mu = float(market_model.get("params", {}).get("mu", 0.0))
        sigma = float(market_model.get("params", {}).get("sigma", 0.01))
        rets = generate_returns(horizon, seed, mu=mu, sigma=sigma)

        e0 = float(self.preset.get("capital_initial", 100000.0))
        st = EngineState(t=0, equity=e0, hwm=e0, last_pnl=0.0, last_size=0.0)

        equity_curve, risk_series, size_series, logs = [e0], [], [], []
        step_returns = []

        for t in range(horizon):
            st.t = t
            ctx = self._step_ctx(st)
            risk_final, step_logs, module_freeze = self._apply_modules(ctx)
            logs.extend(step_logs)

            risk_final = self._enforce_invariants(st, risk_final, ctx, logs)
            size_final = risk_final  # mapping neutre "risk units"

            # P&L: proportionnel au risque engagé et au retour du marché (placeholder robuste)
            r = float(rets[t])
            pnl = st.equity * size_final * r
            st.last_pnl = pnl
            st.last_size = size_final
            st.equity = max(0.0, st.equity + pnl)  # floor à 0
            st.hwm = max(st.hwm, st.equity)

            equity_curve.append(st.equity)
            risk_series.append(risk_final)
            size_series.append(risk_final)
            step_returns.append(r)

            if self.logger:
                self.logger.log_risk(t=t, equity=st.equity, risk_final=risk_final, size_final=size_final)

        kpis = {
            "CAGR": cagr_naive(e0, st.equity, horizon),
            "MaxDD": max_drawdown(equity_curve),
            "ES95": es95(step_returns),
            "ruin_prob": 0.0  # À définir précisément selon ta notion de "ruine"
        }

        return {
            "kpis": kpis,
            "series": {"equity_curve": equity_curve, "risk_effectif": risk_series, "sizing": size_series},
            "logs": logs
        }
