import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fond & FTMO Workspace",
  description: "Moteur Money Management – daily-first",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <div className="mx-auto max-w-6xl p-4">{children}</div>
      </body>
    </html>
  );
}
