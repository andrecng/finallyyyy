def test_heavy_tail_and_daily_dd():
    # 1) Générer une journée heavy-tail + un gap
    # 2) Appliquer modules + aggregate_min()
    # 3) Asserter que dd_daily est parfois > limite (doit "rougir")
    assert True  # TODO: à compléter selon tes helpers

def test_volatility_clustering():
    # 1) Générer vol en grappes avec EWMA
    # 2) Vérifier que la vol bouge (pas fixe)
    # 3) Tester que les modules réagissent aux changements de vol
    assert True  # TODO: à compléter

def test_soft_barrier_levels():
    # 1) Tester les paliers de DD (-3%, -5%, -8%)
    # 2) Vérifier que le risk_eff est bien capé selon le niveau
    # 3) Asserter "no upsize after loss"
    assert True  # TODO: à compléter

def test_session_news_gating():
    # 1) Tester les fenêtres interdites
    # 2) Vérifier que size=0 pendant les news
    # 3) Tester les haircuts sévères
    assert True  # TODO: à compléter

def test_monte_carlo_coverage():
    # 1) ≥ 1000 runs avec grille de seeds
    # 2) Vérifier que tous les modules sont testés
    # 3) Asserter la couverture des cas extrêmes
    assert True  # TODO: à compléter
