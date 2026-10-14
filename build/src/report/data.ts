// Everything the report shows, computed from the engine in the browser.

import { JOB } from "../engine/calibrate";
import { presetBaseYear, type PresetBaseYear } from "../engine/presets";
import { linspace, sweep, withValue, type Run } from "../engine/sweep";
import type { Scenario } from "../engine/types";
import { CheckContext } from "../checks/context";
import { coldStarts, thetaStudy, THETA_COLUMNS, type ColdStartRow, type ThetaRow } from "../checks/diagnostics";
import { PRESETS, runPresetTests } from "../checks/preset-tests";
import { baseEmployment, empChange, noPremiumAt, runSpecTests, SCENARIOS, step1At } from "../checks/spec-tests";
import { runScenario } from "../engine/sweep";

export interface Table {
  title: string;
  header: string[];
  rows: string[][];
}

export interface ScenarioReport {
  scenario: Scenario;
  sweepLabel: string;
  tables: Table[];
}

export interface ReportData {
  checks: CheckContext;
  chart1: { young: [number, number][]; mature: [number, number][]; young10: [number, number][] };
  chart2: { price: [number, number][][]; pay: [number, number][][]; emp: [number, number][][] };
  chart3: { payOld: [number, number][]; payMachineDeskill: [number, number][]; empOld: [number, number][]; empMachine: [number, number][]; evDefault: [number, number][]; evDeskill: [number, number][] };
  scenarios: ScenarioReport[];
  theta: { columns: typeof THETA_COLUMNS; rows: ThetaRow[] };
  coldStarts: ColdStartRow[];
  presets: PresetBaseYear[];
  millis: number;
}

const withPoints = (base: number[], extra: number[]) => [...new Set([...base, ...extra].map((v) => +v.toFixed(6)))].sort((a, b) => a - b);

export function buildReportData(): ReportData {
  const t0 = performance.now();
  const checks = runSpecTests();
  runPresetTests(checks);

  // Chart 1: sector employment against productivity.
  const As = withPoints(linspace(1, 10, 37), [2, 2.765, 8.858]);
  const curve = (c: "young" | "mature", share?: number) => As.map((A) => [A, 100 * empChange(runScenario(step1At(c, A, { share })))] as [number, number]);
  const chart1 = { young: curve("young"), mature: curve("mature"), young10: curve("young", 0.1) };

  // Chart 2: augmenting with no premium, against η, at θ = 200 (the spec's) and θ = 2,000.
  const etas = withPoints(linspace(0.1, 3, 59), [0.4, 0.5, 1, 1.557, 2]);
  const chart2 = { price: [] as [number, number][][], pay: [] as [number, number][][], emp: [] as [number, number][][] };
  for (const theta of [200, 2000]) {
    const runs = etas.map((eta) => [eta, runScenario(noPremiumAt(eta, theta))] as const);
    chart2.price.push(runs.map(([e, r]) => [e, r.solution.sectorPrice[0]!]));
    chart2.pay.push(runs.map(([e, r]) => [e, r.solution.types[0]!.pay[JOB.old]!]));
    chart2.emp.push(runs.map(([e, r]) => [e, 100 * empChange(r)]));
  }

  // Chart 3: automating, against A_m; default (incumbents can't mind machines) and pure deskilling.
  const Ams = withPoints(linspace(1, 10, 37), [8 / 3]);
  const hand = (deskill: boolean) =>
    Ams.map((Am) => {
      let sc = withValue(SCENARIOS.handloom, "technology.Am", Am);
      if (deskill) sc = withValue(sc, "setup.types.0.mindsMachines", true);
      return [Am, runScenario(sc)] as const;
    });
  const def = hand(false);
  const desk = hand(true);
  const inc = 0;
  const chart3 = {
    payOld: def.map(([a, r]) => [a, r.solution.types[inc]!.pay[JOB.old]!] as [number, number]),
    payMachineDeskill: desk.map(([a, r]) => [a, r.solution.types[inc]!.pay[JOB.machine]!] as [number, number]),
    empOld: def.map(([a, r]) => [a, r.solution.jobEmployment[JOB.old]! / baseEmployment(r)] as [number, number]),
    empMachine: def.map(([a, r]) => [a, r.solution.jobEmployment[JOB.machine]! / baseEmployment(r)] as [number, number]),
    evDefault: def.map(([a, r]) => [a, (100 * r.ledger[inc]!.ev) / r.base.base.y[inc]!] as [number, number]),
    evDeskill: desk.map(([a, r]) => [a, (100 * r.ledger[inc]!.ev) / r.base.base.y[inc]!] as [number, number]),
  };

  const scenarios: ScenarioReport[] = [
    scenarioReport(SCENARIOS.step1, "Productivity A"),
    scenarioReport(SCENARIOS.noPremium, "Matched people (share of population)"),
    scenarioReport(SCENARIOS.premium, "Gain g"),
    scenarioReport(SCENARIOS.handloom, "Machine output per minder A_m"),
  ];

  return {
    checks,
    chart1,
    chart2,
    chart3,
    scenarios,
    theta: { columns: THETA_COLUMNS, rows: thetaStudy() },
    coldStarts: coldStarts(),
    presets: PRESETS.map(presetBaseYear),
    millis: performance.now() - t0,
  };
}

const f = (v: number, d = 4) => (Number.isFinite(v) ? Number(v.toPrecision(d)).toString() : "–");
const pct = (v: number) => (Number.isFinite(v) ? `${(100 * v).toFixed(2)}%` : "–");

/** One row per sweep value, in five tables, as the spec's "What the first test model should produce". */
function scenarioReport(scenario: Scenario, sweepLabel: string): ScenarioReport {
  const sw = scenario.sweep!;
  const points = sweep(scenario, sw.path, sw.values).filter((p): p is { value: number; run: Run } => !!p.run);
  const types = points[0]!.run.economy.types;
  const jobs = points[0]!.run.economy.jobs.filter((j) => j.technique !== "machine" || scenario.technology.kind === "automate");
  const jobIdx = jobs.map((j) => points[0]!.run.economy.jobs.indexOf(j));
  const v = (p: { value: number }) => f(p.value);

  const prices: Table = {
    title: "Prices and output",
    header: [sweepLabel, "Piece rate ω", "Price", "Sector output (× base)", "Sector employment (× base)", "Demand as share of ceiling", "Elasticity ε"],
    rows: points.map((p) => {
      const s = p.run.solution;
      return [v(p), f(s.omega[0]!), f(s.sectorPrice[0]!), f(s.sectorOutput[0]! / p.run.base.base.finalDemand[0]!), f(s.sectorEmployment[0]! / baseEmployment(p.run)), pct(s.saturation[0]!), f(s.types[0]!.elasticity[0]!)];
    }),
  };
  const employment: Table = {
    title: "Employment by type and job (share of each type's people)",
    header: [sweepLabel, ...types.flatMap((t) => jobIdx.map((j) => `${t.label}: ${points[0]!.run.economy.jobs[j]!.id}`))],
    rows: points.map((p) => [v(p), ...types.flatMap((_, s) => jobIdx.map((j) => pct(p.run.solution.types[s]!.shares[j]!)))]),
  };
  const pay: Table = {
    title: "Pay by type: average pay per head, and pay in each job open to the type",
    header: [sweepLabel, ...types.flatMap((t) => [`${t.label}: average`, ...jobIdx.filter((j) => j !== JOB.X).map((j) => `${t.label}: ${points[0]!.run.economy.jobs[j]!.id}`)])],
    rows: points.map((p) => [v(p), ...types.flatMap((_, s) => [f(p.run.solution.types[s]!.y), ...jobIdx.filter((j) => j !== JOB.X).map((j) => f(p.run.solution.types[s]!.pay[j]!))])]),
  };
  const ledger: Table = {
    title: "Change in real income per head (equivalent variation) = pay part + price part",
    header: [sweepLabel, ...types.flatMap((t) => [`${t.label}: total`, `${t.label}: pay`, `${t.label}: price`])],
    rows: points.map((p) => [v(p), ...p.run.ledger.flatMap((l) => [f(l.ev), f(l.payPart), f(l.pricePart)])]),
  };
  const holders: Table =
    scenario.technology.kind === "automate"
      ? {
          title: "Who holds the machine jobs (share of machine-technique headcount)",
          header: [sweepLabel, ...types.map((t) => t.label)],
          rows: points.map((p) => {
            const total = p.run.solution.jobEmployment[JOB.machine]!;
            return [v(p), ...types.map((_, s) => (total > 0 ? pct(p.run.solution.employment[s]![JOB.machine]! / total) : "–"))];
          }),
        }
      : {
          title: "Who holds the adopting firm's jobs (share of its headcount): base year, then with the technology",
          header: [sweepLabel, ...types.flatMap((t) => [`${t.label}: base`, `${t.label}: with technology`])],
          rows: points.map((p) => {
            const firmJobs = [JOB.old, JOB.machine];
            const base = p.run.base.types.map((t, s) => firmJobs.reduce((a, j) => a + t.N * p.run.base.base.shares[s]![j]!, 0));
            const now = p.run.economy.types.map((_, s) => firmJobs.reduce((a, j) => a + p.run.solution.employment[s]![j]!, 0));
            const bt = base.reduce((a, b) => a + b, 0);
            const nt = now.reduce((a, b) => a + b, 0);
            return [v(p), ...types.flatMap((_, s) => [pct(base[s]! / bt), pct(now[s]! / nt)])];
          }),
        };
  return { scenario, sweepLabel, tables: [prices, employment, pay, ledger, holders] };
}
