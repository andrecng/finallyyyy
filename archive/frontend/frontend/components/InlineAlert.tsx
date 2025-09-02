import React from "react";

export default function InlineAlert({ type = "error", message }: { type?: "error" | "info" | "success"; message: string }) {
  const colors: Record<string, React.CSSProperties> = {
    error: { border: "1px solid rgba(255,99,132,0.4)", background: "rgba(255,99,132,0.08)", color: "#ff8fa3" },
    info: { border: "1px solid rgba(124,140,255,0.4)", background: "rgba(124,140,255,0.08)", color: "#c7ccff" },
    success: { border: "1px solid rgba(0,200,120,0.4)", background: "rgba(0,200,120,0.08)", color: "#b5ffd6" },
  };
  return (
    <div style={{ ...colors[type], padding: 10, borderRadius: 8, fontSize: 12 }}>
      {message}
    </div>
  );
}
