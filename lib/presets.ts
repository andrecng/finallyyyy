// Utilitaires de presets — centralise bibliothèque + localStorage
export type Preset = {
  id: string;
  name: string;
  payload: Record<string, any>;
  meta?: {
    source?: "default" | "manual" | "auto";         // NEW: provenance
    score?: number;
    kpis?: Record<string, any>;
    mc?: Record<string, any>;
    constraints?: Record<string, any>;
    n?: number;
    score_breakdown?: Record<string, any>;
    grid?: Record<string, any>;         // ranges utilisés pour le sweep
  };
  ts: string; // ISO
};

// Defaults "mémoire projet" — ajuste les chiffres si besoin
const DEFAULTS: Omit<Preset, "id" | "ts">[] = [
  {
    name: "baseline",
    meta: { source: "default" },
    payload: {
      seed: 1337,
      total_steps: 2000,
      mu: 0,
      fees_per_trade: 0.0002,
      sigma: 0.02,
      steps_per_day: 50,
      target_profit: 0.10,
      max_days: 30,
      daily_limit: 0.02,
      total_limit: 0.10,
      modules: {
        VolatilityTarget: { vt_target_vol: 0.10, vt_halflife: 16 },
        CPPIFreeze: { alpha: 0.20, freeze_frac: 0.05 },
        KellyCap: { cap_mult: 0.50 },
        SoftBarrier: { enabled: true, steps: [1,2,3], haircuts: [0.7,0.5,0.3] },
        FTMOGate: { enabled: true, daily_limit: 0.02, total_limit: 0.10, spend_rate: 0.35, lmax_vol_aware: "p50" }
      }
    }
  },
  {
    name: "kelly-low",
    meta: { source: "default" },
    payload: {
      seed: 1337,
      total_steps: 2000,
      mu: 0,
      fees_per_trade: 0.0002,
      sigma: 0.02,
      steps_per_day: 50,
      target_profit: 0.10,
      max_days: 30,
      daily_limit: 0.02,
      total_limit: 0.10,
      modules: {
        VolatilityTarget: { vt_target_vol: 0.10, vt_halflife: 16 },
        CPPIFreeze: { alpha: 0.20, freeze_frac: 0.05 },
        KellyCap: { cap_mult: 0.25 },
        SoftBarrier: { enabled: true, steps: [1,2,3], haircuts: [0.7,0.5,0.3] },
        FTMOGate: { enabled: true, daily_limit: 0.02, total_limit: 0.10, spend_rate: 0.35, lmax_vol_aware: "p50" }
      }
    }
  },
  {
    name: "vt-high",
    meta: { source: "default" },
    payload: {
      seed: 1337,
      total_steps: 2000,
      mu: 0,
      fees_per_trade: 0.0002,
      sigma: 0.02,
      steps_per_day: 50,
      target_profit: 0.10,
      max_days: 30,
      daily_limit: 0.02,
      total_limit: 0.10,
      modules: {
        VolatilityTarget: { vt_target_vol: 0.15, vt_halflife: 12 },
        CPPIFreeze: { alpha: 0.20, freeze_frac: 0.05 },
        KellyCap: { cap_mult: 0.50 },
        SoftBarrier: { enabled: true, steps: [1,2,3], haircuts: [0.7,0.5,0.3] },
        FTMOGate: { enabled: true, daily_limit: 0.02, total_limit: 0.10, spend_rate: 0.35, lmax_vol_aware: "p50" }
      }
    }
  },
  {
    name: "cppi-strong",
    meta: { source: "default" },
    payload: {
      seed: 1337,
      total_steps: 2000,
      mu: 0,
      fees_per_trade: 0.0002,
      sigma: 0.02,
      steps_per_day: 50,
      target_profit: 0.10,
      max_days: 30,
      daily_limit: 0.02,
      total_limit: 0.10,
      modules: {
        VolatilityTarget: { vt_target_vol: 0.10, vt_halflife: 16 },
        CPPIFreeze: { alpha: 0.35, freeze_frac: 0.03 },
        KellyCap: { cap_mult: 0.50 },
        SoftBarrier: { enabled: true, steps: [1,2,3], haircuts: [0.7,0.5,0.3] },
        FTMOGate: { enabled: true, daily_limit: 0.02, total_limit: 0.10, spend_rate: 0.35, lmax_vol_aware: "p50" }
      }
    }
  }
];

const LS_KEY = "mm_presets_v1";

type PresetDict = Record<string, Preset>;

function readLS(): PresetDict {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PresetDict;
  } catch {
    return {};
  }
}

function writeLS(dict: PresetDict) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(dict));
  } catch {}
}

export function normalizePreset(p: any): any {
  // Normalise tous les pourcentages en décimaux
  const clamp = (x: number) => (Number.isFinite(x) ? x : 0);
  const pct = (x: number) => (x > 1 ? x / 100 : x);

  const q = structuredClone(p);
  
  // Normaliser les paramètres principaux
  if (q.fees_per_trade !== undefined) q.fees_per_trade = clamp(q.fees_per_trade);
  if (q.sigma !== undefined) q.sigma = clamp(pct(q.sigma));
  if (q.target_profit !== undefined) q.target_profit = clamp(pct(q.target_profit));
  if (q.daily_limit !== undefined) q.daily_limit = clamp(pct(q.daily_limit));
  if (q.total_limit !== undefined) q.total_limit = clamp(pct(q.total_limit));

  // Normaliser les modules
  if (q.modules) {
    if (q.modules.VolatilityTarget?.vt_target_vol !== undefined) {
      q.modules.VolatilityTarget.vt_target_vol = clamp(pct(q.modules.VolatilityTarget.vt_target_vol));
    }
    if (q.modules.KellyCap?.cap_mult !== undefined) {
      q.modules.KellyCap.cap_mult = clamp(pct(q.modules.KellyCap.cap_mult));
    }
    if (q.modules.CPPIFreeze) {
      if (q.modules.CPPIFreeze.alpha !== undefined) {
        q.modules.CPPIFreeze.alpha = clamp(pct(q.modules.CPPIFreeze.alpha));
      }
      if (q.modules.CPPIFreeze.freeze_frac !== undefined) {
        q.modules.CPPIFreeze.freeze_frac = clamp(pct(q.modules.CPPIFreeze.freeze_frac));
      }
    }
    if (q.modules.FTMOGate?.spend_rate !== undefined) {
      q.modules.FTMOGate.spend_rate = clamp(pct(q.modules.FTMOGate.spend_rate));
    }
  }
  
  return q;
}

export function validatePreset(p: any): string[] {
  const errs: string[] = [];
  if (p.total_steps <= 0) errs.push("total_steps must be > 0");
  if (p.daily_limit <= 0 || p.daily_limit > 0.05) errs.push("daily_limit out of FTMO bounds");
  if (p.total_limit <= 0 || p.total_limit > 0.10) errs.push("total_limit out of FTMO bounds");
  return errs;
}

export function listPresets(): Preset[] {
  const dict = readLS();
  const locals = Object.values(dict);
  
  // Fusion : defaults d'abord, écrasés par locals s'ils ont le même name
  const map: Record<string, Preset> = {};
  
  // Ajouter les presets par défaut
  for (const d of DEFAULTS) {
    const id = `default-${d.name}`;
    map[d.name] = { ...d, id, ts: new Date().toISOString() };
  }
  
  // Écraser par les presets locaux s'ils ont le même nom
  for (const l of locals) {
    map[l.name] = l;
  }
  
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
}

// Fonction pour lister UNIQUEMENT les presets manuels (defaults + manuels)
export function listManualPresets(): Preset[] {
  const dict = readLS();
  const locals = Object.values(dict);
  
  const map: Record<string, Preset> = {};
  
  // Ajouter les presets par défaut
  for (const d of DEFAULTS) {
    const id = `default-${d.name}`;
    map[d.name] = { ...d, id, ts: new Date().toISOString() };
  }
  
  // Ajouter UNIQUEMENT les presets manuels (pas les auto)
  for (const l of locals) {
    if (l.meta?.source !== "auto") {
      map[l.name] = l;
    }
  }
  
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
}

// Fonction pour lister UNIQUEMENT les presets auto-search
export function listAutoSearchPresets(): Preset[] {
  const dict = readLS();
  const locals = Object.values(dict);
  
  // Filtrer UNIQUEMENT les presets auto
  return locals
    .filter(p => p.meta?.source === "auto")
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function loadPreset(name: string): Preset | null {
  const all = listPresets();
  return all.find((p) => p.name === name) ?? null;
}

export function savePreset(p: Omit<Preset, "id" | "ts">): Preset {
  const dict = readLS();
  const ts = new Date().toISOString();
  const id = `${ts}-${Math.random().toString(36).slice(2,8)}`;
  const full = { ...p, id, ts, meta: { ...(p.meta ?? {}), source: p.meta?.source ?? "manual" } };
  
  dict[id] = full;
  writeLS(dict);
  return full;
}

export function deletePreset(id: string) {
  const dict = readLS();
  delete dict[id];
  writeLS(dict);
}

export function renamePreset(id: string, name: string) {
  const dict = readLS();
  if (dict[id]) {
    dict[id].name = name;
    writeLS(dict);
  }
}

export function loadManualPresets(): Preset[] {
  return listPresets().filter(p => (p.meta?.source ?? "manual") === "manual");
}

export function loadAutoPresets(): Preset[] {
  return listPresets().filter(p => p.meta?.source === "auto");
}

export function suggestPresetName(args: {
  score?: number;
  pass_rate_full?: number;
  payload: Record<string, any>;
}) {
  const d = new Date();
  const ymd = [d.getFullYear(), (d.getMonth()+1+"").padStart(2,"0"), (d.getDate()+"").padStart(2,"0")].join("");
  const hm = [(d.getHours()+"").padStart(2,"0"), (d.getMinutes()+"").padStart(2,"0")].join("");
  const s = (x?: number, k=3) => x==null||isNaN(x) ? "na" : Number(x).toFixed(k);
  const p = args.payload || {};
  const vt = s(p.vt_target_vol, 2);
  const kc = s(p.kelly_cap, 2);
  const sb = s(p.softbarrier_level, 2);
  const ca = s(p.cppi_alpha, 2);
  const score = s(args.score ?? undefined, 4);
  const prf = s(args.pass_rate_full ?? undefined, 3);
  return `auto-${ymd}-${hm}-score${score}-pRF${prf}-vt${vt}-kc${kc}-sb${sb}-ca${ca}`;
}
