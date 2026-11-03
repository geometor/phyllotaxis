"""Divergence angle calculations and Fibonacci rational approximations."""

from __future__ import annotations

import math
import sympy as sp

PHI: sp.Expr = (sp.S(1) + sp.sqrt(5)) / 2
GOLDEN_ANGLE_RAD: float = float(2 * sp.pi - (2 * sp.pi / PHI))
GOLDEN_ANGLE_DEG: float = math.degrees(GOLDEN_ANGLE_RAD)


def sweep_phi() -> sp.Expr:
    """Return the exact symbolic golden divergence angle $2\\pi(1 - 1/\\phi)$."""
    return 2 * sp.pi - (2 * sp.pi / PHI)


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

    def get_sweep_rational(self, n: int, m: int) -> sp.Expr:
        return sweep_rational(n, m)

    def get_sweep_lucas(self) -> sp.Expr:
        return sweep_lucas()

    def get_fibonacci_convergents(
        self, count: int = 8
    ) -> list[tuple[int, int, float]]:
        return fibonacci_convergents(count)
