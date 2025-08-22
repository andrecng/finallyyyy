"use client";
import type { PresetV1 } from "@/engine/facade";

const LIB_KEY = "workspace:preset:lib";            // index des presets
const ITEM_KEY = (name: string) => `workspace:preset:item:${name}`;

export type PresetMeta = { name: string; savedAt: string };

function readLib(): PresetMeta[] {
  try {
    const raw = localStorage.getItem(LIB_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLib(items: PresetMeta[]) {
  localStorage.setItem(LIB_KEY, JSON.stringify(items));
}

export function sanitizeName(name: string) {
  return (name || "preset")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 64) || "preset";
}

export function listPresets(): PresetMeta[] {
  return readLib().sort((a, b) => (a.name > b.name ? 1 : -1));
}

export function savePreset(name: string, preset: PresetV1): PresetMeta {
  const n = sanitizeName(name);
  const meta: PresetMeta = { name: n, savedAt: new Date().toISOString() };
  localStorage.setItem(ITEM_KEY(n), JSON.stringify(preset));
  const lib = readLib();
  const i = lib.findIndex((m) => m.name === n);
  if (i >= 0) lib[i] = meta; else lib.push(meta);
  writeLib(lib);
  return meta;
}

export function loadPreset(name: string): PresetV1 | null {
  try {
    const n = sanitizeName(name);
    const raw = localStorage.getItem(ITEM_KEY(n));
    return raw ? (JSON.parse(raw) as PresetV1) : null;
  } catch {
    return null;
  }
}

export function deletePreset(name: string): boolean {
  const n = sanitizeName(name);
  localStorage.removeItem(ITEM_KEY(n));
  const lib = readLib().filter((m) => m.name !== n);
  writeLib(lib);
  return true;
}
