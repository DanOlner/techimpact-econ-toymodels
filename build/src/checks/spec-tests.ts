// The spec's tests 1–10 for steps 1 and 2 ("Tests and expected values"), as data.

import type { Run } from "../engine/sweep";
import { linspace, withValue } from "../engine/sweep";
import type { OneSectorSetup, Scenario } from "../engine/types";
import { JOB } from "../engine/calibrate";
import { CheckContext, IDENTITY, LEVEL, PP } from "./context";
import step1 from "../../scenarios/step1-bessen.json";
import noPremium from "../../scenarios/step2-augment-no-premium.json";
import premium from "../../scenarios/step2-augment-premium.json";
import handloom from "../../scenarios/step2-handloom.json";
import fourTypes from "../../scenarios/step2-four-types-theta5.json";

export const SCENARIOS = {
  step1: step1 as Scenario,
  noPremium: noPremium as Scenario,
  premium: premium as Scenario,
  handloom: handloom as Scenario,
  fourTypes: fourTypes as Scenario,
};

const NONE = { kind: "none" } as const;

/** Sector headcount in the base year. */
export function baseEmployment(r: Run): number {
  return r.base.types.reduce((acc, t, s) => acc + t.N * (r.base.base.shares[s]![JOB.old]! + r.base.base.shares[s]![JOB.machine]!), 0);
}
/** Change in sector headcount relative to the base year. */
export const empChange = (r: Run) => r.solution.sectorEmployment[0]! / baseEmployment(r) - 1;
const typeIndex = (r: Run, id: string) => r.economy.types.findIndex((t) => t.id === id);

/** Step 1 scenario at a curve, spending share, θ and productivity. */
export function step1At(curve: "young" | "mature", A: number, opts: { share?: number; theta?: number; switches?: Scenario["switches"] } = {}): Scenario {
  let sc = withValue(SCENARIOS.step1, "setup.sector.curve", curve);
  sc = withValue(sc, "technology.A", A);
  if (opts.share !== undefined) {
    sc = withValue(sc, "setup.sector.spendingShare", opts.share);
    sc = withValue(sc, "setup.types.0.base.sectorShare", opts.share);
  }
  if (opts.theta !== undefined) sc = withValue(sc, "theta", opts.theta);
  if (opts.switches) sc = { ...sc, switches: opts.switches };
  return sc;
}

/** Test 6 scenario at η (matched people as a multiple of base-year sector employment). */
export function noPremiumAt(eta: number, theta?: number): Scenario {
  const L0 = (SCENARIOS.noPremium.setup as OneSectorSetup).sector.spendingShare; // income per head is 1, so L₀ = the spending share
  let sc = withValue(SCENARIOS.noPremium, "setup.types.0.N", eta * L0);
  if (theta !== undefined) sc = withValue(sc, "theta", theta);
  return sc;
}

/** Golden-section search for the maximum of f on [a, b]. */
function argmax(f: (x: number) => number, a: number, b: number, tol = 1e-7): number {
  const gr = (Math.sqrt(5) - 1) / 2;
  let c = b - gr * (b - a);
  let d = a + gr * (b - a);
  let fc = f(c);
  let fd = f(d);
  while (b - a > tol) {
    if (fc > fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - gr * (b - a);
      fc = f(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + gr * (b - a);
      fd = f(d);
    }
  }
  return 0.5 * (a + b);
}

/** Bisection for f(x) = 0 on [a, b], with f(a) and f(b) of opposite signs. */
function root(f: (x: number) => number, a: number, b: number, tol = 1e-9): number {
  let fa = f(a);
  for (let i = 0; i < 200 && b - a > tol; i++) {
    const m = 0.5 * (a + b);
    const fm = f(m);
    if (fm * fa > 0) {
      a = m;
      fa = fm;
    } else b = m;
  }
  return 0.5 * (a + b);
}

export function runSpecTests(): CheckContext {
  const ctx = new CheckContext();
  test1(ctx);
  test3(ctx);
  test4and5(ctx);
  test6(ctx);
  test7(ctx);
  test8and9(ctx);
  test10(ctx);
  test2(ctx); // last: it reports the worst accounting gaps over every solve above
  return ctx;
}

function test1(ctx: CheckContext) {
  const T = "1 Base year solves back";
  const bases: [string, Scenario][] = [
    ["Step 1, young, 0.1%", step1At("young", 1)],
    ["Step 1, mature, 0.1%", step1At("mature", 1)],
    ["Step 1, young, 10%", step1At("young", 1, { share: 0.1 })],
    ["Step 1, mature, 10%", step1At("mature", 1, { share: 0.1 })],
    ["Test 6, η = 0.4", { ...noPremiumAt(0.4), technology: NONE }],
    ["Test 6, η = 2", { ...noPremiumAt(2), technology: NONE }],
    ["Test 7", { ...SCENARIOS.premium, technology: NONE }],
    ["Test 8", { ...SCENARIOS.handloom, technology: NONE }],
    ["Four types, θ = 5", SCENARIOS.fourTypes],
  ];
  for (const [label, sc] of bases) {
    let worst = 0;
    for (const start of [1.2, 0.8]) {
      const r = ctx.run(sc, { start: [start] });
      worst = Math.max(worst, Math.abs(r.solution.sectorPrice[0]! - 1));
      r.solution.types.forEach((o, s) => {
        o.shares.forEach((sh, j) => (worst = Math.max(worst, Math.abs(sh - r.base.base.shares[s]![j]!))));
      });
    }
    ctx.check(T, `${label}: largest gap in price or shares, from starts 1.2 and 0.8`, worst, 0, IDENTITY);
  }
}

function test2(ctx: CheckContext) {
  const T = "2 Accounting";
  const n = `over all ${ctx.solves} solves in tests 1 and 3 to 10`;
  ctx.check(T, "Spending equals income (largest relative gap)", ctx.worst.spendingVsIncome, 0, IDENTITY, n);
  ctx.check(T, "X produced equals X consumed (largest relative gap)", ctx.worst.xBalance, 0, IDENTITY, n);
  ctx.check(T, "Each type's shares add up to 1 (largest gap)", ctx.worst.shareSums, 0, IDENTITY, n);
  ctx.check(T, "Units required equal units made (largest relative gap)", ctx.worst.marketResidual, 0, IDENTITY, n);
  ctx.check(T, "Solves that didn't converge", ctx.unconverged, 0, { kind: "max", tol: 0 }, n);
}

function test3(ctx: CheckContext) {
  const T = "3 Frozen demand";
  for (const A of [2, 4]) {
    const r = ctx.run(step1At("young", A, { switches: { freezeDemand: true } }));
    const ratio = (r.solution.sectorEmployment[0]! * A) / baseEmployment(r);
    ctx.check(T, `A = ${A}: employment × A relative to the base year, minus 1`, Math.abs(ratio - 1), 0, IDENTITY, `employment falls by ${(100 * (1 - 1 / A)).toFixed(0)}%`);
  }
}

function test4and5(ctx: CheckContext) {
  const T = "4 Bessen's numbers";
  const at = (curve: "young" | "mature", A: number, opts: Parameters<typeof step1At>[2] = {}) => ctx.run(step1At(curve, A, opts));

  // Table points.
  const points = (opts: Parameters<typeof step1At>[2] = {}) => {
    const young2 = at("young", 2, opts);
    const peakA = argmax((A) => at("young", A, opts).solution.sectorEmployment[0]!, 1.5, 5);
    const peak = at("young", peakA, opts);
    const backA = root((A) => empChange(at("young", A, opts)), 4, 20);
    const back = at("young", backA, opts);
    const mature2 = at("mature", 2, opts);
    return { young2, peakA, peak, backA, back, mature2 };
  };
  const p = points();
  ctx.check(T, "Young, A = 2: change in sector employment", empChange(p.young2), 0.557, PP);
  ctx.check(T, "Young, A = 2: demand as a share of the ceiling", p.young2.solution.saturation[0]!, 0.311, PP);
  ctx.check(T, "Young: productivity at the peak", p.peakA, 2.77, LEVEL);
  ctx.check(T, "Young, peak: change in sector employment", empChange(p.peak), 0.632, PP);
  ctx.check(T, "Young, peak: demand as a share of the ceiling", p.peak.solution.saturation[0]!, 0.451, PP);
  ctx.check(T, "Young: productivity where employment is back to the start", p.backA, 8.86, LEVEL);
  ctx.check(T, "Young, back to the start: demand as a share of the ceiling", p.back.solution.saturation[0]!, 0.886, PP);
  ctx.check(T, "Mature, A = 2: change in sector employment", empChange(p.mature2), -0.407, PP);
  ctx.check(T, "Mature, A = 2: demand as a share of the ceiling", p.mature2.solution.saturation[0]!, 0.949, PP);

  // Slope of log employment against log productivity equals ε − 1.
  const h = 1e-3;
  for (const [curve, A] of [["young", 1.5], ["young", 2], ["young", 3], ["young", 5], ["young", 8], ["mature", 2]] as const) {
    const lnL = (a: number) => Math.log(at(curve, a).solution.sectorEmployment[0]!);
    const slope = (lnL(A * Math.exp(h)) - lnL(A * Math.exp(-h))) / (2 * h);
    const eps = at(curve, A).solution.types[0]!.elasticity[0]!;
    ctx.check(T, `${curve === "young" ? "Young" : "Mature"}, A = ${A}: slope d ln L / d ln A minus (ε − 1)`, slope - (eps - 1), 0, PP, `slope ${slope.toFixed(4)}, ε − 1 = ${(eps - 1).toFixed(4)}`);
  }

  // θ check: results at θ = 100 should be within 1 pp of θ = 200.
  const p100 = points({ theta: 100 });
  const thetaGap = (a: Run, b: Run) => Math.abs(empChange(a) - empChange(b));
  ctx.check(T, "θ check, young A = 2: |change at θ = 100 − change at θ = 200|", thetaGap(p100.young2, p.young2), 0, { kind: "max", tol: 0.01 });
  ctx.check(T, "θ check, young peak: |change at θ = 100 − change at θ = 200|", thetaGap(p100.peak, p.peak), 0, { kind: "max", tol: 0.01 });
  ctx.check(T, "θ check, mature A = 2: |change at θ = 100 − change at θ = 200|", thetaGap(p100.mature2, p.mature2), 0, { kind: "max", tol: 0.01 });

  // Test 5: the same points with the sector at 10% of spending. Reported, not tested.
  const T5 = "5 Closed-model effect (reported)";
  const q = points({ share: 0.1 });
  ctx.report(T5, "10% share, young, A = 2: change in sector employment", empChange(q.young2), `0.1% share: ${empChange(p.young2).toFixed(4)}`);
  ctx.report(T5, "10% share, young: productivity at the peak", q.peakA, `0.1% share: ${p.peakA.toFixed(4)}`);
  ctx.report(T5, "10% share, young, peak: change in sector employment", empChange(q.peak), `0.1% share: ${empChange(p.peak).toFixed(4)}`);
  ctx.report(T5, "10% share, young: productivity where employment is back to the start", q.backA, `0.1% share: ${p.backA.toFixed(4)}`);
  ctx.report(T5, "10% share, mature, A = 2: change in sector employment", empChange(q.mature2), `0.1% share: ${empChange(p.mature2).toFixed(4)}`);
}

function test6(ctx: CheckContext) {
  const T = "6 Augmenting, no premium";
  const L0 = (SCENARIOS.noPremium.setup as OneSectorSetup).sector.spendingShare;
  const cases = [
    { eta: 0.4, price: 1, pay: 2, emp: -0.4 },
    { eta: 1, price: 0.68, pay: 1.36, emp: 0 },
    { eta: 2, price: 0.5, pay: 1, emp: 0.557 },
  ];
  for (const c of cases) {
    const r = ctx.run(noPremiumAt(c.eta));
    const m = typeIndex(r, "matched");
    const u = typeIndex(r, "unmatched");
    const unmatchedInSector = r.solution.employment[u]![JOB.old]! / L0;
    ctx.check(T, `η = ${c.eta}: price`, r.solution.sectorPrice[0]!, c.price, LEVEL);
    ctx.check(T, `η = ${c.eta}: matched workers' pay`, r.solution.types[m]!.pay[JOB.old]!, c.pay, LEVEL);
    ctx.check(T, `η = ${c.eta}: change in sector employment`, empChange(r), c.emp, PP);
    if (c.eta < 0.5) {
      ctx.check(T, `η = ${c.eta}: change in sector output`, r.solution.sectorOutput[0]! / r.base.base.finalDemand[0]! - 1, 0, PP);
      ctx.check(T, `η = ${c.eta}: unmatched in the sector, as a share of base employment ("some stay")`, unmatchedInSector, null, { kind: "min", tol: 0.01 }, "hand-worked: 0.2");
    } else {
      ctx.check(T, `η = ${c.eta}: unmatched in the sector, as a share of base employment ("none")`, unmatchedInSector, 0, { kind: "max", tol: 0.01 });
    }
    ctx.report(T, `η = ${c.eta}: regime`, ["scarce", "in between", "plentiful"].indexOf(r.explanation.regime), `${r.explanation.regime} (0 scarce, 1 in between, 2 plentiful)`);
  }
  // Regime boundaries, from the regime classification on a fine grid of η.
  const etas = linspace(0.3, 2.2, 381);
  const regimes = etas.map((eta) => ctx.run(noPremiumAt(eta)).explanation.regime);
  const firstNot = (from: number, label: string) => etas[regimes.findIndex((g, i) => i >= from && g !== label)] ?? NaN;
  const b1 = firstNot(0, "scarce");
  const b2 = etas[regimes.findIndex((g) => g === "plentiful")] ?? NaN;
  const theta100 = ctx.run(noPremiumAt(2, 100));
  const theta200 = ctx.run(noPremiumAt(2));
  ctx.check(T, "θ check, η = 2: |change in employment at θ = 100 − at θ = 200|", Math.abs(empChange(theta100) - empChange(theta200)), 0, { kind: "max", tol: 0.01 });
  const conv = "grid step 0.005; regime read with the 1% and 5% conventions in explain.ts";
  ctx.check(T, "Boundary: scarce to in between, η", b1, 0.5, LEVEL, conv);
  ctx.check(T, "Boundary: in between to plentiful, η", b2, 1.56, LEVEL, conv);
}

function test7(ctx: CheckContext) {
  const T = "7 Augmenting, premium";
  // Find where unmatched incumbents' share in the sector falls through one half.
  const atG = (g: number) => ctx.run(withValue(SCENARIOS.premium, "technology.g", g));
  const unmatchedShare = (r: Run) => r.solution.types[typeIndex(r, "inc-unmatched")]!.shares[JOB.old]!;
  const gs = linspace(0, 5, 51);
  const shares = gs.map((g) => unmatchedShare(atG(g)));
  const i = shares.findIndex((s) => s < 0.5);
  if (i < 1) {
    ctx.check(T, "Unmatched incumbents never leave across g = 0 to 5", NaN, 1 / 1.5, LEVEL);
    return;
  }
  const g = root((x) => unmatchedShare(atG(x)) - 0.5, gs[i - 1]!, gs[i]!);
  const r = atG(g);
  ctx.check(T, "Piece rate when half the unmatched incumbents have left", r.solution.omega[0]!, 1 / 1.5, LEVEL, `at g = ${g.toFixed(3)}`);
  const all = atG(5);
  ctx.check(T, "g = 5: unmatched incumbents' share in the sector", unmatchedShare(all), 0, { kind: "max", tol: 0.01 }, `piece rate ${all.solution.omega[0]!.toFixed(3)}`);
}

function test8and9(ctx: CheckContext) {
  const T8 = "8 Automating: hand-loom";
  const r = ctx.run(SCENARIOS.handloom);
  const inc = typeIndex(r, "inc");
  ctx.check(T8, "Price", r.solution.sectorPrice[0]!, 0.375, LEVEL);
  ctx.check(T8, "Incumbents' pay in the old technique", r.solution.types[inc]!.pay[JOB.old]!, 0.75, LEVEL, "from 2 in the base year");
  ctx.check(T8, "Incumbents' share in the old technique", r.solution.types[inc]!.shares[JOB.old]!, 0, { kind: "max", tol: 0.01 });
  ctx.check(T8, "Sector output relative to the base year", r.solution.sectorOutput[0]! / r.base.base.finalDemand[0]!, 4.35, LEVEL);
  const r100 = ctx.run(withValue(SCENARIOS.handloom, "theta", 100));
  ctx.check(T8, "θ check: |price at θ = 100 − price at θ = 200|, relative", Math.abs(r100.solution.sectorPrice[0]! / r.solution.sectorPrice[0]! - 1), 0, { kind: "max", tol: 0.01 });
  const gm = typeIndex(r, "gen-matched");
  ctx.report(T8, "Minders' pay relative to their X pay", r.solution.types[gm]!.pay[JOB.machine]!, "hand-worked: 1");

  const T9 = "9 Pure deskilling";
  const d = ctx.run(withValue(SCENARIOS.handloom, "setup.types.0.mindsMachines", true));
  ctx.check(T9, "Incumbents' pay on the machines", d.solution.types[inc]!.pay[JOB.machine]!, 1, LEVEL);
  ctx.report(T9, "Incumbents' share on the machines", d.solution.types[inc]!.shares[JOB.machine]!);
}

function test10(ctx: CheckContext) {
  const T = "10 No technology, no difference";
  const cases: [string, Scenario][] = [
    ["Four types, θ = 5", SCENARIOS.fourTypes],
    ["Test 7 setup, θ = 200", { ...SCENARIOS.premium, technology: NONE }],
    ["Test 6 setup, η = 1", { ...noPremiumAt(1), technology: NONE }],
  ];
  for (const [label, sc] of cases) {
    const r = ctx.run(sc);
    const pairs: [string, string][] = [
      ["inc-matched", "inc-unmatched"],
      ["gen-matched", "gen-unmatched"],
      ["matched", "unmatched"],
    ];
    let worst = 0;
    for (const [a, b] of pairs) {
      const ia = typeIndex(r, a);
      const ib = typeIndex(r, b);
      if (ia < 0 || ib < 0) continue;
      const oa = r.solution.types[ia]!;
      const ob = r.solution.types[ib]!;
      worst = Math.max(worst, Math.abs(oa.y - ob.y), Math.abs(oa.x - ob.x), Math.abs(r.ledger[ia]!.ev - r.ledger[ib]!.ev));
      oa.shares.forEach((s, j) => (worst = Math.max(worst, Math.abs(s - ob.shares[j]!))));
    }
    ctx.check(T, `${label}: largest gap between matched and unmatched (pay, x, shares, real income)`, worst, 0, IDENTITY);
  }
}
