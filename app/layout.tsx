import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainNavigation from "@/components/navigation/MainNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2048 Asset Management - Moteur Alpha",
  description: "Système de Gestion de Risque Adaptatif avec Simulation Monte Carlo",
  keywords: "gestion de risque,CPPI,FTMO,simulation,trading",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <MainNavigation />
        {children}
      </body>
    </html>
  );
}
