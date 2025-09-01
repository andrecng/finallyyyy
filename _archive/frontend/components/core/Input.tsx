"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  compact?: boolean;
}

export function Input({ className = "", compact = false, ...props }: InputProps) {
  return (
    <input 
      className={`border rounded px-2 py-1 ${compact ? "w-36" : "w-full"} ${className}`} 
      {...props} 
    />
  );
}
