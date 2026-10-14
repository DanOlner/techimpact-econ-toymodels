// Types shared across the engine. Scenarios are plain data (JSON); the economy is the calibrated
// numeric form that the solver works on; solutions are plain data that serialise to JSON.

/** A demand curve set from two numbers: base-year saturation S and base-year elasticity ε₀. */
export interface CurveSpec {
  saturation: number;
  elasticity: number;
}

export const CURVES: Record<"young" | "mature", CurveSpec> = {
  young: { saturation: 0.1, elasticity: 2 },
  mature: { saturation: 0.8, elasticity: 0.4 },
};

/** Switches that turn single mechanisms off, so their effect can be seen on its own. */
export interface Switches {
  /** Hold final demand at its base-year quantities (the GVA project's "freeze consumption"). */
  freezeDemand?: boolean;
  /** Hold the x in each type's demand cut-off at its base-year value: Bessen's setting, no income effects. */
  fixedX?: boolean;
  /** Replace θ by STRICT_THETA: strict Roy sorting, kept as a test of the logit spread. */
  strictSorting?: boolean;
}

/** θ used when strictSorting is on. Large enough that a 0.1% pay gap moves almost everyone. */
export const STRICT_THETA = 20000;

export type Technology =
  | { kind: "none" }
  /** Every type's output in the adopters' existing technique is multiplied by A (spec step 1). */
  | { kind: "productivity"; adopters: string[]; A: number }
  /** Matched types' output in the adopters' existing technique is multiplied by 1 + g. */
  | { kind: "augment"; adopters: string[]; g: number }
  /** The adopters get a machine technique with output A_m · m_s per worker. */
  | { kind: "automate"; adopters: string[]; Am: number };

// ---------------------------------------------------------------------------------------------
// Scenario data

/** How a type is placed across jobs in the base year. */
export type TypeBase =
  /** Its share in the sector's existing technique; the rest work in X. Attraction is backed out. */
  | { sectorShare: number }
  /** Attraction terms set directly (b, not log b); base-year shares follow from the logit. */
  | { attraction: { sector: number; X: number } };

export interface TypeSetup {
  id: string;
  label?: string;
  /** People of this type. "rest" fills the population to 1; "balance" is sized so the base year clears. */
  N: number | "rest" | "balance";
  /** For "balance" types: relative size within the balance group (default 1, so they're equal). */
  balanceWeight?: number;
  /** Output (and pay) per worker in X. Default 1. */
  xOutput?: number;
  /** Output per worker in the sector's existing technique; 1 + r for incumbents. 0 means it can't work there. */
  sectorOutput: number;
  /** c_s: can use the augmenting technology. */
  matched?: boolean;
  /** m_s: can mind machines. */
  mindsMachines?: boolean;
  /** Incumbent of the sector (for reports only; the premium is in sectorOutput). */
  incumbent?: boolean;
  base: TypeBase;
}

/** Spec steps 1 and 2: one sector, one firm, and X. */
export interface OneSectorSetup {
  kind: "oneSector";
  sector: { curve: "young" | "mature" | CurveSpec; spendingShare: number };
  types: TypeSetup[];
}

export type Setup = OneSectorSetup;

export interface Sweep {
  /** Dotted path of the scenario field to vary, such as "technology.A" or "setup.types.0.N". */
  path: string;
  values: number[];
}

export interface Scenario {
  id: string;
  title: string;
  description?: string;
  setup: Setup;
  theta: number;
  sigmaW: number;
  switches?: Switches;
  technology: Technology;
  sweep?: Sweep;
}

// ---------------------------------------------------------------------------------------------
// The calibrated economy

export interface Sector {
  id: string;
  curve: CurveSpec;
  spendingShare: number;
  gamma: number;
  mu: number;
  sigma: number;
}

export interface Firm {
  id: string;
  sector: number;
}

/** A job is X (firm −1) or a firm's technique. */
export interface Job {
  id: string;
  firm: number;
  technique: "X" | "old" | "machine";
}

export interface WorkerType {
  id: string;
  label: string;
  N: number;
  matched: boolean;
  mindsMachines: boolean;
  incumbent: boolean;
  /** Output per worker in each job, after technology. 0 removes the job from the choice set. */
  output: number[];
  /** log b_{s,j} per job; −Infinity removes the job from the choice set. */
  logAttr: number[];
}

export interface BaseYear {
  omega: number[];
  /** Each type's x, income and demand per head by sector, in the base year. */
  x: number[];
  y: number[];
  demand: number[][];
  finalDemand: number[];
  sectorPrice: number[];
  utility: number[];
  shares: number[][];
}

export interface Economy {
  sectors: Sector[];
  firms: Firm[];
  jobs: Job[];
  /** coef[k][l]: units of sector k's product used per unit of sector l's output. */
  coef: number[][];
  sigmaW: number;
  theta: number;
  switches: Switches;
  types: WorkerType[];
  base: BaseYear;
}

// ---------------------------------------------------------------------------------------------
// Solutions

export interface TypeOutcome {
  id: string;
  /** Average pay per head. */
  y: number;
  /** X consumed per head. */
  x: number;
  /** Demand per head, physical units, by sector. */
  demand: number[];
  /** Share of the type in each job. */
  shares: number[];
  /** Pay per worker in each job (NaN where the job isn't in the choice set). */
  pay: number[];
  utility: number;
  /** Price elasticity of demand by sector, holding x fixed. */
  elasticity: number[];
}

export interface Accounting {
  /** Max relative gap between each type's spending and its income. */
  spendingVsIncome: number;
  /** Relative gap between X produced and X consumed. */
  xBalance: number;
  /** Max |Σ shares − 1| over types. */
  shareSums: number;
  /** Max relative gap between units required of each firm and units its workers make. */
  marketResidual: number;
}

export interface SolverInfo {
  method: string;
  start: number[];
  iterations: number;
  bracket?: [number, number];
  converged: boolean;
}

export interface Solution {
  omega: number[];
  firmPrice: number[];
  /** Firm's share of its sector's units. */
  firmShare: number[];
  sectorPrice: number[];
  finalDemand: number[];
  sectorOutput: number[];
  firmRequired: number[];
  firmSupplied: number[];
  /** Headcount in each job, summed over types. */
  jobEmployment: number[];
  /** Headcount by type (row) and job (column). */
  employment: number[][];
  sectorEmployment: number[];
  /** Share of the ceiling bought, by sector, population-weighted. */
  saturation: number[];
  types: TypeOutcome[];
  accounting: Accounting;
  solver: SolverInfo;
}
