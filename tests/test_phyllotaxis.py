"""Unit tests for `geometor.phyllotaxis`."""

from __future__ import annotations

import math
import sympy as sp

from geometor.phyllotaxis import (
    GOLDEN_ANGLE_DEG,
    GOLDEN_SWEEP_LONG_DEG,
    GOLDEN_SWEEP_SHORT_DEG,
    MeristemConfig,
    Phyllotaxis,
    analyze_parastichy_curves,
    build_rings_model,
    classify_meristem_phase,
    fibonacci,
    fibonacci_convergents,
    find_nearest_points,
    find_parastichies,
    get_node_points,
    golden_sweep_presets,
    grow,
    propagate_3d,
    sweep_lucas,
    sweep_phi,
    sweep_phi_factor,
    sweep_phi_long,
    sweep_phi_power,
    sweep_phi_short,
    sweep_rational,
    vogel_points,
)


def test_symbolic_angles() -> None:
    phi_angle = sweep_phi()
    assert math.isclose(math.degrees(float(phi_angle)), GOLDEN_ANGLE_DEG, rel_tol=1e-7)
    assert math.isclose(GOLDEN_ANGLE_DEG, 137.50776405, rel_tol=1e-6)

    short_sweep = sweep_phi_short()
    long_sweep = sweep_phi_long()
    assert math.isclose(math.degrees(float(short_sweep)), GOLDEN_SWEEP_SHORT_DEG, rel_tol=1e-7)
    assert math.isclose(math.degrees(float(long_sweep)), GOLDEN_SWEEP_LONG_DEG, rel_tol=1e-7)
    assert math.isclose(GOLDEN_SWEEP_SHORT_DEG + GOLDEN_SWEEP_LONG_DEG, 360.0, rel_tol=1e-7)

    pow3 = math.degrees(float(sweep_phi_power(3)))
    assert math.isclose(pow3, GOLDEN_SWEEP_LONG_DEG - GOLDEN_SWEEP_SHORT_DEG, rel_tol=1e-7)
    assert math.isclose(math.degrees(float(sweep_phi_factor(1, 2))), GOLDEN_SWEEP_SHORT_DEG / 2.0, rel_tol=1e-7)
    assert math.isclose(
        math.degrees(float(sweep_phi_factor(1, 2, long_sweep=True))),
        GOLDEN_SWEEP_LONG_DEG / 2.0,
        rel_tol=1e-7,
    )
    presets = golden_sweep_presets()
    assert len(presets) >= 12

    rat_angle = sweep_rational(89, 144)
    assert isinstance(rat_angle, sp.Expr)
    assert math.isclose(math.degrees(float(rat_angle)), 137.5, rel_tol=1e-7)

    lucas_angle = sweep_lucas()
    assert math.isclose(math.degrees(float(lucas_angle)), 99.5015528, rel_tol=1e-5)


def test_fibonacci_and_convergents() -> None:
    assert [fibonacci(k) for k in range(8)] == [0, 1, 1, 2, 3, 5, 8, 13]
    conv = fibonacci_convergents(5)
    assert len(conv) == 5
    assert conv[0][:2] == (1, 3)
    assert conv[-1][:2] == (8, 21)


def test_planar_growth_and_parastichies() -> None:
    pts = get_node_points(8, sweep_rational(3, 8))
    assert len(pts) == 8
    frames = grow(5, sweep_rational(3, 8))
    assert len(frames) == 5
    assert len(frames[4]) == 4

    nearest = find_nearest_points(pts, num_nearest=2)
    assert len(nearest[pts[0]]) == 2

    vogel = vogel_points(55, scale=4.0, growth_factor=0.25, radial_acceleration=0.0)
    assert len(vogel) == 55
    # Newest primordium is at the center (age = 0, r = 0)
    assert vogel[-1]["age"] == 0
    assert vogel[-1]["r"] == 0.0

    accel_vogel = vogel_points(55, scale=4.0, growth_factor=0.5, radial_acceleration=0.8)
    # Outer oldest node (index 0, age = 54) accelerates further and grows larger than unaccelerated
    assert accel_vogel[0]["r"] > vogel[0]["r"]
    assert accel_vogel[0]["size"] > vogel[0]["size"]

    # Verify sunflower meristem life cycle phases (34 leaves -> 55 petals -> florets -> 21 apical buds)
    sunflower = vogel_points(200, leaf_span=34)
    assert sunflower[0]["phase"] == "leaf"
    assert sunflower[33]["phase"] == "leaf"
    assert sunflower[34]["phase"] == "petal"
    assert sunflower[88]["phase"] == "petal"
    assert sunflower[89]["phase"] == "floret"
    assert sunflower[-1]["phase"] == "bud"
    assert classify_meristem_phase(0, 200, leaf_span=34) == "leaf"
    assert classify_meristem_phase(50, 200, leaf_span=34) == "petal"
    assert classify_meristem_phase(120, 200, leaf_span=34) == "floret"
    assert classify_meristem_phase(195, 200, leaf_span=34) == "bud"

    spirals = find_parastichies(34, families=(5, 8))
    assert len(spirals[5]) == 5
    assert len(spirals[8]) == 8

    # Verify curve counting by rank/winding and radial bend zones
    curve_nodes = vogel_points(233, scale=7.4, growth_factor=0.0, radial_acceleration=0.0)
    analysis = analyze_parastichy_curves(curve_nodes, num_nearest=3)
    assert analysis["is_fibonacci_pair"] is True
    assert set(analysis["opposing_pair"]) == {34, 55}
    assert analysis["outer_counts"][0]["direction"] != analysis["outer_counts"][1]["direction"]
    assert len(analysis["zones"]) >= 2
    assert len(analysis["bend_radii"]) >= 1


def test_3d_node_paths_and_meristem_branching() -> None:
    cfg = MeristemConfig(
        max_depth=2,
        maturation_age=4,
        spawn_cadence=3,
        meristem_stride=2,
        path_segments=8,
    )
    nodes = propagate_3d(steps=16, config=cfg)

    # Node 0 is root stem meristem
    root = nodes[0]
    assert root.generation == 0
    assert root.is_meristem is True
    assert len(root.children) == 16

    gen1 = [n for n in nodes if n.generation == 1]
    gen2 = [n for n in nodes if n.generation == 2]
    assert len(gen1) == 16
    assert len(gen2) > 0

    # Every node has a path starting at its origin and ending at its tip
    for node in nodes:
        assert len(node.path) >= 1
        assert node.path[0] == node.origin
        assert node.path[-1] == node.tip
        serialized = node.to_dict()
        assert serialized["origin"] == list(node.origin)


def test_phyllotaxis_mixin_class_and_model_builder() -> None:
    phyl = Phyllotaxis("test")
    assert len(phyl.vogel_points(13)) == 13
    pts = phyl.get_node_points(8)
    assert len(phyl.find_nearest_points(pts, num_nearest=3)[pts[0]]) == 3
    assert len(phyl.find_point_distances(pts[0], pts[1:])) == 7
    nodes_3d = phyl.propagate_3d(10, MeristemConfig(max_depth=1))
    assert len(nodes_3d) == 11

    model = build_rings_model(num_rings=5)
    assert model.name == "phyllotaxis_rings"
    assert len(model.points) >= 6
