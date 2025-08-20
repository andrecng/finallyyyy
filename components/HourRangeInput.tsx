import { useState, useEffect } from "react";

function parseRanges(text: string): [number, number][] {
  if (!text.trim()) return [];
  return text.split(",").map(seg => {
    const [a,b] = seg.split("-").map(x => parseInt(x.trim(), 10));
    if (Number.isFinite(a) && Number.isFinite(b)) return [Math.max(0,a), Math.min(23,b)] as [number,number];
    return null as any;
  }).filter(Boolean);
}

function formatRanges(ranges: [number, number][]): string {
  return ranges.map(([a,b]) => `${a}-${b}`).join(",");
}

export default function HourRangeInput({
  value, onChange
}: { value: [number, number][]; onChange: (v:[number,number][]) => void }) {
  const [text, setText] = useState(formatRanges(value || []));
  
  useEffect(()=>{ 
    setText(formatRanges(value || [])); 
  }, [value]);
  
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Heures interdites (0–23)</label>
      <input
        className="w-full rounded-md border p-2 text-sm font-mono"
        placeholder="ex: 22-23,0-1"
        value={text}
        onChange={e=>{
          setText(e.target.value);
          onChange(parseRanges(e.target.value));
        }}
      />
      <p className="text-xs text-neutral-500">
        Ex : <code>22-23,0-1</code>
      </p>
    </div>
  );
}
