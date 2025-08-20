"use client";
import React from "react";

type FieldProps = {
  label: string;
  subtitle?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

export default function Field({ label, subtitle, htmlFor, children, className = "" }: FieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={htmlFor} className="block text-base font-semibold">
        {label}
      </label>
      {children}
      {subtitle && (
        <div className="text-sm text-muted">
          {subtitle}
        </div>
      )}
    </div>
  );
}
