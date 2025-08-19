import numpy as np

def run_strategy(trades, W0=100_000, alpha=0.10, f=0.1, lam=0.5,
                 freeze_mode="hard", tau=0.05):
    """
    trades: array de résultats en % du capital engagé (ex: +1 ou -1 R multiples)
    freeze_mode: "hard" ou "soft"
    """
    W = W0
    HWM = W0
    F = HWM * (1 - alpha)
    frozen = False
    hist = []

    for i, ret in enumerate(trades):
        # Cushion et freeze
        C = max(W - F, 0)
        cushion_ratio = C / W if W > 0 else 0

        if frozen:
            hist.append(W)
            if freeze_mode == "soft" and cushion_ratio >= tau:
                frozen = False  # défreeze si soft
            else:
                continue

        if cushion_ratio < tau:
            frozen = True
            hist.append(W)
            continue

        # Allocation risquée
        E = lam * f * C
        W = W + E * ret
        HWM = max(HWM, W)
        F = HWM * (1 - alpha)
        hist.append(W)

    return np.array(hist)

if __name__ == "__main__":
    rng = np.random.default_rng(42)
    # exemple: 30 trades (FTMO horizon), winrate=55%, payoff=1:1
    win_rate = 0.55
    N = 30
    signs = (rng.random(N) < win_rate).astype(int)*2 - 1  # +1 ou -1
    trades = signs * 1.0  # payoff 1:1

    W_hard = run_strategy(trades, freeze_mode="hard")
    W_soft = run_strategy(trades, freeze_mode="soft")

    print("Hard freeze final capital:", W_hard[-1])
    print("Soft freeze final capital:", W_soft[-1])
