export type RunEntry = {
  id: string;                   // `${ts}-${type}-${shortHash}`
  ts: string;                   // ISO
  type: "simulate" | "simulate_mc" | "sweep";
  presetName?: string;
  payloadHash: string;
  payload: Record<string, any>;
  seed?: number | string;
  gist?: Record<string, any>;   // KPIs essentiels extraits
};

const KEY = "mm_run_journal_v1";

export function loadJournal(): RunEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RunEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveJournal(entries: RunEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function addRun(entry: RunEntry) {
  const all = loadJournal();
  all.unshift(entry);
  // cap à ~1000 entrées pour éviter le gonflement
  saveJournal(all.slice(0, 1000));
}

export function clearJournal() {
  saveJournal([]);
}

export function exportJournalFile() {
  const blob = new Blob([JSON.stringify(loadJournal(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = `run_journal_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.json`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}

// utilitaires
export function shortHash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}
export function hashPayload(o: any) {
  const s = JSON.stringify(stableClean(o));
  return shortHash(s);
}
export function stableClean(o: any): any {
  if (o === null || typeof o !== "object") return o;
  if (Array.isArray(o)) return o.map(stableClean);
  const out: Record<string, any> = {};
  Object.keys(o).sort().forEach(k => {
    const v = (o as any)[k];
    if (v !== undefined) out[k] = stableClean(v);
  });
  return out;
}
