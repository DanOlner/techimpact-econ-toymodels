// The calibrated economy for a preset (spec steps 3 to 5), from research's recipe.
//
// Jobs: X, then for each firm its existing ("old") technique and a machine technique.
// Types, for n sectors: incumbents of each sector (matched, unmatched), then general workers
// (matched, unmatched). Incumbents choose between their home sector's firms and X; general
// workers choose among every firm and X (recipe step 7). Each type's attraction to a firm's
// machine technique equals its attraction to that firm's old technique (recipe step 10).

import { calibrateCurves, recordBase } from "./base-year";
import { backOutLogAttr, payByJob } from "./labour";
import { presetBaseYear } from "./presets";
import { CURVES, type CurveSpec, type Economy, type Firm, type Job, type PresetSetup, type WorkerType } from "./types";

export function firmId(sectorId: string, i: number, perSector: number): string {
  return perSector === 1 ? sectorId : `${sectorId}${i + 1}`;
}

export function buildPresetEconomy(setup: PresetSetup, theta: number, sigmaW: number): Economy {
  const spec = setup.preset;
  const b = presetBaseYear(spec);
  const F = setup.firmsPerSector;
  const r = spec.premium;

  const firms: Firm[] = spec.sectors.flatMap((sec, k) => Array.from({ length: F }, (_, i) => ({ id: firmId(sec.id, i, F), sector: k })));
  const jobs: Job[] = [{ id: "X", firm: -1, technique: "X" }];
  firms.forEach((f, i) => {
    jobs.push({ id: `${f.id}:old`, firm: i, technique: "old" });
    jobs.push({ id: `${f.id}:machine`, firm: i, technique: "machine" });
  });
  const omega0 = firms.map((f) => b.pieceRate[f.sector] as number);

  // Types with base-year shares and output per worker (old technique; machines start at 0).
  interface Draft { id: string; label: string; N: number; matched: boolean; incumbent: boolean; home: number | null; shares: number[]; output: number[] }
  const drafts: Draft[] = [];
  const minders = setup.machineMinders ?? "matched-general";
  spec.sectors.forEach((sec, k) => {
    const N = b.population.incumbents[k] as number;
    const atHome = (b.placement.incumbentsAtHome[k] as number) / N;
    for (const matched of [true, false]) {
      const shares = jobs.map((j) => (j.firm < 0 ? 1 - atHome : j.technique === "old" && firms[j.firm]!.sector === k ? atHome / F : 0));
      const output = jobs.map((j) => (j.firm < 0 ? 1 : j.technique === "old" && firms[j.firm]!.sector === k ? (1 + r) / (b.pieceRate[k] as number) : 0));
      drafts.push({ id: `inc-${sec.id}-${matched ? "matched" : "unmatched"}`, label: `${sec.label} incumbents, ${matched ? "matched" : "unmatched"}`, N: N * (matched ? spec.matchedSplit : 1 - spec.matchedSplit), matched, incumbent: true, home: k, shares, output });
    }
  });
  const Ng = b.population.general;
  for (const matched of [true, false]) {
    const shares = jobs.map((j) => (j.firm < 0 ? b.placement.generalInX / Ng : j.technique === "old" ? (b.placement.generalInSectors[firms[j.firm]!.sector] as number) / F / Ng : 0));
    const output = jobs.map((j) => (j.firm < 0 ? 1 : j.technique === "old" ? 1 / (b.pieceRate[firms[j.firm]!.sector] as number) : 0));
    drafts.push({ id: `gen-${matched ? "matched" : "unmatched"}`, label: `General, ${matched ? "matched" : "unmatched"}`, N: Ng * (matched ? spec.matchedSplit : 1 - spec.matchedSplit), matched, incumbent: false, home: null, shares, output });
  }

  const types: WorkerType[] = drafts.map((d) => {
    const mindsMachines = minders === "all" || (d.matched && (minders === "matched" || !d.incumbent));
    const t: WorkerType = { id: d.id, label: d.label, N: d.N, matched: d.matched, mindsMachines, incumbent: d.incumbent, output: d.output, logAttr: jobs.map(() => 0) };
    const pay = payByJob(t, jobs, omega0);
    const logAttr = backOutLogAttr(d.shares, pay, theta);
    // Machine techniques: the same attraction as the firm's old technique, where it's in the choice set.
    jobs.forEach((j, idx) => {
      if (j.technique === "machine") logAttr[idx] = logAttr[idx - 1] as number;
    });
    t.logAttr = logAttr;
    return t;
  });

  // Demand curves, calibrated to the preset's spending shares at base-year incomes.
  const curveSpecs: CurveSpec[] = spec.sectors.map((sec) => {
    const c = setup.curves?.[sec.id] ?? (sec.curve as "young" | "mature" | CurveSpec);
    return typeof c === "string" ? CURVES[c] : c;
  });
  const y = drafts.map((d) => d.shares.reduce((acc, sh, j) => (sh > 0 ? acc + sh * (j === 0 ? 1 : omega0[jobs[j]!.firm]! * (d.output[j] as number)) : acc), 0));
  const curves = calibrateCurves(curveSpecs, spec.sectors.map((s) => s.spendingShare), types.map((t) => t.N), y);

  const econ: Economy = {
    sectors: spec.sectors.map((sec, k) => ({ id: sec.id, curve: curveSpecs[k]!, spendingShare: sec.spendingShare, ...curves[k]! })),
    firms,
    jobs,
    coef: b.coef,
    sigmaW,
    theta,
    switches: {},
    types,
    base: { omega: omega0, x: [], y: [], demand: [], finalDemand: [], sectorPrice: [], utility: [], shares: [] },
  };
  return recordBase(econ, omega0);
}
