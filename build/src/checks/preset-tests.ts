// Test 13 (spec step 5, checked early): the presets' recipe base years against the spec's check
// values, to the spec's rounding. Plus the identities the recipe should satisfy.

import { presetBaseYear, type PresetSpec } from "../engine/presets";
import { CheckContext, IDENTITY } from "./context";
import business from "../../scenarios/preset-business-service.json";
import brand from "../../scenarios/preset-brand.json";

export const PRESETS: PresetSpec[] = [business as PresetSpec, brand as PresetSpec];

const CHECK_VALUES: Record<string, { M: number; D: number; X: number; incM: number; incD: number; Y: number }> = {
  "preset-business-service": { M: 0.133, D: 0.037, X: 0.83, incM: 0.111, incD: 0.031, Y: 1.064 },
  "preset-brand": { M: 0.107, D: 0.063, X: 0.83, incM: 0.09, incD: 0.052, Y: 1.064 },
};

/** Within half a unit of the spec's last decimal place: 0.05 pp for shares, 0.0005 for income. */
const ROUNDING = { kind: "abs", tol: 0.0005 + 1e-12 } as const;

export function runPresetTests(ctx = new CheckContext()): CheckContext {
  const T = "13 Preset base years";
  for (const spec of PRESETS) {
    const b = presetBaseYear(spec);
    const want = CHECK_VALUES[spec.id]!;
    const name = spec.title.replace("Preset: ", "");
    ctx.check(T, `${name}: headcount in M`, b.headcount.sectors[0]!, want.M, ROUNDING);
    ctx.check(T, `${name}: headcount in D`, b.headcount.sectors[1]!, want.D, ROUNDING);
    ctx.check(T, `${name}: headcount in X`, b.headcount.X, want.X, ROUNDING);
    ctx.check(T, `${name}: manufacturing incumbents, share of people`, b.population.incumbents[0]!, want.incM, ROUNDING);
    ctx.check(T, `${name}: design incumbents, share of people`, b.population.incumbents[1]!, want.incD, ROUNDING);
    ctx.check(T, `${name}: income per head`, b.incomePerHead, want.Y, ROUNDING);
    // Identities: prices through the chain (test 11's identity, at base-year prices), people add up,
    // and output equals final plus intermediate use.
    ctx.check(T, `${name}: prices from ω · B, largest gap from 1`, Math.max(...b.priceFromChain.map((p) => Math.abs(p - 1))), 0, IDENTITY);
    const people = b.headcount.sectors.reduce((a, c) => a + c, 0) + b.headcount.X;
    ctx.check(T, `${name}: headcount adds up to 1, gap`, Math.abs(people - 1), 0, IDENTITY);
    const balance = Math.max(...b.output.map((q, k) => Math.abs(q - b.finalDemand[k]! - b.intermediate[k]!.reduce((a, c) => a + c, 0)) / q));
    ctx.check(T, `${name}: output equals final plus intermediate use, relative gap`, balance, 0, IDENTITY);
    const income = b.payBill.reduce((a, c) => a + c, 0) + b.headcount.X;
    ctx.check(T, `${name}: total pay equals income, relative gap`, Math.abs(income - b.incomePerHead) / b.incomePerHead, 0, IDENTITY);
  }
  return ctx;
}
