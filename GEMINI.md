# GEOMETOR • phyllotaxis

Investigation of botanical growth, golden angles, Fibonacci spirals, 2D planar packing, and 3D recursive meristem path propagations.

## Architecture

### Python Package (`src/geometor/phyllotaxis/`)
Follows the GEOMETOR Mixin Architecture (`STANDARDS.md`):
- `angles.py` (`AnglesMixin`): Symbolic (`sympy`) and numeric divergence angles ($\Phi = 2\pi(1 - 1/\phi)$, Fibonacci rationals $F_n/F_m$, Lucas angle) and Fibonacci sequences.
- `planar.py` (`PlanarMixin`): 2D apical meristem growth (`get_node_points`, `grow`, `vogel_points`, `classify_meristem_phase`) with radial acceleration and node growth factor, nearest-neighbor distance matrices (`find_nearest_points`), parastichy family extraction (`find_parastichies`), and opposing Fibonacci curve counting with radial bend zone detection (`analyze_parastichy_curves`).
- `paths3d.py` (`Propagation3DMixin`, `MeristemNode`, `MeristemConfig`): 3D propagation engine where each node is a growing 3D trajectory $\gamma_i(\tau)$ from its origin on the parent meristem, carrying a local orthonormal frame $(\mathbf{T}, \mathbf{N}, \mathbf{B})$ so any node tip can act as a secondary/tertiary meristem.
- `builder.py` (`ModelBuilderMixin`): Converts phyllotaxic rings, wedges, and spiral nodes into exact `geometor.model.Model` constructions.
- `phyllotaxis.py` (`Phyllotaxis`): Main composed class inheriting all mixins.
- `__main__.py`: CLI entry point (`phyllotaxis`).

### Interactive Documentation (`docsrc/`)
- `docsrc/_templates/demo_2d.html` & `docsrc/_templates/demo_3d.html`: Custom Sphinx Jinja2 templates extending `page.html` so interactive demonstrations live inside the standard GEOMETOR documentation environment.
- `docsrc/_static/js/palettes.js`: Shared color theme interpolation and live palette cycling engine.
- `docsrc/_static/js/phyllotaxis-2d.js`: Interactive 2D HTML5 Canvas studio (pan/zoom, apical meristem growth with radial acceleration and node growth factor, Explorer Points/Seeds/Rings/Wedges/Leaves/Petals/Sunflower Life Cycle morphologies, closest inner neighbor connections with intersection detection, opposing Fibonacci curve counting across radial bend zones, and live zoetrope rotation).
- `docsrc/_static/js/phyllotaxis-3d.js`: Interactive 3D Three.js studio (Nodes-as-Paths, curved/arched branch trajectories, and recursive multi-generation meristems).
- `docsrc/demos/`: RST demonstration pages (`meristem_2d.rst`, `propagation_3d.rst`).
