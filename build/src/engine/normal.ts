// Standard normal distribution: density φ, distribution function Φ and its inverse Φ⁻¹.
//
// erfc follows W. J. Cody's rational approximations (CALERF, 1969/1993), which are accurate to
// near machine precision. Φ⁻¹ starts from Acklam's approximation and is refined by Halley steps
// on Φ, so Φ(Φ⁻¹(p)) = p to near machine precision.

const SQRT2 = Math.SQRT2;
const SQRT2PI = Math.sqrt(2 * Math.PI);
const INV_SQRTPI = 5.6418958354775628695e-1;

const ERF_A = [3.1611237438705656, 1.13864154151050156e2, 3.77485237685302021e2, 3.20937758913846947e3, 1.85777706184603153e-1];
const ERF_B = [2.36012909523441209e1, 2.44024637934444173e2, 1.28261652607737228e3, 2.84423683343917062e3];
const ERFC_C = [
  5.64188496988670089e-1, 8.88314979438837594, 6.61191906371416295e1, 2.98635138197400131e2,
  8.81952221241769090e2, 1.71204761263407058e3, 2.05107837782607147e3, 1.23033935479799725e3,
  2.15311535474403846e-8,
];
const ERFC_D = [
  1.57449261107098347e1, 1.17693950891312499e2, 5.37181101862009858e2, 1.62138957456669019e3,
  3.29079923573345963e3, 4.36261909014324716e3, 3.43936767414372164e3, 1.23033935480374942e3,
];
const ERFC_P = [
  3.05326634961232344e-1, 3.60344899949804439e-1, 1.25781726111229246e-1, 1.60837851487422766e-2,
  6.58749161529837803e-4, 1.63153871373020978e-2,
];
const ERFC_Q = [2.56852019228982242, 1.87295284992346725, 5.27905102951428412e-1, 6.05183413124413191e-2, 2.33520497626869185e-3];

const c = (arr: number[], i: number): number => arr[i] as number;

/** exp(-y²), computed in two parts to keep relative accuracy for large y. */
function expNegSquare(y: number): number {
  const ysq = Math.trunc(y * 16) / 16;
  const del = (y - ysq) * (y + ysq);
  return Math.exp(-ysq * ysq) * Math.exp(-del);
}

/** Complementary error function, erfc(x) = 1 − erf(x). */
export function erfc(x: number): number {
  if (Number.isNaN(x)) return NaN;
  const y = Math.abs(x);
  let result: number;
  if (y <= 0.46875) {
    const z = y > 1.11e-16 ? y * y : 0;
    let xnum = c(ERF_A, 4) * z;
    let xden = z;
    for (let i = 0; i < 3; i++) {
      xnum = (xnum + c(ERF_A, i)) * z;
      xden = (xden + c(ERF_B, i)) * z;
    }
    const erf = (x * (xnum + c(ERF_A, 3))) / (xden + c(ERF_B, 3));
    return 1 - erf;
  } else if (y <= 4) {
    let xnum = c(ERFC_C, 8) * y;
    let xden = y;
    for (let i = 0; i < 7; i++) {
      xnum = (xnum + c(ERFC_C, i)) * y;
      xden = (xden + c(ERFC_D, i)) * y;
    }
    result = ((xnum + c(ERFC_C, 7)) / (xden + c(ERFC_D, 7))) * expNegSquare(y);
  } else if (y < 26.55) {
    const z = 1 / (y * y);
    let xnum = c(ERFC_P, 5) * z;
    let xden = z;
    for (let i = 0; i < 4; i++) {
      xnum = (xnum + c(ERFC_P, i)) * z;
      xden = (xden + c(ERFC_Q, i)) * z;
    }
    const r = (z * (xnum + c(ERFC_P, 4))) / (xden + c(ERFC_Q, 4));
    result = ((INV_SQRTPI - r) / y) * expNegSquare(y);
  } else {
    result = 0;
  }
  return x < 0 ? 2 - result : result;
}

/** Standard normal density φ(x). */
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT2PI;
}

/** Standard normal distribution function Φ(x). */
export function normCdf(x: number): number {
  return 0.5 * erfc(-x / SQRT2);
}

const ACK_A = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
const ACK_B = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
const ACK_C = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
const ACK_D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
const P_LOW = 0.02425;

function acklam(p: number): number {
  const [a0, a1, a2, a3, a4, a5] = ACK_A as [number, number, number, number, number, number];
  const [b0, b1, b2, b3, b4] = ACK_B as [number, number, number, number, number];
  const [c0, c1, c2, c3, c4, c5] = ACK_C as [number, number, number, number, number, number];
  const [d0, d1, d2, d3] = ACK_D as [number, number, number, number];
  if (p < P_LOW) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) / ((((d0 * q + d1) * q + d2) * q + d3) * q + 1);
  }
  if (p > 1 - P_LOW) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) / ((((d0 * q + d1) * q + d2) * q + d3) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return ((((((a0 * r + a1) * r + a2) * r + a3) * r + a4) * r + a5) * q) / (((((b0 * r + b1) * r + b2) * r + b3) * r + b4) * r + 1);
}

/** Inverse standard normal distribution function Φ⁻¹(p), for 0 < p < 1. */
export function normInv(p: number): number {
  if (!(p > 0 && p < 1)) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    return NaN;
  }
  let x = acklam(p);
  // Halley refinement. In the upper tail, work with 1 − p via the symmetry Φ(−x) = 1 − Φ(x).
  for (let i = 0; i < 2; i++) {
    const e = x > 0 ? 1 - p - normCdf(-x) : normCdf(x) - p;
    const u = e * SQRT2PI * Math.exp(0.5 * x * x);
    x = x - u / (1 + 0.5 * x * u);
  }
  return x;
}
