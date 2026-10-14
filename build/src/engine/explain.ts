// Explanatory outputs: who is at the margin of each firm, and which regime a solution is in.
// These feed reports, regime maps and (later) plain-language explanations.

import type { Economy, Solution, Technology } from "./types";

export interface Presence {
  type: string;
  job: string;
  /** Headcount of the type in the job. */
  employment: number;
  /** Share of the type's people in the job. */
  share: number;
  /** Pay in the job relative to the type's pay in X. */
  payToX: number;
}

export interface FirmExplanation {
  firm: string;
  presence: Presence[];
  /**
   * Types split between the firm and other jobs (between 0.1% and 99.9% of the type works in the
   * firm). With large θ, their pay in the firm is pinned near their outside pay, so they set the price.
   */
  marginal: string[];
}

export type Regime = "not augmenting" | "scarce" | "in between" | "plentiful";

export interface Explanation {
  firms: FirmExplanation[];
  /**
   * For augmenting technology, the regime of the spec's three-regime table, read from who works in
   * the adopting firm:
   * - scarce: unmatched types still make at least 1% of the firm's units, so they set the price
   * - in between: matched types make (nearly) all units and earn more than 5% above their X pay
   * - plentiful: matched types make the units and earn within 5% of their X pay
   * The 1% and 5% thresholds are reporting conventions, not model parameters.
   */
  regime: Regime;
}

export function explain(econ: Economy, sol: Solution, tech: Technology): Explanation {
  const xJob = econ.jobs.findIndex((j) => j.firm < 0);
  const firms = econ.firms.map((firm, f) => {
    const presence: Presence[] = [];
    const typeShareInFirm = econ.types.map(() => 0);
    econ.types.forEach((t, s) => {
      econ.jobs.forEach((job, j) => {
        if (job.firm !== f) return;
        const share = sol.types[s]!.shares[j] as number;
        typeShareInFirm[s] = (typeShareInFirm[s] as number) + share;
        if (share < 1e-9) return;
        const payX = sol.types[s]!.pay[xJob] as number;
        presence.push({ type: t.id, job: job.id, employment: t.N * share, share, payToX: (sol.types[s]!.pay[j] as number) / payX });
      });
    });
    const marginal = econ.types.filter((_, s) => typeShareInFirm[s]! > 1e-3 && typeShareInFirm[s]! < 1 - 1e-3).map((t) => t.id);
    return { firm: firm.id, presence, marginal };
  });
  return { firms, regime: tech.kind === "augment" ? augmentRegime(econ, sol) : "not augmenting" };
}

function augmentRegime(econ: Economy, sol: Solution): Regime {
  // Units made in firm 0 by matched and unmatched types.
  let unitsMatched = 0;
  let unitsUnmatched = 0;
  let matchedPremium = 0;
  let matchedHeads = 0;
  const xJob = econ.jobs.findIndex((j) => j.firm < 0);
  econ.types.forEach((t, s) => {
    econ.jobs.forEach((job, j) => {
      if (job.firm !== 0) return;
      const heads = sol.employment[s]![j]!;
      if (!(heads > 0)) return;
      const units = heads * (t.output[j] as number);
      if (t.matched) {
        unitsMatched += units;
        matchedHeads += heads;
        matchedPremium += heads * ((sol.types[s]!.pay[j] as number) / (sol.types[s]!.pay[xJob] as number));
      } else unitsUnmatched += units;
    });
  });
  if (unitsUnmatched >= 0.01 * (unitsMatched + unitsUnmatched)) return "scarce";
  return matchedHeads > 0 && matchedPremium / matchedHeads > 1.05 ? "in between" : "plentiful";
}
