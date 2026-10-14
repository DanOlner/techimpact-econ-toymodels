// Static SVG heatmaps: one panel per θ, side by side, sharing a colour scale. Hand-worked
// boundaries are dashed ink lines; the model's own contour (such as zero change) is a solid ink
// line; cells that failed to solve are marked with a cross.

import { diverging, ORDINAL, sequential } from "./colour";
import type { Boundary, MapDef, Outcome } from "./maps";

export interface Grid {
  theta: number;
  /** values[iy][ix]; NaN where the solve failed. */
  values: number[][];
}

const INK = "#0b0b0b";
const MUTED = "#898781";
const SECONDARY = "#52514e";
const SURFACE = "#fcfcfb";
const GRID = "#c3c2b7";

const PW = 300;
const PH = 260;
const M = { top: 64, left: 64, gap: 28, bottom: 124, right: 24 };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : Number(v.toPrecision(3)).toString());

function colourFor(o: Outcome, v: number): string {
  if (!Number.isFinite(v)) return SURFACE;
  switch (o.scale.kind) {
    case "diverging":
      return diverging(v / o.scale.limit);
    case "sequential": {
      const [a, b] = o.scale.domain;
      return sequential((v - a) / (b - a));
    }
    case "categorical":
      return ORDINAL[Math.round(v)] ?? SURFACE;
  }
}

/** Cell edges for an axis: midway between values, extended half a step at the ends. */
function edges(vals: number[], log: boolean): number[] {
  const t = vals.map((v) => (log ? Math.log(v) : v));
  const e = [t[0]! - (t[1]! - t[0]!) / 2];
  for (let i = 0; i < t.length - 1; i++) e.push((t[i]! + t[i + 1]!) / 2);
  e.push(t[t.length - 1]! + (t[t.length - 1]! - t[t.length - 2]!) / 2);
  return e;
}

function niceTicks(lo: number, hi: number, n: number): number[] {
  const step0 = (hi - lo) / n;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => (hi - lo) / s <= n) ?? 10 * mag;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toPrecision(10));
  return out;
}

/** Marching squares at a level, on values at grid points; returns segments in index coordinates. */
function contourSegments(values: number[][], level: number): [number, number, number, number][] {
  const segs: [number, number, number, number][] = [];
  for (let iy = 0; iy < values.length - 1; iy++) {
    for (let ix = 0; ix < values[0]!.length - 1; ix++) {
      const v = [values[iy]![ix]!, values[iy]![ix + 1]!, values[iy + 1]![ix + 1]!, values[iy + 1]![ix]!];
      if (v.some((x) => !Number.isFinite(x))) continue;
      const corners: [number, number][] = [[ix, iy], [ix + 1, iy], [ix + 1, iy + 1], [ix, iy + 1]];
      const pts: [number, number][] = [];
      for (let e = 0; e < 4; e++) {
        const a = v[e]! - level;
        const b = v[(e + 1) % 4]! - level;
        if ((a < 0 && b >= 0) || (a >= 0 && b < 0)) {
          const f = a / (a - b);
          const [x0, y0] = corners[e]!;
          const [x1, y1] = corners[(e + 1) % 4]!;
          pts.push([x0 + f * (x1 - x0), y0 + f * (y1 - y0)]);
        }
      }
      if (pts.length >= 2) segs.push([pts[0]![0], pts[0]![1], pts[1]![0], pts[1]![1]]);
      if (pts.length === 4) segs.push([pts[2]![0], pts[2]![1], pts[3]![0], pts[3]![1]]);
    }
  }
  return segs;
}

export function heatmapSvg(def: MapDef, outcome: Outcome, grids: Grid[]): string {
  const n = grids.length;
  const W = M.left + n * PW + (n - 1) * M.gap + M.right;
  const H = M.top + PH + M.bottom;
  const xe = edges(def.x.values, !!def.x.log);
  const ye = edges(def.y.values, !!def.y.log);
  const tx = (v: number) => (def.x.log ? Math.log(v) : v);
  const ty = (v: number) => (def.y.log ? Math.log(v) : v);
  const px = (t: number) => ((t - xe[0]!) / (xe[xe.length - 1]! - xe[0]!)) * PW;
  const py = (t: number) => PH - ((t - ye[0]!) / (ye[ye.length - 1]! - ye[0]!)) * PH;
  // Index coordinates (grid points) to pixels, for contours.
  const ix2p = (i: number) => {
    const lo = Math.floor(Math.min(i, def.x.values.length - 2));
    const f = i - lo;
    return px(tx(def.x.values[lo]!) + f * (tx(def.x.values[lo + 1]!) - tx(def.x.values[lo]!)));
  };
  const iy2p = (i: number) => {
    const lo = Math.floor(Math.min(i, def.y.values.length - 2));
    const f = i - lo;
    return py(ty(def.y.values[lo]!) + f * (ty(def.y.values[lo + 1]!) - ty(def.y.values[lo]!)));
  };

  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">`);
  out.push(`<style>.cell{shape-rendering:crispEdges}</style>`);
  out.push(`<rect width="${W}" height="${H}" fill="${SURFACE}"/>`);
  out.push(`<text x="${M.left}" y="24" font-size="16" font-weight="600" fill="${INK}">${esc(outcome.label)}${outcome.unit ? ` (${esc(outcome.unit)})` : ""}</text>`);
  out.push(`<text x="${M.left}" y="44" font-size="12" fill="${SECONDARY}">${esc(capitalise(def.title.replace(/^Map \d+: /, "")))}. One panel per θ: how sharply people sort by pay.</text>`);

  grids.forEach((g, k) => {
    const ox = M.left + k * (PW + M.gap);
    const oy = M.top;
    out.push(`<g transform="translate(${ox},${oy})">`);
    out.push(`<text x="0" y="-8" font-size="13" font-weight="600" fill="${INK}">θ = ${g.theta}</text>`);
    // Cells.
    g.values.forEach((row, iy) =>
      row.forEach((v, ix) => {
        const x0 = px(xe[ix]!);
        const x1 = px(xe[ix + 1]!);
        const y0 = py(ye[iy + 1]!);
        const y1 = py(ye[iy]!);
        out.push(`<rect x="${x0.toFixed(2)}" y="${y0.toFixed(2)}" width="${(x1 - x0 + 0.3).toFixed(2)}" height="${(y1 - y0 + 0.3).toFixed(2)}" class="cell" fill="${colourFor(outcome, v)}"/>`);
        if (!Number.isFinite(v)) {
          out.push(`<path d="M${x0 + 2},${y0 + 2}L${x1 - 2},${y1 - 2}M${x1 - 2},${y0 + 2}L${x0 + 2},${y1 - 2}" stroke="${MUTED}" stroke-width="1"/>`);
        }
      }),
    );
    // Model contour.
    if (outcome.contour !== undefined) {
      const segs = contourSegments(g.values, outcome.contour);
      const d = segs.map(([a, b, c, e]) => `M${ix2p(a).toFixed(1)},${iy2p(b).toFixed(1)}L${ix2p(c).toFixed(1)},${iy2p(e).toFixed(1)}`).join("");
      if (d) out.push(`<path d="${d}" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`);
    }
    // Hand-worked boundaries.
    for (const b of def.boundaries ?? []) {
      const pts = b.points.filter(([x, y]) => tx(x) >= xe[0]! && tx(x) <= xe[xe.length - 1]! && ty(y) >= ye[0]! && ty(y) <= ye[ye.length - 1]!);
      if (pts.length < 2) continue;
      const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${px(tx(x)).toFixed(1)},${py(ty(y)).toFixed(1)}`).join("");
      out.push(`<path d="${d}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="5 4" fill="none"/>`);
    }
    // Frame and ticks.
    out.push(`<rect x="0" y="0" width="${PW}" height="${PH}" fill="none" stroke="${GRID}" stroke-width="1"/>`);
    const xt = def.x.log ? [1, 2, 3, 5, 10].filter((v) => v >= def.x.values[0]! && v <= def.x.values[def.x.values.length - 1]!) : niceTicks(def.x.values[0]!, def.x.values[def.x.values.length - 1]!, 5);
    for (const t of xt) {
      const x = px(tx(t));
      out.push(`<line x1="${x}" x2="${x}" y1="${PH}" y2="${PH + 4}" stroke="${GRID}"/><text x="${x}" y="${PH + 16}" font-size="11" text-anchor="middle" fill="${MUTED}">${fmt(t)}</text>`);
    }
    for (const t of niceTicks(def.y.values[0]!, def.y.values[def.y.values.length - 1]!, 5)) {
      const y = py(ty(t));
      out.push(`<line x1="-4" x2="0" y1="${y}" y2="${y}" stroke="${GRID}"/><text x="-7" y="${y + 4}" font-size="11" text-anchor="end" fill="${MUTED}">${fmt(t)}</text>`);
    }
    out.push(`<text x="${PW / 2}" y="${PH + 34}" font-size="12" text-anchor="middle" fill="${SECONDARY}">${esc(def.x.label)}</text>`);
    if (k === 0) out.push(`<text transform="translate(-46,${PH / 2}) rotate(-90)" font-size="12" text-anchor="middle" fill="${SECONDARY}">${esc(def.y.label)}</text>`);
    out.push(`</g>`);
  });

  // Legend: colour scale, then line keys.
  const ly = M.top + PH + 56;
  let lx = M.left;
  const s = outcome.scale;
  if (s.kind === "categorical") {
    s.categories.forEach((c, i) => {
      out.push(`<rect x="${lx}" y="${ly - 10}" width="14" height="14" rx="2" fill="${ORDINAL[i]}"/><text x="${lx + 20}" y="${ly + 1}" font-size="12" fill="${SECONDARY}">${esc(c)}</text>`);
      lx += 30 + c.length * 7;
    });
  } else {
    const [a, b] = s.kind === "diverging" ? [-s.limit, s.limit] : s.domain;
    const bw = 220;
    for (let i = 0; i < 44; i++) {
      const v = a + ((b - a) * (i + 0.5)) / 44;
      out.push(`<rect x="${lx + (i * bw) / 44}" y="${ly - 10}" width="${bw / 44 + 0.3}" height="12" fill="${colourFor(outcome, v)}"/>`);
    }
    const mid = s.kind === "diverging" ? `<text x="${lx + bw / 2}" y="${ly + 16}" font-size="11" text-anchor="middle" fill="${MUTED}">0</text>` : "";
    out.push(`<text x="${lx}" y="${ly + 16}" font-size="11" fill="${MUTED}">${s.kind === "diverging" ? "≤ " : ""}${fmt(a)}</text>${mid}<text x="${lx + bw}" y="${ly + 16}" font-size="11" text-anchor="end" fill="${MUTED}">${s.kind === "diverging" ? "≥ " : ""}${fmt(b)}</text>`);
    lx += bw + 28;
  }
  if (outcome.contour !== undefined) {
    out.push(`<line x1="${lx}" x2="${lx + 22}" y1="${ly - 4}" y2="${ly - 4}" stroke="${INK}" stroke-width="1.5"/><text x="${lx + 28}" y="${ly}" font-size="12" fill="${SECONDARY}">model: ${fmt(outcome.contour)}${outcome.unit === "%" || outcome.unit.startsWith("%") ? "%" : ""} contour</text>`);
    lx += 150;
  }
  // Hand-worked boundaries, one per line under the colour scale.
  let by = ly + 34;
  if (def.boundaries?.length) {
    out.push(`<line x1="${M.left}" x2="${M.left + 22}" y1="${by - 4}" y2="${by - 4}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${M.left + 28}" y="${by}" font-size="12" fill="${SECONDARY}">${esc(boundaryLegend(def.boundaries))}</text>`);
    by += 18;
  }
  out.push(`<text x="${M.left}" y="${by}" font-size="11" fill="${MUTED}">A crossed cell marks a failed solve. Data for every cell: the CSV published with this image.</text>`);
  out.push(`</svg>`);
  return out.join("\n");
}

const capitalise = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function boundaryLegend(bs: Boundary[]): string {
  return `Hand-worked, for large θ and a small sector: ${bs.map((b) => b.label.replace(/^Hand-worked: /, "")).join("; ")}`;
}
