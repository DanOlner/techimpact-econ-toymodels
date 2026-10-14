import { expect, it } from "vitest";
import { runPresetTests } from "../src/checks/preset-tests";

for (const c of runPresetTests().checks) {
  it(`${c.label}: expected ${c.expected}, got ${c.actual.toPrecision(6)}`, () => expect(c.pass).toBe(true));
}
