"""
Test pour la logique de lmax dynamique FTMO basé sur la volatilité
"""

def test_ftmo_lmax_dyn_reacts_to_vol():
    import sys
    sys.path.append('.')
    from backend.simulator import FTMOGateParams, FTMOGateState, ftmo_update_vol_after_trade, ftmo_lmax_dynamic

    p = FTMOGateParams(lmax_base=0.02, lmax_min=0.003, lmax_halflife=3, ftmo_target_vol=0.01)
    s = FTMOGateState()

    # vol faible -> lmax_dyn proche du base
    for _ in range(10):
        ftmo_update_vol_after_trade(s, 0.005, p)  # 0.5% ret
    low = ftmo_lmax_dynamic(s, p)

    # vol forte -> lmax_dyn plus serré
    for _ in range(10):
        ftmo_update_vol_after_trade(s, 0.04, p)   # 4% ret
    high = ftmo_lmax_dynamic(s, p)

    assert high <= low
    assert p.lmax_min <= high <= p.lmax_base

def test_ftmo_lmax_dyn_bounds():
    import sys
    sys.path.append('.')
    from backend.simulator import FTMOGateParams, FTMOGateState, ftmo_lmax_dynamic

    p = FTMOGateParams(lmax_base=0.02, lmax_min=0.003, ftmo_target_vol=0.01)
    s = FTMOGateState()

    # Test des bornes
    lmax = ftmo_lmax_dynamic(s, p)
    assert p.lmax_min <= lmax <= p.lmax_base

def test_ftmo_vol_update_convergence():
    import sys
    sys.path.append('.')
    from backend.simulator import FTMOGateParams, FTMOGateState, ftmo_update_vol_after_trade, ftmo_lmax_dynamic

    p = FTMOGateParams(lmax_base=0.02, lmax_min=0.003, lmax_halflife=5, ftmo_target_vol=0.01)
    s = FTMOGateState()

    # Volatilité constante
    for _ in range(20):
        ftmo_update_vol_after_trade(s, 0.02, p)  # 2% ret constant
    
    lmax = ftmo_lmax_dynamic(s, p)
    # Avec vol 2% > target 1%, lmax devrait être réduit
    assert lmax < p.lmax_base
