export type Preset = {
  id: string;
  name: string;
  payload: Record<string, any>;
  meta?: {
    source?: "manual" | "auto";         // NEW: provenance
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

const KEY = "mm_presets_v1";

export function loadPresets(): Preset[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || "[]") as Preset[];
    // migration douce: si pas de meta.source, suppose "manual"
    return arr.map(p => ({ ...p, meta: { source: p.meta?.source ?? "manual", ...p.meta } }));
  } catch {
    return [];
  }
}
export function savePresets(all: Preset[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(all));
}
export function addPreset(p: Omit<Preset, "id" | "ts">): Preset {
  const all = loadPresets();
  const ts = new Date().toISOString();
  const id = `${ts}-${Math.random().toString(36).slice(2,8)}`;
  const full = { ...p, id, ts };
  all.unshift(full);
  savePresets(all.slice(0, 500));
  return full;
}
export function deletePreset(id: string) {
  savePresets(loadPresets().filter(p => p.id !== id));
}
export function renamePreset(id: string, name: string) {
  const all = loadPresets().map(p => (p.id === id ? { ...p, name } : p));
  savePresets(all);
}

export function loadManualPresets(): Preset[] {
  return loadPresets().filter(p => (p.meta?.source ?? "manual") === "manual");
}
export function loadAutoPresets(): Preset[] {
  return loadPresets().filter(p => p.meta?.source === "auto");
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
