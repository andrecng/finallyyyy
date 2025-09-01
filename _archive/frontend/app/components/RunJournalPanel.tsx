"use client";

import React, { useMemo, useState } from "react";
import { RunEntry, loadJournal, clearJournal, exportJournalFile } from "../lib/runJournal";

export default function RunJournalPanel() {
  const [entries, setEntries] = useState<RunEntry[]>(loadJournal());
  const [filter, setFilter] = useState<"" | "simulate" | "simulate_mc" | "sweep">("");

  function refresh() { setEntries(loadJournal()); }

  const rows = useMemo(() => {
    return entries.filter(e => (filter ? e.type === filter : true));
  }, [entries, filter]);

  return (
    <div className="rounded-2xl border p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Run Journal</div>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
          >
            <option value="">Tous</option>
            <option value="simulate">simulate</option>
            <option value="simulate_mc">simulate_mc</option>
            <option value="sweep">sweep</option>
          </select>
          <button onClick={() => { exportJournalFile(); }}
                  className="text-sm underline">Exporter JSON</button>
          <button onClick={() => { clearJournal(); refresh(); }}
                  className="text-sm underline text-red-700">Vider</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th label="ts" />
              <Th label="type" />
              <Th label="preset" />
              <Th label="payloadHash" />
              <Th label="KPIs (gist)" />
              <Th label="payload" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="p-3 text-gray-500" colSpan={6}>Aucune entrée</td></tr>
            )}
            {rows.map((e) => (
              <tr key={e.id} className="border-t align-top">
                <Td>{e.ts.replace("T"," ").slice(0,19)}</Td>
                <Td>{e.type}</Td>
                <Td className="break-words">{e.presetName ?? "—"}</Td>
                <Td><code>{e.payloadHash}</code></Td>
                <Td>
                  <details>
                    <summary className="cursor-pointer select-none">voir</summary>
                    <pre className="text-xs whitespace-pre-wrap break-words">
{JSON.stringify(e.gist ?? {}, null, 2)}
                    </pre>
                  </details>
                </Td>
                <Td>
                  <details>
                    <summary className="cursor-pointer select-none">payload</summary>
                    <pre className="text-xs whitespace-pre-wrap break-words">
{JSON.stringify(e.payload, null, 2)}
                    </pre>
                  </details>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ label }: { label: string }) {
  return <th className="text-left p-2 font-medium text-gray-600">{label}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`p-2 align-top ${className || ""}`}>{children}</td>;
}
