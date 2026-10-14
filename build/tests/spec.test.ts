import { describe, expect, it } from "vitest";
import { KNOWN_FINDINGS, knownFinding } from "../src/checks/known-findings";
import { runSpecTests } from "../src/checks/spec-tests";

// The spec's tests, from the same records the report page shows. Expected values are research's
// derivations: a failure is a finding to report, not a reason to tune parameters. Known findings
// (src/checks/known-findings.ts) must still fail with the value recorded there.
const ctx = runSpecTests();
const groups = [...new Set(ctx.checks.filter((c) => c.pass !== null).map((c) => c.test))];

for (const group of groups) {
  describe(group, () => {
    for (const c of ctx.checks.filter((k) => k.test === group && k.pass !== null)) {
      const known = knownFinding(c.test, c.label);
      if (known) {
        it(`KNOWN FINDING ${c.label}: expected ${c.expected}, still fails with ${known.actual}`, () => {
          expect(c.pass).toBe(false);
          expect(Math.abs(c.actual - known.actual)).toBeLessThanOrEqual(1e-4 * Math.max(1, Math.abs(known.actual)));
        });
      } else {
        it(`${c.label}: expected ${c.expected ?? "-"}, got ${c.actual.toPrecision(6)}`, () => {
          expect(c.pass).toBe(true);
        });
      }
    }
  });
}

it("every known finding matches a check", () => {
  for (const k of KNOWN_FINDINGS) expect(ctx.checks.some((c) => c.test === k.test && c.label === k.label)).toBe(true);
});
