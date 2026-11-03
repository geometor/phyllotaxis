"""Main Phyllotaxis class composed from modular mixins."""

from __future__ import annotations

from .angles import AnglesMixin
from .builder import ModelBuilderMixin
from .paths3d import Propagation3DMixin
from .planar import PlanarMixin


class Phyllotaxis(
    AnglesMixin,
    PlanarMixin,
    Propagation3DMixin,
    ModelBuilderMixin,
):
    """Main class for symbolic and parametric 2D/3D phyllotaxis modeling."""

    def __init__(self, name: str = "phyllotaxis") -> None:
        self.name = name
