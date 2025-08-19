import numpy as np
import pandas as pd
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from engine.prop_amplifier import PropAmpConfig
from tests.sim_freeze_modes import run_strategy     # soft/hard baseline
from tests.sim_soft_propamp_mc import simulate_soft_propamp

def mc_series(N, horizon, win_rate, payoff, seed=42):
    rng = np.random.default_rng(seed)
    signs = (rng.random((N, horizon)) < win_rate).astype(int)*2 - 1
    return signs

def eval_soft(signs):
    rows = []
    for seq in signs:
        W_hist = run_strategy(seq, freeze_mode="soft")
        rows.append(dict(
            final_W=W_hist[-1], pass_constraints=True, # déjà checkés dans la version MC complète si besoin
            hit_target=((W_hist[-1]-100_000)/100_000)>=0.10,
            days_to_target=None, success=False, max_dd=np.nan
        ))
    return pd.DataFrame(rows)

def eval_soft_prop(signs, cfg: PropAmpConfig):
    rows = []
    for seq in signs:
        out = simulate_soft_propamp(seq, cfg=cfg)
        rows.append(out)
    return pd.DataFrame(rows)

if __name__ == "__main__":
    N=2000; horizon=30; win_rate=0.55; payoff=1.0
    signs = mc_series(N, horizon, win_rate, payoff, seed=123)

    # Grille de paramètres (modeste)
    grid = []
    for beta in [1.0, 2.0, 3.0]:
        for lam_cap in [0.75, 1.0, 1.25]:
            for max_E_to_W in [0.015, 0.02]:
                grid.append(PropAmpConfig(
                    beta=beta, lam_cap=lam_cap, max_E_to_W=max_E_to_W
                ))

    base = eval_soft(signs)
    base_summary = dict(
        mode="soft_vanilla",
        success=100*base["success"].mean(),
        hit_target=100*base["hit_target"].mean(),
        pass_constraints=100*base["pass_constraints"].mean(),
        med_days=float(base["days_to_target"].median()) if base["days_to_target"].notna().any() else None,
        med_final=float(base["final_W"].median())
    )

    rows = [base_summary]
    for cfg in grid:
        df = eval_soft_prop(signs, cfg)
        rows.append(dict(
            mode=f"prop_amp_beta{cfg.beta}_cap{cfg.lam_cap}_Ecap{cfg.max_E_to_W}",
            success=100*df["success"].mean(),
            hit_target=100*df["hit_target"].mean(),
            pass_constraints=100*df["pass_constraints"].mean(),
            med_days=float(df["days_to_target"].median()) if df["days_to_target"].notna().any() else None,
            med_final=float(df["final_W"].median())
        ))

    out = pd.DataFrame(rows)
    print(out.sort_values(["success","hit_target","pass_constraints","med_final"], ascending=False).to_string(index=False))
