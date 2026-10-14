// Stage 2 checks: spec steps 3 to 5 (two sectors, the supply chain, two firms per sector, six worker
// types). Tests 11 to 13 are the spec's; 14 to 17 are the build's own checks of the new machinery.

import { presetBaseYear, type PresetSpec } from "../engine/presets";
import { newtonSolve } from "../engine/solve";
import { applyTechnology } from "../engine/technology";
import { buildBaseEconomy } from "../engine/calibrate";
import { runScenario, type Run } from "../engine/sweep";
import type { Scenario, Technology } from "../engine/types";
import { CheckContext, IDENTITY } from "./context";
import { PRESETS } from "./preset-tests";
import { SCENARIOS, step1At, noPremiumAt } from "./spec-tests";
import { withValue } from "../engine/sweep";

export function presetScenario(preset: PresetSpec, opts: { firms?: number; theta?: number; sigmaW?: number; technology?: Technology; minders?: "matched-general" | "matched" | "all" } = {}): Scenario {
  return {
    id: `${preset.id}-${opts.firms ?? 2}firms`,
    title: preset.title,
    theta: opts.theta ?? 200,
    sigmaW: opts.sigmaW ?? 4,
    setup: { kind: "preset", preset, firmsPerSector: opts.firms ?? 2, machineMinders: opts.minders },
    technology: opts.technology ?? { kind: "none" },
  };
}

/** Firm ids of a sector, for 1 or 2 firms per sector. */
export const firmsOf = (sector: string, firms: number) => (firms === 1 ? [sector] : Array.from({ length: firms }, (_, i) => `${sector}${i + 1}`));

/** The technologies used across stage 2's checks and reports. */
export function stage2Technologies(firms: number): [string, Technology][] {
  return [
    ["AI augments design (g = 1)", { kind: "augment", adopters: firmsOf("D", firms), g: 1 }],
    ["Automation in manufacturing (A_m = 3)", { kind: "automate", adopters: firmsOf("M", firms), Am: 3 }],
    ["Productivity × 2 in one manufacturing firm", { kind: "productivity", adopters: [firmsOf("M", firms)[0]!], A: 2 }],
  ];
}

const name = (p: PresetSpec) => p.title.replace("Preset: ", "");
const maxGap = (a: number[], b: number[]) => Math.max(...a.map((v, i) => Math.abs(v - (b[i] as number))));

export function runStage2Tests(ctx = new CheckContext()): CheckContext {
  const before = { solves: ctx.solves };
  test11(ctx);
  test12(ctx);
  test13(ctx);
  test14(ctx);
  test15(ctx);
  test16(ctx);
  test17(ctx, ctx.solves - before.solves);
  return ctx;
}

function test11(ctx: CheckContext) {
  const T = "11 Prices through the chain";
  for (const preset of PRESETS) {
    for (const theta of [5, 200]) {
      let worst = 0;
      const B = presetBaseYear(preset).leontief;
      for (const [, tech] of [["none", { kind: "none" } as Technology] as const, ...stage2Technologies(1)]) {
        const s = ctx.run(presetScenario(preset, { firms: 1, theta, technology: tech })).solution;
        const chain = s.firmPrice.map((_, j) => s.omega.reduce((acc, w, i) => acc + w * B[i]![j]!, 0));
        worst = Math.max(worst, maxGap(s.firmPrice, chain));
      }
      ctx.check(T, `${name(preset)}, θ = ${theta}: largest gap between prices and ω · B, over 4 technologies`, worst, 0, IDENTITY, "one firm per sector");
    }
  }
}

function test12(ctx: CheckContext) {
  const T = "12 Identical firms split 50:50";
  for (const preset of PRESETS) {
    for (const theta of [5, 200]) {
      let worstShare = 0;
      let worstAgg = 0;
      const symmetric: [Technology, Technology][] = [
        [{ kind: "none" }, { kind: "none" }],
        [stage2Technologies(2)[0]![1], stage2Technologies(1)[0]![1]],
        [stage2Technologies(2)[1]![1], stage2Technologies(1)[1]![1]],
      ];
      for (const [two, one] of symmetric) {
        const a = ctx.run(presetScenario(preset, { firms: 2, theta, technology: two })).solution;
        const b = ctx.run(presetScenario(preset, { firms: 1, theta, technology: one })).solution;
        worstShare = Math.max(worstShare, ...a.firmShare.map((s) => Math.abs(s - 0.5)));
        // Aggregation: two identical firms should give the same economy as one.
        worstAgg = Math.max(worstAgg, maxGap(a.sectorPrice, b.sectorPrice), maxGap(a.sectorEmployment, b.sectorEmployment), maxGap(a.types.map((o) => o.y), b.types.map((o) => o.y)));
      }
      ctx.check(T, `${name(preset)}, θ = ${theta}: largest gap of a firm's share from one half, with no technology and with each sector-wide technology`, worstShare, 0, IDENTITY);
      ctx.check(T, `${name(preset)}, θ = ${theta}: two identical firms against one firm, largest gap in prices, employment and incomes`, worstAgg, 0, IDENTITY, "aggregation check (the build's own)");
    }
  }
}

function test13(ctx: CheckContext) {
  const T = "13 Preset base years, solved";
  const want: Record<string, number[]> = { "preset-business-service": [0.133, 0.037, 0.83], "preset-brand": [0.107, 0.063, 0.83] };
  for (const preset of PRESETS) {
    for (const firms of [1, 2]) {
      for (const theta of [5, 200]) {
        let worst = 0;
        let r: Run | undefined;
        for (const f of [1.2, 0.8]) {
          const sc = presetScenario(preset, { firms, theta });
          const base = buildBaseEconomy(sc);
          r = ctx.run(sc, { start: base.base.omega.map((w) => w * f) });
          worst = Math.max(worst, maxGap(r.solution.omega, base.base.omega));
          r.solution.types.forEach((o, s) => (worst = Math.max(worst, maxGap(o.shares, base.base.shares[s]!))));
        }
        ctx.check(T, `${name(preset)}, ${firms} firm${firms > 1 ? "s" : ""} per sector, θ = ${theta}: solves back from 20% above and below, largest gap in piece rates or shares`, worst, 0, IDENTITY);
        if (firms === 2 && theta === 200) {
          const s = r!.solution;
          const heads = [...s.sectorEmployment, 1 - s.sectorEmployment.reduce((a, b) => a + b, 0)];
          ["M", "D", "X"].forEach((k, i) => ctx.check(T, `${name(preset)}: solved headcount in ${k}`, heads[i]!, want[preset.id]![i]!, { kind: "abs", tol: 0.0005 + 1e-12 }, "spec's check value, to its rounding"));
        }
      }
    }
  }
}

function test14(ctx: CheckContext) {
  const T = "14 Six types: no technology, no difference";
  for (const preset of PRESETS) {
    for (const theta of [5, 200]) {
      const r = ctx.run(presetScenario(preset, { theta }));
      let worst = 0;
      const ids = r.economy.types.map((t) => t.id);
      ids.filter((id) => id.endsWith("-matched")).forEach((m) => {
        const a = ids.indexOf(m);
        const b = ids.indexOf(m.replace("-matched", "-unmatched"));
        const oa = r.solution.types[a]!;
        const ob = r.solution.types[b]!;
        worst = Math.max(worst, Math.abs(oa.y - ob.y), Math.abs(oa.x - ob.x), maxGap(oa.shares, ob.shares), Math.abs(r.ledger[a]!.ev - r.ledger[b]!.ev));
      });
      ctx.check(T, `${name(preset)}, θ = ${theta}: largest gap between matched and unmatched halves`, worst, 0, IDENTITY);
    }
  }
}

function test15(ctx: CheckContext) {
  const T = "15 Solver from cold starts";
  const factors = [0.01, 0.1, 0.5, 2, 10, 100];
  for (const preset of PRESETS) {
    for (const theta of [5, 200]) {
      let worst = 0;
      let failed = 0;
      let runs = 0;
      let worstAcc = 0;
      for (const [, tech] of stage2Technologies(2)) {
        const sc = presetScenario(preset, { theta, technology: tech });
        const ref = ctx.run(sc).solution.omega;
        const base = buildBaseEconomy(sc).base.omega;
        for (const f of factors) {
          // Uneven starts too: manufacturing firms scaled by f, design firms by 1/f.
          for (const uneven of [false, true]) {
            const start = base.map((w, i) => w * (uneven && i >= base.length / 2 ? 1 / f : f));
            // Solved outside ctx.run, so deliberate bad starts don't count in test 17's summary;
            // their accounting is checked here instead.
            const s = runScenario(sc, { start }).solution;
            runs++;
            if (!s.solver.converged) failed++;
            else {
              worst = Math.max(worst, maxGap(s.omega.map(Math.log), ref.map(Math.log)));
              worstAcc = Math.max(worstAcc, ...Object.values(s.accounting));
            }
          }
        }
      }
      ctx.check(T, `${name(preset)}, θ = ${theta}: starts that failed, of ${runs} (piece rates × 0.01 to 100, even and uneven, 3 technologies)`, failed, 0, { kind: "max", tol: 0 });
      ctx.check(T, `${name(preset)}, θ = ${theta}: largest gap in ln ω between cold starts and the default start`, worst, 0, IDENTITY);
      ctx.check(T, `${name(preset)}, θ = ${theta}: largest accounting gap over the cold-start solves`, worstAcc, 0, IDENTITY);
    }
  }
}

function test16(ctx: CheckContext) {
  const T = "16 Newton agrees with bisection";
  const cases: [string, Scenario][] = [
    ["Step 1, young, A = 2", step1At("young", 2)],
    ["Step 1, mature, A = 5, 10% share", step1At("mature", 5, { share: 0.1 })],
    ["Test 6, η = 1", noPremiumAt(1)],
    ["Test 8", SCENARIOS.handloom],
    ["Test 7, g = 3, θ = 20", withValue(withValue(SCENARIOS.premium, "technology.g", 3), "theta", 20)],
  ];
  let worst = 0;
  for (const [, sc] of cases) {
    const bis = ctx.run(sc).solution.omega;
    const econ = applyTechnology(buildBaseEconomy(sc), sc.technology);
    const nt = newtonSolve(econ).omega;
    worst = Math.max(worst, Math.abs(Math.log(bis[0]!) - Math.log(nt[0]!)));
  }
  ctx.check(T, `One-sector scenarios: largest gap in ln ω between Newton (with continuation) and bisection, over ${cases.length} cases`, worst, 0, IDENTITY);
}

function test17(ctx: CheckContext, solves: number) {
  const T = "17 Accounting, stage 2";
  const n = `over the ${solves} solves in tests 11 to 16 (test 15's cold starts are checked there)`;
  ctx.check(T, "Output equals final plus intermediate use (largest relative gap)", ctx.worst.supplyChain, 0, IDENTITY, n);
  ctx.check(T, "Spending equals income (largest relative gap)", ctx.worst.spendingVsIncome, 0, IDENTITY, n);
  ctx.check(T, "X produced equals X consumed (largest relative gap)", ctx.worst.xBalance, 0, IDENTITY, n);
  ctx.check(T, "Units required equal units made (largest relative gap)", ctx.worst.marketResidual, 0, IDENTITY, n);
  ctx.check(T, "Solves that didn't converge (test 15's cold starts are counted there)", ctx.unconverged, 0, { kind: "max", tol: 0 }, n);
}
