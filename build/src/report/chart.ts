// Small SVG line charts: one y-axis, at most three series, a crosshair tooltip that snaps to the
// nearest x, expected points marked as hollow rings, optional vertical reference lines, a legend,
// and a table view. Colours come from CSS custom properties (style.css), so dark mode is one place.

export interface Series {
  label: string;
  /** Categorical slot 1–3, in fixed order. */
  slot: 1 | 2 | 3;
  points: [number, number][];
}

export interface Expected {
  x: number;
  y: number;
  label: string;
}

export interface ChartSpec {
  title: string;
  subtitle?: string;
  xLabel: string;
  yLabel: string;
  series: Series[];
  expected?: Expected[];
  vlines?: { x: number; label: string }[];
  /** A horizontal reference line, such as zero change or X pay. */
  hline?: { y: number; label: string };
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  yDomain?: [number, number];
  /** Narrower drawing for small multiples, so text stays legible when three sit side by side. */
  compact?: boolean;
}

const SVG = "http://www.w3.org/2000/svg";
const M = { top: 16, right: 20, bottom: 44, left: 58 };

function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>, parent?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  parent?.appendChild(e);
  return e;
}

function niceTicks(lo: number, hi: number, n = 5): number[] {
  const span = hi - lo || 1;
  const step0 = span / n;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n) ?? 10 * mag;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9 * step; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : v);
  return out;
}

const defaultFormat = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : Number(v.toPrecision(3)).toString());

export function lineChart(spec: ChartSpec): HTMLElement {
  const W = spec.compact ? 400 : 560;
  const H = spec.compact ? 290 : 300;
  const fx = spec.xFormat ?? defaultFormat;
  const fy = spec.yFormat ?? defaultFormat;
  const fig = document.createElement("figure");
  fig.className = "chart";
  const cap = document.createElement("figcaption");
  const h = document.createElement("h4");
  h.textContent = spec.title;
  cap.appendChild(h);
  if (spec.subtitle) {
    const p = document.createElement("p");
    p.className = "subtitle";
    p.textContent = spec.subtitle;
    cap.appendChild(p);
  }
  fig.appendChild(cap);

  // Legend: always present for two or more series; expected points and reference lines keyed too.
  const legend = document.createElement("ul");
  legend.className = "legend";
  const addKey = (cls: string, text: string) => {
    const li = document.createElement("li");
    const k = document.createElement("span");
    k.className = `key ${cls}`;
    li.append(k, document.createTextNode(text));
    legend.appendChild(li);
  };
  if (spec.series.length > 1) spec.series.forEach((s) => addKey(`line s${s.slot}`, s.label));
  if (spec.expected?.length) addKey("ring", "Hand-worked expected value");
  if (spec.vlines?.length) addKey("vline", spec.vlines.map((v) => v.label).filter(Boolean).join("; "));
  if (legend.children.length) fig.appendChild(legend);

  // Scales.
  const xs = spec.series.flatMap((s) => s.points.map((p) => p[0]));
  const ys = spec.series.flatMap((s) => s.points.map((p) => p[1])).concat((spec.expected ?? []).map((e) => e.y));
  if (spec.hline) ys.push(spec.hline.y);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  let [y0, y1] = spec.yDomain ?? [Math.min(...ys), Math.max(...ys)];
  if (!spec.yDomain) {
    const pad = (y1 - y0) * 0.08 || 0.1;
    y0 -= pad;
    y1 += pad;
  }
  let yt = niceTicks(y0, y1);
  if (!spec.yDomain && yt.length > 1) {
    // Snap the domain outwards to whole tick steps, so the axis ends on a labelled tick.
    const step = yt[1]! - yt[0]!;
    y0 = Math.floor(y0 / step + 1e-9) * step;
    y1 = Math.ceil(y1 / step - 1e-9) * step;
    yt = niceTicks(y0, y1);
  }
  const sx = (v: number) => M.left + ((v - x0) / (x1 - x0)) * (W - M.left - M.right);
  const sy = (v: number) => H - M.bottom - ((v - y0) / (y1 - y0)) * (H - M.top - M.bottom);

  const wrap = document.createElement("div");
  wrap.className = "plot";
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${spec.title}. Values are in the table below.`, tabindex: 0 });
  wrap.appendChild(svg);

  // Grid and axes: solid hairlines, recessive.
  const grid = el("g", { class: "grid" }, svg);
  for (const t of yt) {
    el("line", { x1: M.left, x2: W - M.right, y1: sy(t), y2: sy(t) }, grid);
    const lab = el("text", { x: M.left - 8, y: sy(t), "text-anchor": "end", "dominant-baseline": "middle", class: "tick" }, svg);
    lab.textContent = fy(t);
  }
  for (const t of niceTicks(x0, x1, spec.compact ? 6 : 8)) {
    const lab = el("text", { x: sx(t), y: H - M.bottom + 16, "text-anchor": "middle", class: "tick" }, svg);
    lab.textContent = fx(t);
  }
  el("line", { x1: M.left, x2: W - M.right, y1: H - M.bottom, y2: H - M.bottom, class: "axis" }, svg);
  const xl = el("text", { x: (M.left + W - M.right) / 2, y: H - 6, "text-anchor": "middle", class: "axis-label" }, svg);
  xl.textContent = spec.xLabel;
  const yl = el("text", { x: 14, y: (M.top + H - M.bottom) / 2, "text-anchor": "middle", class: "axis-label", transform: `rotate(-90 14 ${(M.top + H - M.bottom) / 2})` }, svg);
  yl.textContent = spec.yLabel;

  if (spec.hline && spec.hline.y >= y0 && spec.hline.y <= y1) {
    el("line", { x1: M.left, x2: W - M.right, y1: sy(spec.hline.y), y2: sy(spec.hline.y), class: "ref" }, svg);
    const t = el("text", { x: W - M.right, y: sy(spec.hline.y) - 4, "text-anchor": "end", class: "ref-label" }, svg);
    t.textContent = spec.hline.label;
  }
  for (const v of spec.vlines ?? []) {
    if (v.x < x0 || v.x > x1) continue;
    el("line", { x1: sx(v.x), x2: sx(v.x), y1: M.top, y2: H - M.bottom, class: "vref" }, svg);
  }

  // Lines: 2px, round joins; then expected points as hollow rings in ink.
  for (const s of spec.series) {
    const d = s.points.map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join("");
    el("path", { d, class: `series s${s.slot}` }, svg);
  }
  for (const e of spec.expected ?? []) {
    el("circle", { cx: sx(e.x), cy: sy(e.y), r: 5, class: "expected" }, svg);
  }

  // Hover layer: crosshair snapping to the nearest x, with one tooltip listing every series.
  const allX = [...new Set(xs)].sort((a, b) => a - b);
  const cross = el("line", { y1: M.top, y2: H - M.bottom, class: "crosshair", visibility: "hidden" }, svg);
  const dots = spec.series.map((s) => el("circle", { r: 4, class: `dot s${s.slot}`, visibility: "hidden" }, svg));
  const tip = document.createElement("div");
  tip.className = "tooltip";
  tip.hidden = true;
  wrap.appendChild(tip);
  let current = -1;
  const show = (i: number) => {
    current = Math.max(0, Math.min(allX.length - 1, i));
    const x = allX[current]!;
    cross.setAttribute("x1", String(sx(x)));
    cross.setAttribute("x2", String(sx(x)));
    cross.setAttribute("visibility", "visible");
    tip.replaceChildren();
    const head = document.createElement("div");
    head.className = "tip-head";
    head.textContent = `${spec.xLabel}: ${fx(x)}`;
    tip.appendChild(head);
    spec.series.forEach((s, k) => {
      const p = s.points.find((q) => q[0] === x);
      const dot = dots[k]!;
      if (!p) {
        dot.setAttribute("visibility", "hidden");
        return;
      }
      dot.setAttribute("cx", String(sx(p[0])));
      dot.setAttribute("cy", String(sy(p[1])));
      dot.setAttribute("visibility", "visible");
      const row = document.createElement("div");
      row.className = "tip-row";
      const key = document.createElement("span");
      key.className = `key line s${s.slot}`;
      const val = document.createElement("strong");
      val.textContent = fy(p[1]);
      const name = document.createElement("span");
      name.textContent = s.label;
      row.append(key, val, name);
      tip.appendChild(row);
    });
    for (const e of spec.expected ?? []) {
      if (Math.abs(e.x - x) / (x1 - x0) < 0.012) {
        const row = document.createElement("div");
        row.className = "tip-row muted";
        row.textContent = `Expected: ${fy(e.y)} (${e.label})`;
        tip.appendChild(row);
      }
    }
    tip.hidden = false;
    const left = (sx(x) / W) * 100;
    tip.style.left = left > 60 ? "" : `calc(${left}% + 12px)`;
    tip.style.right = left > 60 ? `calc(${100 - left}% + 12px)` : "";
  };
  const hide = () => {
    cross.setAttribute("visibility", "hidden");
    dots.forEach((d) => d.setAttribute("visibility", "hidden"));
    tip.hidden = true;
  };
  svg.addEventListener("pointermove", (ev) => {
    const r = svg.getBoundingClientRect();
    const vx = ((ev.clientX - r.left) / r.width) * W;
    const xv = x0 + ((vx - M.left) / (W - M.left - M.right)) * (x1 - x0);
    let best = 0;
    allX.forEach((v, i) => {
      if (Math.abs(v - xv) < Math.abs(allX[best]! - xv)) best = i;
    });
    show(best);
  });
  svg.addEventListener("pointerleave", hide);
  svg.addEventListener("focus", () => show(current < 0 ? 0 : current));
  svg.addEventListener("blur", hide);
  svg.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowRight") show(current + 1);
    else if (ev.key === "ArrowLeft") show(current - 1);
    else return;
    ev.preventDefault();
  });
  fig.appendChild(wrap);

  // Table view: every plotted value, reachable without hovering.
  const det = document.createElement("details");
  det.className = "table-view";
  const sum = document.createElement("summary");
  sum.textContent = "Table view";
  det.appendChild(sum);
  const header = [spec.xLabel, ...spec.series.map((s) => s.label)];
  const rows = allX.map((x) => [fx(x), ...spec.series.map((s) => {
    const p = s.points.find((q) => q[0] === x);
    return p ? fy(p[1]) : "";
  })]);
  det.appendChild(simpleTable(header, rows));
  if (spec.expected?.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = `Expected values: ${spec.expected.map((e) => `${e.label}: ${fx(e.x)} → ${fy(e.y)}`).join("; ")}.`;
    det.appendChild(p);
  }
  fig.appendChild(det);
  return fig;
}

export function simpleTable(header: string[], rows: string[][]): HTMLTableElement {
  const t = document.createElement("table");
  const thead = t.createTHead().insertRow();
  for (const h of header) {
    const th = document.createElement("th");
    th.textContent = h;
    thead.appendChild(th);
  }
  const tb = t.createTBody();
  for (const r of rows) {
    const tr = tb.insertRow();
    r.forEach((c) => {
      tr.insertCell().textContent = c;
    });
  }
  return t;
}

export interface LedgerRow {
  label: string;
  /** Pay part and price part, in the chart's unit; they can have different signs. */
  pay: number;
  price: number;
}

/**
 * The gains ledger as horizontal diverging stacked bars: one bar per worker type, split into its
 * pay part (slot 1) and price part (slot 2), losses to the left of zero and gains to the right.
 * The total is labelled at the bar's end.
 */
export function ledgerChart(spec: { title: string; subtitle?: string; rows: LedgerRow[]; unit: string; domain?: [number, number] }): HTMLElement {
  const fig = document.createElement("figure");
  fig.className = "chart";
  const cap = document.createElement("figcaption");
  const t = document.createElement("h4");
  t.textContent = spec.title;
  cap.appendChild(t);
  if (spec.subtitle) {
    const p = document.createElement("p");
    p.className = "subtitle";
    p.textContent = spec.subtitle;
    cap.appendChild(p);
  }
  fig.appendChild(cap);
  const legend = document.createElement("ul");
  legend.className = "legend";
  for (const [cls, text] of [["rect s1", "Pay part (as earners)"], ["rect s2", "Price part (as consumers)"]] as const) {
    const li = document.createElement("li");
    const k = document.createElement("span");
    k.className = `key ${cls}`;
    li.append(k, document.createTextNode(text));
    legend.appendChild(li);
  }
  fig.appendChild(legend);

  const W = 420;
  const rowH = 30;
  const M = { top: 22, right: 64, bottom: 30, left: 150 };
  const H = M.top + spec.rows.length * rowH + M.bottom;
  const neg = spec.rows.map((r) => Math.min(0, r.pay) + Math.min(0, r.price));
  const pos = spec.rows.map((r) => Math.max(0, r.pay) + Math.max(0, r.price));
  let [d0, d1] = spec.domain ?? [Math.min(0, ...neg), Math.max(0, ...pos)];
  const ticks = niceTicks(d0, d1, 5);
  const step = (ticks[1] ?? 1) - (ticks[0] ?? 0);
  d0 = Math.min(d0, Math.floor(d0 / step) * step);
  d1 = Math.max(d1, Math.ceil(d1 / step) * step);
  const sx = (v: number) => M.left + ((v - d0) / (d1 - d0)) * (W - M.left - M.right);

  const wrap = document.createElement("div");
  wrap.className = "plot";
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${spec.title}. Values are in the table below.` });
  wrap.appendChild(svg);
  for (const tk of niceTicks(d0, d1, 5)) {
    el("line", { x1: sx(tk), x2: sx(tk), y1: M.top, y2: H - M.bottom, class: tk === 0 ? "axis" : "gridv" }, svg);
    const lab = el("text", { x: sx(tk), y: H - M.bottom + 16, "text-anchor": "middle", class: "tick" }, svg);
    lab.textContent = defaultFormat(tk);
  }
  const totalHead = el("text", { x: W - 4, y: M.top - 8, "text-anchor": "end", class: "tick" }, svg);
  totalHead.textContent = "Total";
  const unitLab = el("text", { x: (M.left + W - M.right) / 2, y: H - 2, "text-anchor": "middle", class: "axis-label" }, svg);
  unitLab.textContent = spec.unit;

  const tip = document.createElement("div");
  tip.className = "tooltip";
  tip.hidden = true;
  wrap.appendChild(tip);
  const barH = 18;
  spec.rows.forEach((r, i) => {
    const yc = M.top + i * rowH + rowH / 2;
    const g = el("g", { class: "bar-row", tabindex: 0 }, svg);
    const name = el("text", { x: M.left - 8, y: yc + 4, "text-anchor": "end", class: "row-label" }, g);
    name.textContent = r.label;
    // Stack: positive parts rightwards from 0, negative parts leftwards, pay first.
    let right = 0;
    let left = 0;
    for (const [v, slot] of [[r.pay, 1], [r.price, 2]] as const) {
      if (v === 0) continue;
      const a = v > 0 ? right : left + v;
      const b = v > 0 ? right + v : left;
      if (v > 0) right += v;
      else left += v;
      const x0 = sx(a);
      const x1 = sx(b);
      // 2px surface gap between touching segments.
      const gap = 1;
      el("rect", { x: x0 + gap, y: yc - barH / 2, width: Math.max(0, x1 - x0 - 2 * gap), height: barH, rx: 2, class: `seg s${slot}` }, g);
    }
    // Totals in their own column on the right, so they never collide with labels or bars.
    const total = r.pay + r.price;
    const lab = el("text", { x: W - 4, y: yc + 4, "text-anchor": "end", class: "bar-total" }, g);
    lab.textContent = `${total > 0 ? "+" : ""}${defaultFormat(total)}`;
    el("rect", { x: 0, y: yc - rowH / 2, width: W, height: rowH, fill: "transparent" }, g);
    const show = () => {
      tip.replaceChildren();
      const head = document.createElement("div");
      head.className = "tip-head";
      head.textContent = r.label;
      tip.appendChild(head);
      for (const [v, slot, nm] of [[total, 0, "Total"], [r.pay, 1, "Pay part"], [r.price, 2, "Price part"]] as const) {
        const row = document.createElement("div");
        row.className = "tip-row";
        const key = document.createElement("span");
        key.className = slot ? `key line s${slot}` : "key line";
        const val = document.createElement("strong");
        val.textContent = `${v > 0 ? "+" : ""}${defaultFormat(v)}`;
        const n = document.createElement("span");
        n.textContent = nm;
        row.append(key, val, n);
        tip.appendChild(row);
      }
      tip.hidden = false;
      tip.style.left = "";
      tip.style.right = "8px";
      tip.style.top = `${((yc + rowH / 2) / H) * 100}%`;
    };
    g.addEventListener("pointerenter", show);
    g.addEventListener("focus", show);
    g.addEventListener("pointerleave", () => (tip.hidden = true));
    g.addEventListener("blur", () => (tip.hidden = true));
  });
  fig.appendChild(wrap);

  const det = document.createElement("details");
  det.className = "table-view";
  const sum = document.createElement("summary");
  sum.textContent = "Table view";
  det.appendChild(sum);
  det.appendChild(simpleTable(["Type", `Total (${spec.unit})`, "Pay part", "Price part"], spec.rows.map((r) => [r.label, defaultFormat(r.pay + r.price), defaultFormat(r.pay), defaultFormat(r.price)])));
  fig.appendChild(det);
  return fig;
}
