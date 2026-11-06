"""Divergence angle calculations and Fibonacci rational approximations."""

from __future__ import annotations

import math
import sympy as sp

PHI: sp.Expr = (sp.S(1) + sp.sqrt(5)) / 2
GOLDEN_SWEEP_SHORT_RAD: float = float(2 * sp.pi / (PHI**2))
GOLDEN_SWEEP_SHORT_DEG: float = math.degrees(GOLDEN_SWEEP_SHORT_RAD)
GOLDEN_SWEEP_LONG_RAD: float = float(2 * sp.pi / PHI)
GOLDEN_SWEEP_LONG_DEG: float = math.degrees(GOLDEN_SWEEP_LONG_RAD)

GOLDEN_ANGLE_RAD: float = GOLDEN_SWEEP_SHORT_RAD
GOLDEN_ANGLE_DEG: float = GOLDEN_SWEEP_SHORT_DEG


def sweep_phi() -> sp.Expr:
    """Return the exact symbolic short golden sweep $2\\pi(1 - 1/\\phi) = 2\\pi / \\phi^2$."""
    return 2 * sp.pi - (2 * sp.pi / PHI)


def sweep_phi_short() -> sp.Expr:
    """Return the exact symbolic short golden sweep $2\\pi / \\phi^2 \\approx 137.507764^\\circ$."""
    return sp.simplify(2 * sp.pi / (PHI**2))


def sweep_phi_long() -> sp.Expr:
    """Return the exact symbolic long golden sweep $2\\pi / \\phi \\approx 222.492236^\\circ$."""
    return 2 * sp.pi / PHI


def sweep_phi_power(k: int = 2) -> sp.Expr:
    """Return the $k$-th golden section sweep $2\\pi / \\phi^k$ ($k=1$: Long, $k=2$: Short)."""
    if k < 1:
        raise ValueError("Power k must be >= 1.")
    return sp.simplify(2 * sp.pi / (PHI**k))


def sweep_phi_factor(
    numerator: int = 1,
    denominator: int = 1,
    *,
    long_sweep: bool = False,
) -> sp.Expr:
    """Return a rational factor $(\\text{numerator}/\\text{denominator})$ of the short or long golden sweep."""
    if denominator == 0:
        raise ValueError("Denominator must be non-zero.")
    base = sweep_phi_long() if long_sweep else sweep_phi_short()
    return sp.simplify(sp.Rational(numerator, denominator) * base)


def golden_sweep_presets() -> list[dict[str, str | float]]:
    """Return a catalog of short/long golden sweeps, $\\phi^{-k}$ powers, and rational sweep factors."""
    short_deg = GOLDEN_SWEEP_SHORT_DEG
    long_deg = GOLDEN_SWEEP_LONG_DEG
    phi_f = float(PHI)
    return [
        {"key": "short_1", "group": "Golden Sweeps", "label": "Short Sweep • 360°/φ²", "degrees": short_deg},
        {"key": "long_1", "group": "Golden Sweeps", "label": "Long Sweep • 360°/φ", "degrees": long_deg},
        {"key": "phi_pow_3", "group": "φ⁻ᵏ Sweeps", "label": "φ⁻³ Sweep • 360°/φ³", "degrees": 360.0 / (phi_f**3)},
        {"key": "phi_pow_4", "group": "φ⁻ᵏ Sweeps", "label": "φ⁻⁴ Sweep • 360°/φ⁴", "degrees": 360.0 / (phi_f**4)},
        {"key": "phi_pow_5", "group": "φ⁻ᵏ Sweeps", "label": "φ⁻⁵ Sweep • 360°/φ⁵", "degrees": 360.0 / (phi_f**5)},
        {"key": "short_2x", "group": "Short Sweep Factors", "label": "2× Short Sweep", "degrees": 2.0 * short_deg},
        {"key": "short_1_2", "group": "Short Sweep Factors", "label": "1/2 Short Sweep", "degrees": short_deg / 2.0},
        {"key": "short_1_3", "group": "Short Sweep Factors", "label": "1/3 Short Sweep", "degrees": short_deg / 3.0},
        {"key": "short_1_4", "group": "Short Sweep Factors", "label": "1/4 Short Sweep", "degrees": short_deg / 4.0},
        {"key": "short_1_5", "group": "Short Sweep Factors", "label": "1/5 Short Sweep", "degrees": short_deg / 5.0},
        {"key": "long_1_2", "group": "Long Sweep Factors", "label": "1/2 Long Sweep", "degrees": long_deg / 2.0},
        {"key": "long_1_3", "group": "Long Sweep Factors", "label": "1/3 Long Sweep", "degrees": long_deg / 3.0},
        {"key": "long_1_4", "group": "Long Sweep Factors", "label": "1/4 Long Sweep", "degrees": long_deg / 4.0},
        {"key": "long_1_5", "group": "Long Sweep Factors", "label": "1/5 Long Sweep", "degrees": long_deg / 5.0},
    ]


def sweep_rational(n: int, m: int) -> sp.Expr:
    """Return a rational divergence angle $2\\pi(1 - n/m)$ from two integers."""
    if m == 0:
        raise ValueError("Denominator m must be non-zero.")
    return 2 * sp.pi - (2 * sp.pi * sp.Rational(n, m))


def sweep_lucas() -> sp.Expr:
    """Return the exact symbolic Lucas divergence angle $2\\pi / (3 + 1/\\phi) \\approx 99.5^\\circ$."""
    return 2 * sp.pi / (sp.S(3) + 1 / PHI)


def fibonacci(n: int) -> int:
    """Return the $n$-th Fibonacci number ($F_0 = 0, F_1 = 1$)."""
    if n < 0:
        raise ValueError("n must be non-negative.")
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


def fibonacci_convergents(count: int = 8) -> list[tuple[int, int, float]]:
    """Return consecutive Fibonacci rational approximations $(F_k, F_{k+2}, \\text{degrees})$.

    Args:
        count: Number of convergent pairs to generate starting from $(1, 2)$.

    Returns:
        List of tuples `(numerator, denominator, angle_degrees)`.
    """
    result: list[tuple[int, int, float]] = []
    for k in range(2, 2 + count):
        num = fibonacci(k)
        den = fibonacci(k + 2)
        angle_deg = 360.0 * (1.0 - num / den)
        result.append((num, den, angle_deg))
    return result


class AnglesMixin:
    """Mixin for Phyllotaxis class containing divergence angle functionality."""

    def get_sweep_phi(self) -> sp.Expr:
        return sweep_phi()

    def get_sweep_phi_short(self) -> sp.Expr:
        return sweep_phi_short()

    def get_sweep_phi_long(self) -> sp.Expr:
        return sweep_phi_long()

    def get_sweep_phi_power(self, k: int = 2) -> sp.Expr:
        return sweep_phi_power(k)

    def get_sweep_phi_factor(
        self,
        numerator: int = 1,
        denominator: int = 1,
        *,
        long_sweep: bool = False,
    ) -> sp.Expr:
        return sweep_phi_factor(numerator, denominator, long_sweep=long_sweep)

    def get_golden_sweep_presets(self) -> list[dict[str, str | float]]:
        return golden_sweep_presets()

    def get_sweep_rational(self, n: int, m: int) -> sp.Expr:
        return sweep_rational(n, m)

    def get_sweep_lucas(self) -> sp.Expr:
        return sweep_lucas()

    def get_fibonacci_convergents(
        self, count: int = 8
    ) -> list[tuple[int, int, float]]:
        return fibonacci_convergents(count)
