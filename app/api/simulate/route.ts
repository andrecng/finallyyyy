import { NextResponse } from "next/server";
import { toBackend } from "@/app/api/_lib/toBackend";  // garde ton import
import { callBackend } from "@/lib/backend";            // garde ton import

// --- utilitaires de sanitation/coercition --- //
function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function coerceNumbers(obj: any) {
  if (!obj || typeof obj !== "object") return obj;
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      (obj as any)[k] = coerceNumbers(v);
    } else if (Array.isArray(v)) {
      (obj as any)[k] = v.map((x) => (typeof x === "object" ? coerceNumbers(x) : x));
    } else if (typeof v === "string") {
      // nombres encodés en string -> number
      const n = Number(v);
      if (v.trim() !== "" && !Number.isNaN(n) && /^-?\d+(\.\d+)?$/.test(v.trim())) {
        (obj as any)[k] = n;
      } else if (v.trim() === "") {
        // supprime les chaînes vides (évite pattern mismatch côté backend)
        delete (obj as any)[k];
      }
    }
  }
  return obj;
}

function sanitizeStrings(obj: any) {
  if (!obj || typeof obj !== "object") return obj;
  // champs connus qui causent souvent des "pattern" errors
  const CANDIDATE_SLUGS = new Set(["preset", "preset_id", "library", "template", "profile"]);
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      (obj as any)[k] = sanitizeStrings(v);
    } else if (typeof v === "string") {
      if (CANDIDATE_SLUGS.has(k)) {
        (obj as any)[k] = slugify(v);
      }
    } else if (Array.isArray(v)) {
      (obj as any)[k] = v.map((x) => (typeof x === "object" ? sanitizeStrings(x) : x));
    }
  }
  return obj;
}

// --- proxy --- //
export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const payload: any = toBackend(raw);

    // Si tu veux forcer les modules par défaut, tu peux laisser ces deux lignes :
    payload.use_session_gate ??= true;
    payload.use_nested_cppi ??= true;

    // ❌ Supprime ces deux lignes si tu ne veux PAS forcer 0
    // payload.news_pre_blackout_min ??= 0;
    // payload.news_post_blackout_min ??= 0;

    // Laisse vide si tu veux "pas de blocage"
    if (!Array.isArray(payload.sess_windows)) payload.sess_windows = [];

    console.log("proxy /simulate payload →", payload);
    return callBackend("/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e: any) {
    console.error("proxy /simulate error:", e?.message || e);
    return NextResponse.json({ error: "proxy_fail", detail: String(e) }, { status: 502 });
  }
}
