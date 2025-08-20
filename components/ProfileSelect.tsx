import { useId } from "react";

const PROFILES = [
  { key: "gaussian", label: "Gaussian (optimiste)" },
  { key: "student_t", label: "Student-t (queues épaisses)" },
  { key: "student_t_jumps_ewma", label: "Student-t + Jumps + EWMA (stress réaliste)" },
];

export default function ProfileSelect({ value, onChange }: { value: string; onChange: (v: string)=>void }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">Profil de marché</label>
      <select id={id} className="w-full rounded-md border p-2" value={value} onChange={e=>onChange(e.target.value)}>
        {PROFILES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
      </select>
    </div>
  );
}
