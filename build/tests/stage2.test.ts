import { describe, expect, it } from "vitest";
import { runStage2Tests } from "../src/checks/stage2-tests";

// Stage 2: spec tests 11 to 13 and the build's own checks 14 to 17.
const ctx = runStage2Tests();
for (const group of [...new Set(ctx.checks.map((c) => c.test))]) {
  describe(group, () => {
    for (const c of ctx.checks.filter((k) => k.test === group && k.pass !== null)) {
      it(`${c.label}: expected ${c.expected ?? "-"}, got ${c.actual.toPrecision(6)}`, () => expect(c.pass).toBe(true));
    }
  });
}
