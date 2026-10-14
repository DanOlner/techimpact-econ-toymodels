// Base years. Spec "The base year".
// Steps 1 and 2: one sector, one firm, X. All prices and piece rates are 1 in the base year.

import { curveMu, curveShape, household, utility, type Curve } from "./demand";
import { backOutLogAttr, logitShares, payByJob } from "./labour";
import { evaluate } from "./solve";
import { CURVES, type Economy, type Job, type OneSectorSetup, type Scenario, type WorkerType } from "./types";

/** Index of each job in a one-sector economy. */
export const JOB = { X: 0, old: 1, machine: 2 } as const;

/** Build the calibrated base-year economy for a scenario, with its switches set. */
export function buildBaseEconomy(scenario: Scenario): Economy {
  const econ = buildOneSector(scenario.setup, scenario.theta, scenario.sigmaW);
  econ.switches = { ...(scenario.switches ?? {}) };
  return econ;
}

function buildOneSector(setup: OneSectorSetup, theta: number, sigmaW: number): Economy {
  const curve = typeof setup.sector.curve === "string" ? CURVES[setup.sector.curve] : setup.sector.curve;
  const share = setup.sector.spendingShare;
  const jobs: Job[] = [
    { id: "X", firm: -1, technique: "X" },
    { id: "M:old", firm: 0, technique: "old" },
    { id: "M:machine", firm: 0, technique: "machine" },
  ];
  const omega0 = [1];

  // Types: output table and attraction terms, at base-year pay.
  const types: WorkerType[] = setup.types.map((ts) => {
    const xOut = ts.xOutput ?? 1;
    const t: WorkerType = {
      id: ts.id,
      label: ts.label ?? ts.id,
      N: 0,
      matched: ts.matched ?? false,
      mindsMachines: ts.mindsMachines ?? false,
      incumbent: ts.incumbent ?? false,
      output: [xOut, ts.sectorOutput, 0],
      logAttr: [0, 0, 0],
    };
    // Base pay with every job open, so attraction can be set or backed out.
    const pay = payByJob({ ...t, logAttr: [0, 0, 0] }, jobs, omega0);
    let logAttr: number[];
    if ("sectorShare" in ts.base) {
      const s = ts.base.sectorShare;
      if (s > 0 && !(ts.sectorOutput > 0)) throw new Error(`Type ${ts.id} has a sector share but can't work in the sector`);
      logAttr = backOutLogAttr([1 - s, s, 0], pay, theta);
    } else {
      const b = ts.base.attraction;
      logAttr = [Math.log(b.X), b.sector > 0 && ts.sectorOutput > 0 ? Math.log(b.sector) : -Infinity, -Infinity];
    }
    // New-technique jobs: the same attraction as the old technique, or as X if the type has no
    // attraction to the old one (a default reported to research).
    logAttr[JOB.machine] = Number.isFinite(logAttr[JOB.old]) ? (logAttr[JOB.old] as number) : (logAttr[JOB.X] as number);
    t.logAttr = logAttr;
    return t;
  });

  // Per-head income and units supplied in the base year.
  const perHead = types.map((t) => {
    const pay = payByJob(t, jobs, omega0);
    const shares = logitShares(t, pay, theta);
    const y = shares.reduce((acc, sh, j) => (sh > 0 ? acc + sh * (pay[j] as number) : acc), 0);
    return { y, supply: (shares[JOB.old] as number) * (t.output[JOB.old] as number) };
  });

  // Population sizes: fixed numbers; "balance" types (sized equally, so that the base year clears);
  // and "rest" types (sized equally, filling the population to 1).
  // Clearing at price 1: Σ N_s (supply_s − share · y_s) = 0.
  const k = perHead.map((p) => p.supply - share * p.y);
  const idx = (kind: "balance" | "rest") => setup.types.flatMap((t, i) => (t.N === kind ? [i] : []));
  const fixedIdx = setup.types.flatMap((t, i) => (typeof t.N === "number" ? [i] : []));
  const balIdx = idx("balance");
  const restIdx = idx("rest");
  const fixedTotal = fixedIdx.reduce((acc, i) => acc + (setup.types[i]!.N as number), 0);
  fixedIdx.forEach((i) => {
    types[i]!.N = setup.types[i]!.N as number;
  });
  const sumK = (ids: number[]) => ids.reduce((acc, i) => acc + (k[i] as number), 0);
  if (balIdx.length > 0) {
    if (restIdx.length === 0) throw new Error("Balance types need a rest type");
    // With b for each balance type and r = (1 − fixed − nb·b) / nr for each rest type:
    // Σ_fixed N k + b Σ_bal k + r Σ_rest k = 0.
    // Balance types have sizes b · weight; with W the total weight:
    // Σ_fixed N k + b Σ_bal weight · k + r Σ_rest k = 0, with r = (1 − fixed − b W) / nr.
    const weight = (i: number) => setup.types[i]!.balanceWeight ?? 1;
    const W = balIdx.reduce((acc, i) => acc + weight(i), 0);
    const fixedK = fixedIdx.reduce((acc, i) => acc + types[i]!.N * (k[i] as number), 0);
    const kr = sumK(restIdx) / restIdx.length;
    const kb = balIdx.reduce((acc, i) => acc + weight(i) * (k[i] as number), 0);
    const b = -(fixedK + (1 - fixedTotal) * kr) / (kb - W * kr);
    balIdx.forEach((i) => (types[i]!.N = b * weight(i)));
    restIdx.forEach((i) => (types[i]!.N = (1 - fixedTotal - W * b) / restIdx.length));
  } else if (restIdx.length > 0) {
    restIdx.forEach((i) => (types[i]!.N = (1 - fixedTotal) / restIdx.length));
  }
  if (types.some((t) => !(t.N > 0))) throw new Error(`Population sizes don't work: ${types.map((t) => `${t.id}=${t.N}`).join(", ")}`);

  // Demand curve: shape from two numbers, location from the population-average x₀, then γ
  // solved so that base-year spending on the sector is exactly its share of income.
  const Y = types.reduce((acc, t, s) => acc + t.N * perHead[s]!.y, 0);
  const totalN = types.reduce((acc, t) => acc + t.N, 0);
  const xbar = (Y * (1 - share)) / totalN;
  const { sigma } = curveShape(curve);
  const mu = curveMu(curve, 1 / xbar);
  let gamma = (share * Y) / totalN / curve.saturation;
  for (let i = 0; i < 200; i++) {
    const c: Curve = { gamma, mu, sigma };
    const spend = types.reduce((acc, t, s) => acc + t.N * household([c], [1], perHead[s]!.y).demand[0]!, 0);
    const ratio = (share * Y) / spend;
    gamma *= ratio;
    if (Math.abs(ratio - 1) < 1e-15) break;
  }

  const econ: Economy = {
    sectors: [{ id: "M", curve, spendingShare: share, gamma, mu, sigma }],
    firms: [{ id: "M", sector: 0 }],
    jobs,
    coef: [[0]],
    sigmaW,
    theta,
    switches: {},
    types,
    base: { omega: omega0, x: [], y: [], demand: [], finalDemand: [], sectorPrice: [1], utility: [], shares: [] },
  };

  // Record the base year, and check that it clears at a piece rate of 1.
  const sol = evaluate(econ, omega0);
  if (sol.accounting.marketResidual > 1e-10) throw new Error(`Base year doesn't clear: residual ${sol.accounting.marketResidual}`);
  const curves: Curve[] = [{ gamma, mu, sigma }];
  econ.base = {
    omega: omega0,
    x: sol.types.map((o) => o.x),
    y: sol.types.map((o) => o.y),
    demand: sol.types.map((o) => o.demand),
    finalDemand: sol.finalDemand,
    sectorPrice: sol.sectorPrice,
    utility: sol.types.map((o) => utility(curves, sol.sectorPrice, o.x)),
    shares: sol.types.map((o) => o.shares),
  };
  return econ;
}
