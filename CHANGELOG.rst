changelog
=========

0.2.1
-----
*2026-11-03*

- Removed legacy `fastGrowthSteps` height slowdown on the 3D apical meristem so the primary shoot climbs continuously with basal internode elongation.
- Scaled 3D lateral branch curvature (`pathArch`) with branch reach and normalized progress $u^2$ so lower branches do not overtake the apical meristem.
- Added climbing camera orbit target tracking, `Center (0)` camera framing, and live `Meristem Height` HUD telemetry in the 3D studio.

0.2.0
-----
*2026-11-03*

- Modernized package structure (`pyproject.toml`, `README.rst`, `GEMINI.md`) and registered `geometor-phyllotaxis` in the root `uv` workspace.
- Implemented modular Mixin architecture (`AnglesMixin`, `PlanarMixin`, `Propagation3DMixin`, `ModelBuilderMixin`, `Phyllotaxis`).
- Added radial acceleration ($a$), node growth factor ($g$), and meristem production life cycle phases (`leaf`, `petal`, `floret`, `bud`) to `vogel_points` and `classify_meristem_phase`.
- Added parastichy curve counting, opposing winding chirality verification, and concentric radial bend zone analysis (`analyze_parastichy_curves`).
- Added 3D Node-as-Path and recursive multi-generation meristem engine (`MeristemNode`, `MeristemConfig`, `propagate_3d`).
- Integrated custom Sphinx templates (`demo_2d.html`, `demo_3d.html`) and interactive 2D/3D web laboratories in `docsrc/` with pan/zoom, non-scaling Explorer Points and ~1px connectors, closest-neighbor intersection detection, perimeter Fibonacci curve numbering, and fullscreen theater presets.
- Archived legacy batch-rendering scripts into `demos/legacy/`.

0.1.0
-----
*2023-11-15*

- Repository initialized.
