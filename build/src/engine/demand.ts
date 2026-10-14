// Households: Bessen's lognormal distribution of uses for each sector, plus ln x for X.
// Spec "Households" and "Setting a demand curve from two numbers".

import { normCdf, normInv, normPdf } from "./normal";
import type { CurveSpec } from "./types";

export interface Curve {
  gamma: number;
  mu: number;
  sigma: number;
}

/** σ and z₀ implied by a curve's two numbers. */
export function curveShape(spec: CurveSpec): { sigma: number; z0: number } {
  const z0 = normInv(spec.saturation);
  const sigma = normPdf(z0) / (spec.elasticity * spec.saturation);
  return { sigma, z0 };
}

/** μ for a curve, given the base-year cut-off v̂₀ = P₀ / x₀. */
export function curveMu(spec: CurveSpec, cutoff0: number): number {
  const { sigma, z0 } = curveShape(spec);
  return sigma * z0 + Math.log(cutoff0);
}

/** Demand per head in physical units at cut-off v̂ = P / x. */
export function demandAt(c: Curve, cutoff: number): number {
  return c.gamma * normCdf((c.mu - Math.log(cutoff)) / c.sigma);
}

/** Price elasticity of demand at cut-off v̂, holding x fixed: φ(z) / (σ Φ(z)). */
export function elasticityAt(c: Curve, cutoff: number): number {
  const z = (c.mu - Math.log(cutoff)) / c.sigma;
  return normPdf(z) / (c.sigma * normCdf(z));
}

/** Value of the uses bought: the lognormal partial expectation above the cut-off. */
export function usesValue(c: Curve, cutoff: number): number {
  const s2 = c.sigma * c.sigma;
  return c.gamma * Math.exp(c.mu + s2 / 2) * normCdf((c.mu + s2 - Math.log(cutoff)) / c.sigma);
}

export interface Household {
  x: number;
  demand: number[];
}

/**
 * Solve x = y − Σ_k P_k d_k(P_k / x) by bisection on (0, y]. The right-hand side falls as x rises,
 * so there is exactly one solution. If xFixed is given, demand uses it in the cut-off instead
 * (Bessen's setting) and x is whatever income is left.
 */
export function household(curves: Curve[], prices: number[], y: number, xFixed?: number): Household {
  const demandFor = (x: number) => curves.map((c, k) => demandAt(c, (prices[k] as number) / x));
  const spend = (d: number[]) => d.reduce((s, dk, k) => s + (prices[k] as number) * dk, 0);
  if (xFixed !== undefined) {
    const demand = demandFor(xFixed);
    return { x: y - spend(demand), demand };
  }
  if (!(y > 0)) return { x: 0, demand: curves.map(() => 0) };
  let lo = 0;
  let hi = y;
  for (let i = 0; i < 200; i++) {
    const mid = 0.5 * (lo + hi);
    if (mid <= lo || mid >= hi) break;
    const gap = mid + spend(demandFor(mid)) - y;
    if (gap > 0) hi = mid;
    else lo = mid;
  }
  // Take x from the budget at the final cut-off, so spending equals income to rounding.
  const demand = demandFor(hi);
  return { x: y - spend(demand), demand };
}

/** Utility per head: value of uses bought plus ln x. */
export function utility(curves: Curve[], prices: number[], x: number): number {
  let u = Math.log(x);
  curves.forEach((c, k) => {
    u += usesValue(c, (prices[k] as number) / x);
  });
  return u;
}

/** Indirect utility: the utility a household with income y reaches at the given prices. */
export function indirectUtility(curves: Curve[], prices: number[], y: number): number {
  const h = household(curves, prices, y);
  return utility(curves, prices, h.x);
}
