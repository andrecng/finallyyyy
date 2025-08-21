export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
export const formatPct = (x: number, d = 2) =>
  Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : "—";
export const formatNumber = (x: number, d = 2) =>
  Number.isFinite(x) ? x.toFixed(d) : "—";
export const clamp = (x: number, min: number, max: number) =>
  Math.min(max, Math.max(min, x));
export const safeJson = (v: unknown) => {
  try { return JSON.stringify(v); } catch { return '"[unserializable]"'; }
};
