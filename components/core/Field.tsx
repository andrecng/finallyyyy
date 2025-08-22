"use client";
import React from "react";
type Props = { label: string; children: React.ReactNode; className?: string };
export default function Field({ label, children, className }: Props) {
  return (
    <label className={`block space-y-1 ${className ?? ""}`}>
      <span className="text-xs font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
