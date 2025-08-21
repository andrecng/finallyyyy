"use client";

export type ModuleFlags = { FTMOGate: boolean; CPPI: boolean; VolTarget: boolean; SoftBarrier: boolean; };

export default function ModuleToggles({ mods, onChange, disabled }:
  { mods: ModuleFlags; onChange: (m: ModuleFlags)=>void; disabled?: boolean }) {
  
  const T = ({ k, label }: { k: keyof ModuleFlags; label: string }) => (
    <label className="flex items-center gap-2 text-sm">
      <input 
        type="checkbox" 
        checked={mods[k]} 
        disabled={disabled}
        onChange={e => onChange({ ...mods, [k]: e.target.checked })} 
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="card">
      <div className="font-semibold mb-2">Modules actifs</div>
      <div className="grid grid-cols-2 gap-2">
        <T k="FTMOGate" label="FTMOGate" />
        <T k="CPPI" label="CPPI" />
        <T k="VolTarget" label="VolTarget" />
        <T k="SoftBarrier" label="SoftBarrier" />
      </div>
    </div>
  );
}
