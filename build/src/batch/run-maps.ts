// Run the parameter-space maps offline: solve each grid, save the data, draw the images.
// Usage: npx tsx src/batch/run-maps.ts [map id ...]
// Writes maps/<id>/grid.csv and maps/<id>/meta.json (full data), and copies the images and CSV to
// src/report/public/maps/, which the report build publishes as docs/maps/.

import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { runScenario } from "../engine/sweep";
import { heatmapSvg, type Grid } from "./heatmap-svg";
import { MAPS, type MapDef } from "./maps";

const ROOT = join(import.meta.dirname, "..", "..");
const PUBLIC = join(ROOT, "src", "report", "public", "maps");

interface Cell {
  theta: number;
  x: number;
  y: number;
  values: Record<string, number>;
  converged: boolean;
  worstAccounting: number;
  iterations: number;
  error?: string;
}

function runMap(def: MapDef): Cell[] {
  const cells: Cell[] = [];
  for (const theta of def.thetas) {
    for (const y of def.y.values) {
      for (const x of def.x.values) {
        try {
          const r = runScenario(def.build(x, y, theta));
          const a = r.solution.accounting;
          cells.push({
            theta,
            x,
            y,
            values: Object.fromEntries(def.outcomes.map((o) => [o.key, o.get(r)])),
            converged: r.solution.solver.converged,
            worstAccounting: Math.max(a.spendingVsIncome, a.xBalance, a.shareSums, a.marketResidual),
            iterations: r.solution.solver.iterations,
          });
        } catch (e) {
          cells.push({ theta, x, y, values: Object.fromEntries(def.outcomes.map((o) => [o.key, NaN])), converged: false, worstAccounting: NaN, iterations: 0, error: String(e).replace(/[\n,]/g, " ") });
        }
      }
    }
  }
  return cells;
}

function main() {
  const wanted = process.argv.slice(2);
  mkdirSync(PUBLIC, { recursive: true });
  for (const def of MAPS.filter((m) => wanted.length === 0 || wanted.includes(m.id))) {
    const t0 = Date.now();
    const cells = runMap(def);
    const dir = join(ROOT, "maps", def.id);
    mkdirSync(dir, { recursive: true });

    // Data.
    const header = ["theta", def.x.key, def.y.key, ...def.outcomes.map((o) => o.key), "converged", "worst_accounting_gap", "iterations", "error"];
    const rows = cells.map((c) => [c.theta, c.x, c.y, ...def.outcomes.map((o) => c.values[o.key]), c.converged, c.worstAccounting, c.iterations, c.error ?? ""].join(","));
    writeFileSync(join(dir, "grid.csv"), [header.join(","), ...rows].join("\n") + "\n");
    const failed = cells.filter((c) => !c.converged).length;
    const worst = Math.max(...cells.filter((c) => c.converged).map((c) => c.worstAccounting));
    const meta = {
      id: def.id,
      title: def.title,
      description: def.description,
      x: { key: def.x.key, label: def.x.label, min: def.x.values[0], max: def.x.values[def.x.values.length - 1], n: def.x.values.length, log: !!def.x.log },
      y: { key: def.y.key, label: def.y.label, min: def.y.values[0], max: def.y.values[def.y.values.length - 1], n: def.y.values.length, log: !!def.y.log },
      thetas: def.thetas,
      outcomes: def.outcomes.map((o) => ({ key: o.key, label: o.label, unit: o.unit })),
      solves: cells.length,
      failed,
      worstAccountingGap: worst,
      seconds: (Date.now() - t0) / 1000,
      run: new Date().toISOString(),
    };
    writeFileSync(join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
    copyFileSync(join(dir, "grid.csv"), join(PUBLIC, `${def.id}.csv`));
    copyFileSync(join(dir, "meta.json"), join(PUBLIC, `${def.id}.json`));

    // Images: one per outcome.
    for (const o of def.outcomes) {
      const grids: Grid[] = def.thetas.map((theta) => ({
        theta,
        values: def.y.values.map((y) => def.x.values.map((x) => cells.find((c) => c.theta === theta && c.x === x && c.y === y)!.values[o.key]!)),
      }));
      const svg = heatmapSvg(def, o, grids);
      writeFileSync(join(dir, `${o.key}.svg`), svg);
      writeFileSync(join(PUBLIC, `${def.id}-${o.key}.svg`), svg);
    }
    console.log(`${def.id}: ${cells.length} solves, ${failed} failed, worst accounting gap ${worst.toExponential(1)}, ${meta.seconds.toFixed(1)} s`);
  }
}

main();
