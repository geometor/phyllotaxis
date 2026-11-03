"""Planar 2D phyllotaxic growth, Vogel packing, and parastichy analysis."""

from __future__ import annotations

import math
import sympy as sp
import sympy.geometry as spg

from .angles import GOLDEN_ANGLE_RAD, sweep_phi


def get_node_points(
    num_nodes: int, sweep: sp.Expr | float | None = None
) -> list[spg.Point2D]:
    """Generate a single planar growth frame with `num_nodes` symbolic points.

    Each node $i \\in [0, N-1]$ has radius $N - i$ and angle $i \\cdot \\text{sweep}$.

    Args:
        num_nodes: Number of primordia in the frame.
        sweep: Divergence angle in radians (symbolic or float). Defaults to `sweep_phi()`.

    Returns:
        List of SymPy `Point2D` instances.
    """
    if sweep is None:
        sweep = sweep_phi()
    result: list[spg.Point2D] = []
    origin = spg.Point(0, 0)
    for i in range(num_nodes):
        rad = num_nodes - i
        pt = spg.Point(rad, 0).rotate(i * sweep, origin)
        result.append(pt)
    return result


def grow(
    steps: int, sweep: sp.Expr | float | None = None
) -> list[list[spg.Point2D]]:
    """Grow planar frames from $0$ up to `steps - 1` nodes."""
    if sweep is None:
        sweep = sweep_phi()
    return [get_node_points(n, sweep) for n in range(steps)]


def find_point_distances(
    pt: spg.Point2D, other_pts: list[spg.Point2D]
) -> dict[float, spg.Point2D]:
    """Compute Euclidean distances from `pt` to each point in `other_pts`."""
    distances: dict[float, spg.Point2D] = {}
    for test_pt in other_pts:
        d = float(pt.distance(test_pt))
        distances[d] = test_pt
    return distances


def find_nearest_points(
    test_points: list[spg.Point2D], num_nearest: int = 3
) -> dict[spg.Point2D, list[spg.Point2D]]:
    """For each point in `test_points`, find the `num_nearest` closest subsequent points."""
    result: dict[spg.Point2D, list[spg.Point2D]] = {}
    for i, pt in enumerate(test_points):
        distances = find_point_distances(pt, test_points[i + 1 :])
        keys = sorted(distances.keys())
        result[pt] = [distances[k] for k in keys[:num_nearest]]
    return result


def classify_meristem_phase(
    node_id: int,
    total_nodes: int,
    leaf_span: int = 34,
) -> str:
    """Classify a node's ontogenetic organ type in the meristem's production life cycle.

    In a composite capitulum (such as a sunflower), the apical meristem transitions
    through distinct organ-production phases as the sequence progresses:
    1. `"leaf"`: Early vegetative/involucral bracts (`0 <= node_id < leaf_span`).
    2. `"petal"`: Ray florets / corolla petals (`leaf_span <= node_id < leaf_span + round(leaf_span * φ)`).
    3. `"floret"`: Mature tubular disc florets in the capitulum interior.
    4. `"bud"`: Newly initiated unopened primordia at the apical center (`age < round(leaf_span / φ)`).
    """
    phi = 1.618033988749895
    leaf_count = max(1, int(leaf_span))
    petal_count = max(1, round(leaf_count * phi))
    bud_count = max(1, round(leaf_count / phi))
    age = (total_nodes - 1) - node_id

    if node_id < leaf_count:
        return "leaf"
    if node_id < leaf_count + petal_count:
        return "petal"
    if age < bud_count:
        return "bud"
    return "floret"


def vogel_points(
    num_nodes: int,
    scale: float = 5.0,
    angle_rad: float = GOLDEN_ANGLE_RAD,
    base_size: float = 1.5,
    growth_factor: float = 0.25,
    radial_acceleration: float = 0.0,
    leaf_span: int = 34,
) -> list[dict[str, float | int | str]]:
    """Compute 2D apical meristem coordinates with radial acceleration, node growth, and life-cycle phases.

    New primordia emerge at the center ($k_{\\text{eff}} = (N - 1) - i$) while older
    primordia are displaced radially as
    $r = c\\sqrt{k_{\\text{eff}}}\\left(\\frac{k_{\\text{eff}} + 1}{K_0}\\right)^{a}$,
    and node size grows as
    $s = s_0 + g\\sqrt{k_{\\text{eff}}}\\left(\\frac{k_{\\text{eff}} + 1}{K_0}\\right)^{1.15a}$.

    Args:
        num_nodes: Total number of primordia.
        scale: Radial spread constant $c$.
        angle_rad: Divergence angle in radians.
        base_size: Initial radius of a newly emerged primordium ($s_0$).
        growth_factor: Rate $g$ at which primordium size scales as it moves outward.
        radial_acceleration: Acceleration exponent $a \\ge 0$ controlling how much faster
            older outer nodes move and expand compared to young inner primordia.
        leaf_span: Characteristic Fibonacci cohort span for meristem life-cycle phases.

    Returns:
        List of dictionaries with keys `id`, `age`, `phase`, `x`, `y`, `r`, `theta`, `size`.
    """
    nodes: list[dict[str, float | int | str]] = []
    k_ref = 28.0
    for i in range(num_nodes):
        k_eff = (num_nodes - 1) - i
        sqrt_k = math.sqrt(k_eff)
        accel_factor = (
            math.pow((k_eff + 1.0) / k_ref, radial_acceleration)
            if radial_acceleration != 0.0 and k_eff > 0
            else 1.0
        )
        size_accel = (
            math.pow((k_eff + 1.0) / k_ref, radial_acceleration * 1.15)
            if radial_acceleration != 0.0 and k_eff > 0
            else 1.0
        )
        theta = i * angle_rad
        radius = scale * sqrt_k * accel_factor
        size = max(0.2, base_size + growth_factor * sqrt_k * size_accel)
        phase = classify_meristem_phase(i, num_nodes, leaf_span=leaf_span)
        nodes.append(
            {
                "id": i,
                "age": k_eff,
                "phase": phase,
                "x": radius * math.cos(theta),
                "y": radius * math.sin(theta),
                "r": radius,
                "theta": theta,
                "size": size,
            }
        )
    return nodes


def find_parastichies(
    num_nodes: int, families: tuple[int, ...] = (5, 8, 13, 21)
) -> dict[int, list[list[int]]]:
    """Group node indices into parastichy spiral chains for each modulo family $m \\in \\text{families}$.

    Args:
        num_nodes: Total number of nodes.
        families: Parastichy numbers (typically consecutive Fibonacci numbers).

    Returns:
        Mapping from family number $m$ to a list of $m$ index chains `[r, r+m, r+2m, ...]`.
    """
    parastichies: dict[int, list[list[int]]] = {}
    for m in families:
        if m <= 0:
            continue
        chains: list[list[int]] = []
        for rem in range(min(m, num_nodes)):
            chain = list(range(rem, num_nodes, m))
            if len(chain) >= 2:
                chains.append(chain)
        parastichies[m] = chains
    return parastichies


def analyze_parastichy_curves(
    nodes: list[dict[str, float | int | str]], num_nearest: int = 3
) -> dict[str, object]:
    """Count parastichy curves in each closest-neighbor rank and radial zone until they bend.

    Demonstrates that the two primary closest-neighbor curve families wind in opposite
    directions (CW vs CCW) and always form a consecutive pair of Fibonacci numbers
    $(F_m, F_{m+1})$ within each radial zone between curve bends.

    Args:
        nodes: List of node dictionaries from :func:`vogel_points`.
        num_nearest: Number of closest inner nodes connected per node ($1 \\le k \\le 4$).

    Returns:
        Dictionary containing:
        - ``outer_counts``: Curve count $\\Delta$, winding direction (``"CW"`` or ``"CCW"``),
          and Fibonacci status for each rank at the outer rim.
        - ``opposing_pair``: Tuple ``(cw_count, ccw_count)`` of the two primary opposing
          spiral families in the outer zone.
        - ``is_fibonacci_pair``: ``True`` if ``opposing_pair`` consists of consecutive
          Fibonacci numbers with opposite chirality.
        - ``zones``: Radial zones from inner to outer separated by bend radii.
    """
    fib_set = {1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610}
    n = len(nodes)
    k = max(1, min(4, num_nearest))
    if n < 8:
        return {
            "outer_counts": [],
            "opposing_pair": (0, 0),
            "is_fibonacci_pair": False,
            "zones": [],
            "bend_radii": [],
        }

    # For each node i, find its k closest inner neighbors j > i
    steps_by_node: list[list[tuple[int, str]]] = []
    for i in range(n - 1):
        p1 = nodes[i]
        x1 = float(p1["x"])
        y1 = float(p1["y"])
        dists: list[tuple[float, int]] = []
        for j in range(i + 1, n):
            p2 = nodes[j]
            dx = x1 - float(p2["x"])
            dy = y1 - float(p2["y"])
            dists.append((dx * dx + dy * dy, j))
        dists.sort(key=lambda item: item[0])
        chosen = dists[:k]
        rank_info: list[tuple[int, str]] = []
        for _, j in chosen:
            p2 = nodes[j]
            x2 = float(p2["x"])
            y2 = float(p2["y"])
            delta = j - i
            # 2D cross product from inner node p2 to outer node p1
            cross = x2 * y1 - y2 * x1
            direction = "CCW" if cross >= 0.0 else "CW"
            rank_info.append((delta, direction))
        steps_by_node.append(rank_info)

    # Group nodes (excluding the innermost 6 nascent nodes) into radial zones where (delta_0, delta_1) is constant
    valid_limit = max(1, n - 8)
    zones: list[dict[str, object]] = []
    for i in range(valid_limit - 1, -1, -1):
        info = steps_by_node[i]
        if not info:
            continue
        d0, dir0 = info[0]
        d1, dir1 = info[1] if len(info) > 1 else (0, "NONE")
        d2, dir2 = info[2] if len(info) > 2 else (0, "NONE")
        r_val = float(nodes[i]["r"])
        pair_key = (d0, d1)
        if not zones or zones[-1]["pair_key"] != pair_key:
            zones.append(
                {
                    "pair_key": pair_key,
                    "r_min": r_val,
                    "r_max": r_val,
                    "node_count": 1,
                    "ranks": [
                        {"rank": 0, "count": d0, "direction": dir0, "is_fibonacci": d0 in fib_set},
                        *(
                            [{"rank": 1, "count": d1, "direction": dir1, "is_fibonacci": d1 in fib_set}]
                            if d1 > 0
                            else []
                        ),
                        *(
                            [{"rank": 2, "count": d2, "direction": dir2, "is_fibonacci": d2 in fib_set}]
                            if d2 > 0
                            else []
                        ),
                    ],
                }
            )
        else:
            zones[-1]["r_max"] = max(float(zones[-1]["r_max"]), r_val)
            zones[-1]["node_count"] = int(zones[-1]["node_count"]) + 1

    # Filter out single-node boundary transients
    clean_zones = [z for z in zones if int(z["node_count"]) >= 3] or zones
    bend_radii = [
        0.5 * (float(clean_zones[idx]["r_max"]) + float(clean_zones[idx + 1]["r_min"]))
        for idx in range(len(clean_zones) - 1)
    ]

    outer_ranks = clean_zones[-1]["ranks"] if clean_zones else []
    opposing_pair = (0, 0)
    is_fib_pair = False
    if len(outer_ranks) >= 2:
        r0 = outer_ranks[0]
        r1 = outer_ranks[1]
        c0 = int(r0["count"])
        c1 = int(r1["count"])
        opposing_pair = (c0, c1)
        is_fib_pair = (
            c0 in fib_set
            and c1 in fib_set
            and r0["direction"] != r1["direction"]
        )

    return {
        "outer_counts": outer_ranks,
        "opposing_pair": opposing_pair,
        "is_fibonacci_pair": is_fib_pair,
        "zones": clean_zones,
        "bend_radii": bend_radii,
    }


class PlanarMixin:
    """Mixin for Phyllotaxis class containing 2D planar growth and parastichy methods."""

    def get_node_points(
        self, num_nodes: int, sweep: sp.Expr | float | None = None
    ) -> list[spg.Point2D]:
        return get_node_points(num_nodes, sweep)

    def grow(
        self, steps: int, sweep: sp.Expr | float | None = None
    ) -> list[list[spg.Point2D]]:
        return grow(steps, sweep)

    def classify_meristem_phase(
        self, node_id: int, total_nodes: int, leaf_span: int = 34
    ) -> str:
        return classify_meristem_phase(node_id, total_nodes, leaf_span=leaf_span)

    def vogel_points(
        self,
        num_nodes: int,
        scale: float = 5.0,
        angle_rad: float = GOLDEN_ANGLE_RAD,
        base_size: float = 1.5,
        growth_factor: float = 0.25,
        radial_acceleration: float = 0.0,
        leaf_span: int = 34,
    ) -> list[dict[str, float | int | str]]:
        return vogel_points(
            num_nodes,
            scale,
            angle_rad,
            base_size,
            growth_factor,
            radial_acceleration,
            leaf_span,
        )

    def find_point_distances(
        self, pt: spg.Point2D, other_pts: list[spg.Point2D]
    ) -> dict[float, spg.Point2D]:
        return find_point_distances(pt, other_pts)

    def find_nearest_points(
        self, test_points: list[spg.Point2D], num_nearest: int = 3
    ) -> dict[spg.Point2D, list[spg.Point2D]]:
        return find_nearest_points(test_points, num_nearest=num_nearest)

    def find_parastichies(
        self, num_nodes: int, families: tuple[int, ...] = (5, 8, 13, 21)
    ) -> dict[int, list[list[int]]]:
        return find_parastichies(num_nodes, families)

    def analyze_parastichy_curves(
        self, nodes: list[dict[str, float | int | str]], num_nearest: int = 3
    ) -> dict[str, object]:
        return analyze_parastichy_curves(nodes, num_nearest=num_nearest)

