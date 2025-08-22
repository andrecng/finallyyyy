"use client";
import Field from "@/components/core/Field";
import NumberInput from "@/components/core/NumberInput";
import Checkbox from "@/components/core/Checkbox";
import type { PresetV1 } from "@/engine/facade";
import React from "react";

type Props = { preset: PresetV1; setPreset: (p: PresetV1) => void };

export default function PresetEditor({ preset, setPreset }: Props) {
  const m = preset.modules ?? {};

  const update = (up: Partial<PresetV1>) => setPreset({ ...preset, ...up });

  const setModule = <K extends keyof PresetV1["modules"]>(
    key: K,
    value: PresetV1["modules"][K] | null
  ) => {
    const next = { ...(preset.modules ?? {}) };
    if (value === null) delete (next as any)[key];
    else (next as any)[key] = value;
    setPreset({ ...preset, modules: next });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Bloc A — Paramètres généraux */}
      <div className="rounded border p-3 space-y-3">
        <div className="text-sm font-semibold">Paramètres</div>
        <Field label="Seed">
          <NumberInput value={preset.seed} onChange={(v) => update({ seed: v })} step={1} />
        </Field>
        <Field label="Total steps">
          <NumberInput value={preset.total_steps} onChange={(v) => update({ total_steps: v })} step={10} />
        </Field>
        <Field label="Drift μ (ex: 0 ou 0.4)">
          <NumberInput value={preset.mu} onChange={(v) => update({ mu: v })} step={0.01} />
        </Field>
        <Field label="Frais par trade (ex: 0.0002)">
          <NumberInput value={preset.fees_per_trade} onChange={(v) => update({ fees_per_trade: v })} step={0.0001} />
        </Field>
      </div>

      {/* Bloc B — Modules 1 */}
      <div className="rounded border p-3 space-y-3">
        <div className="text-sm font-semibold">Modules (1)</div>

        {/* VolatilityTarget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">VolatilityTarget</span>
            <Checkbox
              checked={!!m.VolatilityTarget}
              onChange={(on) =>
                setModule(
                  "VolatilityTarget",
                  on ? { vt_target_vol: 0.1, vt_halflife: 16 } : null
                )
              }
            />
          </div>
          {m.VolatilityTarget && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Target vol">
                <NumberInput
                  value={m.VolatilityTarget.vt_target_vol}
                  onChange={(v) =>
                    setModule("VolatilityTarget", { ...m.VolatilityTarget!, vt_target_vol: v })
                  }
                  step={0.01}
                />
              </Field>
              <Field label="Halflife">
                <NumberInput
                  value={m.VolatilityTarget.vt_halflife}
                  onChange={(v) =>
                    setModule("VolatilityTarget", { ...m.VolatilityTarget!, vt_halflife: v })
                  }
                  step={1}
                />
              </Field>
            </div>
          )}
        </div>

        {/* CPPIFreeze */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">CPPIFreeze</span>
            <Checkbox
              checked={!!m.CPPIFreeze}
              onChange={(on) =>
                setModule("CPPIFreeze", on ? { alpha: 0.2, freeze_frac: 0.05 } : null)
              }
            />
          </div>
          {m.CPPIFreeze && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="α (alpha)">
                <NumberInput
                  value={m.CPPIFreeze.alpha}
                  onChange={(v) => setModule("CPPIFreeze", { ...m.CPPIFreeze!, alpha: v })}
                  step={0.01}
                />
              </Field>
              <Field label="Freeze (fraction)">
                <NumberInput
                  value={m.CPPIFreeze.freeze_frac}
                  onChange={(v) => setModule("CPPIFreeze", { ...m.CPPIFreeze!, freeze_frac: v })}
                  step={0.01}
                />
              </Field>
            </div>
          )}
        </div>

        {/* KellyCap */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">KellyCap</span>
            <Checkbox
              checked={!!m.KellyCap}
              onChange={(on) => setModule("KellyCap", on ? { cap_mult: 0.5 } : null)}
            />
          </div>
          {m.KellyCap && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Cap multiplier">
                <NumberInput
                  value={m.KellyCap.cap_mult}
                  onChange={(v) => setModule("KellyCap", { ...m.KellyCap!, cap_mult: v })}
                  step={0.1}
                />
              </Field>
            </div>
          )}
        </div>
      </div>

      {/* Bloc C — Modules 2 */}
      <div className="rounded border p-3 space-y-3">
        <div className="text-sm font-semibold">Modules (2)</div>

        {/* SoftBarrier */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">SoftBarrier</span>
            <Checkbox
              checked={!!m.SoftBarrier?.enabled}
              onChange={(on) =>
                setModule("SoftBarrier", on ? { enabled: true, steps: [1, 2, 3], haircuts: [0.7, 0.5, 0.3] } : { enabled: false, steps: [], haircuts: [] })
              }
            />
          </div>
          {m.SoftBarrier?.enabled && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Steps (csv)">
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  defaultValue={(m.SoftBarrier.steps || []).join(",")}
                  onBlur={(e) =>
                    setModule("SoftBarrier", {
                      ...m.SoftBarrier!,
                      steps: (e.target.value || "")
                        .split(",")
                        .map((s) => parseInt(s.trim()))
                        .filter((n) => Number.isFinite(n)),
                    })
                  }
                />
              </Field>
              <Field label="Haircuts (csv)">
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  defaultValue={(m.SoftBarrier.haircuts || []).join(",")}
                  onBlur={(e) =>
                    setModule("SoftBarrier", {
                      ...m.SoftBarrier!,
                      haircuts: (e.target.value || "")
                        .split(",")
                        .map((s) => parseFloat(s.trim()))
                        .filter((n) => Number.isFinite(n)),
                    })
                  }
                />
              </Field>
            </div>
          )}
        </div>

        {/* FTMOGate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">FTMOGate</span>
            <Checkbox
              checked={!!m.FTMOGate?.enabled}
              onChange={(on) =>
                setModule("FTMOGate", on ? {
                  enabled: true, daily_limit: 0.02, total_limit: 0.10, spend_rate: 0.35, lmax_vol_aware: "p50"
                } : { enabled: false, daily_limit: 0, total_limit: 0, spend_rate: 0, lmax_vol_aware: "p50" })
              }
            />
          </div>
          {m.FTMOGate?.enabled && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Daily limit">
                <NumberInput value={m.FTMOGate.daily_limit} onChange={(v) => setModule("FTMOGate", { ...m.FTMOGate!, daily_limit: v })} step={0.01} />
              </Field>
              <Field label="Total limit">
                <NumberInput value={m.FTMOGate.total_limit} onChange={(v) => setModule("FTMOGate", { ...m.FTMOGate!, total_limit: v })} step={0.01} />
              </Field>
              <Field label="Spend rate">
                <NumberInput value={m.FTMOGate.spend_rate} onChange={(v) => setModule("FTMOGate", { ...m.FTMOGate!, spend_rate: v })} step={0.05} />
              </Field>
              <Field label="lmax vol aware">
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={m.FTMOGate.lmax_vol_aware}
                  onChange={(e) => setModule("FTMOGate", { ...m.FTMOGate!, lmax_vol_aware: e.target.value })}
                />
              </Field>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
