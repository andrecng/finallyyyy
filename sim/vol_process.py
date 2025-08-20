import numpy as np

def ewma_vol_path(T=1000, sigma0=0.01, lam=0.94, shock=0.02, rng=None):
    rng = rng or np.random.default_rng()
    sig = np.empty(T)
    sig[0] = sigma0
    for t in range(1, T):
        eps = rng.standard_normal()
        sig[t] = np.sqrt(lam*sig[t-1]**2 + (1-lam)*(shock*abs(eps))**2)
    return sig
