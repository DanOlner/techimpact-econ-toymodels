// Firms, prices and quantities. Spec "Firms, prices and quantities".

import type { Firm } from "./types";

export interface PriceState {
  firmPrice: number[];
  /** Firm's share of its sector's units: CES shares p^(−σ_w), normalised within the sector. */
  firmShare: number[];
  /** Sector price: the average price paid per unit. */
  sectorPrice: number[];
}

/**
 * Prices from piece rates: p_f = ω_f + Σ_k coef[k][sector f] · P_k, with P_k the share-weighted
 * average of its firms' prices. Iterated to a fixed point; it converges while the input loop's
 * coefficients multiply to less than 1. With no bought-in inputs, p = ω.
 */
export function pricesFromPieceRates(firms: Firm[], nSectors: number, coef: number[][], sigmaW: number, omega: number[]): PriceState {
  let sectorPrice = new Array<number>(nSectors).fill(1);
  let firmPrice = omega.slice();
  let firmShare = firms.map(() => 1);
  for (let iter = 0; iter < 10000; iter++) {
    firmPrice = firms.map((f, i) => {
      let p = omega[i] as number;
      for (let k = 0; k < nSectors; k++) p += (coef[k]?.[f.sector] ?? 0) * (sectorPrice[k] as number);
      return p;
    });
    firmShare = cesShares(firms, nSectors, sigmaW, firmPrice);
    const next = new Array<number>(nSectors).fill(0);
    firms.forEach((f, i) => {
      next[f.sector] = (next[f.sector] as number) + (firmShare[i] as number) * (firmPrice[i] as number);
    });
    const change = Math.max(...next.map((p, k) => Math.abs(p - (sectorPrice[k] as number)) / p));
    sectorPrice = next;
    if (change < 1e-15) break;
  }
  return { firmPrice, firmShare, sectorPrice };
}

/** CES purchase shares within each sector. A sector with one firm gives it a share of 1. */
export function cesShares(firms: Firm[], nSectors: number, sigmaW: number, firmPrice: number[]): number[] {
  // Work in logs relative to each sector's cheapest firm, so large σ_w doesn't overflow.
  const minLogP = new Array<number>(nSectors).fill(Infinity);
  firms.forEach((f, i) => {
    minLogP[f.sector] = Math.min(minLogP[f.sector] as number, Math.log(firmPrice[i] as number));
  });
  const w = firms.map((f, i) => Math.exp(-sigmaW * (Math.log(firmPrice[i] as number) - (minLogP[f.sector] as number))));
  const totals = new Array<number>(nSectors).fill(0);
  firms.forEach((f, i) => {
    totals[f.sector] = (totals[f.sector] as number) + (w[i] as number);
  });
  return firms.map((f, i) => (w[i] as number) / (totals[f.sector] as number));
}

/** Sector outputs from final demand through the input loop: Q = F + coef · Q, solved directly. */
export function sectorOutputs(coef: number[][], finalDemand: number[]): number[] {
  const n = finalDemand.length;
  // (I − coef) Q = F, by Gaussian elimination with partial pivoting.
  const m = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (j === n ? (finalDemand[i] as number) : (i === j ? 1 : 0) - (coef[i]?.[j] ?? 0))),
  );
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r]![col]!) > Math.abs(m[piv]![col]!)) piv = r;
    [m[col], m[piv]] = [m[piv]!, m[col]!];
    const rowC = m[col]!;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const row = m[r]!;
      const f = row[col]! / rowC[col]!;
      for (let j = col; j <= n; j++) row[j] = row[j]! - f * rowC[j]!;
    }
  }
  return m.map((row, i) => row[n]! / row[i]!);
}
