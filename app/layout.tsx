import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "MM Strategy Tester",
  description: "Money Management Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      {/* fond unifié + couleur/typo globale */}
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {/* barre de nav minimaliste et cohérente */}
        <header className="border-b border-white/10 sticky top-0 z-50 bg-neutral-950/90 backdrop-blur">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-semibold tracking-wide">MM Engine</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/strategy-tester" className="hover:opacity-80">Strategy Tester</Link>
              <Link href="/ftmo" className="hover:opacity-80">FTMO Multi</Link>
              <Link href="/logs" className="hover:opacity-80">Logs</Link>
            </div>
            <div className="ml-auto text-xs opacity-70">env: {process.env.NEXT_PUBLIC_ENV ?? "local"}</div>
          </nav>
        </header>

        {/* contenu */}
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="mx-auto max-w-6xl px-4 py-6 opacity-60 text-xs">
          MM Engine • V1
        </footer>
      </body>
    </html>
  );
}