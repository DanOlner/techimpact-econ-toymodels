// Stage 2's page: two sectors, the supply chain, two firms per sector and six worker types.
// Its data is generated at build time (generate.ts) and embedded, so the page loads instantly.

import type { Tolerance } from "../../checks/context";
import type { PresetBaseYear } from "../../engine/presets";
import { ledgerChart, lineChart, simpleTable, type Series } from "../chart";
import { allStagesLink, app, csvLink, fmt, h, section, statusCell, tolText, type Status, type Table } from "../common";
import raw from "./data.json";

interface CheckRow {
  test: string;
  label: string;
  expected: number | null;
  actual: number | null;
  tolerance: Tolerance | null;
  pass: boolean | null;
  known: string | null;
  note: string | null;
}
interface TypeRow {
  id: string;
  label: string;
  ev: number | null;
  pay: number | null;
  price: number | null;
  inHome: number | null;
}
interface Row {
  level: number;
  price: number[];
  output: number[];
  empChange: number[];
  firmShare: number[];
  types: TypeRow[];
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
interface HM {
  preset: string;
  theta: number;
  designOutput: number;
  designEmployment: number;
  designPrice: number;
  finalShare: number;
  costShare: number;
  epsM: number;
  epsD: number;
  passThrough: number;
  approxOutput: number;
  upstreamOnly: number;
}
interface Stage2Data {
  generated: string;
  seconds: number;
  solves: number;
  checks: CheckRow[];
  sweeps: Sweep[];
  hm: HM[];
  presets: PresetBaseYear[];
}
const data = raw as unknown as Stage2Data;

const PRESET_IDS = ["preset-business-service", "preset-brand"];
const sweepOf = (id: string, preset: string, theta: number, sigmaW = 4) => data.sweeps.find((s) => s.id === id && s.preset === preset && s.theta === theta && s.sigmaW === sigmaW)!;
const pct = (v: number) => 100 * v;
const statusOf = (c: CheckRow): Status => (c.pass === null ? "reported" : c.pass ? "pass" : c.known ? "known" : "fail");
const SHORT: Record<string, string> = {
  "inc-M-matched": "M incumbents, matched",
  "inc-M-unmatched": "M incumbents, unmatched",
  "inc-D-matched": "D incumbents, matched",
  "inc-D-unmatched": "D incumbents, unmatched",
  "gen-matched": "General, matched",
  "gen-unmatched": "General, unmatched",
};

function header() {
  const head = h("header");
  head.append(allStagesLink(), h("h1", __SITE_STAGE_TITLE__));
  head.appendChild(
    h(
      "p",
      "Spec steps 3 to 5: a second sector, so manufacturing (M) and design (D) buy from each other; two firms in each sector; and six worker types: each sector’s incumbents and general workers, each split into those who can use the new technology (matched) and those who can’t. Both of research’s presets are solved: business service, where M sells to households and buys design, and brand (“Cupertino”), where D sells the finished product and buys manufacturing. Each technology level is still solved as its own equilibrium (Stage A).",
    ),
  );
  const tested = data.checks.filter((c) => c.pass !== null);
  const count = (s: Status) => tested.filter((c) => statusOf(c) === s).length;
  const tiles = h("div", undefined, "tiles");
  const tile = (label: string, value: string, note: string) => {
    const t = h("div", undefined, "tile");
    t.append(h("div", label, "tile-label"), h("div", value, "tile-value"), h("div", note, "tile-note"));
    tiles.appendChild(t);
  };
  tile("Checks passed", `${count("pass")} of ${tested.length}`, "stage 1’s tests 1–10 and 13, and stage 2’s 11–17");
  tile("Known findings", String(count("known")), "from stage 1: θ = 200 is too small for some step 2 limits");
  tile("Unexpected failures", String(count("fail")), count("fail") ? "need investigating" : "none");
  tile("Solves", data.solves.toLocaleString("en-GB"), `made when the page was built, in ${data.seconds.toFixed(0)} s`);
  head.appendChild(tiles);
  const nav = h("nav");
  for (const [id, label] of [
    ["findings", "What stage 2 shows"],
    ["ai-design", "AI in design"],
    ["automate-m", "Automation in manufacturing"],
    ["one-firm", "One firm adopts"],
    ["upstream", "Design upstream"],
    ["tests", "Test report"],
    ["presets", "Presets"],
    ["tables", "Tables"],
  ]) {
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = label!;
    nav.appendChild(a);
  }
  head.appendChild(nav);
  app.appendChild(head);
}

function findings() {
  const s = section("findings", "What stage 2 shows", "Read with the charts below. Unless stated, θ = 200 (people move readily between jobs) and σ_w = 4.");
  const ul = h("ul", undefined, "findings");
  for (const text of [
    "Technology in one sector moves jobs in the other, through the supply chain. Automating manufacturing in the business-service preset raises design employment far more than manufacturing’s own: manufacturing sells much more, and each unit needs design. AI in design in the brand preset adds manufacturing jobs while design jobs fall.",
    "In the brand preset, AI in design can only cut the brand’s price so far: 60% of its cost is bought-in manufacturing. So demand grows less than design productivity, and design employment falls.",
    "Incumbents who can’t use the technology lose most: unmatched design incumbents lose about 28% of real income under AI in design in both presets, while consumers everywhere gain a few per cent through prices.",
    "Incumbents of the other sector can gain a lot. Under automation in manufacturing, design incumbents gain about a quarter in real income in the business-service preset, as demand for design grows.",
    "When people move reluctantly (θ = 5), the other sector becomes a bottleneck. Its price rises as it expands, which damps the gains and can turn winners into losers: in the brand preset with a large AI gain (g = 3), even matched design incumbents lose.",
    "One firm that adopts takes market share through its lower price, by an amount set by σ_w. Workers aren’t attached to firms yet, so the non-adopter’s workers simply move.",
    "Design that’s sold mostly to manufacturers moves final prices little, so its own demand responds weakly, as the plan’s Hicks–Marshall reasoning predicts. With fixed input coefficients, how much design each product uses can’t grow (σ_DM is a later step).",
  ]) ul.appendChild(h("li", text));
  s.appendChild(ul);
}

const empSeries = (sw: Sweep): Series[] => [
  { label: "Manufacturing (M)", slot: 1, points: sw.rows.map((r) => [r.level, pct(r.empChange[0]!)]) },
  { label: "Design (D)", slot: 2, points: sw.rows.map((r) => [r.level, pct(r.empChange[1]!)]) },
];
const priceSeries = (sw: Sweep): Series[] => [
  { label: "Manufacturing (M)", slot: 1, points: sw.rows.map((r) => [r.level, r.price[0]!]) },
  { label: "Design (D)", slot: 2, points: sw.rows.map((r) => [r.level, r.price[1]!]) },
];

function ledgerFor(sw: Sweep, level: number, symbol: string) {
  const row = sw.rows.reduce((best, r) => (Math.abs(r.level - level) < Math.abs(best.level - level) ? r : best));
  return ledgerChart({
    title: `${sw.presetTitle}, θ = ${sw.theta}`,
    subtitle: `Change in real income at ${symbol} = ${fmt(row.level)}, % of base-year income`,
    unit: "% of base-year income",
    rows: row.types.map((t) => ({ label: SHORT[t.id] ?? t.label, pay: pct(t.pay ?? 0), price: pct(t.price ?? 0) })),
  });
}

function techSection(id: string, title: string, intro: string, ledgerLevel: number, xLabel: string) {
  const s = section(id, title, intro);
  for (const theta of [200, 5]) {
    s.appendChild(h("h3", theta === 200 ? "θ = 200: people move readily" : "θ = 5: people move reluctantly"));
    const grid = h("div", undefined, "chart-grid four");
    for (const p of PRESET_IDS) {
      const sw = sweepOf(id, p, theta);
      grid.appendChild(lineChart({ compact: true, title: `${sw.presetTitle}: employment`, subtitle: "Change from the base year", xLabel, yLabel: "Change (%)", series: empSeries(sw), hline: { y: 0, label: "base year" } }));
      grid.appendChild(lineChart({ compact: true, title: `${sw.presetTitle}: prices`, subtitle: "Sector prices (base year 1)", xLabel, yLabel: "Price", series: priceSeries(sw), hline: { y: 1, label: "base year" } }));
    }
    s.appendChild(grid);
  }
  s.appendChild(h("h3", "Who gains: the gains ledger"));
  s.appendChild(h("p", "Each type’s change in real income, split into a pay part (as earners) and a price part (as consumers of cheaper goods). Hover a bar for its parts."));
  const grid = h("div", undefined, "chart-grid four");
  for (const p of PRESET_IDS) for (const theta of [200, 5]) grid.appendChild(ledgerFor(sweepOf(id, p, theta), ledgerLevel, xLabel));
  s.appendChild(grid);
}

function oneFirm() {
  const s = section(
    "one-firm",
    "One firm adopts",
    "Manufacturing firm M1 alone becomes more productive (every worker’s output × A); M2 doesn’t. Buyers split their purchases between the two by price, with elasticity σ_w. The plan’s map 5 (σ_w against one firm adopting) builds on this. θ = 200.",
  );
  const grid = h("div", undefined, "chart-grid four");
  for (const p of PRESET_IDS) {
    const sws = [2, 4, 10].map((sw) => sweepOf("one-firm", p, 200, sw));
    const title = sws[0]!.presetTitle;
    grid.appendChild(
      lineChart({
        compact: true,
        title: `${title}: M1’s share of manufacturing`,
        xLabel: "M1’s productivity A",
        yLabel: "Share (%)",
        series: sws.map((sw, i) => ({ label: `σ_w = ${sw.sigmaW}`, slot: (i + 1) as 1 | 2 | 3, points: sw.rows.map((r) => [r.level, pct(r.firmShare[0]!)]) })),
        hline: { y: 50, label: "equal shares" },
        yDomain: [40, 100],
      }),
    );
    grid.appendChild(
      lineChart({
        compact: true,
        title: `${title}: manufacturing employment`,
        subtitle: "Change in the sector’s employment, both firms",
        xLabel: "M1’s productivity A",
        yLabel: "Change (%)",
        series: sws.map((sw, i) => ({ label: `σ_w = ${sw.sigmaW}`, slot: (i + 1) as 1 | 2 | 3, points: sw.rows.map((r) => [r.level, pct(r.empChange[0]!)]) })),
        hline: { y: 0, label: "base year" },
      }),
    );
  }
  s.appendChild(grid);
}

function upstream() {
  const s = section(
    "upstream",
    "Design upstream: the Hicks–Marshall check",
    "A 1% productivity gain in design, and how much more design is bought. Design’s price falls by the pass-through: less than 1%, because part of its price is bought-in manufacturing (most of it, in the brand preset). With fixed input coefficients, demand for design is then a mix of households’ own demand (elasticity ε_D) and manufacturers’ derived demand (design’s cost share s in manufacturing, times manufacturing’s elasticity ε_M). The approximation weights them by design’s sales to each and multiplies by the pass-through. It ignores income effects and the supply chain’s second round, so it’s a guide, not an exact test.",
  );
  s.appendChild(
    simpleTable(
      ["Preset", "θ", "Design sold to households", "s: design’s cost share in M", "ε_M", "ε_D", "Pass-through to design’s price", "Model: d ln (design output) / d ln A_D", "Approximation", "If sold only to manufacturers", "Model: d ln (design employment) / d ln A_D"],
      data.hm.map((r) => [r.preset, String(r.theta), `${fmt(pct(r.finalShare))}%`, fmt(r.costShare), fmt(r.epsM), fmt(r.epsD), fmt(r.passThrough), fmt(r.designOutput), fmt(r.approxOutput), fmt(r.upstreamOnly), fmt(r.designEmployment)]),
    ),
  ).className = "num";
  s.appendChild(h("p", "Design employment changes by the output response minus 1, so it falls whenever design output responds by less than one-for-one. In the business-service preset 40% of design is sold to households, which props up its demand; a design sector sold wholly to manufacturers would respond with only s · ε_M times the pass-through."));
}

function tests() {
  const s = section("tests", "Test report", "Stage 1’s tests still run, and stage 2 adds tests 11 to 17. Tests 11 to 13 are the spec’s; 14 to 17 are the build’s own checks of the new machinery: the six types, the solver from cold starts, agreement between the two solvers, and the accounting identities.");
  const groups = [...new Set(data.checks.map((c) => c.test))].sort((a, b) => parseInt(a) - parseInt(b));
  for (const g of groups) {
    const rows = data.checks.filter((c) => c.test === g);
    const det = document.createElement("details");
    const bad = rows.filter((c) => statusOf(c) === "fail" || statusOf(c) === "known").length;
    const sum = h("summary");
    sum.append(h("span", g, "group-name"), h("span", bad ? `${bad} of ${rows.length} not passing` : rows.every((c) => c.pass === null) ? "reported only" : `all ${rows.filter((c) => c.pass).length} pass`, "group-count"));
    det.appendChild(sum);
    const t = simpleTable(["Check", "Expected", "Model", "Tolerance", "Result", "Note"], []);
    for (const c of rows) {
      const tr = t.tBodies[0]!.insertRow();
      tr.insertCell().textContent = c.label;
      tr.insertCell().textContent = fmt(c.expected);
      tr.insertCell().textContent = fmt(c.actual);
      tr.insertCell().textContent = tolText(c);
      tr.insertCell().appendChild(statusCell(statusOf(c)));
      tr.insertCell().textContent = c.known ?? c.note ?? "";
    }
    t.className = "num";
    det.appendChild(t);
    s.appendChild(det);
  }
}

function presets() {
  const s = section("presets", "The presets", "Research’s recipe sets the sectors first and derives the population, so the base year fits by construction; stage 2 now solves it, from piece rates 20% too high and too low, with one and two firms per sector (test 13).");
  for (const b of data.presets) {
    s.appendChild(h("h3", b.spec.title));
    const ids = b.spec.sectors.map((x) => `${x.label} (${x.id})`);
    const p = (v: number) => `${(100 * v).toFixed(1)}%`;
    s.appendChild(
      simpleTable(["", ...ids, "X"], [
        ["Household spending share", ...b.spec.sectors.map((x) => p(x.spendingShare)), p(1 - b.spec.sectors.reduce((a, x) => a + x.spendingShare, 0))],
        ["Piece rate ω (price 1 minus input cost)", ...b.pieceRate.map((v) => v.toFixed(4)), "–"],
        ["Headcount", ...b.headcount.sectors.map(p), p(b.headcount.X)],
        ["Incumbents of this sector, share of people", ...b.population.incumbents.map(p), `general workers: ${p(b.population.general)}`],
      ]),
    ).className = "num";
  }
}

function tables() {
  const s = section("tables", "Scenario tables", "Every level of every sweep on this page. Each table can be downloaded as CSV.");
  for (const sw of data.sweeps) {
    const det = document.createElement("details");
    const sum = h("summary");
    const name = sw.id === "ai-design" ? "AI in design" : sw.id === "automate-m" ? "Automation in manufacturing" : "One firm adopts";
    sum.append(h("span", `${name}: ${sw.presetTitle}, θ = ${sw.theta}${sw.id === "one-firm" ? `, σ_w = ${sw.sigmaW}` : ""}`, "group-name"), h("span", `${sw.rows.length} levels`, "group-count"));
    det.appendChild(sum);
    const types = sw.rows[0]!.types;
    const t: Table = {
      title: sw.levelLabel,
      header: [sw.levelLabel, "Price M", "Price D", "Output M (× base)", "Output D (× base)", "Employment M (change)", "Employment D (change)", "M1 share", "D1 share", ...types.flatMap((x) => [`${SHORT[x.id] ?? x.label}: real income`, "pay part", "price part", "share working in firms"])],
      rows: sw.rows.map((r) => [
        fmt(r.level),
        fmt(r.price[0]!),
        fmt(r.price[1]!),
        fmt(r.output[0]!),
        fmt(r.output[1]!),
        `${fmt(pct(r.empChange[0]!))}%`,
        `${fmt(pct(r.empChange[1]!))}%`,
        fmt(r.firmShare[0]!),
        fmt(r.firmShare[2]!),
        ...r.types.flatMap((x) => [`${fmt(pct(x.ev ?? NaN))}%`, `${fmt(pct(x.pay ?? NaN))}%`, `${fmt(pct(x.price ?? NaN))}%`, `${fmt(pct(x.inHome ?? NaN))}%`]),
      ]),
    };
    const head = h("div", undefined, "table-head");
    head.append(h("h4", "Real income figures are % of each type’s base-year income"), csvLink(t, `${sw.id}-${sw.preset}-theta${sw.theta}-sigmaw${sw.sigmaW}`));
    det.appendChild(head);
    const scroll = h("div", undefined, "scroll");
    const table = simpleTable(t.header, t.rows);
    table.className = "num";
    scroll.appendChild(table);
    det.appendChild(scroll);
    s.appendChild(det);
  }
}

export function startStage2() {
  app.replaceChildren();
  header();
  findings();
  techSection("ai-design", "AI in design", "Both design firms adopt an augmenting technology: matched workers’ output in design rises by 1 + g (half of each type is matched). In the business-service preset design is mostly an input to manufacturing; in the brand preset it is the product households buy.", 1, "g");
  techSection("automate-m", "Automation in manufacturing", "Both manufacturing firms get a machine technique with output A_m per minder. Only matched general workers can mind machines (the spec’s default), so manufacturing incumbents can’t follow their work onto the machines.", 3, "A_m");
  oneFirm();
  upstream();
  tests();
  presets();
  tables();
  section("about", "About", `This page’s results were computed when it was built (${data.generated.slice(0, 10)}) and are embedded in it. Stage 1’s page, with the one-sector tests, charts and regime maps, is linked from the list of stages.`);
}
