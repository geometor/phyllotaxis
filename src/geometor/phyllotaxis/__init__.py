"""Symbolic modeling, 2D planar analysis, and 3D recursive meristem path propagation.

Everything centers around :class:`Phyllotaxis`, :class:`MeristemNode`, and :class:`MeristemConfig`.
"""

from __future__ import annotations

__version__ = "0.2.1"

from .angles import (
    AnglesMixin,
    GOLDEN_ANGLE_DEG,
    GOLDEN_ANGLE_RAD,
    GOLDEN_SWEEP_LONG_DEG,
    GOLDEN_SWEEP_LONG_RAD,
    GOLDEN_SWEEP_SHORT_DEG,
    GOLDEN_SWEEP_SHORT_RAD,
    PHI,
    fibonacci,
    fibonacci_convergents,
    golden_sweep_presets,
    sweep_lucas,
    sweep_phi,
    sweep_phi_factor,
    sweep_phi_long,
    sweep_phi_power,
    sweep_phi_short,
    sweep_rational,
)
from .builder import ModelBuilderMixin, build_rings_model
from .paths3d import (
    MeristemConfig,
    MeristemNode,
    Propagation3DMixin,
    compute_node_path,
    propagate_3d,
)
from .phyllotaxis import Phyllotaxis
from .planar import (
    PlanarMixin,
    analyze_parastichy_curves,
    classify_meristem_phase,
    find_nearest_points,
    find_parastichies,
    find_point_distances,
    get_node_points,
    grow,
    vogel_points,
)

__all__ = [
    "__version__",
    "PHI",
    "GOLDEN_ANGLE_RAD",
    "GOLDEN_ANGLE_DEG",
    "GOLDEN_SWEEP_SHORT_RAD",
    "GOLDEN_SWEEP_SHORT_DEG",
    "GOLDEN_SWEEP_LONG_RAD",
    "GOLDEN_SWEEP_LONG_DEG",
    "Phyllotaxis",
    "AnglesMixin",
    "PlanarMixin",
    "Propagation3DMixin",
    "ModelBuilderMixin",
    "MeristemConfig",
    "MeristemNode",
    "sweep_phi",
    "sweep_phi_short",
    "sweep_phi_long",
    "sweep_phi_power",
    "sweep_phi_factor",
    "golden_sweep_presets",
    "sweep_rational",
    "sweep_lucas",
    "fibonacci",
    "fibonacci_convergents",
    "get_node_points",
    "grow",
    "vogel_points",
    "classify_meristem_phase",
    "find_point_distances",
    "find_nearest_points",
    "find_parastichies",
    "analyze_parastichy_curves",
    "compute_node_path",
    "propagate_3d",
    "build_rings_model",
]
