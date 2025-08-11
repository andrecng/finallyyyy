import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import MainNavigation from '@/components/navigation/MainNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '2048 Asset Management - Money Management & Sizing',
  description: 'Professional Asset Management and Position Sizing Tool',
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
        <main className="min-h-screen bg-primary">
          {children}
        </main>
      </body>
    </html>
  );
}