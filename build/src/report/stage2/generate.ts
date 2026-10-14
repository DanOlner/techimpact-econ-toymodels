// Generate the stage 2 report's data at build time (about 400 solves, too slow for page load).
// Run: npx tsx src/report/stage2/generate.ts  →  src/report/stage2/data.json
// scripts/build-site.mjs runs it before building stage 2.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CheckContext } from "../../checks/context";
import { knownFinding } from "../../checks/known-findings";
import { runPresetTests, PRESETS } from "../../checks/preset-tests";
import { runSpecTests } from "../../checks/spec-tests";
import { firmsOf, presetScenario, runStage2Tests } from "../../checks/stage2-tests";
import { presetBaseYear, type PresetSpec } from "../../engine/presets";
import { linspace, runScenario } from "../../engine/sweep";
import type { Technology } from "../../engine/types";

const t0 = Date.now();
const r6 = (v: number) => (Number.isFinite(v) ? Number(v.toPrecision(6)) : null);

// Checks: stage 1's (tests 1–10, 13 recipe) and stage 2's (11–17).
const ctx: CheckContext = runSpecTests();
runPresetTests(ctx);
const s2 = runStage2Tests(new CheckContext());
const checks = [...ctx.checks, ...s2.checks].map((c) => ({
  test: c.test,
  label: c.label,
  expected: c.expected === null ? null : r6(c.expected),
  actual: r6(c.actual),
  tolerance: c.tolerance,
  pass: c.pass,
  known: c.pass === false && !!knownFinding(c.test, c.label) ? knownFinding(c.test, c.label)!.reason : null,
  note: c.note ?? null,
}));

// Technology sweeps on both presets, two firms per sector.
interface Row {
  level: number;
  price: (number | null)[];
  output: (number | null)[];
  empChange: (number | null)[];
  firmShare: (number | null)[];
  types: { id: string; label: string; ev: number | null; pay: number | null; price: number | null; inHome: number | null }[];
  converged: boolean;
}
interface Sweep {
  id: string;
  preset: string;
  presetTitle: string;
  theta: number;
  sigmaW: number;
  levelLabel: string;
  rows: Row[];
}

function sweepPreset(id: string, preset: PresetSpec, theta: number, levels: number[], tech: (v: number) => Technology, levelLabel: string, sigmaW = 4): Sweep {
  const base = runScenario(presetScenario(preset, { theta, sigmaW }));
  const rows = levels.map((v) => {
    const r = runScenario(presetScenario(preset, { theta, sigmaW, technology: tech(v) }));
    const s = r.solution;
    return {
      level: r6(v)!,
      price: s.sectorPrice.map(r6),
      output: s.sectorOutput.map((q, k) => r6(q / base.solution.sectorOutput[k]!)),
      empChange: s.sectorEmployment.map((e, k) => r6(e / base.solution.sectorEmployment[k]! - 1)),
      firmShare: s.firmShare.map(r6),
      types: r.economy.types.map((t, i) => {
        // Share of the type working in firms (not X).
        const inFirms = s.types[i]!.shares.reduce((acc, sh, j) => (r.economy.jobs[j]!.firm >= 0 ? acc + sh : acc), 0);
        const y0 = r.base.base.y[i]!;
        return { id: t.id, label: t.label, ev: r6(r.ledger[i]!.ev / y0), pay: r6(r.ledger[i]!.payPart / y0), price: r6(r.ledger[i]!.pricePart / y0), inHome: r6(inFirms) };
      }),
      converged: s.solver.converged,
    };
  });
  return { id, preset: preset.id, presetTitle: preset.title.replace("Preset: ", ""), theta, sigmaW, levelLabel, rows };
}

const sweeps: Sweep[] = [];
for (const preset of PRESETS) {
  for (const theta of [200, 5]) {
    sweeps.push(sweepPreset("ai-design", preset, theta, linspace(0, 3, 25), (g) => ({ kind: "augment", adopters: firmsOf("D", 2), g }), "Gain g for matched workers in design"));
    sweeps.push(sweepPreset("automate-m", preset, theta, linspace(1, 8, 29), (Am) => ({ kind: "automate", adopters: firmsOf("M", 2), Am }), "Machine output per minder A_m in manufacturing"));
  }
  for (const sigmaW of [2, 4, 10]) {
    sweeps.push(sweepPreset("one-firm", preset, 200, linspace(1, 4, 25), (A) => ({ kind: "productivity", adopters: ["M1"], A }), "Productivity A in manufacturing firm M1 only", sigmaW));
  }
}

// Design upstream: response of design to a small productivity gain in design, against the
// Hicks–Marshall approximation with fixed input coefficients.
function hicksMarshall(preset: PresetSpec, theta: number) {
  const solve = (A: number) => runScenario(presetScenario(preset, { theta, technology: { kind: "productivity", adopters: firmsOf("D", 2), A } }));
  const a = solve(1);
  const b = solve(1.01);
  const d = (f: (r: typeof a) => number) => (Math.log(f(b)) - Math.log(f(a))) / Math.log(1.01);
  const s0 = a.solution;
  const by = presetBaseYear(preset);
  const finalShare = s0.finalDemand[1]! / s0.sectorOutput[1]!;
  const costShare = (by.coef[1]![0]! * s0.sectorPrice[1]!) / s0.sectorPrice[0]!;
  const N = a.economy.types.map((t) => t.N);
  const avgEps = (k: number) => s0.types.reduce((acc, o, i) => acc + N[i]! * o.demand[k]! * o.elasticity[k]!, 0) / s0.types.reduce((acc, o, i) => acc + N[i]! * o.demand[k]!, 0);
  const epsM = avgEps(0);
  const epsD = avgEps(1);
  return {
    preset: preset.title.replace("Preset: ", ""),
    theta,
    designOutput: r6(d((r) => r.solution.sectorOutput[1]!)),
    designEmployment: r6(d((r) => r.solution.sectorEmployment[1]!)),
    designPrice: r6(d((r) => r.solution.sectorPrice[1]!)),
    finalShare: r6(finalShare),
    costShare: r6(costShare),
    epsM: r6(epsM),
    epsD: r6(epsD),
    // Pass-through: how far design's price falls per 1% productivity gain. Below 1 because part of
    // design's price is bought-in manufacturing.
    passThrough: r6(-d((r) => r.solution.sectorPrice[1]!)),
    approxOutput: r6((finalShare * epsD + (1 - finalShare) * costShare * epsM) * -d((r) => r.solution.sectorPrice[1]!)),
    upstreamOnly: r6(costShare * epsM * -d((r) => r.solution.sectorPrice[1]!)),
  };
}
const hm = PRESETS.flatMap((p) => [hicksMarshall(p, 200), hicksMarshall(p, 5)]);

const data = {
  generated: new Date().toISOString(),
  seconds: 0,
  solves: ctx.solves + s2.solves + sweeps.reduce((a, s) => a + s.rows.length + 1, 0) + hm.length * 2,
  checks,
  sweeps,
  hm,
  presets: PRESETS.map((p) => presetBaseYear(p)),
};
data.seconds = (Date.now() - t0) / 1000;
writeFileSync(join(import.meta.dirname, "data.json"), JSON.stringify(data));
console.log(`stage 2 data: ${data.solves} solves, ${data.seconds.toFixed(1)} s, ${checks.length} checks, ${checks.filter((c) => c.pass === false && !c.known).length} unexpected failures`);
