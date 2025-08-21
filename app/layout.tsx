import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fond & FTMO Workspace",
  description: "Moteur de Money Management – daily-first FTMO",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-6xl p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
