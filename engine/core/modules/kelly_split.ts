// Boîte noire: on suppose que la fraction Kelly "f" est fournie/estimée ailleurs.
// Ici on applique seulement un cap et un haircut et on s'assure G(f) >= 0 (pas d'expo négative).

export type KellyCfg = {
  enabled: boolean;
  f_cap: number;     // borne sup (ex: 1.0)
  haircut: number;   // 0..1, ex: 0.5 => réduit l'expo
  source?: "external" | "internal"; // par défaut "external"
};

export function kellyExposure(f_estimated: number | undefined, cfg: KellyCfg) {
  if (!cfg.enabled) return undefined;
  const f = Math.max(0, f_estimated ?? 0);      // G(f) >= 0 -> pas de négatif
  const cut = Math.max(0, Math.min(1, cfg.haircut ?? 1));
  const capped = Math.min(cfg.f_cap ?? 1, f);
  return capped * cut;
}
