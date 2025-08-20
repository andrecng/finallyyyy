import numpy as np

def sample_student_t(mu=0.0, sigma=0.01, nu=4, size=1, rng=None):
    rng = rng or np.random.default_rng()
    # Student-t standard -> scale to target sigma
    x = rng.standard_t(df=nu, size=size)
    x = (x / np.sqrt(nu/(nu-2))) * sigma  # match variance for nu>2
    return mu + x

def sample_mixture(mu=0.0, sigma=0.008, p_tail=0.10, tail_mult=3.0, size=1, rng=None):
    rng = rng or np.random.default_rng()
    base = rng.normal(mu, sigma, size)
    tail = rng.normal(mu, tail_mult*sigma, size)
    mask = rng.random(size) < p_tail
    out = base
    out[mask] = tail[mask]
    return out

def sample_with_jumps(mu=0.0, sigma=0.008, p_jump=0.01, jump_sigma=0.04, size=1, rng=None):
    rng = rng or np.random.default_rng()
    r = rng.normal(mu, sigma, size)
    jumps = rng.normal(0.0, jump_sigma, size)
    do_jump = rng.random(size) < p_jump
    r[do_jump] += jumps[do_jump]
    return r
