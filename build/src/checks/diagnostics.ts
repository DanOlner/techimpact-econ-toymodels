// Diagnostics for research: how the step-2 results depend on θ, and whether the solver
// converges from cold starts. Reported, not tested.

import { JOB } from "../engine/calibrate";
import { runScenario, withValue } from "../engine/sweep";
import { empChange, noPremiumAt, SCENARIOS } from "./spec-tests";

export interface ThetaRow {
  theta: number;
  values: Record<string, number>;
}

export const THETA_COLUMNS: { key: string; label: string; expected: number }[] = [
  { key: "t6a_emp", label: "Test 6, η = 0.4: change in sector employment", expected: -0.4 },
  { key: "t6c_price", label: "Test 6, η = 2: price", expected: 0.5 },
  { key: "t6c_emp", label: "Test 6, η = 2: change in sector employment", expected: 0.557 },
  { key: "t8_price", label: "Test 8: price", expected: 0.375 },
  { key: "t8_output", label: "Test 8: output relative to the base year", expected: 4.35 },
  { key: "t9_pay", label: "Test 9: incumbents' pay on the machines", expected: 1 },
];

export function thetaStudy(thetas = [100, 200, 500, 1000, 2000, 5000, 20000]): ThetaRow[] {
  return thetas.map((theta) => {
    const a = runScenario(noPremiumAt(0.4, theta));
    const c = runScenario(noPremiumAt(2, theta));
    const h = runScenario(withValue(SCENARIOS.handloom, "theta", theta));
    const d = runScenario(withValue(withValue(SCENARIOS.handloom, "theta", theta), "setup.types.0.mindsMachines", true));
    return {
      theta,
      values: {
        t6a_emp: empChange(a),
        t6c_price: c.solution.sectorPrice[0]!,
        t6c_emp: empChange(c),
        t8_price: h.solution.sectorPrice[0]!,
        t8_output: h.solution.sectorOutput[0]! / h.base.base.finalDemand[0]!,
        t9_pay: d.solution.types[0]!.pay[JOB.machine]!,
      },
    };
  });
}

export interface ColdStartRow {
  scenario: string;
  starts: number;
  converged: number;
  /** Largest relative spread of the solved price across starts. */
  priceSpread: number;
  maxIterations: number;
}

/** Solve each test scenario from piece rates spread over six orders of magnitude. */
export function coldStarts(starts = [1e-3, 0.01, 0.1, 0.5, 2, 10, 100, 1000]): ColdStartRow[] {
  const cases = [
    ["Test 4, young, A = 5", withValue(SCENARIOS.step1, "technology.A", 5)],
    ["Test 6, η = 2", noPremiumAt(2)],
    ["Test 7, g = 3", withValue(SCENARIOS.premium, "technology.g", 3)],
    ["Test 8", SCENARIOS.handloom],
    ["Four types, θ = 5", SCENARIOS.fourTypes],
  ] as const;
  return cases.map(([label, sc]) => {
    const runs = starts.map((s) => runScenario(sc, { start: [s] }).solution);
    const prices = runs.map((r) => r.sectorPrice[0]!);
    const mid = prices[0]!;
    return {
      scenario: label,
      starts: starts.length,
      converged: runs.filter((r) => r.solver.converged).length,
      priceSpread: Math.max(...prices.map((p) => Math.abs(p - mid) / mid)),
      maxIterations: Math.max(...runs.map((r) => r.solver.iterations)),
    };
  });
}
