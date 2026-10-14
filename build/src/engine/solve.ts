// Evaluating the economy at given piece rates, and solving for the piece rates that clear every
// firm's market. Spec "Solving".

import { elasticityAt, household, utility, type Curve } from "./demand";
import { logitShares, payByJob } from "./labour";
import { pricesFromPieceRates, sectorOutputs } from "./prices";
import { STRICT_THETA, type Economy, type Solution, type SolverInfo, type TypeOutcome } from "./types";

export function effectiveTheta(econ: Economy): number {
  return econ.switches.strictSorting ? STRICT_THETA : econ.theta;
}

const curvesOf = (econ: Economy): Curve[] => econ.sectors.map((s) => ({ gamma: s.gamma, mu: s.mu, sigma: s.sigma }));

/** Everything that follows from a set of piece rates. The solver looks for rates where firmRequired = firmSupplied. */
export function evaluate(econ: Economy, omega: number[], solver?: SolverInfo): Solution {
  const nS = econ.sectors.length;
  const theta = effectiveTheta(econ);
  const curves = curvesOf(econ);
  const { firmPrice, firmShare, sectorPrice } = pricesFromPieceRates(econ.firms, nS, econ.coef, econ.sigmaW, omega);

  // Workers: pay, shares and income for each type.
  const types: TypeOutcome[] = econ.types.map((t, s) => {
    const pay = payByJob(t, econ.jobs, omega);
    const shares = logitShares(t, pay, theta);
    const y = shares.reduce((acc, sh, j) => (sh > 0 ? acc + sh * (pay[j] as number) : acc), 0);
    let x: number;
    let demand: number[];
    if (econ.switches.freezeDemand) {
      demand = (econ.base.demand[s] as number[]).slice();
      x = y - demand.reduce((acc, d, k) => acc + (sectorPrice[k] as number) * d, 0);
    } else {
      const h = household(curves, sectorPrice, y, econ.switches.fixedX ? econ.base.x[s] : undefined);
      x = h.x;
      demand = h.demand;
    }
    const cutX = econ.switches.fixedX || econ.switches.freezeDemand ? (econ.base.x[s] as number) : x;
    const elasticity = curves.map((c, k) => elasticityAt(c, (sectorPrice[k] as number) / cutX));
    return { id: t.id, y, x, demand, shares, pay, utility: x > 0 ? utility(curves, sectorPrice, x) : -Infinity, elasticity };
  });

  // Final demand, sector outputs and the units each firm must make.
  const finalDemand = econ.sectors.map((_, k) => econ.types.reduce((acc, t, s) => acc + t.N * (types[s]!.demand[k] as number), 0));
  const sectorOutput = sectorOutputs(econ.coef, finalDemand);
  const firmRequired = econ.firms.map((f, i) => (firmShare[i] as number) * (sectorOutput[f.sector] as number));

  // Headcount and units supplied.
  const employment = econ.types.map((t, s) => types[s]!.shares.map((sh) => t.N * sh));
  const jobEmployment = econ.jobs.map((_, j) => employment.reduce((acc, row) => acc + (row[j] as number), 0));
  const firmSupplied = econ.firms.map(() => 0);
  econ.types.forEach((t, s) => {
    econ.jobs.forEach((job, j) => {
      if (job.firm >= 0) firmSupplied[job.firm] = (firmSupplied[job.firm] as number) + employment[s]![j]! * (t.output[j] as number);
    });
  });
  const sectorEmployment = econ.sectors.map((_, k) =>
    econ.jobs.reduce((acc, job, j) => (job.firm >= 0 && econ.firms[job.firm]!.sector === k ? acc + (jobEmployment[j] as number) : acc), 0),
  );
  const totalN = econ.types.reduce((acc, t) => acc + t.N, 0);
  const saturation = econ.sectors.map(
    (sec, k) => econ.types.reduce((acc, t, s) => acc + t.N * (types[s]!.demand[k] as number), 0) / totalN / sec.gamma,
  );

  // Accounting identities.
  const spendingVsIncome = Math.max(
    ...types.map((o) => {
      const spend = o.x + o.demand.reduce((acc, d, k) => acc + (sectorPrice[k] as number) * d, 0);
      return Math.abs(spend - o.y) / Math.max(o.y, 1e-300);
    }),
  );
  const xJob = econ.jobs.findIndex((j) => j.firm < 0);
  const xProduced = econ.types.reduce((acc, t, s) => acc + employment[s]![xJob]! * (t.output[xJob] as number), 0);
  const xConsumed = econ.types.reduce((acc, t, s) => acc + t.N * types[s]!.x, 0);
  const xBalance = Math.abs(xProduced - xConsumed) / Math.max(xConsumed, 1e-300);
  const shareSums = Math.max(...types.map((o) => Math.abs(o.shares.reduce((a, b) => a + b, 0) - 1)));
  const marketResidual = Math.max(
    ...firmRequired.map((r, i) => Math.abs(r - (firmSupplied[i] as number)) / Math.max(r, firmSupplied[i] as number, 1e-300)),
  );

  return {
    omega: omega.slice(),
    firmPrice,
    firmShare,
    sectorPrice,
    finalDemand,
    sectorOutput,
    firmRequired,
    firmSupplied,
    jobEmployment,
    employment,
    sectorEmployment,
    saturation,
    types,
    accounting: { spendingVsIncome, xBalance, shareSums, marketResidual },
    solver: solver ?? { method: "evaluate", start: omega.slice(), iterations: 0, converged: false },
  };
}

/** Log excess demand for one firm: ln(required) − ln(supplied). Falls as the piece rate rises. */
function logExcess(econ: Economy, omega: number[], f: number): number {
  const sol = evaluate(econ, omega);
  return Math.log(sol.firmRequired[f] as number) - Math.log(sol.firmSupplied[f] as number);
}

export interface SolveOptions {
  /** Starting piece rates; default 1 for every firm. */
  start?: number[];
  /** Convergence tolerance on ln ω. */
  tol?: number;
}

/**
 * Solve for the piece rates that clear every firm's market.
 * One firm: bisection on ln ω, bracketing outwards from the start by factors of 2.
 * Two or more firms come with spec step 3.
 */
export function solve(econ: Economy, opts: SolveOptions = {}): Solution {
  const nF = econ.firms.length;
  const start = opts.start ?? new Array<number>(nF).fill(1);
  const tol = opts.tol ?? 1e-13;
  if (nF !== 1) throw new Error("Solving with more than one firm comes with spec step 3");

  const g = (t: number) => logExcess(econ, [Math.exp(t)], 0);
  const t0 = Math.log(start[0] as number);
  let iterations = 0;
  // Bracket: excess demand is positive below the solution and negative above it.
  let lo = t0;
  let hi = t0;
  let glo = g(lo);
  let ghi = glo;
  const step = Math.LN2;
  const limit = Math.log(1e12);
  while (glo < 0 || Number.isNaN(glo)) {
    lo -= step;
    glo = g(lo);
    iterations++;
    if (lo < -limit) throw new Error("No bracket found below the start");
  }
  while (ghi > 0 || Number.isNaN(ghi)) {
    hi += step;
    ghi = g(hi);
    iterations++;
    if (hi > limit) throw new Error("No bracket found above the start");
  }
  const bracket: [number, number] = [Math.exp(lo), Math.exp(hi)];
  while (hi - lo > tol) {
    const mid = 0.5 * (lo + hi);
    if (mid <= lo || mid >= hi) break;
    const gm = g(mid);
    iterations++;
    if (gm > 0) lo = mid;
    else hi = mid;
  }
  const t = 0.5 * (lo + hi);
  return evaluate(econ, [Math.exp(t)], { method: "bisection on ln ω", start, iterations, bracket, converged: hi - lo <= tol * 1.0001 });
}
