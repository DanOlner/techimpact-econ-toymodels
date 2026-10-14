// Preset base years for steps 3 to 5, built by the spec's recipe ("Steps 3 to 5: a recipe that
// fits together"). No solve: the recipe sets sectors first and derives the population, so the base
// year fits by construction. Solving these economies comes with step 3.

import { sectorOutputs } from "./prices";

export interface PresetSpec {
  id: string;
  title: string;
  description?: string;
  sectors: { id: string; label: string; curve: string; spendingShare: number }[];
  /** "D->M": units of D used per unit of M (a_DM); "M->D": units of M per unit of D (a_MD). */
  coef: Record<string, number>;
  premium: number;
  incumbentShareOfHeadcount: number;
  incumbentShareAtHome: number;
  matchedSplit: number;
}

export interface PresetBaseYear {
  spec: PresetSpec;
  /** coef[k][l]: units of sector k used per unit of sector l. */
  coef: number[][];
  /** Leontief inverse B = (I − coef)⁻¹. */
  leontief: number[][];
  pieceRate: number[];
  /** Base-year prices: all 1, and equal to ω · B (the supply-chain identity). */
  priceFromChain: number[];
  incomePerHead: number;
  finalDemand: number[];
  output: number[];
  /** intermediate[k][l]: units of k bought by sector l. */
  intermediate: number[][];
  payBill: number[];
  headcount: { sectors: number[]; X: number };
  /** Output per worker in each sector's existing technique. */
  outputPerWorker: { incumbent: number[]; general: number[] };
  population: { incumbents: number[]; general: number };
  /** Who works where: incumbents of each sector at home and in X, and general workers by job. */
  placement: { incumbentsAtHome: number[]; incumbentsInX: number[]; generalInSectors: number[]; generalInX: number };
}

export function presetBaseYear(spec: PresetSpec): PresetBaseYear {
  const n = spec.sectors.length;
  const idx = (id: string) => spec.sectors.findIndex((s) => s.id === id);
  const coef = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (const [key, a] of Object.entries(spec.coef)) {
    const [from, to] = key.split("->") as [string, string];
    coef[idx(from)]![idx(to)] = a;
  }
  // 1. Prices are all 1, so each sector's piece rate is 1 minus its input cost per unit.
  const pieceRate = spec.sectors.map((_, l) => 1 - coef.reduce((acc, row) => acc + row[l]!, 0));
  // Leontief inverse, column by column.
  const leontief = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let j = 0; j < n; j++) {
    const col = sectorOutputs(coef, spec.sectors.map((_, i) => (i === j ? 1 : 0)));
    col.forEach((v, i) => (leontief[i]![j] = v));
  }
  const priceFromChain = spec.sectors.map((_, j) => pieceRate.reduce((acc, w, i) => acc + w * leontief[i]![j]!, 0));

  // 2–4. Pay and sizes per unit of total income, then scaled so the population adds up to 1.
  const r = spec.premium;
  const inc = spec.incumbentShareOfHeadcount;
  const avgPay = inc * (1 + r) + (1 - inc) * 1;
  const outPerY = sectorOutputs(coef, spec.sectors.map((s) => s.spendingShare));
  const headsPerY = outPerY.map((q, k) => (pieceRate[k]! * q) / avgPay);
  const xHeadsPerY = 1 - spec.sectors.reduce((acc, s) => acc + s.spendingShare, 0); // X pays and produces 1
  const Y = 1 / (headsPerY.reduce((a, b) => a + b, 0) + xHeadsPerY);

  const output = outPerY.map((q) => q * Y);
  const headSectors = headsPerY.map((h) => h * Y);
  const headX = xHeadsPerY * Y;
  // 5–6. Incumbents are 75% of each sector's headcount; 90% of each incumbent type works at home.
  const incumbentsAtHome = headSectors.map((h) => inc * h);
  const incumbents = incumbentsAtHome.map((h) => h / spec.incumbentShareAtHome);
  const incumbentsInX = incumbents.map((p, k) => p - incumbentsAtHome[k]!);
  const generalInSectors = headSectors.map((h) => (1 - inc) * h);
  const general = 1 - incumbents.reduce((a, b) => a + b, 0);
  const generalInX = general - generalInSectors.reduce((a, b) => a + b, 0);

  return {
    spec,
    coef,
    leontief,
    pieceRate,
    priceFromChain,
    incomePerHead: Y,
    finalDemand: spec.sectors.map((s) => s.spendingShare * Y),
    output,
    intermediate: coef.map((row) => row.map((a, l) => a * output[l]!)),
    payBill: output.map((q, k) => pieceRate[k]! * q),
    headcount: { sectors: headSectors, X: headX },
    outputPerWorker: { incumbent: pieceRate.map((w) => (1 + r) / w), general: pieceRate.map((w) => 1 / w) },
    population: { incumbents, general },
    placement: { incumbentsAtHome, incumbentsInX, generalInSectors, generalInX },
  };
}
