// Shared base-year steps: calibrating demand curves to spending shares, and recording the base
// year once the economy is built.

import { curveMu, curveShape, household, utility, type Curve } from "./demand";
import { evaluate } from "./solve";
import { payByJob } from "./labour";
import type { CurveSpec, Economy } from "./types";

/**
 * Demand curves for several sectors and types. Each curve's shape comes from its two numbers and
 * its location from the population-average x₀ at base-year prices of 1. Then γ_k is iterated
 * until base-year spending on each sector is its target share of income (rescaling γ moves x).
 */
export function calibrateCurves(specs: CurveSpec[], shares: number[], N: number[], y: number[]): Curve[] {
  const totalN = N.reduce((a, b) => a + b, 0);
  const Y = N.reduce((acc, n, s) => acc + n * (y[s] as number), 0);
  const xbar = (Y * (1 - shares.reduce((a, b) => a + b, 0))) / totalN;
  const prices = specs.map(() => 1);
  const curves: Curve[] = specs.map((spec, k) => ({
    gamma: ((shares[k] as number) * Y) / totalN / spec.saturation,
    mu: curveMu(spec, 1 / xbar),
    sigma: curveShape(spec).sigma,
  }));
  for (let iter = 0; iter < 500; iter++) {
    const spend = specs.map(() => 0);
    N.forEach((n, s) => {
      household(curves, prices, y[s] as number).demand.forEach((d, k) => (spend[k] = (spend[k] as number) + n * d));
    });
    let worst = 0;
    curves.forEach((c, k) => {
      const ratio = ((shares[k] as number) * Y) / (spend[k] as number);
      c.gamma *= ratio;
      worst = Math.max(worst, Math.abs(ratio - 1));
    });
    if (worst < 1e-15) break;
  }
  return curves;
}

/** Evaluate the economy at its base-year piece rates, check that it clears, and record the base year. */
export function recordBase(econ: Economy, omega0: number[]): Economy {
  econ.types.forEach((t) => {
    const pay = payByJob({ ...t, logAttr: t.logAttr.map(() => 0) }, econ.jobs, omega0);
    t.baseLogPay = econ.jobs.map((job, j) => {
      if (job.technique !== "machine") return Math.log(pay[j] as number);
      const old = econ.jobs.findIndex((o) => o.firm === job.firm && o.technique === "old");
      return Math.log(pay[old] as number);
    });
  });
  const sol = evaluate(econ, omega0);
  if (sol.accounting.marketResidual > 1e-10) throw new Error(`Base year doesn't clear: residual ${sol.accounting.marketResidual}`);
  const curves: Curve[] = econ.sectors.map((s) => ({ gamma: s.gamma, mu: s.mu, sigma: s.sigma }));
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
