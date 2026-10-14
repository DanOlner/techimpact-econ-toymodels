// Helpers shared by every stage's report page.

import type { Tolerance } from "../checks/context";

export const app = document.getElementById("app")!;

export interface Table {
  title: string;
  header: string[];
  rows: string[][];
}

export function h(tag: string, text?: string, cls?: string): HTMLElement {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

export function section(id: string, title: string, ...intro: string[]): HTMLElement {
  const s = h("section");
  s.id = id;
  s.appendChild(h("h2", title));
  for (const p of intro) s.appendChild(h("p", p));
  app.appendChild(s);
  return s;
}

export const fmt = (v: number | null) => (v === null ? "" : Math.abs(v) > 0 && (Math.abs(v) < 1e-3 || Math.abs(v) >= 1e4) ? v.toExponential(2) : Number(v.toPrecision(4)).toString());

export function tolText(c: { tolerance: Tolerance | null }): string {
  const t = c.tolerance;
  if (!t) return "reported";
  switch (t.kind) {
    case "abs":
      return `± ${fmt(t.tol)}`;
    case "rel":
      return `± ${fmt(100 * t.tol)}%`;
    case "max":
      return `≤ ${fmt(t.tol)}`;
    case "min":
      return `≥ ${fmt(t.tol)}`;
  }
}

export type Status = "pass" | "fail" | "known" | "reported";
const STATUS_TEXT: Record<Status, [string, string]> = {
  pass: ["✓", "Pass"],
  fail: ["✕", "Fail"],
  known: ["!", "Known finding"],
  reported: ["–", "Reported"],
};
export function statusCell(s: Status): HTMLElement {
  const span = h("span", undefined, `status ${s}`);
  span.append(h("span", STATUS_TEXT[s][0], "icon"), document.createTextNode(STATUS_TEXT[s][1]));
  return span;
}

export function csvLink(t: Table, name: string): HTMLAnchorElement {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const csv = [t.header, ...t.rows].map((r) => r.map(esc).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `${name}.csv`;
  a.textContent = "Download CSV";
  a.className = "csv";
  return a;
}

export function allStagesLink(): HTMLElement {
  const p = h("p", undefined, "crumb");
  const a = document.createElement("a");
  a.href = "../";
  a.textContent = "← All stages of the build";
  p.appendChild(a);
  return p;
}
