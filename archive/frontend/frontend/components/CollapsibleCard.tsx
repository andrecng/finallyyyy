"use client";
import React, { useState } from "react";

export default function CollapsibleCard({
  title, defaultOpen=true, children, footer
}: { title: string; defaultOpen?: boolean; children: React.ReactNode; footer?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{title}</h3>
        <button
          className="text-xs underline"
          onClick={()=>setOpen(o=>!o)}
          aria-expanded={open}
        >
          {open ? "Masquer" : "Afficher"}
        </button>
      </div>
      {open && <div className="space-y-3">{children}</div>}
      {footer && <div className="pt-3">{footer}</div>}
    </section>
  );
}
