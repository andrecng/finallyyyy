export function cn(...cl: Array<string | false | null | undefined>) {
  return cl.filter(Boolean).join(" ");
}
export const formatPct = (x: number, d = 2) => Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : "—";
export const formatNum = (x: number, d = 2) => Number.isFinite(x) ? x.toFixed(d) : "—";
export const clamp = (x: number, min: number, max: number) =>
  Math.min(max, Math.max(min, x));
export const safeJson = (v: unknown) => {
  try { return JSON.stringify(v); } catch { return '"[unserializable]"'; }
};
