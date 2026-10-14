// Print every spec check and the diagnostics. Run: npx tsx scripts/print-checks.ts
import { coldStarts, thetaStudy, THETA_COLUMNS } from "../src/checks/diagnostics";
import { runSpecTests } from "../src/checks/spec-tests";

const ctx = runSpecTests();
for (const c of ctx.checks) {
  const status = c.pass === null ? "  -  " : c.pass ? "PASS " : "FAIL ";
  console.log([status, c.test.padEnd(34), c.label.padEnd(100), String(c.expected ?? "").padStart(8), c.actual.toPrecision(5).padStart(12), c.note ?? ""].join(" "));
}
const failed = ctx.checks.filter((c) => c.pass === false).length;
console.log(`\n${ctx.checks.filter((c) => c.pass !== null).length} checks, ${failed} failed, ${ctx.solves} solves\n`);
console.log("θ study:", THETA_COLUMNS.map((c) => c.key).join(", "));
for (const r of thetaStudy()) console.log(String(r.theta).padStart(6), THETA_COLUMNS.map((c) => r.values[c.key]!.toFixed(4).padStart(9)).join(""));
console.log("\nCold starts:");
console.table(coldStarts());
