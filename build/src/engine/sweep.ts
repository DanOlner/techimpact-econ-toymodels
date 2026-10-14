// Running scenarios: one solve, a sweep over any numeric scenario field by its path, or a grid.

import { buildBaseEconomy } from "./calibrate";
import { explain, type Explanation } from "./explain";
import { solve, type SolveOptions } from "./solve";
import { applyTechnology } from "./technology";
import type { Economy, Scenario, Solution } from "./types";
import { ledger, type Ledger } from "./welfare";

export interface Run {
  /** The base-year economy (before technology). */
  base: Economy;
  /** The economy with the technology applied. */
  economy: Economy;
  solution: Solution;
  ledger: Ledger[];
  explanation: Explanation;
}

/** Build the base year, apply the technology and solve. */
export function runScenario(scenario: Scenario, opts: SolveOptions = {}): Run {
  const base = buildBaseEconomy(scenario);
  const economy = applyTechnology(base, scenario.technology);
  const solution = solve(economy, opts);
  return { base, economy, solution, ledger: ledger(economy, solution), explanation: explain(economy, solution, scenario.technology) };
}

/** A copy of the scenario with the field at a dotted path (such as "technology.A") set to a value. */
export function withValue<T>(obj: T, path: string, value: unknown): T {
  const copy = structuredClone(obj) as Record<string, unknown>;
  const keys = path.split(".");
  let node: Record<string, unknown> = copy;
  keys.slice(0, -1).forEach((k) => {
    const next = node[k];
    if (next === null || typeof next !== "object") throw new Error(`No field ${k} in path ${path}`);
    node = next as Record<string, unknown>;
  });
  const last = keys[keys.length - 1] as string;
  if (!(last in node)) throw new Error(`No field ${last} in path ${path}`);
  node[last] = value;
  return copy as T;
}

/** Read the field at a dotted path. */
export function valueAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, k) => (node as Record<string, unknown>)?.[k], obj);
}

export interface SweepPoint {
  value: number;
  run?: Run;
  error?: string;
}

/**
 * Solve the scenario at each value of a field. Each value is solved on its own. Fields that change
 * the base year (such as a population size) rebuild it; technology levels leave it unchanged.
 */
export function sweep(scenario: Scenario, path: string, values: number[], opts: SolveOptions = {}): SweepPoint[] {
  return values.map((value) => {
    try {
      return { value, run: runScenario(withValue(scenario, path, value), opts) };
    } catch (e) {
      return { value, error: String(e) };
    }
  });
}

/** Evenly spaced values from a to b, inclusive. */
export function linspace(a: number, b: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

/** Log-spaced values from a to b, inclusive. */
export function logspace(a: number, b: number, n: number): number[] {
  return linspace(Math.log(a), Math.log(b), n).map(Math.exp);
}
