"""3D phyllotaxic propagation where each node is a growing path and may be a meristem."""

from __future__ import annotations

from dataclasses import dataclass, field
import math
from typing import Any

from .angles import GOLDEN_ANGLE_DEG

Vec3 = tuple[float, float, float]


def _add(a: Vec3, b: Vec3) -> Vec3:
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def _sub(a: Vec3, b: Vec3) -> Vec3:
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def _scale(v: Vec3, s: float) -> Vec3:
    return (v[0] * s, v[1] * s, v[2] * s)


def _dot(a: Vec3, b: Vec3) -> float:
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def _cross(a: Vec3, b: Vec3) -> Vec3:
    return (
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    )


def _norm(v: Vec3) -> float:
    return math.sqrt(_dot(v, v))


def _normalize(v: Vec3) -> Vec3:
    length = _norm(v)
    if length < 1e-12:
        return (0.0, 0.0, 1.0)
    return (v[0] / length, v[1] / length, v[2] / length)


@dataclass
class MeristemConfig:
    """Configuration for 3D Node-as-Path and recursive meristem propagation."""

    divergence_angle_deg: float = GOLDEN_ANGLE_DEG
    branch_pitch_deg: float = 54.0
    stem_step: float = 0.35
    fast_growth_steps: int = 50
    slow_growth_factor: float = 1.0
    radial_scale: float = 1.6
    radial_exponent: float = 0.55
    path_arch: float = 0.16
    path_twist_deg: float = 0.0
    path_segments: int = 12
    base_size: float = 0.18
    size_growth: float = 0.045
    max_depth: int = 2
    maturation_age: int = 6
    spawn_cadence: int = 3
    meristem_stride: int = 2
    child_scale_decay: float = 0.6180339887


@dataclass
class MeristemNode:
    """A 3D phyllotaxic node that grows as a path from its origin and may act as a meristem."""

    id: int
    generation: int
    parent_id: int | None
    index_on_parent: int
    birth_step: int
    age: int
    is_meristem: bool
    origin: Vec3
    tangent: Vec3
    normal: Vec3
    binormal: Vec3
    path: list[Vec3] = field(default_factory=list)
    tip: Vec3 = (0.0, 0.0, 0.0)
    tip_tangent: Vec3 = (0.0, 0.0, 1.0)
    tip_normal: Vec3 = (1.0, 0.0, 0.0)
    tip_binormal: Vec3 = (0.0, 1.0, 0.0)
    tip_size: float = 0.2
    children: list[int] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Serialize the node, its 3D path from origin to tip, and child meristem IDs."""
        return {
            "id": self.id,
            "generation": self.generation,
            "parent_id": self.parent_id,
            "index_on_parent": self.index_on_parent,
            "birth_step": self.birth_step,
            "age": self.age,
            "is_meristem": self.is_meristem,
            "origin": list(self.origin),
            "tip": list(self.tip),
            "tip_size": round(self.tip_size, 5),
            "path": [[round(c, 5) for c in pt] for pt in self.path],
            "children": list(self.children),
        }


def compute_node_path(
    origin: Vec3,
    parent_tangent: Vec3,
    radial_dir: Vec3,
    binormal_dir: Vec3,
    age: int,
    generation: int,
    config: MeristemConfig,
) -> tuple[list[Vec3], Vec3, Vec3, Vec3]:
    """Evaluate a node's 3D trajectory $\\gamma(s)$ for $s \\in [0, \\text{age}]$ from `origin`.

    At $s = 0$, $\\gamma(0) = \\text{origin}$. As $s \\to \\text{age}$, the path advances
    outward along `radial_dir` and lifts/curves along `parent_tangent` with optional
    helical twist around `binormal_dir`.

    Args:
        origin: 3D point on the parent meristem where this node originated.
        parent_tangent: Unit tangent of the parent meristem at `origin`.
        radial_dir: Unit radial outward vector at the node's divergence angle.
        binormal_dir: Unit binormal vector perpendicular to `parent_tangent` and `radial_dir`.
        age: Plastochron age ($t - t_{\\text{birth}} \\ge 0$) of the node.
        generation: Branching depth ($1$ = primary lateral node, $2$ = secondary, etc.).
        config: Propagation parameters.

    Returns:
        Tuple `(path_points, tip_tangent, tip_normal, tip_binormal)`.
    """
    decay = config.child_scale_decay ** (generation - 1)
    pitch_rad = math.radians(config.branch_pitch_deg)
    twist_rate = math.radians(config.path_twist_deg)

    if age <= 0:
        t0 = _normalize(
            _add(
                _scale(parent_tangent, math.cos(pitch_rad)),
                _scale(radial_dir, math.sin(pitch_rad)),
            )
        )
        b0 = _normalize(_cross(t0, parent_tangent))
        n0 = _normalize(_cross(b0, t0))
        return [origin], t0, n0, b0

    num_seg = max(2, min(config.path_segments, age + 1))
    points: list[Vec3] = []

    sin_pitch = math.sin(pitch_rad)
    cos_pitch = math.cos(pitch_rad)

    for idx in range(num_seg + 1):
        u = idx / num_seg
        s = age * u
        reach = config.radial_scale * decay * (s ** config.radial_exponent)
        twist_angle = twist_rate * s
        lateral_vec = _add(
            _scale(radial_dir, math.cos(twist_angle)),
            _scale(binormal_dir, math.sin(twist_angle)),
        )
        radial_disp = reach * sin_pitch
        axial_disp = reach * cos_pitch + (config.path_arch * reach * (u ** 2))

        pt = _add(
            origin,
            _add(
                _scale(lateral_vec, radial_disp),
                _scale(parent_tangent, axial_disp),
            ),
        )
        points.append(pt)

    tip_tangent = _normalize(_sub(points[-1], points[-2]))
    tip_binormal = _normalize(_cross(tip_tangent, parent_tangent))
    if _norm(tip_binormal) < 1e-6:
        tip_binormal = binormal_dir
    tip_normal = _normalize(_cross(tip_binormal, tip_tangent))

    return points, tip_tangent, tip_normal, tip_binormal


def propagate_3d(
    steps: int, config: MeristemConfig | None = None
) -> list[MeristemNode]:
    """Propagate a 3D phyllotaxic meristem system for `steps` plastochrons.

    Node `0` is the primary apical meristem growing along $+Z$. At each step $t$,
    active meristems grow along their paths and emit new lateral child nodes at
    the divergence angle $\\Phi$ around their local tangent frame.

    Args:
        steps: Number of plastochron steps to simulate.
        config: Optional `MeristemConfig` instance.

    Returns:
        List of `MeristemNode` instances (including the root stem and all lateral/recursive paths).
    """
    cfg = config or MeristemConfig()
    div_rad = math.radians(cfg.divergence_angle_deg)

    # Build the primary stem (Generation 0 meristem) trajectory over `steps`
    stem_points: list[Vec3] = [(0.0, 0.0, 0.0)]
    z_cur = 0.0
    for step in range(1, max(1, steps) + 1):
        dz = cfg.stem_step
        if step > cfg.fast_growth_steps:
            dz *= cfg.slow_growth_factor
        z_cur += dz
        stem_points.append((0.0, 0.0, z_cur))

    root_node = MeristemNode(
        id=0,
        generation=0,
        parent_id=None,
        index_on_parent=0,
        birth_step=0,
        age=steps,
        is_meristem=True,
        origin=(0.0, 0.0, 0.0),
        tangent=(0.0, 0.0, 1.0),
        normal=(1.0, 0.0, 0.0),
        binormal=(0.0, 1.0, 0.0),
        path=stem_points,
        tip=stem_points[-1],
        tip_tangent=(0.0, 0.0, 1.0),
        tip_normal=(1.0, 0.0, 0.0),
        tip_binormal=(0.0, 1.0, 0.0),
        tip_size=cfg.base_size * 1.25,
    )

    nodes: list[MeristemNode] = [root_node]
    next_id = 1

    # Queue of meristematic nodes that can spawn child nodes along their paths
    def _spawn_children_for_meristem(parent: MeristemNode) -> None:
        nonlocal next_id
        child_gen = parent.generation + 1
        if child_gen > cfg.max_depth:
            return

        decay = cfg.child_scale_decay ** (child_gen - 1)
        if parent.generation == 0:
            # Root stem spawns one lateral node per plastochron step t = 0 .. steps - 1
            spawn_steps = list(range(steps))
        else:
            # Lateral meristem spawns child nodes after maturation_age every spawn_cadence steps
            start_t = parent.birth_step + cfg.maturation_age
            spawn_steps = list(range(start_t, steps, max(1, cfg.spawn_cadence)))

        for child_idx, birth_t in enumerate(spawn_steps):
            child_age = max(0, (steps - 1) - birth_t)
            theta = child_idx * div_rad

            if parent.generation == 0:
                child_origin = stem_points[min(birth_t, len(stem_points) - 1)]
                p_tangent: Vec3 = (0.0, 0.0, 1.0)
                p_normal: Vec3 = (1.0, 0.0, 0.0)
                p_binormal: Vec3 = (0.0, 1.0, 0.0)
            else:
                # Origin lies along parent's growing path at age (birth_t - parent.birth_step)
                age_at_birth = max(1, birth_t - parent.birth_step)
                sub_path, p_tangent, p_normal, p_binormal = compute_node_path(
                    origin=parent.origin,
                    parent_tangent=parent.tangent,
                    radial_dir=parent.normal,
                    binormal_dir=parent.binormal,
                    age=age_at_birth,
                    generation=parent.generation,
                    config=cfg,
                )
                child_origin = sub_path[-1]

            # Radial direction rotated by theta around parent's tangent frame
            radial_dir = _normalize(
                _add(
                    _scale(p_normal, math.cos(theta)),
                    _scale(p_binormal, math.sin(theta)),
                )
            )
            binormal_dir = _normalize(_cross(p_tangent, radial_dir))

            path_pts, tip_t, tip_n, tip_b = compute_node_path(
                origin=child_origin,
                parent_tangent=p_tangent,
                radial_dir=radial_dir,
                binormal_dir=binormal_dir,
                age=child_age,
                generation=child_gen,
                config=cfg,
            )

            can_be_meristem = (
                child_gen < cfg.max_depth
                and (child_idx % max(1, cfg.meristem_stride) == 0)
            )
            tip_size = max(
                0.02,
                (cfg.base_size + cfg.size_growth * math.sqrt(child_age)) * decay,
            )

            child_node = MeristemNode(
                id=next_id,
                generation=child_gen,
                parent_id=parent.id,
                index_on_parent=child_idx,
                birth_step=birth_t,
                age=child_age,
                is_meristem=can_be_meristem,
                origin=child_origin,
                tangent=p_tangent,
                normal=radial_dir,
                binormal=binormal_dir,
                path=path_pts,
                tip=path_pts[-1],
                tip_tangent=tip_t,
                tip_normal=tip_n,
                tip_binormal=tip_b,
                tip_size=tip_size,
            )
            parent.children.append(child_node.id)
            nodes.append(child_node)
            next_id += 1

    # Breadth-first generation expansion up to max_depth
    idx = 0
    while idx < len(nodes):
        current = nodes[idx]
        if current.is_meristem and current.generation < cfg.max_depth:
            _spawn_children_for_meristem(current)
        idx += 1

    return nodes


class Propagation3DMixin:
    """Mixin for Phyllotaxis class containing 3D path and meristem propagation methods."""

    def propagate_3d(
        self, steps: int, config: MeristemConfig | None = None
    ) -> list[MeristemNode]:
        return propagate_3d(steps, config)
