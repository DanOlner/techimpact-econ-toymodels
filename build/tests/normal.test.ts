import { describe, expect, it } from "vitest";
import { erfc, normCdf, normInv, normPdf } from "../src/engine/normal";
import ref from "./fixtures/normal-reference.json";

// Relative error, falling back to absolute error near zero.
const relErr = (a: number, b: number) => (b === 0 ? Math.abs(a) : Math.abs(a - b) / Math.abs(b));

describe("normal distribution against R", () => {
  it.each(ref.cdf as [number, number][])("Φ(%s)", (x, want) => {
    // Rounding x/√2 gives a relative error of about x² times machine precision far in the tail.
    expect(relErr(normCdf(x), want)).toBeLessThan(1e-14 * Math.max(1, (x * x) / 4));
  });
  it.each(ref.pdf as [number, number][])("φ(%s)", (x, want) => {
    expect(relErr(normPdf(x), want)).toBeLessThan(1e-14);
  });
  it.each(ref.inv as [number, number][])("Φ⁻¹(%s)", (p, want) => {
    // qnorm(0.5) = 0 exactly, so allow an absolute error there.
    if (want === 0) expect(Math.abs(normInv(p))).toBeLessThan(1e-15);
    else expect(relErr(normInv(p), want)).toBeLessThan(1e-13);
  });
});

describe("normal distribution identities", () => {
  it("erfc(0) = 1 and erfc(−x) = 2 − erfc(x)", () => {
    expect(erfc(0)).toBe(1);
    for (const x of [0.1, 0.7, 2.5, 5]) expect(erfc(-x)).toBeCloseTo(2 - erfc(x), 15);
  });
  it("Φ(Φ⁻¹(p)) = p across the range", () => {
    for (let p = 0.0005; p < 1; p += 0.0137) expect(relErr(normCdf(normInv(p)), p)).toBeLessThan(1e-13);
  });
  it("Φ⁻¹ is symmetric", () => {
    for (const p of [0.001, 0.1, 0.3]) expect(normInv(1 - p)).toBeCloseTo(-normInv(p), 12);
  });
  it("edge values", () => {
    expect(normInv(0)).toBe(-Infinity);
    expect(normInv(1)).toBe(Infinity);
    expect(normInv(1.5)).toBeNaN();
    expect(normCdf(-40)).toBe(0);
    expect(normCdf(40)).toBe(1);
  });
});
