import { lineChart, simpleTable } from "./chart";
import { buildReportData, type ReportData, type Table } from "./data";
import { knownFinding } from "../checks/known-findings";
import { allStagesLink, app, csvLink, fmt, h, section, statusCell, tolText, type Status } from "./common";
import type { Check } from "../checks/context";
import { MAPS } from "../batch/maps";

function statusOf(c: Check): Status {
  if (c.pass === null) return "reported";
  if (c.pass) return "pass";
  return knownFinding(c.test, c.label) ? "known" : "fail";
}

function render(d: ReportData) {
  app.replaceChildren();
  const header = h("header");
  header.append(
    allStagesLink(),
    h("h1", __SITE_STAGE_TITLE__),
    h("p", "Steps 1 and 2 of the build: one sector plus “everything else” (X), with one and then four worker types, and technology that augments or automates. Each technology level is solved as its own equilibrium (Stage A). Everything on this page is computed in your browser by the model’s engine when the page loads."),
  );
  app.appendChild(header);

  // Summary tiles.
  const tested = d.checks.checks.filter((c) => c.pass !== null);
  const counts = { pass: 0, fail: 0, known: 0 };
  tested.forEach((c) => counts[statusOf(c) as "pass" | "fail" | "known"]++);
  const tiles = h("div", undefined, "tiles");
  const tile = (label: string, value: string, note: string) => {
    const t = h("div", undefined, "tile");
    t.append(h("div", label, "tile-label"), h("div", value, "tile-value"), h("div", note, "tile-note"));
    tiles.appendChild(t);
  };
  tile("Checks passed", `${counts.pass} of ${tested.length}`, "spec tests 1–10 and preset check values");
  tile("Known findings", String(counts.known), "fail for a known reason: θ = 200 is too small (below)");
  tile("Unexpected failures", String(counts.fail), counts.fail ? "need investigating" : "none");
  tile("Solves", d.checks.solves.toLocaleString("en-GB"), `in the checks; page computed in ${(d.millis / 1000).toFixed(1)} s`);
  header.appendChild(tiles);

  const nav = h("nav");
  for (const [id, label] of [["tests", "Test report"], ["theta", "Why some tests fail"], ["charts", "Charts"], ["maps", "Regime maps"], ["presets", "Preset base years"], ["tables", "Scenario tables"], ["about", "About"]]) {
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = label!;
    nav.appendChild(a);
  }
  header.appendChild(nav);

  // Test report.
  const tests = section("tests", "Test report", "Each check from the spec, with its expected value (research’s hand-worked derivation), the model’s value, and the tolerance. The spec’s “about 1 percentage point” is read as ± 0.01 on changes and shares, and ± 1% on levels such as prices and pay. Accounting identities must hold to one part in a billion.");
  const groups = [...new Set(d.checks.checks.map((c) => c.test))].sort((a, b) => parseInt(a) - parseInt(b));
  for (const g of groups) {
    const rows = d.checks.checks.filter((c) => c.test === g);
    const det = document.createElement("details");
    const bad = rows.filter((c) => statusOf(c) === "fail" || statusOf(c) === "known").length;
    det.open = bad > 0;
    const sum = h("summary");
    sum.append(h("span", g, "group-name"), h("span", bad ? `${bad} of ${rows.length} not passing` : rows.every((c) => c.pass === null) ? "reported only" : `all ${rows.filter((c) => c.pass).length} pass`, "group-count"));
    det.appendChild(sum);
    const t = simpleTable(["Check", "Expected", "Model", "Tolerance", "Result", "Note"], []);
    const tb = t.tBodies[0]!;
    for (const c of rows) {
      const tr = tb.insertRow();
      tr.insertCell().textContent = c.label;
      tr.insertCell().textContent = fmt(c.expected);
      tr.insertCell().textContent = fmt(c.actual);
      tr.insertCell().textContent = tolText(c);
      tr.insertCell().appendChild(statusCell(statusOf(c)));
      tr.insertCell().textContent = knownFinding(c.test, c.label)?.reason ?? c.note ?? "";
    }
    t.className = "num";
    det.appendChild(t);
    tests.appendChild(det);
  }

  // θ.
  const th = section(
    "theta",
    "Why some tests fail: θ = 200 is too small in step 2",
    "θ sets how sharply people sort by pay. The hand-worked values assume it is effectively infinite, so that pay in the sector is pinned to pay in X. In step 1 that holds at θ = 200, because the one worker type barely needs to move. In step 2, whole types must move into or out of a sector that is 0.1% of spending, or only a few of them must: matched workers in test 6, minders in test 8. Logit sorting then needs a pay gap of a few per cent to move them, so prices stop short of the hand-worked limits.",
    "The table runs the failing cases at rising θ. Every value converges to research’s expected value, which confirms both the engine and the derivations. The tests themselves still run at the spec’s θ = 200; the choice is for research (see plan/findings-for-research.md).",
  );
  th.appendChild(simpleTable(["θ", ...d.theta.columns.map((c) => c.label)], [
    ["Expected", ...d.theta.columns.map((c) => fmt(c.expected))],
    ...d.theta.rows.map((r) => [r.theta.toLocaleString("en-GB"), ...d.theta.columns.map((c) => fmt(r.values[c.key]!))]),
  ])).className = "num";
  th.appendChild(h("h3", "Solver from cold starts"));
  th.appendChild(h("p", "Each scenario solved from piece rates of 0.001, 0.01, 0.1, 0.5, 2, 10, 100 and 1,000."));
  th.appendChild(simpleTable(["Scenario", "Starts", "Converged", "Largest spread in price", "Most iterations"], d.coldStarts.map((r) => [r.scenario, String(r.starts), String(r.converged), fmt(r.priceSpread), String(r.maxIterations)]))).className = "num";

  // Charts.
  const ch = section("charts", "Charts", "Hover over a chart, or focus it and use the arrow keys, to read every series at one point. Hollow rings are research’s hand-worked expected values. Each chart has a table view.");
  const grid1 = h("div", undefined, "chart-grid one");
  grid1.appendChild(
    lineChart({
      title: "1. Sector employment against productivity",
      subtitle: "Change in sector employment from the base year, θ = 200. Bessen’s inverted U on the young curve; a steady fall on the mature curve. At 10% of spending, closing the model damps the rise.",
      xLabel: "Productivity A",
      yLabel: "Change in employment (%)",
      series: [
        { label: "Young curve, 0.1% of spending", slot: 1, points: d.chart1.young },
        { label: "Mature curve, 0.1% of spending", slot: 2, points: d.chart1.mature },
        { label: "Young curve, 10% of spending", slot: 3, points: d.chart1.young10 },
      ],
      expected: [
        { x: 2, y: 55.7, label: "young, A = 2" },
        { x: 2.77, y: 63.2, label: "young peak" },
        { x: 8.86, y: 0, label: "young, back to start" },
        { x: 2, y: -40.7, label: "mature, A = 2" },
      ],
      hline: { y: 0, label: "base year" },
      yFormat: (v) => `${Number(v.toPrecision(3))}`,
    }),
  );
  ch.appendChild(grid1);

  ch.appendChild(h("h3", "2. Augmenting: who gets the gain depends on how many can use it"));
  ch.appendChild(h("p", "Test 6. Matched workers’ output doubles (g = 1). η is the number of matched people as a multiple of the sector’s base-year employment. While they are scarce (η < 0.5), the unmatched still set the price and the matched earn a premium. Once they are plentiful (η > 1.56), the gain passes to consumers as a lower price, and demand grows. In between, the gain is shared. Shown at the spec’s θ = 200 and at θ = 2,000, where the hand-worked limits hold."));
  const grid2 = h("div", undefined, "chart-grid three");
  const etaLines = [{ x: 0.5, label: "regime boundaries η = 0.5 and 1.56" }, { x: 1.557, label: "" }];
  const two = (pts: [number, number][][]) => [
    { label: "θ = 200", slot: 1 as const, points: pts[0]! },
    { label: "θ = 2,000", slot: 2 as const, points: pts[1]! },
  ];
  grid2.append(
    lineChart({ compact: true, title: "Price", xLabel: "η", yLabel: "Price", series: two(d.chart2.price), vlines: etaLines, expected: [{ x: 0.4, y: 1, label: "η = 0.4" }, { x: 1, y: 0.68, label: "η = 1" }, { x: 2, y: 0.5, label: "η = 2" }] }),
    lineChart({ compact: true, title: "Matched workers’ pay", subtitle: "Relative to their pay in X (1)", xLabel: "η", yLabel: "Pay", series: two(d.chart2.pay), vlines: etaLines, hline: { y: 1, label: "X pay" }, expected: [{ x: 0.4, y: 2, label: "η = 0.4" }, { x: 1, y: 1.36, label: "η = 1" }, { x: 2, y: 1, label: "η = 2" }] }),
    lineChart({ compact: true, title: "Sector employment", subtitle: "Change from the base year", xLabel: "η", yLabel: "Change (%)", series: two(d.chart2.emp), vlines: etaLines, hline: { y: 0, label: "base year" }, expected: [{ x: 0.4, y: -40, label: "η = 0.4" }, { x: 1, y: 0, label: "η = 1" }, { x: 2, y: 55.7, label: "η = 2" }] }),
  );
  ch.appendChild(grid2);

  ch.appendChild(h("h3", "3. Automating: the hand-loom case"));
  ch.appendChild(h("p", "Tests 8 and 9. A machine technique with output A_m per minder. By default incumbent craft workers (2 × X pay in the base year) can’t mind machines and matched general workers can; under pure deskilling everyone can. θ = 200."));
  const grid3 = h("div", undefined, "chart-grid three");
  const amLine = [{ x: 8 / 3, label: "A_m = 8/3, the spec’s case" }];
  grid3.append(
    lineChart({
      compact: true,
      title: "Incumbents’ pay",
      subtitle: "In the old technique (default), and on the machines (pure deskilling)",
      xLabel: "A_m",
      yLabel: "Pay",
      series: [
        { label: "Old technique (default)", slot: 1, points: d.chart3.payOld },
        { label: "Machines (pure deskilling)", slot: 2, points: d.chart3.payMachineDeskill },
      ],
      vlines: amLine,
      hline: { y: 1, label: "X pay" },
      expected: [{ x: 8 / 3, y: 0.75, label: "old technique" }, { x: 8 / 3, y: 1, label: "machines" }],
    }),
    lineChart({
      compact: true,
      title: "Employment on each technique",
      subtitle: "Default case, relative to base-year sector employment",
      xLabel: "A_m",
      yLabel: "× base employment",
      series: [
        { label: "Old technique", slot: 1, points: d.chart3.empOld },
        { label: "Machine technique", slot: 2, points: d.chart3.empMachine },
      ],
      vlines: amLine,
    }),
    lineChart({
      compact: true,
      title: "Incumbents’ change in real income",
      subtitle: "Equivalent variation, % of base-year income. The two lines coincide: being able to mind machines doesn’t save the premium.",
      xLabel: "A_m",
      yLabel: "Change (%)",
      series: [
        { label: "Default", slot: 1, points: d.chart3.evDefault },
        { label: "Pure deskilling", slot: 2, points: d.chart3.evDeskill },
      ],
      vlines: amLine,
      hline: { y: 0, label: "no change" },
    }),
  );
  ch.appendChild(grid3);

  // Regime maps: static images, made offline by src/batch/run-maps.ts.
  const mp = section(
    "maps",
    "Regime maps",
    "Each map solves the model on a grid of two parameters, at three values of θ: how sharply people sort by pay (θ = 5 is a wide spread of personal tastes, θ = 200 nearly everyone chasing the best pay). Dashed lines are research’s hand-worked boundaries, which hold for large θ and a small sector; solid lines are the model’s own contours. These are made offline, not computed in your browser; every cell’s values are in the CSV.",
  );
  for (const m of MAPS) {
    mp.appendChild(h("h3", m.title));
    mp.appendChild(h("p", m.description));
    const links = h("p", undefined, "muted");
    const csv = document.createElement("a");
    csv.href = `maps/${m.id}.csv`;
    csv.textContent = "Data for every cell (CSV)";
    links.append(csv, document.createTextNode(` · ${m.x.values.length} × ${m.y.values.length} grid × ${m.thetas.length} values of θ`));
    mp.appendChild(links);
    for (const o of m.outcomes) {
      const fig = h("figure", undefined, "map");
      const img = document.createElement("img");
      img.src = `maps/${m.id}-${o.key}.svg`;
      img.alt = `${o.label}: ${m.title}, at θ = ${m.thetas.join(", ")}. Values are in the CSV.`;
      img.loading = "lazy";
      fig.appendChild(img);
      mp.appendChild(fig);
    }
  }

  // Presets.
  const pr = section("presets", "Preset base years (steps 3 to 5, built early)", "The two presets of the two-sector model, built by research’s recipe: prices are 1, sectors are sized from household spending and the input coefficients, and the population follows. No solve is needed, so these come before the solver handles two sectors. Values are shares of the population, or per head of population.");
  for (const b of d.presets) {
    pr.appendChild(h("h3", b.spec.title));
    if (b.spec.description) pr.appendChild(h("p", b.spec.description));
    const ids = b.spec.sectors.map((s) => `${s.label} (${s.id})`);
    const p = (v: number) => `${(100 * v).toFixed(1)}%`;
    const n = (v: number) => v.toFixed(4);
    pr.appendChild(
      simpleTable(["", ...ids, "X"], [
        ["Household spending share", ...b.spec.sectors.map((s) => p(s.spendingShare)), p(1 - b.spec.sectors.reduce((a, s) => a + s.spendingShare, 0))],
        ["Piece rate ω (price 1 minus input cost)", ...b.pieceRate.map(n), "–"],
        ["Price built up through the chain, ω · B", ...b.priceFromChain.map(n), "1"],
        ["Final demand (households)", ...b.finalDemand.map(n), n(b.headcount.X)],
        ...b.spec.sectors.map((s, k) => [`Sold to ${s.label.toLowerCase()} firms`, ...b.intermediate.map((row) => n(row[k]!)), "–"]),
        ["Output", ...b.output.map(n), n(b.headcount.X)],
        ["Headcount", ...b.headcount.sectors.map(p), p(b.headcount.X)],
        ["Incumbents working at home", ...b.placement.incumbentsAtHome.map(p), `${p(b.placement.incumbentsInX.reduce((a, c) => a + c, 0))} (incumbents working in X)`],
        ["General workers", ...b.placement.generalInSectors.map(p), p(b.placement.generalInX)],
        ["Output per worker: incumbent / general", ...b.outputPerWorker.incumbent.map((v, k) => `${v.toFixed(3)} / ${b.outputPerWorker.general[k]!.toFixed(3)}`), "1 / 1"],
        ["Incumbents of this sector, share of people", ...b.population.incumbents.map(p), `general workers: ${p(b.population.general)}`],
      ]),
    ).className = "num";
    pr.appendChild(h("p", `Income per head: ${b.incomePerHead.toFixed(4)}. Leontief inverse B: ${b.leontief.map((r) => `[${r.map((v) => v.toFixed(4)).join(", ")}]`).join(", ")}.`, "muted"));
  }

  // Scenario tables.
  const tb = section("tables", "Scenario tables", "One row per level of each scenario’s sweep, solved on its own from the base year. Each table can be downloaded as CSV.");
  for (const sr of d.scenarios) {
    const det = document.createElement("details");
    const sum = h("summary");
    sum.append(h("span", sr.scenario.title, "group-name"), h("span", `${sr.tables[0]!.rows.length} levels`, "group-count"));
    det.appendChild(sum);
    if (sr.scenario.description) det.appendChild(h("p", sr.scenario.description));
    for (const t of sr.tables) {
      const wrap = h("div", undefined, "table-wrap");
      const head = h("div", undefined, "table-head");
      head.append(h("h4", t.title), csvLink(t, `${sr.scenario.id}-${t.title.split(" ").slice(0, 3).join("-").toLowerCase().replace(/[^a-z-]/g, "")}`));
      wrap.appendChild(head);
      const scroll = h("div", undefined, "scroll");
      const table = simpleTable(t.header, t.rows);
      table.className = "num";
      scroll.appendChild(table);
      wrap.appendChild(scroll);
      det.appendChild(wrap);
    }
    tb.appendChild(det);
  }

  // About.
  section(
    "about",
    "About",
    "Design: research’s two-sector model plan. Equations, tests and expected values: research’s first build spec. Demand for the sector follows Bessen’s lognormal distribution of uses, set from two numbers (saturation and elasticity): the young curve starts at 10% of its ceiling with elasticity 2, the mature curve at 80% with elasticity 0.4. Workers sort across jobs by a logit in pay with sharpness θ. X pays each worker their output there and closes the model: it takes all spending not on the sector.",
    "Real income is the equivalent variation: the change in income that, at base-year prices, gives each type its current utility. It splits into a pay part (the change in income) and a price part (the rest: the gain or loss as a consumer).",
  );
}

/** Stage 1's page: computes the model in the browser when the page loads. */
export function startStage1() {
  app.replaceChildren(h("p", "Computing the model… (a few seconds)", "loading"));
  setTimeout(() => {
    try {
      render(buildReportData());
    } catch (e) {
      app.replaceChildren(h("p", `The model failed to compute: ${String(e)}`, "status fail"));
      throw e;
    }
  }, 30);
}
