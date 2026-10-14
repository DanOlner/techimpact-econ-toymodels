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

  const supplyChain = Math.max(
    ...sectorOutput.map((q, k) => {
      const use = (finalDemand[k] as number) + sectorOutput.reduce((acc, ql, l) => acc + (econ.coef[k]?.[l] ?? 0) * ql, 0);
      return Math.abs(q - use) / Math.max(q, 1e-300);
    }),
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
    accounting: { spendingVsIncome, xBalance, shareSums, marketResidual, supplyChain },
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
 * Several firms: Newton's method on ln ω (newtonSolve).
 */
export function solve(econ: Economy, opts: SolveOptions = {}): Solution {
  const nF = econ.firms.length;
  if (nF > 1) return newtonSolve(econ, opts);
  const start = opts.start ?? econ.base.omega.slice();
  const tol = opts.tol ?? 1e-13;

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

/** Log excess demand for every firm: ln(required) − ln(supplied). */
function logExcessAll(econ: Economy, t: number[]): number[] {
  const sol = evaluate(econ, t.map(Math.exp));
  return sol.firmRequired.map((r, i) => Math.log(r) - Math.log(sol.firmSupplied[i] as number));
}

const maxAbs = (v: number[]) => Math.max(...v.map(Math.abs));

/** Solve A x = b by Gaussian elimination with partial pivoting. */
function linearSolve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const m = A.map((row, i) => [...row, b[i] as number]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r]![c]!) > Math.abs(m[p]![c]!)) p = r;
    [m[c], m[p]] = [m[p]!, m[c]!];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = m[r]![c]! / m[c]![c]!;
      for (let j = c; j <= n; j++) m[r]![j] = m[r]![j]! - f * m[c]![j]!;
    }
  }
  return m.map((row, i) => row[n]! / row[i]!);
}

/** The economy at a different θ, with attraction terms re-set so the base year is still an equilibrium. */
export function atTheta(econ: Economy, theta: number): Economy {
  if (theta === econ.theta) return econ;
  const shift = econ.theta - theta;
  return {
    ...econ,
    theta,
    switches: { ...econ.switches, strictSorting: false },
    types: econ.types.map((t) => ({
      ...t,
      logAttr: t.logAttr.map((a, j) => {
        const lp = t.baseLogPay?.[j];
        return Number.isFinite(a) && lp !== undefined && Number.isFinite(lp) ? a + shift * lp : a;
      }),
    })),
  };
}

interface NewtonResult {
  t: number[];
  converged: boolean;
  iterations: number;
}

/**
 * Newton's method on t = ln ω, with a forward-difference Jacobian and a backtracking line search
 * on the largest log excess demand. Stops when every firm's log excess demand is below tol, or when
 * a step makes no progress.
 */
function newton(econ: Economy, t0: number[], tol: number, farThreshold = 0.3, maxIter = 300): NewtonResult {
  const n = t0.length;
  let t = t0.slice();
  let F = logExcessAll(econ, t);
  let norm = maxAbs(F);
  let iterations = 0;
  let fallback = 0;
  const stepSize = t0.map(() => 0.25);
  const lastSign = t0.map(() => 0);
  let converged = norm < tol;
  for (; iterations < maxIter && !converged; iterations++) {
    const h = 1e-7;
    const J = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    for (let j = 0; j < n && norm <= farThreshold; j++) {
      const tj = t.slice();
      tj[j] = (tj[j] as number) + h;
      const Fj = logExcessAll(econ, tj);
      for (let i = 0; i < n; i++) J[i]![j] = ((Fj[i] as number) - (F[i] as number)) / h;
    }
    let step = linearSolve(J, F.map((v) => -v));
    let next = t;
    let Fn = F;
    let progress = false;
    // Far from the solution (any market off by more than farThreshold in logs), don't trust Newton:
    // there the surface can slope the wrong way and Newton can creep off towards infinite piece rates.
    if (norm <= farThreshold && step.every((v) => Number.isFinite(v))) {
      // Cap the step so a bad Jacobian far from the solution can't throw ω out by many orders.
      const big = maxAbs(step);
      if (big > 1) step = step.map((v) => v / big);
      let lambda = 1;
      next = t.map((v, i) => v + (step[i] as number));
      Fn = logExcessAll(econ, next);
      while (!(maxAbs(Fn) < (1 - 1e-4 * lambda) * norm) && lambda > 1e-6) {
        lambda /= 2;
        next = t.map((v, i) => v + lambda * (step[i] as number));
        Fn = logExcessAll(econ, next);
      }
      progress = maxAbs(Fn) < norm;
    }
    if (!progress) {
      // Far from the solution the excess-demand surface can be flat, or even slope the wrong way,
      // because incomes rise with piece rates and demand partly keeps up. Then move each piece rate
      // the way its own market points (up where there's excess demand), by at most half a log
      // unit, and let Newton take over again.
      // Step sizes adapt per piece rate: they grow while its market keeps pointing the same way and
      // halve when it flips, which homes in like bisection.
      if (++fallback > 250) break;
      for (let i = 0; i < n; i++) {
        const sgn = Math.sign(F[i] as number);
        if (lastSign[i] !== 0 && sgn !== lastSign[i]) stepSize[i] = (stepSize[i] as number) * 0.5;
        else stepSize[i] = Math.min(1, (stepSize[i] as number) * 1.2);
        lastSign[i] = sgn;
      }
      next = t.map((v, i) => v + Math.sign(F[i] as number) * (stepSize[i] as number));
      Fn = logExcessAll(econ, next);
      if (Fn.some((v) => !Number.isFinite(v))) break;
    }
    t = next;
    F = Fn;
    norm = maxAbs(F);
    converged = norm < tol;
  }
  return { t, converged, iterations };
}

/**
 * Several firms. Newton from the start (the base year's piece rates unless told otherwise). If
 * that fails, which happens far from the solution at large θ where the logit saturates and the
 * Jacobian is nearly flat, solve by continuation in θ: from θ = 2, where the landscape is smooth,
 * up to the economy's θ in geometric steps, each starting from the last solution.
 */
export function newtonSolve(econ: Economy, opts: SolveOptions = {}): Solution {
  const start = opts.start ?? econ.base.omega.slice();
  const tol = opts.tol ?? 1e-12;
  const theta = econ.switches.strictSorting ? STRICT_THETA : econ.theta;
  const target = econ.switches.strictSorting ? atTheta({ ...econ, switches: { ...econ.switches, strictSorting: false } }, theta) : econ;
  const first = newton(target, start.map(Math.log), tol);
  if (first.converged) return evaluate(econ, first.t.map(Math.exp), { method: "Newton on ln ω", start, iterations: first.iterations, converged: true });

  const thetaLow = Math.min(2, theta);
  const steps = Math.max(1, Math.ceil(Math.log(theta / thetaLow) / Math.log(1.5)));
  let t = start.map(Math.log);
  let iterations = first.iterations;
  let converged = false;
  for (let k = 0; k <= steps; k++) {
    const th = thetaLow * (theta / thetaLow) ** (k / steps);
    // The first step may start far away; later ones start from a nearby solution, where Newton is
    // trusted however large the residual (the next θ can make the market look steep).
    const res = newton(atTheta(target, th), t, k === steps ? tol : 1e-9, k === 0 ? 0.3 : Infinity);
    iterations += res.iterations;
    t = res.t;
    converged = res.converged;
    if (!converged) break;
  }
  return evaluate(econ, t.map(Math.exp), { method: `Newton on ln ω, by continuation in θ (${steps + 1} steps)`, start, iterations, converged });
}
