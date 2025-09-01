"use client";
import React, { useState } from "react";
import { normalizeSimOut } from "@/lib/normalizeSimOut";

declare global {
  interface Window {
    buildSimPayload?: () => any;
    __payload?: any;
    __raw?: any;
    __norm?: any;
    __lastOut?: any;
    dbgSetOut?: (v: any) => void;
  }
}

async function postSimulate(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const ctype = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} @ ${url} — ${text || "no body"}`);
  }
  return ctype.includes("application/json") ? res.json() : res.text();
}

export default function RunSimButton({
  onOut,
  className = "",
  title = "Run Simulation",
}: {
  onOut: (out: any) => void;
  className?: string;
  title?: string;
}) {
  const [running, setRunning] = useState(false);

  async function handleClick() {
    if (running) return;
    setRunning(true);
    try {
      const payload =
        (typeof window !== "undefined" && window.buildSimPayload)
          ? window.buildSimPayload!()
          : {}; // on laisse le proxy mapper & mettre des defaults

      try { window.__payload = payload; } catch {}

      let data: any;
      try {
        data = await postSimulate("/api/simulate", payload);
      } catch (e1: any) {
        console.warn("Primary /api/simulate failed → fallback /simulate", e1?.message || e1);
        data = await postSimulate("/simulate", payload);
      }

      try { window.__raw = data; } catch {}

      const norm = normalizeSimOut(data);
      try {
        window.__norm = norm;
        window.__lastOut = norm;
        window.dbgSetOut = (v: any) => {
          const n = normalizeSimOut(v);
          window.__lastOut = n;
          onOut(n);
        };
      } catch {}

      console.log("✅ simulate raw result:", data);
      console.log("✅ simulate normalized:", {
        equity_len: norm?.series?.equity?.length ?? 0,
        kpis: norm?.kpis,
      });

      onOut(norm);
    } catch (e: any) {
      console.error("simulate error:", e);
      alert(`Simulation failed: ${e?.message || e}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={running}
      className={
        "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium " +
        (running ? "bg-gray-300 text-gray-600" : "bg-black text-white hover:bg-gray-800") +
        (className ? " " + className : "")
      }
    >
      {running ? "Running…" : title}
    </button>
  );
}
