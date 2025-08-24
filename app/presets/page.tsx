"use client";

import React, { useEffect, useState } from "react";
import { Preset, loadManualPresets, loadAutoPresets, deletePreset, renamePreset } from "@/app/lib/presets";
import { setWorkspacePayload } from "@/app/lib/workspacePayload";

export default function PresetsPage() {
  const [manual, setManual] = useState<Preset[]>([]);
  const [auto, setAuto] = useState<Preset[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");

  function refresh() {
    setManual(loadManualPresets());
    setAuto(loadAutoPresets());
  }
  useEffect(() => { refresh(); }, []);

  function onExport(p: Preset) {
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `${p.name || "preset"}.json`;
    a.href = url; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Presets</h1>
        <nav className="text-sm flex gap-4">
          <a className="underline" href="/workspace">Workspace</a>
          <a className="underline" href="/optimize">Optimize</a>
        </nav>
      </header>

      <h2 className="text-lg font-semibold mt-4">Presets manuels</h2>
      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th label="Nom" />
              <Th label="Créé" />
              <Th label="Meta (score / pRF)" />
              <Th label="Actions" />
            </tr>
          </thead>
          <tbody>
            {manual.length === 0 && (
              <tr><td className="p-4 text-gray-500" colSpan={4}>Aucun preset manuel enregistré</td></tr>
            )}
            {manual.map(p => (
              <tr key={p.id} className="border-t align-top">
                <Td>
                  {editingId === p.id ? (
                    <div className="flex items-center gap-2">
                      <input className="border rounded px-2 py-1" value={nameDraft} onChange={e=>setNameDraft(e.target.value)} />
                      <button className="text-xs underline" onClick={()=>{
                        renamePreset(p.id, nameDraft || p.name);
                        setEditingId(null); refresh();
                      }}>OK</button>
                      <button className="text-xs underline" onClick={()=>setEditingId(null)}>Annuler</button>
                    </div>
                  ) : (
                    <div className="font-medium">{p.name}</div>
                  )}
                  <details>
                    <summary className="cursor-pointer select-none text-gray-600">payload</summary>
                    <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(p.payload, null, 2)}</pre>
                  </details>
                </Td>
                <Td>{p.ts.replace("T"," ").slice(0,19)}</Td>
                <Td>
                  <div className="text-xs text-gray-700">
                    score: {p.meta?.score ?? "—"}<br/>
                    pass_rate_full: {p.meta?.mc?.pass_rate_full ?? "—"}
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    {editingId !== p.id && (
                      <button className="text-xs underline"
                        onClick={() => { setEditingId(p.id); setNameDraft(p.name); }}>
                        Renommer
                      </button>
                    )}
                    <button className="text-xs underline text-red-700"
                      onClick={() => { deletePreset(p.id); refresh(); }}>
                      Supprimer
                    </button>
                    <button className="text-xs underline"
                      onClick={() => { setWorkspacePayload(p.payload); location.href="/workspace"; }}>
                      Utiliser dans Workspace
                    </button>
                    <button className="text-xs underline" onClick={() => onExport(p)}>Exporter JSON</button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold mt-8">Presets Auto‑Search</h2>
      <p className="text-xs text-gray-500 mb-2">Ces presets proviennent de l'optimisation automatique.</p>
      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th label="Nom" />
              <Th label="Créé" />
              <Th label="Meta (score / pRF)" />
              <Th label="Actions" />
            </tr>
          </thead>
          <tbody>
            {auto.length === 0 && (
              <tr><td className="p-4 text-gray-500" colSpan={4}>Aucun preset auto-search enregistré</td></tr>
            )}
            {auto.map(p => (
              <tr key={p.id} className="border-t align-top">
                <Td>
                  {editingId === p.id ? (
                    <div className="flex items-center gap-2">
                      <input className="border rounded px-2 py-1" value={nameDraft} onChange={e=>setNameDraft(e.target.value)} />
                      <button className="text-xs underline" onClick={()=>{ renamePreset(p.id, nameDraft || p.name); setEditingId(null); refresh(); }}>OK</button>
                      <button className="text-xs underline" onClick={()=>setEditingId(null)}>Annuler</button>
                    </div>
                  ) : (
                    <div className="font-medium">{p.name}</div>
                  )}
                  <details>
                    <summary className="cursor-pointer select-none text-gray-600">payload</summary>
                    <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(p.payload, null, 2)}</pre>
                  </details>
                </Td>
                <Td>{p.ts.replace("T"," ").slice(0,19)}</Td>
                <Td>
                  <div className="text-xs text-gray-700">
                    score: {p.meta?.score ?? "—"}<br/>
                    pass_rate_full: {p.meta?.mc?.pass_rate_full ?? "—"}
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    {editingId !== p.id && (
                      <button className="text-xs underline" onClick={() => { setEditingId(p.id); setNameDraft(p.name); }}>
                        Renommer
                      </button>
                    )}
                    <button className="text-xs underline text-red-700" onClick={() => { deletePreset(p.id); refresh(); }}>
                      Supprimer
                    </button>
                    <button className="text-xs underline" onClick={() => { setWorkspacePayload(p.payload); location.href="/workspace"; }}>
                      Utiliser dans Workspace
                    </button>
                    <button className="text-xs underline" onClick={() => onExport(p)}>Exporter JSON</button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ label }: { label: string }) { return <th className="text-left p-2 font-medium text-gray-600">{label}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="p-2 align-top">{children}</td>; }
