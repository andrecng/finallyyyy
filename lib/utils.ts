import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Génère un nombre aléatoire suivant une distribution normale (Box-Muller)
 * @returns Nombre aléatoire avec moyenne 0 et écart-type 1
 */
export function getRandomNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z;
}

/**
 * Calcule le maximum drawdown d'une série de valeurs
 * @param equity - Série de valeurs d'équité
 * @returns Pourcentage de drawdown maximum
 */
export function calculateMaxDrawdown(equity: number[]): number {
  let maxDD = 0;
  let peak = equity[0];
  
  for (let i = 1; i < equity.length; i++) {
    if (equity[i] > peak) {
      peak = equity[i];
    }
    const drawdown = (peak - equity[i]) / peak;
    if (drawdown > maxDD) {
      maxDD = drawdown;
    }
  }
  
  return maxDD * 100; // Retourne en pourcentage
}

/**
 * Calcule le CAGR (Compound Annual Growth Rate)
 * @param startValue - Valeur initiale
 * @param endValue - Valeur finale
 * @param years - Nombre d'années
 * @returns CAGR en pourcentage
 */
export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

/**
 * Formate un nombre en pourcentage avec 2 décimales
 * @param value - Valeur à formater
 * @returns Chaîne formatée
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Formate un nombre en devise avec 2 décimales
 * @param value - Valeur à formater
 * @returns Chaîne formatée
 */
export function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
