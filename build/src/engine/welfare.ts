// Real income and the gains ledger. Spec "Real income and the gains ledger".

import { indirectUtility, type Curve } from "./demand";
import type { Economy, Solution } from "./types";

export interface Ledger {
  id: string;
  /** Equivalent variation: the change in income that, at base-year prices, gives current utility. */
  ev: number;
  /** Change in pay (income). */
  payPart: number;
  /** ev − payPart: the gain or loss as a consumer. */
  pricePart: number;
}

export function ledger(econ: Economy, sol: Solution): Ledger[] {
  const curves: Curve[] = econ.sectors.map((s) => ({ gamma: s.gamma, mu: s.mu, sigma: s.sigma }));
  const P0 = econ.base.sectorPrice;
  return econ.types.map((t, s) => {
    const o = sol.types[s]!;
    const y0 = econ.base.y[s] as number;
    const target = o.utility;
    const V = (y: number) => indirectUtility(curves, P0, y);
    let lo = 0;
    let hi = Math.max(o.y, y0, 1e-12);
    while (V(hi) < target) hi *= 2;
    for (let i = 0; i < 200; i++) {
      const mid = 0.5 * (lo + hi);
      if (mid <= lo || mid >= hi) break;
      if (V(mid) < target) lo = mid;
      else hi = mid;
    }
    const ev = 0.5 * (lo + hi) - y0;
    const payPart = o.y - y0;
    return { id: t.id, ev, payPart, pricePart: ev - payPart };
  });
}
