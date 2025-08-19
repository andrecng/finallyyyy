import numpy as np
import pandas as pd
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from engine.prop_amplifier import PropAmplifier, PropAmpConfig

def simulate_soft_propamp(
    signs,                     # +1/-1 (R multiples)
    W0=100_000,
    alpha=0.10,                # CPPI floor via HWM(1-alpha)
    f_kelly=0.10,              # Kelly fraction estimate
    lam_base=0.50,             # base lambda (fractional Kelly)
    payoff=1.0,
    cfg: PropAmpConfig = PropAmpConfig(),
    horizon_days=30,
    max_total_dd=0.10,
    max_daily_dd=0.05
):
    amp = PropAmplifier(cfg)
    W = W0; HWM = W0
    F = HWM * (1 - alpha)
    hit_target_day = None
    pass_constraints = True
    max_dd = 0.0

    for day, s in enumerate(signs, start=1):
        # Maj état freeze / dé-freeze
        C = max(W - F, 0.0)
        amp.update_on_state(W, C)

        # Si frozen -> pas de trade
        if amp.frozen:
            # Check contraintes/target quand même
            HWM = max(HWM, W)
            F = HWM * (1 - alpha)
            total_dd = (HWM - W) / max(HWM, 1e-12)
            if total_dd > max_total_dd:
                pass_constraints = False
            if hit_target_day is None and (W - W0) / W0 >= 0.10:
                hit_target_day = day
            if day >= horizon_days: break
            continue

        # lambda effectif (proportionnel à la montée)
        lam_eff = amp.lambda_effective(W, C)
        # position sizing
        E = lam_eff * f_kelly * C
        E = min(E, C, W)
        E = amp.cap_exposure(E, W)  # cap (ex: 1.5% W)

        # Exécution du trade
        W_prev = W
        pnl = E * (s * payoff)
        W = W + pnl

        # MAJ HWM & floor
        HWM = max(HWM, W)
        F = HWM * (1 - alpha)

        # Contraintes FTMO
        total_dd = (HWM - W) / max(HWM, 1e-12)
        max_dd = max(max_dd, total_dd)
        if total_dd > max_total_dd:
            pass_constraints = False
        if pnl < 0 and abs(pnl) / max(W_prev, 1e-12) > max_daily_dd:
            pass_constraints = False

        # Target
        if hit_target_day is None and (W - W0) / W0 >= 0.10:
            hit_target_day = day

        # Informer l'ampli du résultat (pour EMA & cooldown)
        amp.update_on_trade_end(pnl, W, max(W - F, 0.0))

        if day >= horizon_days:
            break

    return dict(
        final_W=W,
        hit_target=(hit_target_day is not None),
        days_to_target=hit_target_day,
        pass_constraints=pass_constraints,
        success=(hit_target_day is not None) and pass_constraints,
        max_dd=max_dd
    )

if __name__ == "__main__":
    # Mini test local
    rng = np.random.default_rng(7)
    N = 2000; horizon = 30; win_rate = 0.55
    signs = (rng.random((N, horizon)) < win_rate).astype(int)*2 - 1

    res = []
    for i in range(N):
        out = simulate_soft_propamp(signs[i])
        res.append(out)

    df = pd.DataFrame(res)
    print("Success %:", 100*df["success"].mean())
    print("Hit target %:", 100*df["hit_target"].mean())
    print("Pass constraints %:", 100*df["pass_constraints"].mean())
    print("Median days→target:", df["days_to_target"].median())
    print("Median maxDD %:", 100*df["max_dd"].median())
    print("Median final W:", df["final_W"].median())
