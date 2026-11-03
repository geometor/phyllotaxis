GEOMETOR • phyllotaxis
======================

**Symbolic modeling, interactive 2D/3D web visualizations, and recursive meristem propagation of botanical patterns.**

``geometor.phyllotaxis`` explores the mathematical and geometric laws of botanical growth—from planar Vogel capitula and golden-angle divergence ($\Phi = 2\pi(1 - 1/\phi) \approx 137.50776^\circ$) to 3D vascular path propagations where **every node is a growing trajectory from its origin on the parent stem and may itself act as a child meristem**.

Key Features
------------

* **Symbolic & Rational Divergence Angles**: Exact SymPy representations of the golden angle $2\pi/\phi^2$, Fibonacci rational convergents $2\pi(1 - F_n/F_m)$, and Lucas divergence angles.
* **2D Apical Meristem, Life Cycle & Parastichy Analysis**: Planar outward growth with radial acceleration ($a$) and node growth factor ($g$), sunflower meristem production life cycle phases (Leaves $\to$ Petals $\to$ Florets $\to$ Buds), closest inner neighbor connections ($k=1\dots 4$), curve intersection detection, and opposing Fibonacci curve counting across radial bend zones (`analyze_parastichy_curves`).
* **3D Node-as-Path & Recursive Meristems**: Each primordium originates on its parent meristem's axis and propagates along a curved 3D trajectory $\gamma_i(\tau)$ with a local parallel-transport frame $(\hat{\mathbf{T}}, \hat{\mathbf{N}}, \hat{\mathbf{B}})$, optionally spawning recursive child meristems along its path.
* **Integrated Interactive Documentation**: Custom Sphinx templates in ``docsrc/_templates/`` embed 60 FPS HTML5 Canvas (2D) and Three.js WebGL (3D) laboratories directly inside the published documentation.

Installation & Usage
--------------------

Within the GEOMETOR ``uv`` workspace:

.. code-block:: bash

   uv run phyllotaxis --help
   uv run phyllotaxis summary --nodes 55 --depth 2
   uv run pytest

Documentation
-------------

Build the interactive documentation and demonstrations into ``docs/``:

.. code-block:: bash

   publish build
