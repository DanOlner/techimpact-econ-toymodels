// Parameter-space maps (milestone 7): the one-sector regime maps from the plan's "Regime maps to
// run", each solved on a grid at several θ. Definitions are code rather than JSON because two of
// the axes are derived settings (a point on the demand curve, a matched share of incumbents) that
// set more than one scenario field.

import { JOB } from "../engine/calibrate";
import { curveShape } from "../engine/demand";
import { normCdf, normInv, normPdf } from "../engine/normal";
import { linspace, logspace, withValue, type Run } from "../engine/sweep";
import { CURVES, type OneSectorSetup, type Scenario } from "../engine/types";
import { baseEmployment, empChange, noPremiumAt, SCENARIOS } from "../checks/spec-tests";

export interface Axis {
  key: string;
  label: string;
  values: number[];
  log?: boolean;
}

export type ColourScale =
  | { kind: "diverging"; /** Values are clipped to ± this. */ limit: number }
  | { kind: "sequential"; domain: [number, number] }
  | { kind: "categorical"; categories: string[] };

export interface Outcome {
  key: string;
  label: string;
  unit: string;
  scale: ColourScale;
  get: (run: Run) => number;
  /** Draw the model's own contour at this value (for diverging outcomes, usually 0). */
  contour?: number;
}

/** A curve in data coordinates, drawn on every panel. */
export interface Boundary {
  label: string;
  points: [number, number][];
}

export interface MapDef {
  id: string;
  title: string;
  description: string;
  x: Axis;
  y: Axis;
  thetas: number[];
  build: (x: number, y: number, theta: number) => Scenario;
  outcomes: Outcome[];
  /** Hand-worked boundaries, for the large-θ, small-sector limit where they apply. */
  boundaries?: Boundary[];
}

export const THETAS = [5, 20, 200];

// ---------------------------------------------------------------------------------------------
// Map 1: size of gain against starting point on the demand curve.

/** The young and mature curves share σ ≈ 0.875; the starting point is the base-year saturation S. */
const SIGMA = curveShape(CURVES.young).sigma;
const curveAt = (S: number) => ({ saturation: S, elasticity: normPdf(normInv(S)) / (SIGMA * S) });

/** Bessen's setting (price 1/A, x fixed): employment relative to the base year. */
const bessenL = (A: number, S: number) => normCdf(normInv(S) + Math.log(A) / SIGMA) / (S * A);

function bessenBoundaries(Ss: number[]): Boundary[] {
  // Peak: ε = 1, where φ(z)/Φ(z) = σ. φ/Φ falls as z rises, so bisect on z.
  let lo = -10;
  let hi = 10;
  for (let i = 0; i < 200; i++) {
    const m = 0.5 * (lo + hi);
    if (normPdf(m) / normCdf(m) > SIGMA) lo = m;
    else hi = m;
  }
  const zStar = 0.5 * (lo + hi);
  const peak: [number, number][] = [];
  const back: [number, number][] = [];
  for (const S of Ss) {
    const Ap = Math.exp(SIGMA * (zStar - normInv(S)));
    if (Ap >= 1) peak.push([Ap, S]);
    // Back to the start: the A > peak where L = 1.
    if (Ap > 1) {
      let a = Ap;
      let b = 1e4;
      if (bessenL(b, S) < 1) {
        for (let i = 0; i < 200; i++) {
          const m = Math.sqrt(a * b);
          if (bessenL(m, S) > 1) a = m;
          else b = m;
        }
        back.push([Math.sqrt(a * b), S]);
      }
    }
  }
  return [
    { label: "Bessen’s peak (ε = 1)", points: peak },
    { label: "Bessen: employment back to its start", points: back },
  ];
}

const map1: MapDef = {
  id: "map1-gain-vs-starting-point",
  title: "Map 1: size of gain against starting point on the demand curve",
  description:
    "One sector at 0.1% of spending, one worker type. The sector's productivity rises by a factor A. The starting point is how saturated demand is in the base year, on the curve shared by the young (10%) and mature (80%) starting points (σ ≈ 0.875). Outcome: change in sector employment. Expect Bessen's hump: employment rises for young sectors and modest gains, and falls for mature sectors or large gains.",
  x: { key: "A", label: "Productivity gain A (log scale)", values: logspace(1.05, 10, 41), log: true },
  y: { key: "S", label: "Base-year saturation (share of ceiling)", values: linspace(0.05, 0.95, 37) },
  thetas: THETAS,
  build: (A, S, theta) => {
    let sc = withValue(SCENARIOS.step1, "setup.sector.curve", curveAt(S));
    sc = withValue(sc, "technology.A", A);
    return withValue(sc, "theta", theta);
  },
  outcomes: [
    { key: "emp", label: "Change in sector employment", unit: "%", scale: { kind: "diverging", limit: 100 }, get: (r) => 100 * empChange(r), contour: 0 },
    { key: "sat", label: "Demand as a share of the ceiling", unit: "%", scale: { kind: "sequential", domain: [0, 100] }, get: (r) => 100 * r.solution.saturation[0]! },
  ],
  boundaries: bessenBoundaries(linspace(0.02, 0.98, 97)),
};

// ---------------------------------------------------------------------------------------------
// Map 2: size of gain against matched share.

const youngShape = curveShape(CURVES.young);
/** Demand relative to the base year at price p, in Bessen's setting, on the young curve. */
const Qyoung = (p: number) => normCdf(youngShape.z0 + Math.log(1 / p) / youngShape.sigma) / CURVES.young.saturation;

const REGIMES = ["scarce", "in between", "plentiful"];

const map2: MapDef = {
  id: "map2-gain-vs-matched-share",
  title: "Map 2: size of gain against matched share",
  description:
    "Test 6's setup: matched and unmatched workers produce 1 in the sector and in X; the young curve; the sector at 0.1% of spending. Matched workers' output rises by 1 + g. η is the number of matched people as a multiple of the sector's base-year employment. Outcomes: the price, matched workers' pay relative to X, and the regime. Hand-worked boundaries: matched workers are scarce while η (1 + g) ≤ 1, and plentiful once η (1 + g) > Q(1/(1 + g)). The regime is read from who works in the sector (explain.ts): scarce while unmatched workers still make at least 1% of its units, plentiful once matched workers earn within 5% of their X pay. Those are conventions for large θ: at low θ some unmatched workers always stay, so cells read as scarce even where the price has fallen.",
  x: { key: "g", label: "Gain g (matched output × (1 + g))", values: linspace(0.05, 3, 41) },
  y: { key: "eta", label: "Matched people η", values: linspace(0.1, 3, 39) },
  thetas: THETAS,
  build: (g, eta, theta) => withValue(noPremiumAt(eta, theta), "technology.g", g),
  outcomes: [
    { key: "price", label: "Price", unit: "", scale: { kind: "sequential", domain: [0.25, 1] }, get: (r) => r.solution.sectorPrice[0]! },
    {
      key: "premium",
      label: "Matched workers’ pay premium over X",
      unit: "%",
      scale: { kind: "sequential", domain: [0, 300] },
      get: (r) => 100 * (r.solution.types[0]!.pay[JOB.old]! / r.solution.types[0]!.pay[JOB.X]! - 1),
    },
    { key: "regime", label: "Regime", unit: "", scale: { kind: "categorical", categories: REGIMES }, get: (r) => REGIMES.indexOf(r.explanation.regime) },
  ],
  boundaries: [
    { label: "Hand-worked: scarce | in between", points: linspace(0.05, 3, 60).map((g) => [g, 1 / (1 + g)]) },
    { label: "Hand-worked: in between | plentiful", points: linspace(0.05, 3, 60).map((g) => [g, Qyoung(1 / (1 + g)) / (1 + g)]) },
  ],
};

// ---------------------------------------------------------------------------------------------
// Map 3: premium against matched share, for unmatched incumbents' real income.

function premiumScenario(r: number, h: number, theta: number): Scenario {
  let sc = withValue(SCENARIOS.premium, "theta", theta);
  sc = withValue(sc, "technology.g", 1);
  sc = withValue(sc, "setup.sector.spendingShare", 0.1);
  sc = withValue(sc, "setup.types.0.sectorOutput", 1 + r);
  sc = withValue(sc, "setup.types.1.sectorOutput", 1 + r);
  const setup = sc.setup as OneSectorSetup;
  setup.types[0]!.balanceWeight = h;
  setup.types[1]!.balanceWeight = 1 - h;
  return sc;
}

const evPct = (r: Run, id: string) => {
  const s = r.economy.types.findIndex((t) => t.id === id);
  return (100 * r.ledger[s]!.ev) / r.base.base.y[s]!;
};

const map3: MapDef = {
  id: "map3-premium-vs-matched-share",
  title: "Map 3: premium against matched share",
  description:
    "Test 7's setup with the sector at 10% of spending, so that cheaper goods matter to everyone's real income. Incumbents earn a premium r in the sector and are its whole base-year workforce; a share h of them are matched, and the technology doubles matched output (g = 1). General workers can't use it. Outcome: the change in real income of unmatched incumbents, the type most likely to lose, and of matched incumbents. Where does it stay positive?",
  x: { key: "r", label: "Incumbents’ premium r", values: linspace(0.05, 1.5, 30) },
  y: { key: "h", label: "Share of incumbents matched, h", values: linspace(0.05, 0.95, 31) },
  thetas: THETAS,
  build: premiumScenario,
  outcomes: [
    { key: "evUnmatched", label: "Unmatched incumbents’ change in real income", unit: "% of base income", scale: { kind: "diverging", limit: 40 }, get: (r) => evPct(r, "inc-unmatched"), contour: 0 },
    { key: "evMatched", label: "Matched incumbents’ change in real income", unit: "% of base income", scale: { kind: "diverging", limit: 100 }, get: (r) => evPct(r, "inc-matched"), contour: 0 },
    { key: "price", label: "Price", unit: "", scale: { kind: "sequential", domain: [0.4, 1] }, get: (r) => r.solution.sectorPrice[0]! },
  ],
};

export const MAPS: MapDef[] = [map1, map2, map3];

/** Sector employment relative to base, re-exported for the runner's diagnostics. */
export { baseEmployment };
