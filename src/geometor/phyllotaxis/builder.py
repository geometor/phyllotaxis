"""Integration with `geometor.model.Model` for exact symbolic constructions."""

from __future__ import annotations

from typing import TYPE_CHECKING
import sympy as sp

from .angles import sweep_phi
from .planar import get_node_points

if TYPE_CHECKING:
    from geometor.model import Model


def build_rings_model(
    num_rings: int = 8,
    sweep: sp.Expr | float | None = None,
    name: str = "phyllotaxis_rings",
) -> Model:
    """Construct a `geometor.model.Model` containing phyllotaxic node points and dot circles.

    Args:
        num_rings: Number of primordia rings to construct.
        sweep: Symbolic or numeric divergence angle (defaults to `sweep_phi()`).
        name: Name of the created `Model`.

    Returns:
        Populated `geometor.model.Model` instance.
    """
    from geometor.model import Model

    angle = sweep if sweep is not None else sweep_phi()
    model = Model(name)
    model.set_point(0, 0, classes=["origin", "meristem"])

    pts = get_node_points(num_rings, angle)
    for i, pt in enumerate(pts):
        center = model.set_point(pt.x, pt.y, classes=["primordium", f"node_{i}"])
        dot_radius = sp.sqrt(num_rings - i)
        rad_pt = model.set_point(
            pt.x + dot_radius,
            pt.y,
            classes=["guide"],
        )
        model.construct_circle(center, rad_pt, classes=["dot", f"ring_{i}"], guide=True)

    return model


class ModelBuilderMixin:
    """Mixin for Phyllotaxis class containing `geometor.model.Model` construction helpers."""

    def build_rings_model(
        self,
        num_rings: int = 8,
        sweep: sp.Expr | float | None = None,
        name: str = "phyllotaxis_rings",
    ) -> Model:
        return build_rings_model(num_rings=num_rings, sweep=sweep, name=name)
