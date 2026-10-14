// Colour scales for the static maps, interpolated in OKLab between steps of the reference palette.

type Lab = [number, number, number];

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

function hexToOklab(hex: string): Lab {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => srgbToLinear(v / 255)) as Lab;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

function oklabToHex([L, a, b]: Lab): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return `#${rgb.map((c) => Math.round(Math.min(1, Math.max(0, linearToSrgb(c))) * 255).toString(16).padStart(2, "0")).join("")}`;
}

/** A scale through colour stops at positions 0..1, interpolated in OKLab. */
function ramp(stops: [number, string][]): (t: number) => string {
  const labs = stops.map(([p, h]) => [p, hexToOklab(h)] as [number, Lab]);
  return (t: number) => {
    const u = Math.min(1, Math.max(0, t));
    let i = 0;
    while (i < labs.length - 2 && u > labs[i + 1]![0]) i++;
    const [p0, c0] = labs[i]!;
    const [p1, c1] = labs[i + 1]!;
    const f = p1 === p0 ? 0 : (u - p0) / (p1 - p0);
    return oklabToHex([0, 1, 2].map((k) => c0[k]! + f * (c1[k]! - c0[k]!)) as Lab);
  };
}

/** Sequential: one hue (blue), light to dark (palette steps 100 → 650). */
export const sequential = ramp([
  [0, "#cde2fb"],
  [0.25, "#86b6ef"],
  [0.5, "#3987e5"],
  [0.75, "#1c5cab"],
  [1, "#104281"],
]);

/** Diverging: red (negative, loss) ← neutral grey → blue (positive, gain). t in −1..1. */
const divRamp = ramp([
  [0, "#9c2a2a"],
  [0.25, "#e34948"],
  [0.5, "#f0efec"],
  [0.75, "#3987e5"],
  [1, "#184f95"],
]);
export const diverging = (t: number) => divRamp((t + 1) / 2);

/** Ordinal steps for ordered categories (regimes): blue 250, 450, 650. */
export const ORDINAL = ["#86b6ef", "#2a78d6", "#104281"];
