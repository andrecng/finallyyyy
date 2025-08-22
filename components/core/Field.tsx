"use client";
import { ReactNode } from "react";
export default function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block space-y-1 ${className ?? ""}`}>
      <span className="text-xs font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
