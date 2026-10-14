# Independent check of the spec's hand-worked expected values, from its equations alone, using
# only the Python standard library. These are the large-θ, small-sector limits, so the model
# should approach them as θ grows. Run: python3 scripts/crosscheck-expected.py
from math import log, exp
from statistics import NormalDist

N = NormalDist()
Phi, phi, Phinv = N.cdf, N.pdf, N.inv_cdf


def curve(S, eps):
    z0 = Phinv(S)
    return z0, phi(z0) / (eps * S)


def bisect(f, lo, hi, n=200):
    flo = f(lo)
    for _ in range(n):
        m = (lo + hi) / 2
        if (f(m) > 0) == (flo > 0):
            lo, flo = m, f(m)
        else:
            hi = m
    return (lo + hi) / 2


young, mature = curve(0.1, 2), curve(0.8, 0.4)
print(f"young:  z0 = {young[0]:.4f}, sigma = {young[1]:.4f}")
print(f"mature: z0 = {mature[0]:.4f}, sigma = {mature[1]:.4f}")

# Bessen's setting: price = 1/A, x fixed. Demand relative to base Q(p) = Phi(z0 + ln(1/p)/sigma)/S.
def Q(p, c=young, S=0.1):
    return Phi(c[0] + log(1 / p) / c[1]) / S

def L(A, c=young, S=0.1):  # employment relative to base
    return Q(1 / A, c, S) / A

def eps(A, c=young):
    z = c[0] + log(A) / c[1]
    return phi(z) / (c[1] * Phi(z))

peak = bisect(lambda A: eps(A) - 1, 1, 10)
back = bisect(lambda A: L(A) - 1, 3, 20)
print(f"Test 4: young A=2: {L(2) - 1:+.4f}, saturation {Q(0.5) * 0.1:.4f}")
print(f"Test 4: peak A = {peak:.4f}: {L(peak) - 1:+.4f}, saturation {Q(1 / peak) * 0.1:.4f}")
print(f"Test 4: back to start A = {back:.4f}, saturation {Q(1 / back) * 0.1:.4f}")
print(f"Test 4: mature A=2: {L(2, mature, 0.8) - 1:+.4f}, saturation {Q(0.5, mature, 0.8) * 0.8:.4f}")

# Test 6: g = 1. Scarce while 2 eta <= 1; plentiful once 2 eta > Q(1/2).
print(f"Test 6: boundaries eta = 0.5 and {Q(0.5) / 2:.4f}")
p1 = exp(-young[1] * (Phinv(0.2) - young[0]))  # eta = 1: Q(p) = 2
print(f"Test 6: eta = 1: price {p1:.4f}, matched pay {2 * p1:.4f}")
print(f"Test 6: eta = 2: price 0.5, employment {Q(0.5) / 2 - 1:+.4f}")

# Test 8: price 3/8, set by minders earning their X pay.
print(f"Test 8: output factor at price 0.375: {Q(0.375):.4f}")
