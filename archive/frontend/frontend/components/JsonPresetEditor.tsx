import { useState } from "react";

export default function JsonPresetEditor({ value, onChange }:{ value: any; onChange:(v:any)=>void }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  function handleBlur() {
    try { onChange(JSON.parse(text)); }
    catch { /* laisse l'utilisateur corriger */ }
  }
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Entrée JSON (presets_api)</label>
      <textarea
        className="w-full h-64 rounded-md border p-2 font-mono text-sm"
        value={text}
        onChange={e=>setText(e.target.value)}
        onBlur={handleBlur}
        spellCheck={false}
      />
    </div>
  );
}
