// Recording checks. Each check holds its expected and actual values, so Vitest and the report
// page read the same records.

import { runScenario, type Run } from "../engine/sweep";
import type { SolveOptions } from "../engine/solve";
import type { Accounting, Scenario } from "../engine/types";

export type Tolerance =
  /** |actual − expected| ≤ tol: used for percentage changes and shares (1 pp = 0.01). */
  | { kind: "abs"; tol: number }
  /** |actual − expected| ≤ tol · |expected|: used for levels such as prices and pay. */
  | { kind: "rel"; tol: number }
  /** actual ≤ tol: used for residuals and accounting gaps. */
  | { kind: "max"; tol: number }
  /** actual ≥ tol. */
  | { kind: "min"; tol: number };

export interface Check {
  test: string;
  label: string;
  expected: number | null;
  actual: number;
  tolerance: Tolerance | null;
  /** null for values that are reported, not tested. */
  pass: boolean | null;
  note?: string;
}

export class CheckContext {
  checks: Check[] = [];
  solves = 0;
  /** Worst accounting gaps across every solve made through this context. */
  worst: Accounting = { spendingVsIncome: 0, xBalance: 0, shareSums: 0, marketResidual: 0, supplyChain: 0 };
  unconverged = 0;

  run(scenario: Scenario, opts: SolveOptions = {}): Run {
    const r = runScenario(scenario, opts);
    this.solves++;
    if (!r.solution.solver.converged) this.unconverged++;
    const a = r.solution.accounting;
    for (const k of Object.keys(this.worst) as (keyof Accounting)[]) this.worst[k] = Math.max(this.worst[k], a[k]);
    return r;
  }

  check(test: string, label: string, actual: number, expected: number | null, tolerance: Tolerance, note?: string): Check {
    const pass = passes(actual, expected, tolerance);
    const c: Check = { test, label, expected, actual, tolerance, pass, note };
    this.checks.push(c);
    return c;
  }

  report(test: string, label: string, actual: number, note?: string): Check {
    const c: Check = { test, label, expected: null, actual, tolerance: null, pass: null, note };
    this.checks.push(c);
    return c;
  }
}

function passes(actual: number, expected: number | null, t: Tolerance): boolean {
  if (!Number.isFinite(actual)) return false;
  switch (t.kind) {
    case "abs":
      return Math.abs(actual - (expected as number)) <= t.tol;
    case "rel":
      return Math.abs(actual - (expected as number)) <= t.tol * Math.abs(expected as number);
    case "max":
      return actual <= t.tol;
    case "min":
      return actual >= t.tol;
  }
}

/** The spec's tolerance: about 1 percentage point, read as 0.01 on changes and shares and 1% on levels. */
export const PP = { kind: "abs", tol: 0.01 } as const;
export const LEVEL = { kind: "rel", tol: 0.01 } as const;
export const IDENTITY = { kind: "max", tol: 1e-9 } as const;
