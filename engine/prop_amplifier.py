from dataclasses import dataclass
import math

@dataclass
class PropAmpConfig:
    # Déclenchement & reset
    tau_freeze: float = 0.05     # freeze si C/W < 5%
    tau_up: float = 0.08         # sortie de freeze si C/W >= 8%
    cooldown_after_loss: int = 2 # nb trades sans amplificateur après une perte
    # Force de l'amplification proportionnelle
    beta: float = 2.0            # sensibilité à la pente/momentum (>0)
    lam_base: float = 0.50       # lambda de base (fractional Kelly)
    lam_cap: float = 1.0         # plafond de lambda effectif
    # Lissage du signal de montée (EMA/exponentiel)
    ema_alpha: float = 0.3       # 0<alpha<=1 : poids des variations récentes
    # Sécurité FTMO (bornes)
    max_E_to_W: float = 0.015    # max exposition / capital (≈1.5% par trade)
    # Fenêtre momentum (en points de cushion, non en % du capital)
    # On mesure la "pente" comme delta_C positif lissé.
    # Option: utiliser HWM du cushion pour ne compter que les nouveaux plus-hauts.
    use_cushion_hwm_trigger: bool = True

class PropAmplifier:
    """
    Amplificateur proportionnel à la montée :
    - calcule un 'momentum' du cushion (EMA des delta_C positifs),
    - linéarise la montée: lam_eff = lam_base * (1 + beta * momentum_norm),
    - stop immédiat à la 1ère perte + cooldown,
    - jamais d'amplification en-dessous du seuil freeze,
    - bornes de sécurité pour FTMO (E/W).
    """
    def __init__(self, cfg: PropAmpConfig):
        self.cfg = cfg
        self.ema_up = 0.0
        self.cooldown = 0
        self.frozen = False
        self.cushion_hwm = 0.0
        self.prev_C = None

    def update_on_state(self, W: float, C: float):
        # Freeze logic
        if W <= 0:
            self.frozen = True
            return
        c_ratio = C / W
        if c_ratio < self.cfg.tau_freeze:
            self.frozen = True
            return
        if self.frozen and c_ratio >= self.cfg.tau_up:
            # dé-freeze (soft)
            self.frozen = False
            # reset momentum à zéro au dé-freeze (option)
            self.ema_up = 0.0
            self.prev_C = C
            # on ne reset pas cooldown ici

    def update_on_trade_end(self, pnl: float, W: float, C: float):
        """À appeler après chaque trade exécuté (ou période)"""
        # Gestion cooldown si perte
        if pnl < 0:
            self.cooldown = self.cfg.cooldown_after_loss

        # Mettre à jour l'EMA des hausses de cushion
        if self.prev_C is None:
            self.prev_C = C
        delta = C - self.prev_C
        self.prev_C = C

        # Option: n'accumuler que si on fait des nouveaux plus-hauts de cushion
        if self.cfg.use_cushion_hwm_trigger:
            self.cushion_hwm = max(self.cushion_hwm, C)
            is_up = C >= self.cushion_hwm
        else:
            is_up = delta > 0

        up_component = max(delta, 0.0) if is_up else 0.0
        self.ema_up = self.cfg.ema_alpha * up_component + (1 - self.cfg.ema_alpha) * self.ema_up

        # décrémenter le cooldown
        if self.cooldown > 0:
            self.cooldown -= 1

    def lambda_effective(self, W: float, C: float) -> float:
        if self.frozen or W <= 0 or C <= 0:
            return 0.0

        # Normalisation du momentum : rapport au cushion courant pour rester relatif
        momentum_norm = 0.0
        if C > 0:
            momentum_norm = max(self.ema_up, 0.0) / C  # ∈ [0, +∞), souvent petit

        lam = self.cfg.lam_base * (1.0 + self.cfg.beta * momentum_norm)

        # Pas d'amplification si cooldown actif
        if self.cooldown > 0:
            lam = self.cfg.lam_base

        # Plafond
        lam = min(lam, self.cfg.lam_cap)
        return lam

    def cap_exposure(self, E: float, W: float) -> float:
        # Sécurité FTMO basique (cap sur E/W)
        cap = self.cfg.max_E_to_W * max(W, 1e-12)
        return min(E, cap)
