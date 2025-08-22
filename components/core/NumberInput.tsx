"use client";
import { useEffect, useState } from "react";

type Props = {
  value: number | null | undefined;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
};

/**
 * NumberInput permissif :
 * - Autorise l'édition libre : "", "-", "1.", "-.5" pendant la saisie
 * - Émet vers onChange UNIQUEMENT quand une valeur numérique valide est présente
 * - Sur blur : tente de valider le texte courant ; sinon garde la dernière valeur numérique connue
 */
export default function NumberInput({
  value,
  onChange,
  step = 0.01,
  min,
  max,
  placeholder,
  className,
}: Props) {
  const valueToText = (v: number | null | undefined) =>
    Number.isFinite(v as number) ? String(v) : "";

  const [text, setText] = useState<string>(valueToText(value));
  const [focused, setFocused] = useState(false);

  // Quand la prop value change (externe) et que l'input n'est pas focus, on resynchronise l'affichage
  useEffect(() => {
    if (!focused) setText(valueToText(value));
  }, [value, focused]);

  // Essaie d'émettre un nombre valide vers le parent
  function tryEmit(s: string) {
    const t = s.trim();
    // États intermédiaires autorisés : ne rien émettre
    if (t === "" || t === "-" || t === "." || t === "-.") return;

    const n = Number(t);
    if (!Number.isFinite(n)) return;

    let nn = n;
    if (typeof min === "number") nn = Math.max(min, nn);
    if (typeof max === "number") nn = Math.min(max, nn);

    onChange(nn);
  }

  return (
    <input
      type="text" // text pour permettre "", "-", "1.", etc.
      inputMode="decimal"
      className={`w-full rounded border px-2 py-1 text-sm ${className ?? ""}`}
      value={text}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        const s = e.target.value;
        setText(s);
        // on tente d'émettre à chaque frappe si c'est déjà un nombre valide
        tryEmit(s);
      }}
      onBlur={() => {
        setFocused(false);
        // dernière tentative à la sortie du champ
        tryEmit(text);
        // puis on resynchronise l'affichage avec la value externe (si elle a changé)
        setText(valueToText(value));
      }}
    />
  );
}
